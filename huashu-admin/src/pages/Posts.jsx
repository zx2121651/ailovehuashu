import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Search, CheckCircle, XCircle, EyeOff, Eye, Loader, Image as ImageIcon, Plus, X, Upload } from 'lucide-react';

const Posts = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    images: [],
    tags: '',
    categoryId: '',
    status: 'ACTIVE'
  });
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/categories?type=POST', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        keyword,
        status,
        categoryId
      });
      const res = await fetch(`/api/v1/admin/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data.list);
        setPagination({
          page: data.data.page,
          limit: data.data.limit,
          total: data.data.total
        });
      }
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [token, status, categoryId]);

  const handleDelete = async (id) => {
    if (!window.confirm('确定要彻底删除这条动态吗？相关的评论也会被删除。')) return;
    try {
      const res = await fetch(`/api/v1/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchPosts(pagination.page);
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
      const res = await fetch(`/api/v1/admin/posts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchPosts(pagination.page);
      } else {
        alert(data.message || '更新失败');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('更新状态失败');
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

  const openModal = (post = null) => {
    setCurrentPost(post);
    if (post) {
      setFormData({
        content: post.content || '',
        images: post.images || [],
        tags: post.tags ? post.tags.join(', ') : '',
        categoryId: post.categoryId || '',
        status: post.status || 'ACTIVE'
      });
    } else {
      setFormData({ content: '', images: [], tags: '', categoryId: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setModalLoading(true);
    try {
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataUpload
      });
      const data = await res.json();
      if (data.code === 200) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.data.url]
        }));
      } else {
        alert(data.message || '上传失败');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('上传异常');
    } finally {
      setModalLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSavePost = async () => {
    if (!formData.content.trim() && formData.images.length === 0) {
      return alert('帖子内容和媒体不能同时为空');
    }

    setModalLoading(true);
    try {
      const payload = {
        content: formData.content,
        images: formData.images,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        categoryId: formData.categoryId || null,
        status: formData.status
      };

      const url = currentPost
        ? `/api/v1/admin/posts/${currentPost.id}`
        : `/api/v1/admin/posts`;
      const method = currentPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPosts(pagination.page);
      } else {
        alert(data.message || '保存失败');
      }
    } catch (err) {
      console.error('Save post error:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">动态管理 (社区)</h2>
          <p className="text-sm text-slate-500 mt-1">管理用户发布的帖子，或以官方身份发布带有图文/视频的动态</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          发布帖子
        </button>
      </div>

      {/* 工具栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索帖子内容..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPosts(1)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">全部分类</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
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
          onClick={() => fetchPosts(1)}
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
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">暂无帖子数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
                  <th className="p-4 font-medium w-80">内容 & 图片</th>
                  <th className="p-4 font-medium">分类</th>
                  <th className="p-4 font-medium">发布者</th>
                  <th className="p-4 font-medium">数据</th>
                  <th className="p-4 font-medium">状态</th>
                  <th className="p-4 font-medium">发布时间</th>
                  <th className="p-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      {post.isUrgent && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            🚨 急救悬赏 ({post.rewardPoints}分) - {post.resolved ? '已解决' : '待解答'}
                          </span>
                        </div>
                      )}
                      <div className="text-slate-800 break-words mb-2 whitespace-pre-wrap max-h-32 overflow-y-auto pr-2">
                        {post.content}
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.images.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                              <img src={img} className="w-full h-full object-cover" alt="post" />
                            </div>
                          ))}
                          {post.images.length > 3 && (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
                              +{post.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {post.tags.map(t => <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {post.category ? (
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${post.category.color}`}>
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <img src={post.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100" />
                        <div>
                          <div className="font-medium text-slate-800">{post.user?.name || '未知用户'}</div>
                          <div className="text-xs text-slate-400">ID: {post.user?.id?.slice(0,8) || '未知'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 flex flex-col gap-1">
                        <span>点赞: {post.likes}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(post.status)}</td>
                    <td className="p-4 text-slate-500">{new Date(post.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {post.status === 'ACTIVE' ? (
                          <button onClick={() => updateStatus(post.id, 'HIDDEN')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg tooltip" title="隐藏帖子">
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(post.id, 'ACTIVE')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg tooltip" title="恢复显示">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg tooltip" title="彻底删除">
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
              onClick={() => fetchPosts(idx + 1)}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${pagination.page === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* 创建/编辑 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {currentPost ? '编辑动态' : '发布新动态'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">帖子内容 <span className="text-red-500">*</span></label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="说点什么吧..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700 resize-y"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex justify-between items-center">
                  <span>多媒体 (图片/视频)</span>
                  <span className="text-xs text-slate-400 font-normal">支持 JPG, PNG, MP4 等，最大 50MB</span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((mediaUrl, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                      {isVideo(mediaUrl) ? (
                        <video src={mediaUrl} className="w-full h-full object-cover" controls={false} />
                      ) : (
                        <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 9 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 transition-all">
                      {modalLoading ? <Loader className="w-6 h-6 animate-spin mb-2" /> : <Upload className="w-6 h-6 mb-2" />}
                      <span className="text-xs font-medium">{modalLoading ? '上传中...' : '上传文件'}</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/mp4,video/webm"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={modalLoading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">所属分类</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
                >
                  <option value="">(无分类)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">话题标签</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="例如: #脱单, #聊天技巧 (多个用逗号隔开)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
                >
                  <option value="ACTIVE">显示中</option>
                  <option value="HIDDEN">已隐藏</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white font-medium transition-colors"
                disabled={modalLoading}
              >
                取消
              </button>
              <button
                onClick={handleSavePost}
                disabled={modalLoading}
                className="flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors disabled:opacity-70"
              >
                {modalLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                {currentPost ? '保存修改' : '立即发布'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;