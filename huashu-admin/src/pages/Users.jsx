import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Edit, Trash2, X, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vipFilter, setVipFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ isVip: false, points: 0, rank: '' });

  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.code === 200 || data.success) {
        setUsers(data.data.list || data.data);
      } else {
        setError('加载用户列表失败');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('服务器连接错误');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, fetchUsers]);

  const handleDelete = async (userId) => {
    if (window.confirm("确定要注销这个用户吗？此操作将清除其信息并将其状态改为已注销，无法恢复。")) {
      try {
        const response = await fetch(`/api/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (response.ok && data.success) {
          alert('用户已注销');
          fetchUsers(); // Refresh the list
        } else {
          alert(`操作失败: ${data.message || '未知错误'}`);
        }
      } catch (err) {
        console.error('Failed to delete user', err);
        alert('操作失败，服务器发生错误');
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      isVip: user.isVip,
      points: user.points,
      rank: user.rank || '新手'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/v1/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        // Update local state to reflect changes immediately
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editFormData } : u));
        setEditingUser(null);
      } else {
        alert('更新失败，请稍后重试');
      }
    } catch (err) {
      console.error('Update user error:', err);
      alert('网络错误');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = user.status !== 'banned';
      if (statusFilter === 'banned') matchesStatus = user.status === 'banned';

      let matchesVip = true;
      if (vipFilter === 'vip') matchesVip = user.isVip === true;
      if (vipFilter === 'normal') matchesVip = user.isVip !== true;

      return matchesSearch && matchesStatus && matchesVip;
    });
  }, [users, searchTerm, statusFilter, vipFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 relative pb-10">
      {/* 页面头部横幅 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* 背景光斑装饰 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-3 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider text-blue-100 uppercase">User Management</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-1">用户数据中心</h2>
          <p className="text-blue-100/80 font-medium max-w-lg text-sm">全面管理平台注册用户的核心资料、积分与段位状态。</p>
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          <button
            onClick={() => exportToCSV(filteredUsers, 'users')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            <Download size={18} />
            <span className="text-sm font-bold">导出 CSV</span>
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 shadow-sm flex items-center"><X size={18} className="mr-2"/>{error}</div>}

      {/* 控制栏卡片 */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="通过用户名检索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex w-full sm:w-auto space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer hover:border-blue-300"
            >
              <option value="all">所有账号状态</option>
              <option value="active">正常活跃</option>
              <option value="banned">已封禁</option>
            </select>
            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer hover:border-amber-300"
            >
              <option value="all">所有会员等级</option>
              <option value="vip">VIP 会员</option>
              <option value="normal">普通用户</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th scope="col" className="px-6 py-5">用户基础信息</th>
                <th scope="col" className="px-6 py-5">性别</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">段位</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">积分</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">VIP 状态</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-blue-500 shadow-sm"></div>
                      <span className="text-slate-400 font-medium text-sm animate-pulse">正在加载用户数据...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <Search className="text-slate-300" size={32} />
                      </div>
                      <span className="text-slate-500 font-medium">未能找到匹配的用户记录</span>
                      <p className="text-slate-400 text-sm mt-1">请尝试更换检索关键词或筛选条件</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 relative">
                          {user.avatar ? (
                            <img className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-200 transition-all group-hover:shadow-md" src={user.avatar} alt="" />
                          ) : (
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-200 transition-all group-hover:shadow-md">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          {user.isVip && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div></div>}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {user.name || '未知用户'}
                            {user.role === 'BANNED' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                已注销
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 inline-flex items-center shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></span>
                            ID: {user.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                      {user.gender === '男' ? (
                        <span className="text-blue-500 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>男生</span>
                      ) : user.gender === '女' ? (
                        <span className="text-pink-500 flex items-center"><span className="w-2 h-2 rounded-full bg-pink-400 mr-2"></span>女生</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/50 shadow-sm">
                        {user.rank || '新手起步'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-2 text-xs">P</span>
                        {user.points || 0}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {user.isVip ? (
                        <span className="px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200/50 shadow-sm">
                          ✨ 尊贵 VIP
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200/50">
                          免费用户
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-xl transition-colors shadow-sm" title="编辑资料"
                        >
                          <Edit size={16} />
                        </button>
                        {user.role !== 'BANNED' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-rose-600 hover:bg-rose-100 bg-rose-50 rounded-xl transition-colors shadow-sm" title="注销账号"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm font-medium text-slate-500">
                显示 <span className="text-slate-800 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 mx-1 shadow-sm">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-slate-800 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 mx-1 shadow-sm">{Math.min(currentPage * pageSize, filteredUsers.length)}</span>，总计 <span className="text-slate-800 font-bold">{filteredUsers.length}</span> 位用户
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all shadow-sm"
              >
                上一页
              </button>

              <div className="hidden sm:flex items-center px-2 space-x-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${isCurrent ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-slate-400 font-bold px-1">...</span>}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all shadow-sm"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal - Enhanced with Backdrop & Animations */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">编辑用户资料</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-rose-500 bg-white shadow-sm border border-slate-100 p-2 rounded-xl hover:bg-rose-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* User Identity Card */}
              <div className="flex items-center space-x-4 bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <img src={editingUser.avatar || `https://ui-avatars.com/api/?name=${editingUser.name}&background=random`} alt="avatar" className="w-14 h-14 rounded-2xl shadow-sm ring-2 ring-white" />
                <div>
                  <div className="font-bold text-slate-800 text-lg">{editingUser.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200">UID: {editingUser.id}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">VIP 会员状态</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    value={editFormData.isVip ? 'true' : 'false'}
                    onChange={e => setEditFormData({...editFormData, isVip: e.target.value === 'true'})}
                  >
                    <option value="false">普通免费用户</option>
                    <option value="true">尊贵 VIP 会员</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">活跃积分 (可抵扣服务)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    value={editFormData.points}
                    onChange={e => setEditFormData({...editFormData, points: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">社区段位标识</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    value={editFormData.rank}
                    onChange={e => setEditFormData({...editFormData, rank: e.target.value})}
                  >
                    <option value="新手">新手起步</option>
                    <option value="青铜">青铜</option>
                    <option value="白银">白银</option>
                    <option value="黄金">黄金</option>
                    <option value="铂金">铂金</option>
                    <option value="钻石">钻石</option>
                    <option value="星耀">星耀</option>
                    <option value="嘴强王者">嘴强王者</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex space-x-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-5 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 font-bold transition-all hover:border-slate-300 shadow-sm active:scale-95">
                  放弃修改
                </button>
                <button type="submit" className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95 border-2 border-transparent">
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;