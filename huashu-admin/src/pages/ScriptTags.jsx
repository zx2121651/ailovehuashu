import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tag, Plus, Trash2, Edit2, GripVertical, Save, X, ArrowLeft } from 'lucide-react';

const ScriptTags = () => {
  const [activeTab, setActiveTab] = useState('sortTabs'); // 'sortTabs' or 'categoryTags'
  const [sortTabs, setSortTabs] = useState([]);
  const [categoryTags, setCategoryTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Modal states
  const [isSortTabModalOpen, setIsSortTabModalOpen] = useState(false);
  const [isCategoryTagModalOpen, setIsCategoryTagModalOpen] = useState(false);
  const [editingSortTab, setEditingSortTab] = useState(null);
  const [editingCategoryTag, setEditingCategoryTag] = useState(null);

  // Form states
  const [sortTabForm, setSortTabForm] = useState({ key: '', label: '', sort: 'new', isDefault: false, sortOrder: 0 });
  const [categoryTagForm, setCategoryTagForm] = useState({ name: '', categoryId: '', sortOrder: 0 });

  const { token } = useAuth();

  // Fetch data on mount
  useEffect(() => {
    fetchSortTabs();
    fetchCategories();
  }, [token]);

  // Fetch category tags when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryTags(selectedCategory);
    }
  }, [selectedCategory, token]);

  const fetchSortTabs = async () => {
    try {
      const response = await fetch('/api/v1/admin/script-sort-tabs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200 || data.success) {
        setSortTabs(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch sort tabs', err);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/categories?type=SCRIPT', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200 || data.success) {
        setCategories(data.data || []);
        if (data.data && data.data.length > 0 && !selectedCategory) {
          setSelectedCategory(data.data[0].id);
        }
      }
    } catch (err) {
      setError('加载分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTags = async (categoryId) => {
    try {
      const response = await fetch(`/api/v1/admin/categories/${categoryId}/tags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200 || data.success) {
        setCategoryTags(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch category tags', err);
    }
  };

  // Sort Tab handlers
  const handleSaveSortTab = async (e) => {
    e.preventDefault();
    try {
      const url = editingSortTab 
        ? `/api/v1/admin/script-sort-tabs/${editingSortTab.id}`
        : '/api/v1/admin/script-sort-tabs';
      const method = editingSortTab ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sortTabForm)
      });

      const data = await response.json();
      if (data.code === 200 || data.success) {
        setToast(editingSortTab ? '更新成功！' : '创建成功！');
        fetchSortTabs();
        closeSortTabModal();
      } else {
        setToast(data.message || '操作失败');
      }
    } catch (err) {
      setToast('网络错误');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeleteSortTab = async (id) => {
    if (!window.confirm('确定要删除这个排序标签吗？')) return;
    try {
      const response = await fetch(`/api/v1/admin/script-sort-tabs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200 || data.success) {
        setToast('删除成功！');
        fetchSortTabs();
      }
    } catch (err) {
      setToast('删除失败');
    }
    setTimeout(() => setToast(''), 3000);
  };

  // Category Tag handlers
  const handleSaveCategoryTag = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategoryTag 
        ? `/api/v1/admin/category-tags/${editingCategoryTag.id}`
        : '/api/v1/admin/category-tags';
      const method = editingCategoryTag ? 'PUT' : 'POST';

      const body = editingCategoryTag 
        ? { name: categoryTagForm.name, sortOrder: categoryTagForm.sortOrder }
        : { ...categoryTagForm, categoryId: selectedCategory };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.code === 200 || data.success) {
        setToast(editingCategoryTag ? '更新成功！' : '创建成功！');
        fetchCategoryTags(selectedCategory);
        closeCategoryTagModal();
      } else {
        setToast(data.message || '操作失败');
      }
    } catch (err) {
      setToast('网络错误');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeleteCategoryTag = async (id) => {
    if (!window.confirm('确定要删除这个分类标签吗？')) return;
    try {
      const response = await fetch(`/api/v1/admin/category-tags/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200 || data.success) {
        setToast('删除成功！');
        fetchCategoryTags(selectedCategory);
      }
    } catch (err) {
      setToast('删除失败');
    }
    setTimeout(() => setToast(''), 3000);
  };

  // Modal helpers
  const openSortTabModal = (tab = null) => {
    setEditingSortTab(tab);
    if (tab) {
      setSortTabForm({
        key: tab.key,
        label: tab.label,
        sort: tab.sort,
        isDefault: tab.isDefault,
        sortOrder: tab.sortOrder,
        status: tab.status
      });
    } else {
      setSortTabForm({ key: '', label: '', sort: 'new', isDefault: false, sortOrder: sortTabs.length });
    }
    setIsSortTabModalOpen(true);
  };

  const closeSortTabModal = () => {
    setIsSortTabModalOpen(false);
    setEditingSortTab(null);
    setSortTabForm({ key: '', label: '', sort: 'new', isDefault: false, sortOrder: 0 });
  };

  const openCategoryTagModal = (tag = null) => {
    setEditingCategoryTag(tag);
    if (tag) {
      setCategoryTagForm({
        name: tag.name,
        categoryId: tag.categoryId,
        sortOrder: tag.sortOrder
      });
    } else {
      setCategoryTagForm({ name: '', categoryId: selectedCategory, sortOrder: categoryTags.length });
    }
    setIsCategoryTagModalOpen(true);
  };

  const closeCategoryTagModal = () => {
    setIsCategoryTagModalOpen(false);
    setEditingCategoryTag(null);
    setCategoryTagForm({ name: '', categoryId: '', sortOrder: 0 });
  };

  const getSortLabel = (sort) => {
    const map = { new: '最新', hot: '最热', default: '默认' };
    return map[sort] || sort;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">话术库标签管理</h2>
          <p className="text-slate-500 mt-1">管理话术库的排序标签和分类标签</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sortTabs')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'sortTabs'
              ? 'text-pink-600 border-b-2 border-pink-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          排序标签
        </button>
        <button
          onClick={() => setActiveTab('categoryTags')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'categoryTags'
              ? 'text-pink-600 border-b-2 border-pink-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          分类标签
        </button>
      </div>

      {/* Sort Tabs Content */}
      {activeTab === 'sortTabs' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">排序标签</h3>
              <p className="text-sm text-slate-500 mt-1">管理话术库页面的排序选项（最新、最热、推荐）</p>
            </div>
            <button
              onClick={() => openSortTabModal()}
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加标签
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {sortTabs.map((tab, index) => (
              <div key={tab.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-slate-400">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-800">{tab.label}</span>
                      {tab.isDefault && (
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">默认</span>
                      )}
                      {tab.status === 'INACTIVE' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">已禁用</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      标识: {tab.key} | 排序方式: {getSortLabel(tab.sort)} | 顺序: {tab.sortOrder}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openSortTabModal(tab)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSortTab(tab.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {sortTabs.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                暂无排序标签，点击上方按钮添加
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Tags Content */}
      {activeTab === 'categoryTags' && (
        <div className="space-y-4">
          {/* Category Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">选择分类</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {categories.find(c => c.id === selectedCategory)?.name || '分类'} 的标签
                </h3>
                <p className="text-sm text-slate-500 mt-1">管理该分类下的筛选标签</p>
              </div>
              <button
                onClick={() => openCategoryTagModal()}
                className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加标签
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {categoryTags.map((tag) => (
                <div key={tag.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-slate-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">{tag.name}</span>
                      <div className="text-sm text-slate-500 mt-0.5">顺序: {tag.sortOrder}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCategoryTagModal(tag)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoryTag(tag.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {categoryTags.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  该分类暂无标签，点击上方按钮添加
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sort Tab Modal */}
      {isSortTabModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingSortTab ? '编辑排序标签' : '添加排序标签'}
              </h3>
              <button onClick={closeSortTabModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSortTab} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标识 (key)</label>
                <input
                  type="text"
                  value={sortTabForm.key}
                  onChange={(e) => setSortTabForm({ ...sortTabForm, key: e.target.value })}
                  placeholder="如: hot, latest, recommend"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">显示名称</label>
                <input
                  type="text"
                  value={sortTabForm.label}
                  onChange={(e) => setSortTabForm({ ...sortTabForm, label: e.target.value })}
                  placeholder="如: 最热, 最新, 推荐"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">排序方式</label>
                <select
                  value={sortTabForm.sort}
                  onChange={(e) => setSortTabForm({ ...sortTabForm, sort: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  <option value="new">最新发布</option>
                  <option value="hot">最热</option>
                  <option value="default">默认/推荐</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">显示顺序</label>
                <input
                  type="number"
                  value={sortTabForm.sortOrder}
                  onChange={(e) => setSortTabForm({ ...sortTabForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={sortTabForm.isDefault}
                  onChange={(e) => setSortTabForm({ ...sortTabForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-slate-700">设为默认选中</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status"
                  checked={sortTabForm.status !== 'INACTIVE'}
                  onChange={(e) => setSortTabForm({ ...sortTabForm, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <label htmlFor="status" className="ml-2 text-sm text-slate-700">启用</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeSortTabModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {editingSortTab ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Tag Modal */}
      {isCategoryTagModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingCategoryTag ? '编辑分类标签' : '添加分类标签'}
              </h3>
              <button onClick={closeCategoryTagModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategoryTag} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标签名称</label>
                <input
                  type="text"
                  value={categoryTagForm.name}
                  onChange={(e) => setCategoryTagForm({ ...categoryTagForm, name: e.target.value })}
                  placeholder="如: #相亲开场, #微信首聊"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">显示顺序</label>
                <input
                  type="number"
                  value={categoryTagForm.sortOrder}
                  onChange={(e) => setCategoryTagForm({ ...categoryTagForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryTagModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {editingCategoryTag ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptTags;
