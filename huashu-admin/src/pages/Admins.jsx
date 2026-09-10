import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit, Trash2, X, Plus, User, Download, CheckCircle, KeyRound } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  SUPER_ADMIN: { label: '超级管理员', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  ADMIN: { label: '管理员', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  EDITOR: { label: '内容运营', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  REVIEWER: { label: '审核员', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  GUEST: { label: '访客', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const Admins = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 权限定义（前端渲染勾选面板）
  const [permDefs, setPermDefs] = useState({ groups: [], roles: [] });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ username: '', name: '', password: '', role: 'EDITOR', status: 'ACTIVE', permissions: [] });

  // 解析管理员存储的 permissions(JSON 字符串或数组)
  const parsePermissions = (perm) => {
    if (!perm) return [];
    if (Array.isArray(perm)) return perm;
    try {
      const p = JSON.parse(perm);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/admins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        const list = data.data.list || data.data;
        // 普通化 permissions，便于前端操作
        setAdmins(list.map(a => ({ ...a, permissionsArr: parsePermissions(a.permissions) })));
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermDefs = async () => {
    try {
      const res = await fetch('/api/v1/admin/permissions-definitions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setPermDefs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch perm defs', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPermDefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Filter
  const filteredAdmins = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return admins.filter(admin =>
      (admin.username || '').toLowerCase().includes(q) ||
      (admin.name || '').toLowerCase().includes(q)
    );
  }, [admins, searchTerm]);

  // Handlers
  const handleDelete = async (id, role) => {
    if (role === 'SUPER_ADMIN') return;
    if (!window.confirm('确定要删除该管理员账号吗？')) return;
    try {
      const res = await fetch(`/api/v1/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setAdmins(admins.filter(a => a.id !== id));
      } else {
        alert(data.message || '删除失败');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingAdmin(null);
    setFormData({ username: '', name: '', password: '', role: 'EDITOR', status: 'ACTIVE', permissions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setModalMode('edit');
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      name: admin.name || '',
      password: '',
      role: admin.role,
      status: admin.status,
      permissions: admin.permissionsArr || []
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (role) => {
    // 切换角色时，若未自定义权限则同步该角色默认权限；超管默认拥有全部
    const roleDef = permDefs.roles.find(r => r.value === role);
    const perms = role === 'SUPER_ADMIN'
      ? allPermissionPoints()
      : (roleDef ? roleDef.permissions : []);
    setFormData({ ...formData, role, permissions: perms });
  };

  const allPermissionPoints = () => {
    const set = new Set();
    permDefs.groups.forEach(g => g.permissions.forEach(p => set.add(p)));
    return Array.from(set);
  };

  const togglePermission = (perm) => {
    const has = formData.permissions.includes(perm);
    setFormData({
      ...formData,
      permissions: has
        ? formData.permissions.filter(p => p !== perm)
        : [...formData.permissions, perm]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: formData.username,
      name: formData.name,
      role: formData.role,
      status: formData.status,
      permissions: formData.role === 'SUPER_ADMIN' ? [] : formData.permissions // 超管不存，默认全权限
    };
    // 新增时才传密码
    if (modalMode === 'create' && formData.password) {
      payload.password = formData.password;
    }

    const url = modalMode === 'edit' ? `/api/v1/admin/admins/${editingAdmin.id}` : '/api/v1/admin/admins';
    const method = modalMode === 'edit' ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.code === 200) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message || '保存失败');
      }
    } catch (err) {
      console.error(err);
      alert('保存失败，请稍后重试');
    }
  };

  const hasCustomPerms = (admin) => {
    const stored = admin.permissions;
    if (!stored) return false;
    try {
      const p = JSON.parse(stored);
      return Array.isArray(p) && p.length > 0;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">管理员权限分配</h2>
          <p className="text-slate-500 mt-2">管理后台账号及其操作角色 (RBAC + 细粒度权限点)。</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">新增账号</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">加载中...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">账号信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">角色权限</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">自定义权限</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">最后登录</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasCustomPerms(admin) ? (
                        <span className="inline-flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          <KeyRound size={12} className="mr-1" /> 已自定义
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">默认</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {admin.lastLogin || '-'}
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
                        onClick={() => openEditModal(admin)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-2 transition-colors" title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id, admin.role)}
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
        )}
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{modalMode === 'edit' ? '编辑管理员' : '新增管理员'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">登录账号 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'edit'}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名 / 备注</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">初始密码</label>
                    <input
                      type="text"
                      placeholder="默认 123456"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">分配角色</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {permDefs.roles.filter(r => r.value !== 'SUPER_ADMIN' || true).map(r => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => handleRoleChange(r.value)}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                        formData.role === r.value
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {r.name}
                      <span className="block text-[10px] font-normal opacity-70 mt-0.5">{r.permissions.length} 项权限</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.role !== 'SUPER_ADMIN' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">细粒度权限点</label>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => handleRoleChange(formData.role)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        跟随角色默认
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, permissions: allPermissionPoints() })}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        全选
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, permissions: [] })}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 border border-slate-100 rounded-xl p-4 max-h-64 overflow-y-auto">
                    {permDefs.groups.map(g => (
                      <div key={g.key} className="bg-white rounded-lg border border-slate-100 p-3">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{g.name}</div>
                        <div className="space-y-1.5">
                          {g.permissions.map(perm => {
                            const checked = formData.permissions.includes(perm);
                            return (
                              <label key={perm} className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(perm)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 accent-blue-600"
                                />
                                <span className={`text-xs ${checked ? 'text-blue-700 font-medium' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                  {perm}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex space-x-3 border-t border-slate-100">
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