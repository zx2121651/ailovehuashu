import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Folder, Palette, Plus, Trash2 } from 'lucide-react';

const Categories = ({ type = 'SCRIPT' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null means create mode
  const [formData, setFormData] = useState({ name: '', icon: '', color: '' });

  const { token } = useAuth();

  const isCommunity = type === 'POST';
  const pageTitle = isCommunity ? '社区分类管理' : '话术分类管理';
  const pageDesc = isCommunity ? '管理社区动态的话题分类，控制图标与颜色主题。' : '管理系统话术库的话题分类，控制图标与颜色主题。';
  const itemTypeLabel = isCommunity ? '动态内容' : '话术内容';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/categories?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.code === 200 || data.success) {
        setCategories(data.data);
      } else {
        setError('加载分类列表失败');
      }
    } catch (err) {
      setError('服务器连接错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token, type]);

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color
      });
    } else {
      setFormData({ name: '', icon: '📦', color: colorPresets[0] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingCategory;
    const url = isEditing ? `/api/v1/admin/categories/${editingCategory.id}` : '/api/v1/admin/categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const payload = { ...formData };
      if (!isEditing) {
        payload.type = type;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        fetchCategories();
        closeModal();
      } else {
        alert(result.message || (isEditing ? '更新失败，请稍后重试' : '创建失败，请稍后重试'));
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个分类吗？如果分类下还有话术或动态将无法删除。')) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        fetchCategories();
      } else {
        alert(result.message || '删除失败，请稍后重试');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  const colorPresets = [
    'from-blue-400 to-cyan-300',
    'from-pink-400 to-rose-300',
    'from-orange-400 to-red-300',
    'from-indigo-400 to-purple-300',
    'from-violet-400 to-fuchsia-300',
    'from-teal-400 to-emerald-300'
  ];

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{pageTitle}</h2>
          <p className="text-slate-500 mt-2">{pageDesc}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
        >
          <Plus size={20} className="mr-2" />
          新建分类
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-500">正在加载分类数据...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            暂无分类数据
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300 group">
              <div className={`h-24 bg-gradient-to-br ${category.color} flex items-center justify-center relative`}>
                <span className="text-5xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-6 right-6 flex space-x-2 z-10">
                  <button
                    onClick={() => openModal(category)}
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-slate-100"
                    title="编辑分类"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-100"
                    title="删除分类"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{category.name}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-3">
                  <Folder size={16} className="mr-1.5 opacity-70" />
                  包含 <span className="font-semibold text-slate-700 mx-1">{category.count || 0}</span> 条{itemTypeLabel}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                {editingCategory ? '编辑分类信息' : '新建分类'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              <div className="flex justify-center mb-2">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${formData.color || 'from-slate-200 to-slate-300'} flex items-center justify-center shadow-inner`}>
                  <span className="text-4xl filter drop-shadow-md">{formData.icon || '📦'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">分类名称</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emoji 图标</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-center text-2xl"
                  value={formData.icon}
                  onChange={e => setFormData({...formData, icon: e.target.value})}
                  maxLength={2}
                />
                <p className="text-xs text-slate-400 mt-1.5">输入一个合适的 Emoji 作为分类图标</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <Palette size={16} className="mr-1.5 text-slate-400" />
                  主题渐变色
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {colorPresets.map((color, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFormData({...formData, color})}
                      className={`h-10 rounded-lg cursor-pointer bg-gradient-to-br ${color} ${formData.color === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:opacity-80'}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm">
                  取消
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30">
                  {editingCategory ? '保存修改' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;