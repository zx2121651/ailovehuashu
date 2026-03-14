import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Search, CheckCircle, XCircle, EyeOff, Eye, Loader } from 'lucide-react';

const Comments = () => {
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [targetType, setTargetType] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        keyword,
        targetType,
        status
      });
      const res = await fetch(`/api/v1/admin/comments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComments(data.data.list);
        setPagination({
          page: data.data.page,
          limit: data.data.limit,
          total: data.data.total
        });
      }
    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [token, targetType, status]);

  const handleDelete = async (id) => {
    if (!window.confirm('确定要彻底删除这条评论吗？')) return;
    try {
      const res = await fetch(`/api/v1/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchComments(pagination.page);
      } else {
        alert(data.message || '删除失败');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('删除失败');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/v1/admin/comments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchComments(pagination.page);
      } else {
        alert(data.message || '更新失败');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('更新状态失败');
    }
  };

  const getTargetTypeLabel = (type) => {
    switch(type) {
      case 'SCRIPT': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">话术</span>;
      case 'ARTICLE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">文章</span>;
      case 'COURSE': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">课程</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{type}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> 正常显示</span>;
      case 'HIDDEN': return <span className="flex items-center text-orange-500"><EyeOff className="w-4 h-4 mr-1" /> 已隐藏</span>;
      case 'DELETED': return <span className="flex items-center text-red-500"><XCircle className="w-4 h-4 mr-1" /> 已删除</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">评论管理</h2>
          <p className="text-sm text-slate-500 mt-1">查看和审核用户的评论内容 (UGC)</p>
        </div>
      </div>

      {/* 搜索和过滤工具栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索评论内容..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchComments(1)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">全部模块</option>
          <option value="SCRIPT">话术</option>
          <option value="ARTICLE">文章</option>
          <option value="COURSE">课程</option>
          <option value="POST">社区动态</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">全部状态</option>
          <option value="ACTIVE">正常显示</option>
          <option value="HIDDEN">已隐藏</option>
        </select>
        <button
          onClick={() => fetchComments(1)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          查询
        </button>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">暂无评论数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
                  <th className="p-4 font-medium w-64">评论内容</th>
                  <th className="p-4 font-medium">用户信息</th>
                  <th className="p-4 font-medium">来源模块</th>
                  <th className="p-4 font-medium">点赞数</th>
                  <th className="p-4 font-medium">当前状态</th>
                  <th className="p-4 font-medium">发布时间</th>
                  <th className="p-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="text-slate-800 break-words line-clamp-2 max-w-xs" title={comment.content}>
                        {comment.content}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <img src={comment.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100" />
                        <div>
                          <div className="font-medium text-slate-800">{comment.user?.name || '未知用户'}</div>
                          <div className="text-xs text-slate-400">ID: {comment.user?.id.slice(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getTargetTypeLabel(comment.targetType)}<br/><span className="text-xs text-slate-400">ID: {comment.targetId}</span></td>
                    <td className="p-4 text-slate-600">{comment.likes}</td>
                    <td className="p-4">{getStatusBadge(comment.status)}</td>
                    <td className="p-4 text-slate-500">{new Date(comment.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {comment.status === 'ACTIVE' ? (
                          <button onClick={() => updateStatus(comment.id, 'HIDDEN')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg tooltip" title="隐藏">
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(comment.id, 'ACTIVE')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg tooltip" title="恢复显示">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(comment.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg tooltip" title="彻底删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: pagination.totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => fetchComments(idx + 1)}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${pagination.page === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;