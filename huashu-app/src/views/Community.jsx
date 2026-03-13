import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, MessageCircle, MoreHorizontal, Image as ImageIcon, X, Send, Tag, Edit3, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getPosts, toggleLikePost, createPost, getPostCategories, getPostSortTabs, uploadFile, reportPost } from '../services/api';
import CommentSection from '../components/common/CommentSection';
import { useInView } from 'react-intersection-observer';

export default function Community() {
  const { user, showToast } = useContext(AppContext);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);

  // Post Creation State
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const tagsList = ['#情感求助', '#约会实战', '#脱单打卡', '#聊天诊断'];
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sortTabs, setSortTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('latest'); // sort key from API
  const [activeFilterTag, setActiveFilterTag] = useState(''); // current tag filter
  const [activeCategoryId, setActiveCategoryId] = useState(''); // current category filter
  const [previewImage, setPreviewImage] = useState(null); // URL for full screen preview
  const [previewIndex, setPreviewIndex] = useState(0); // Index for gallery
  const [previewImages, setPreviewImages] = useState([]); // List of images for gallery

  // Pagination & Infinite Scroll State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [loadingMore, setLoadingMore] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('色情低俗');
  const reportReasonsList = ['色情低俗', '垃圾广告', '人身攻击', '其他'];

  // Action Sheet State
  const [activeActionSheetPostId, setActiveActionSheetPostId] = useState(null);

  const fetchCategories = async () => {
    try {
      const cats = await getPostCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error('Fetch categories error', error);
    }
  };

  const fetchSortTabs = async () => {
    try {
      const tabs = await getPostSortTabs();
      setSortTabs(tabs || []);
      // 设置默认选中的排序
      const defaultTab = tabs.find(t => t.default);
      if (defaultTab) {
        setActiveTab(defaultTab.key);
      }
    } catch (error) {
      console.error('Fetch sort tabs error', error);
      // 使用默认值
      setSortTabs([
        { key: 'latest', label: '最新', sort: 'new', default: true },
        { key: 'hot', label: '热门', sort: 'hot' }
      ]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSortTabs();
  }, []);

  const fetchPosts = async (tag = activeFilterTag, sort = activeTab, catId = activeCategoryId, pageNum = 1, isAppend = false) => {
    if (!isAppend) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = { page: pageNum, limit: 10 };
      if (tag) params.tag = tag;
      if (sort) params.sort = sort;
      if (catId) params.categoryId = catId;
      const data = await getPosts(params);

      const newItems = data.list || [];
      if (isAppend) {
        setPosts(prev => [...prev, ...newItems]);
      } else {
        setPosts(newItems);
      }

      setHasMore(newItems.length >= 10);
    } catch (error) {
      console.error('Fetch posts error', error);
      showToast('获取动态失败');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 监听分类/标签/排序改变，重置页码
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(activeFilterTag, activeTab, activeCategoryId, 1, false);
  }, [activeFilterTag, activeTab, activeCategoryId]);

  // 监听触底加载更多
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(activeFilterTag, activeTab, activeCategoryId, nextPage, true);
    }
  }, [inView, hasMore, loading, loadingMore]);

  const handleLike = async (postId, index) => {
    if (!user) {
      showToast('请先登录');
      return;
    }

    // Optimistic UI
    const newPosts = [...posts];
    const post = newPosts[index];
    post.hasLiked = !post.hasLiked;
    post.likes = post.hasLiked ? post.likes + 1 : Math.max(0, post.likes - 1);
    setPosts(newPosts);

    try {
      const res = await toggleLikePost(postId);
      if (res) {
        newPosts[index].likes = res.likes;
        newPosts[index].hasLiked = res.isLiked;
        setPosts([...newPosts]);
      }
    } catch (error) {
      console.error('Like error', error);
      fetchPosts(activeFilterTag, activeTab, activeCategoryId, page, false); // Revert
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (newImages.length >= 9) {
      showToast('最多添加9张图片/视频');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setNewImages(prev => [...prev, url]);
      showToast('上传成功', 'success');
    } catch (err) {
      console.error('File upload error', err);
      showToast('文件上传失败，请重试');
    } finally {
      setUploadingImage(false);
      e.target.value = null; // reset input
    }
  };

  const handleRemoveImage = (idx) => {
    const arr = [...newImages];
    arr.splice(idx, 1);
    setNewImages(arr);
  };

  const handleSubmitPost = async () => {
    if (!newContent.trim() && newImages.length === 0) {
      showToast('说点什么或者发张图吧~');
      return;
    }
    setSubmitting(true);
    try {
      const tags = selectedTag ? [selectedTag] : [];
      await createPost({
        content: newContent,
        images: newImages,
        tags,
        categoryId: selectedCategoryId || null
      });
      showToast('发布成功！', 'success');
      setShowCreateModal(false);
      setNewContent('');
      setNewImages([]);
      setSelectedTag('');
      setSelectedCategoryId('');
      setPage(1);
      fetchPosts(activeFilterTag, activeTab, activeCategoryId, 1, false);
    } catch (error) {
      console.error('Submit post error', error);
      showToast('发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${date.getMonth() + 1}-${date.getDate()}`;
  };

  const handleShare = async (postId) => {
    const url = `${window.location.origin}/community/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '推荐这篇情感实战',
          text: '快来看看圈子里的这个帖子吧',
          url: url
        });
      } catch (err) {
        console.error('Share error', err);
      }
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast('链接已复制到剪贴板');
      });
    }
  };

  const openReportModal = (postId) => {
    if (!user) {
      showToast('请先登录');
      return;
    }
    setReportPostId(postId);
    setActiveActionSheetPostId(null);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      showToast('请选择举报原因');
      return;
    }
    try {
      await reportPost(reportPostId, { reason: reportReason });
      showToast('举报成功，我们将尽快处理', 'success');
      setShowReportModal(false);
    } catch (err) {
      showToast(err.message || '举报提交失败');
    }
  };

  return (
    <div className="bg-gray-50 min-h-full pb-24 relative">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-5 py-3 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-extrabold text-gray-800">圈子</h1>
          {/* Tab switch for sorting */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {sortTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-[11px] px-3 py-1 font-bold rounded-md transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Category Scroll */}
        <div className="flex space-x-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
             onClick={() => setActiveCategoryId('')}
             className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${!activeCategoryId ? 'bg-pink-500 text-white shadow-sm shadow-pink-200' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            全部
          </button>
          {categories.map(c => (
             <button
               key={c.id}
               onClick={() => setActiveCategoryId(c.id)}
               className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${activeCategoryId === c.id ? 'bg-pink-500 text-white shadow-sm shadow-pink-200' : 'bg-white text-gray-500 border border-gray-200'}`}
             >
               {c.name}
             </button>
          ))}
        </div>
      </div>

      {/* Post List */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          // Skeleton Loader
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
              <div className="h-40 bg-gray-200 rounded-xl"></div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">还没有人发帖，快来抢沙发！</div>
        ) : (
          <>
            {posts.map((post, idx) => (
              <div key={post.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md relative">
                {/* User Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img src={post.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} className={`w-10 h-10 rounded-full object-cover bg-gray-100 ${post.user?.role === 'MENTOR' ? 'ring-2 ring-yellow-400' : ''}`} alt="avatar" />
                      {post.user?.role === 'MENTOR' && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border border-white">
                           <ShieldCheck size={10} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-sm text-gray-800">{post.user?.name || '热心用户'}</h3>
                        {post.user?.role === 'MENTOR' && (
                           <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded font-bold">官方导师</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveActionSheetPostId(activeActionSheetPostId === post.id ? null : post.id)} className="p-2 -mr-2 text-gray-300 hover:text-gray-500">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Inline Action Sheet */}
                {activeActionSheetPostId === post.id && (
                  <div className="absolute right-5 top-14 bg-white shadow-xl rounded-xl border border-gray-100 py-2 w-28 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => openReportModal(post.id)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 flex items-center">
                      <AlertTriangle size={14} className="mr-2" /> 举报
                    </button>
                  </div>
                )}

                {/* Text Content */}
                {post.content && (
                  <p className="text-[15px] text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Image Grid (Max 9) */}
                {post.images && post.images.length > 0 && (
                  <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {post.images.map((img, iIdx) => (
                      <div
                        key={iIdx}
                        className={`rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in active:opacity-80 transition-opacity ${post.images.length === 1 ? 'max-h-60' : 'aspect-square'}`}
                        onClick={() => {
                          setPreviewImages(post.images);
                          setPreviewIndex(iIdx);
                          setPreviewImage(true);
                        }}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="post img" onError={(e) => e.target.style.display='none'} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-gray-500">
                  <div className="flex items-center space-x-6">
                    <button onClick={() => handleLike(post.id, idx)} className={`flex items-center space-x-1.5 transition-all ${post.hasLiked ? 'text-pink-500 scale-110' : 'hover:text-pink-500 hover:scale-105'}`}>
                      <Heart size={18} className={post.hasLiked ? 'fill-pink-500' : ''} />
                      <span className="text-xs font-medium">{post.likes || '点赞'}</span>
                    </button>
                    <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center space-x-1.5 hover:text-blue-500 hover:scale-105 transition-all">
                      <MessageCircle size={18} />
                      <span className="text-xs font-medium">评论</span>
                    </button>
                  </div>
                  <button onClick={() => handleShare(post.id)} className="flex items-center space-x-1.5 text-gray-400 hover:text-indigo-500 hover:scale-105 transition-all">
                    <Share2 size={16}/>
                  </button>
                </div>

              {/* Inline Comment Section */}
              {activeCommentPostId === post.id && (
                <div className="mt-4 bg-gray-50 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200">
                  <CommentSection targetType="POST" targetId={post.id} />
                </div>
              )}
            </div>
          ))}

          {/* Infinite Scroll Trigger & Loader */}
          {hasMore && (
            <div ref={ref} className="py-4 flex justify-center items-center">
              {loadingMore ? (
                 <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <div className="text-xs text-gray-400">滑动加载更多...</div>
              )}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="py-6 text-center text-xs text-gray-400">
              — 到底啦 —
            </div>
          )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => user ? setShowCreateModal(true) : showToast('请先登录')}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-300 flex items-center justify-center text-white active:scale-95 transition-transform z-40"
      >
        <span className="text-3xl leading-none -mt-1">+</span>
      </button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white w-full sm:w-[400px] sm:rounded-[2rem] rounded-t-[2rem] h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <span className="text-gray-400 cursor-pointer p-1" onClick={() => setShowCreateModal(false)}>取消</span>
              <h3 className="font-bold text-gray-800 text-lg">发动态</h3>
              <button onClick={handleSubmitPost} disabled={submitting} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${submitting ? 'bg-gray-100 text-gray-400' : 'bg-pink-500 text-white shadow-md shadow-pink-200 active:scale-95'}`}>
                {submitting ? '发布中...' : '发布'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="分享你的情感实战、聊天截图或求助..."
                className="w-full text-[15px] text-gray-800 placeholder-gray-400 outline-none resize-none min-h-[120px]"
                maxLength={500}
              />

              {/* Category Selection */}
              <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                <span className="text-[12px] font-bold text-gray-800 w-full mb-1">选择分类:</span>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(selectedCategoryId === c.id ? '' : c.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${selectedCategoryId === c.id ? 'bg-pink-50 border-pink-200 text-pink-500' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Tags Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tagsList.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors flex items-center ${selectedTag === tag ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <Tag size={12} className="mr-1" /> {tag}
                  </button>
                ))}
              </div>

              {/* Image Previews & Upload */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {newImages.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-xl relative group overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" alt="preview" />
                    <div onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/50 w-5 h-5 rounded-full flex items-center justify-center text-white cursor-pointer backdrop-blur-md">
                      <X size={12} />
                    </div>
                  </div>
                ))}
                {newImages.length < 9 && (
                  <label className="aspect-square bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                    {uploadingImage ? (
                      <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                    ) : (
                      <ImageIcon size={24} className="mb-1 opacity-50" />
                    )}
                    <span className="text-[10px]">{uploadingImage ? '上传中...' : '添加图片'}</span>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview (Gallery) */}
      {previewImage && previewImages && previewImages.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="absolute top-safe pt-4 left-0 w-full flex justify-between px-4 z-10 text-white">
            <span className="text-sm font-medium bg-black/40 px-3 py-1 rounded-full">{previewIndex + 1} / {previewImages.length}</span>
            <button className="p-2 bg-black/40 rounded-full" onClick={() => { setPreviewImage(null); setPreviewImages([]); }}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden" onClick={(e) => {
             // 简易的点击左右切换
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             if (x < rect.width / 2) {
               setPreviewIndex(Math.max(0, previewIndex - 1));
             } else {
               setPreviewIndex(Math.min(previewImages.length - 1, previewIndex + 1));
             }
          }}>
            <img src={previewImages[previewIndex]} alt="Gallery Preview" className="max-w-full max-h-full object-contain select-none transition-opacity duration-200" />
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={() => setShowReportModal(false)}>
          <div className="bg-white w-full sm:w-[350px] sm:rounded-3xl rounded-t-3xl p-5 shadow-xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">举报不良内容</h3>
            <div className="space-y-3 mb-6">
              {reportReasonsList.map(reason => (
                <label key={reason} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 active:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">取消</button>
              <button onClick={submitReport} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-200 active:scale-95 transition-transform">提交举报</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}