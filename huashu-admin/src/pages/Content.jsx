import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Tag, ThumbsUp, X, PlusCircle, MinusCircle, Search, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';

const Content = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState(null);

  // Default form state
  const defaultForm = {
    question: '',
    categoryId: 1, // Default category
    type: '通用',
    tags: '', // Comma separated string for input
    isFeatured: false,
    answers: ['']
  };
  const [formData, setFormData] = useState(defaultForm);

  const { token } = useAuth();

  const fetchScripts = useCallback(async () => {
      try {
        const response = await fetch('/api/v1/admin/scripts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.code === 200 || data.success) {
          setScripts(data.data.list || data.data);
        } else {
          setError('加载话术库列表失败');
        }
      } catch (err) {
        setError('服务器连接错误');
      } finally {
        setLoading(false);
      }
    }, [token]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const handleDelete = async (id) => {
    if (window.confirm("确定要删除这条话术吗？删除后不可恢复。")) {
      try {
        const response = await fetch(`/api/v1/admin/scripts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setScripts(scripts.filter(s => s.id !== id));
        } else {
          alert('删除失败');
        }
      } catch (err) {
        alert('网络错误');
      }
    }
  };

  const openModal = (script = null) => {
    if (script) {
      setEditingScript(script);
      setFormData({
        question: script.question,
        categoryId: script.categoryId || 1,
        type: script.type,
        tags: script.tags?.join(', ') || '',
        isFeatured: script.isFeatured,
        answers: script.answers?.length ? [...script.answers] : ['']
      });
    } else {
      setEditingScript(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingScript(null);
    setFormData(defaultForm);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const addAnswerField = () => {
    setFormData({ ...formData, answers: [...formData.answers, ''] });
  };

  const removeAnswerField = (index) => {
    const newAnswers = [...formData.answers];
    newAnswers.splice(index, 1);
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean up payload
    const payload = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      answers: formData.answers.filter(a => a.trim() !== '')
    };

    if (payload.answers.length === 0) {
      alert("请至少提供一条回复内容");
      return;
    }

    const url = editingScript
      ? `/api/v1/admin/scripts/${editingScript.id}`
      : '/api/v1/admin/scripts';

    const method = editingScript ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchScripts(); // Reload list
        closeModal();
      } else {
        alert('保存失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  const filteredScripts = useMemo(() => {
    return scripts.filter(script =>
      script.question?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scripts, searchTerm]);

  const totalPages = Math.ceil(filteredScripts.length / pageSize);
  const paginatedScripts = filteredScripts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">内容管理</h2>
          <p className="text-slate-500 mt-2">管理系统内的所有话术问题与回复内容。</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => exportToCSV(filteredScripts, 'content')}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="text-sm font-medium">导出数据</span>
          </button>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="搜索话术问题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all w-64"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>添加话术</span>
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100">{error}</div>}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">话术问题</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">分类</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">类型标签</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">点赞数</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">最新状态</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedScripts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    暂无话术数据
                  </td>
                </tr>
              ) : (
                paginatedScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800 line-clamp-2 max-w-xs leading-relaxed">{script.question}</div>
                      <div className="text-xs text-slate-400 mt-1.5 flex items-center space-x-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">ID: {script.id}</span>
                        <span>包含 {script.answers?.length || 0} 条回复</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                        <span className="mr-1.5 opacity-80">{script.category?.icon}</span>
                        {script.category?.name || '未分类'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200/50 rounded-md">
                          <Tag size={12} className="mr-1.5 text-slate-400" />
                          {script.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <div className="p-1 bg-rose-50 text-rose-500 rounded">
                          <ThumbsUp size={14} />
                        </div>
                        <span>{script.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {script.isNew ? (
                          <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            新增
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200/50">
                            正常
                          </span>
                        )}
                        {script.isFeatured && (
                          <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-md bg-orange-50 text-orange-700 border border-orange-200/50">
                            精选
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(script)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-2 transition-colors" title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(script.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                显示第 <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> 到 <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, filteredScripts.length)}</span> 条，共 <span className="font-semibold text-slate-700">{filteredScripts.length}</span> 条
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{editingScript ? '编辑话术' : '新增话术'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">情境 / 问题 <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  placeholder="例如：女生说“在干嘛呢？”"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">分类 <span className="text-rose-500">*</span></label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="1">🧊 开场破冰</option>
                    <option value="2">😜 幽默撩人</option>
                    <option value="3">🔥 情感升温</option>
                    <option value="4">🛡️ 巧妙化解</option>
                    <option value="5">🌙 睡前情话</option>
                    <option value="6">💑 长期关系</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">话术类型</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="高情商">高情商</option>
                    <option value="幽默">幽默</option>
                    <option value="暖心">暖心</option>
                    <option value="通用">通用</option>
                    <option value="反怼">反怼</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">标签 (英文逗号分隔)</label>
                  <input
                    type="text"
                    placeholder="例如: #微信首聊, #高情商"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                  />
                </div>

                {/* isFeatured */}
                <div className="flex items-center pt-8">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">设为精选 (首页推荐)</span>
                  </label>
                </div>
              </div>

              {/* Answers - Dynamic List */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700">话术回复列表 <span className="text-rose-500">*</span></label>
                  <button
                    type="button"
                    onClick={addAnswerField}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <PlusCircle size={16} />
                    <span>添加一条回复</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.answers.map((answer, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-1 relative">
                        <textarea
                          rows={2}
                          placeholder={`输入第 ${index + 1} 条绝佳回复...`}
                          className="w-full border border-slate-200 bg-blue-50/30 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                          value={answer}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAnswerField(index)}
                        disabled={formData.answers.length === 1}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title="移除此回复"
                      >
                        <MinusCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white font-medium transition-colors shadow-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
              >
                {editingScript ? '保存修改' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;