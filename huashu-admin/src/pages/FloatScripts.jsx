import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FloatScripts = () => {
  const { token } = useAuth();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '默认',
    order: 0,
    isActive: true
  });

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/float-scripts?keyword=${searchTerm}`, { headers: { 'Authorization': `Bearer ${token}` } }); const data = await res.json();
      if (data && data.success) {
        setScripts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch float scripts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, [searchTerm]);

  const handleOpenModal = (script = null) => {
    if (script) {
      setCurrentScript(script);
      setFormData({
        question: script.question,
        answer: script.answer,
        category: script.category,
        order: script.order,
        isActive: script.isActive
      });
    } else {
      setCurrentScript(null);
      setFormData({
        question: '',
        answer: '',
        category: '默认',
        order: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentScript) {
        await fetch(`/api/v1/admin/float-scripts/${currentScript.id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      } else {
        await fetch('/api/v1/admin/float-scripts', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      }
      setIsModalOpen(false);
      fetchScripts();
    } catch (error) {
      console.error('Failed to save script', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条悬浮窗专属话术吗？')) {
      try {
        await fetch(`/api/v1/admin/float-scripts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        fetchScripts();
      } catch (error) {
        console.error('Failed to delete script', error);
      }
    }
  };

  const toggleStatus = async (script) => {
    try {
      await fetch(`/api/v1/admin/float-scripts/${script.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !script.isActive })
      });
      fetchScripts();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">悬浮窗话术配置</h1>
          <p className="text-gray-500 text-sm mt-1">管理推送到移动端 App 悬浮窗的“杀手锏”话术，仅限 VIP 用户可见。</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-pink-700 transition"
        >
          <Plus size={18} className="mr-2" />
          新增悬浮话术
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索问句或回复..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问句 (对方说)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">神级回复</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">加载中...</td>
              </tr>
            ) : scripts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">没有找到相关话术</td>
              </tr>
            ) : (
              scripts.map((script) => (
                <tr key={script.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{script.question}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 line-clamp-2 bg-pink-50 p-2 rounded">{script.answer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {script.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {script.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(script)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none ${
                        script.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {script.isActive ? <CheckCircle size={14} className="mr-1" /> : <XCircle size={14} className="mr-1" />}
                      {script.isActive ? '已启用' : '已禁用'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal(script)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(script.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{currentScript ? '编辑悬浮话术' : '新增悬浮话术'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问句内容 (对方说)</label>
                <textarea
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows="2"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="例如：你在干嘛？"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">神级回复 (我回复)</label>
                <textarea
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50"
                  rows="3"
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  placeholder="例如：在思考怎么才能不那么想你..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序值 (越大越靠前)</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  直接启用 (立刻推送到 App 悬浮窗)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                保存话术
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatScripts;
