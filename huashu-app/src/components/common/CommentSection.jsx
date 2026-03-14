import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { getComments, postComment, toggleLikeComment } from '../../services/api';
import { Heart, Send, UserCircle2, MessageSquare } from 'lucide-react';

const CommentSection = ({ targetType, targetId }) => {
  const { user, showToast } = useContext(AppContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetType && targetId) {
      fetchComments();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId, user]); // Refetch if user changes (for hasLiked status)

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(targetType, targetId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      showToast('请先登录再发表评论');
      return;
    }

    setSubmitting(true);
    try {
      const addedComment = await postComment(targetType, targetId, newComment);
      if (addedComment) {
        setComments([{ ...addedComment, hasLiked: false, likes: 0 }, ...comments]);
        setNewComment('');
        showToast('评论发布成功', 'success');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      showToast('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId, index) => {
    if (!user) {
      showToast('请先登录再点赞');
      return;
    }

    try {
      // Optimistic update
      const newComments = [...comments];
      const comment = newComments[index];
      comment.hasLiked = !comment.hasLiked;
      comment.likes = comment.hasLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1);
      setComments(newComments);

      const res = await toggleLikeComment(commentId);
      if (res) {
        // Sync with server state
        newComments[index].likes = res.likes;
        newComments[index].hasLiked = res.isLiked;
        setComments([...newComments]);
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
      // Revert optimistic update on error
      fetchComments();
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;

    return `${date.getMonth() + 1}-${date.getDate()}`;
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <h3 className="font-bold text-[17px] text-gray-800 mb-4 px-1">全部评论 ({comments.length})</h3>

      {/* 评论输入框 */}
      <div className="flex items-start space-x-3 mb-6 px-1">
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-slate-100" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
            <UserCircle2 size={24} />
          </div>
        )}
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "分享你的实战经验或感受..." : "登录后参与评论互动..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all resize-none min-h-[80px]"
            maxLength={200}
            disabled={!user || submitting}
          />
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim() || submitting || !user}
            className={`absolute right-2 bottom-2 p-2 rounded-full transition-all ${
              newComment.trim() && user
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 hover:scale-105 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} className={submitting ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400">
          <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={comment.id} className="flex space-x-3 group px-1">
              <img src={comment.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="avatar" className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-600 truncate mr-2">{comment.user?.name || '热心用户'}</span>
                  <button
                    onClick={() => handleLike(comment.id, index)}
                    className="flex items-center space-x-1 p-1 text-slate-400 hover:text-pink-500 transition-colors"
                  >
                    <span className="text-[12px]">{comment.likes > 0 ? comment.likes : ''}</span>
                    <Heart size={14} className={comment.hasLiked ? 'fill-pink-500 text-pink-500' : ''} />
                  </button>
                </div>
                <p className="text-[14px] text-slate-800 mt-1 leading-relaxed break-words whitespace-pre-wrap">{comment.content}</p>
                <div className="text-[11px] text-slate-400 mt-2">{formatTime(comment.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
            <MessageSquare size={24} />
          </div>
          <p className="text-[13px] text-slate-400">还没有评论，快来抢沙发吧~</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;