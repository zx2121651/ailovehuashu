import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'; // keep for UI

const BlindBoxList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const { adminToken } = useAuth();

  const [formData, setFormData] = useState({
    content: '',
    type: 'QUOTE',
    author: '',
    status: 'ACTIVE'
  });

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/blind-box', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setCards(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch blind box cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCard
        ? `/api/v1/admin/blind-box/${editingCard.id}`
        : '/api/v1/admin/blind-box';
      const method = editingCard ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.code === 200) {
        setIsModalOpen(false);
        fetchCards();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to save card:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个盲盒内容吗？')) return;
    try {
      const res = await fetch(`/api/v1/admin/blind-box/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        fetchCards();
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const openModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        content: card.content,
        type: card.type,
        author: card.author || '',
        status: card.status
      });
    } else {
      setEditingCard(null);
      setFormData({ content: '', type: 'QUOTE', author: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">每日盲盒管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理用户每日签到抽取的专属盲盒卡片内容</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={18} className="mr-2" />
          新增盲盒内容
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">类型</th>
                <th className="px-6 py-4 w-1/2">内容</th>
                <th className="px-6 py-4">作者/来源</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map(card => (
                <tr key={card.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">#{card.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${card.type === 'QUOTE' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {card.type === 'QUOTE' ? '早安语录' : '脱单技巧'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{card.content}</td>
                  <td className="px-6 py-4">{card.author || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {card.status === 'ACTIVE' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openModal(card)} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(card.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">暂无盲盒内容数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg p-4">
            <div className="relative bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingCard ? '编辑盲盒' : '新增盲盒'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm p-2 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">盲盒类型</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="QUOTE">早安语录</option>
                    <option value="TIP">脱单技巧/建议</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容详情 <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="请输入语录或技巧内容..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作者/来源 (选填)</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="例如：苏苏导师 / 佚名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="ACTIVE">启用 (允许被抽取)</option>
                    <option value="INACTIVE">禁用 (暂不抽取)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    保存盲盒
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlindBoxList;
