import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Image as ImageIcon, Link as LinkIcon, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';
import { useAuth } from '../context/AuthContext';

const mockBanners = [
  { id: 1, title: '七夕节限时活动', type: 'BANNER', targetUrl: '/pages/activity/qixi', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400&h=200', sortOrder: 1, status: 'ACTIVE', startTime: '2023-08-20', endTime: '2023-08-25' },
  { id: 2, title: '充值送积分', type: 'BANNER', targetUrl: '/pages/vip/recharge', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400&h=200', sortOrder: 2, status: 'ACTIVE', startTime: '2023-10-01', endTime: '2023-12-31' },
  { id: 3, title: '话术库更新公告 v2.0', type: 'ANNOUNCEMENT', targetUrl: '/pages/article/update-v2', content: '我们在这个版本中新增了超过 500 条高情商回复...', sortOrder: 1, status: 'INACTIVE', startTime: '2023-09-01', endTime: '2023-09-30' },
  { id: 4, title: '防骗安全提示', type: 'ANNOUNCEMENT', targetUrl: '', content: '近期网络诈骗高发，请勿轻信陌生人转账要求...', sortOrder: 99, status: 'ACTIVE', startTime: '2023-01-01', endTime: '2025-12-31' },
];

const Banners = () => {

  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/banners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setBanners(data.data.list || data.data);
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const [banners, setBanners] = useState([]);
  const [activeTab, setActiveTab] = useState('BANNER'); // 'BANNER' or 'ANNOUNCEMENT'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '', type: 'BANNER', targetUrl: '', imageUrl: '', content: '', sortOrder: 1, status: 'ACTIVE', startTime: '', endTime: ''
  });

  // Filter
  const filteredBanners = useMemo(() => {
    return banners.filter(b =>
      b.type === activeTab &&
      b.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [banners, activeTab, searchTerm]);

  // Handlers
  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({ ...banner });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '', type: activeTab, targetUrl: '', imageUrl: '', content: '', sortOrder: 1, status: 'ACTIVE',
        startTime: new Date().toISOString().split('T')[0],
        endTime: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...formData } : b));
    } else {
      setBanners([{
        id: Date.now(),
        ...formData
      }, ...banners]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('确定要删除该项运营数据吗？')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setBanners(banners.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">运营位管理</h2>
          <p className="text-slate-500 mt-2">管理小程序首页轮播图、活动推荐与系统公告。</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col sm:flex-row p-4 gap-4 items-center justify-between">
        {/* Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl shadow-inner border border-slate-100">
          <button
            onClick={() => setActiveTab('BANNER')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'BANNER' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
          >
            首页轮播图
          </button>
          <button
            onClick={() => setActiveTab('ANNOUNCEMENT')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'ANNOUNCEMENT' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
          >
            系统公告
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="搜索标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex-shrink-0 flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            <span className="text-sm font-medium hidden sm:inline">
              新增{activeTab === 'BANNER' ? '轮播' : '公告'}
            </span>
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBanners.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
            {activeTab === 'BANNER' ? (
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs">无图片</span>
                  </div>
                )}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white shadow-sm backdrop-blur-sm ${item.status === 'ACTIVE' ? 'bg-emerald-500/80' : 'bg-slate-500/80'}`}>
                  {item.status === 'ACTIVE' ? '展示中' : '已下线'}
                </div>
              </div>
            ) : (
              <div className="p-5 border-b border-slate-50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 relative">
                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold shadow-sm ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {item.status === 'ACTIVE' ? '展示中' : '已下线'}
                </div>
                <div className="text-3xl font-serif text-blue-200 absolute right-4 top-1/2 -translate-y-1/2 opacity-50 select-none">"</div>
                <h4 className="font-bold text-slate-800 text-lg pr-12 line-clamp-1">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.content || '无内容'}</p>
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2 mb-4">
                {activeTab === 'BANNER' && (
                  <h4 className="font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                )}
                {item.targetUrl && (
                  <div className="flex items-start text-xs text-slate-500">
                    <LinkIcon size={14} className="mr-1.5 mt-0.5 flex-shrink-0 text-blue-400" />
                    <span className="line-clamp-1 font-mono bg-slate-50 px-1 rounded">{item.targetUrl}</span>
                  </div>
                )}
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar size={14} className="mr-1.5 flex-shrink-0" />
                  <span>{item.startTime} 至 {item.endTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded">排序: {item.sortOrder}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`p-1.5 rounded-lg transition-colors ${item.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                    title={item.status === 'ACTIVE' ? '下线' : '上线'}
                  >
                    {item.status === 'ACTIVE' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button onClick={() => handleOpenModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="删除">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredBanners.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <ImageIcon size={48} className="mb-4 text-slate-300" />
            <p>暂无{activeTab === 'BANNER' ? '轮播图' : '公告'}数据</p>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingBanner ? `编辑${activeTab === 'BANNER' ? '轮播图' : '公告'}` : `新增${activeTab === 'BANNER' ? '轮播图' : '公告'}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <form id="bannerForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">标题名称 <span className="text-rose-500">*</span></label>
                <input
                  type="text" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {activeTab === 'BANNER' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">图片 URL <span className="text-rose-500">*</span></label>
                  <input
                    type="url" required
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                      <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ANNOUNCEMENT' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">公告内容 <span className="text-rose-500">*</span></label>
                  <textarea
                    required rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">跳转链接 (可选)</label>
                <input
                  type="text"
                  placeholder="/pages/..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  value={formData.targetUrl}
                  onChange={e => setFormData({...formData, targetUrl: e.target.value})}
                />
                <p className="text-xs text-slate-400 mt-1">支持小程序内部路径，或外部 https 链接</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">开始时间 <span className="text-rose-500">*</span></label>
                  <input
                    type="date" required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">结束时间 <span className="text-rose-500">*</span></label>
                  <input
                    type="date" required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">展示排序</label>
                  <input
                    type="number" min="1"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.sortOrder}
                    onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 1})}
                  />
                  <p className="text-xs text-slate-400 mt-1">数字越小越靠前</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">状态</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">立即展示 (Active)</option>
                    <option value="INACTIVE">暂不下线 (Inactive)</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white font-medium transition-colors shadow-sm"
              >
                取消
              </button>
              <button
                type="submit"
                form="bannerForm"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/20"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;