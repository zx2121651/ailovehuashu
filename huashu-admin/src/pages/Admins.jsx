import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit, Trash2, X, Plus, Shield, User, Download, CheckCircle } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';
import { useAuth } from '../context/AuthContext';

const mockAdmins = [
  { id: 1, username: 'admin', role: 'SUPER_ADMIN', name: '系统管理员', lastLogin: '2023-10-25 15:30:22', status: 'ACTIVE' },
  { id: 2, username: 'editor_01', role: 'EDITOR', name: '内容运营', lastLogin: '2023-10-24 09:15:00', status: 'ACTIVE' },
  { id: 3, username: 'reviewer_li', role: 'REVIEWER', name: '李审核', lastLogin: '2023-10-25 11:20:11', status: 'ACTIVE' },
  { id: 4, username: 'test_user', role: 'GUEST', name: '测试号', lastLogin: '2023-09-01 10:00:00', status: 'INACTIVE' },
];

const roleLabels = {
  SUPER_ADMIN: { label: '超级管理员', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  EDITOR: { label: '内容运营', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  REVIEWER: { label: '审核员', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  GUEST: { label: '访客', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const Admins = () => {

  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/admins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setAdmins(data.data.list || data.data);
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ username: '', name: '', role: 'EDITOR', status: 'ACTIVE' });

  // Filter
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  // Handlers
  const handleDelete = (id) => {
    if(window.confirm('确定要删除该管理员账号吗？')) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  const openModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({ username: admin.username, name: admin.name, role: admin.role, status: admin.status });
    } else {
      setEditingAdmin(null);
      setFormData({ username: '', name: '', role: 'EDITOR', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAdmin) {
      setAdmins(admins.map(a => a.id === editingAdmin.id ? { ...a, ...formData } : a));
    } else {
      setAdmins([{
        id: Date.now(),
        ...formData,
        lastLogin: '尚未登录'
      }, ...admins]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">管理员权限分配</h2>
          <p className="text-slate-500 mt-2">管理后台账号及其操作角色 (RBAC)。</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => exportToCSV(filteredAdmins, 'admins')}
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
              placeholder="搜索账号或姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all w-64"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">新增账号</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">账号信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">角色权限</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">最后登录</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    没有找到符合条件的管理员账号。
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{admin.username}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{admin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-md border ${roleLabels[admin.role]?.color || roleLabels.GUEST.color}`}>
                        {roleLabels[admin.role]?.label || '未知角色'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {admin.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.status === 'ACTIVE' ? (
                        <span className="flex items-center text-sm text-emerald-600 font-medium">
                          <CheckCircle size={16} className="mr-1.5" /> 正常
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-slate-400 font-medium">
                          <X size={16} className="mr-1.5" /> 已停用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(admin)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-2 transition-colors" title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        disabled={admin.role === 'SUPER_ADMIN'}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="删除"
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
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingAdmin ? '编辑管理员' : '新增管理员'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">登录账号 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  disabled={!!editingAdmin}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名 / 备注 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">分配角色</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="SUPER_ADMIN">超级管理员</option>
                  <option value="EDITOR">内容运营</option>
                  <option value="REVIEWER">审核员</option>
                  <option value="GUEST">访客/查看者</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">账号状态</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE">正常使用</option>
                  <option value="INACTIVE">停用/冻结</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors">
                  取消
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/20">
                  保存设置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;