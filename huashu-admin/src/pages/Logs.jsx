import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, History, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';
import { useAuth } from '../context/AuthContext';

const mockLogs = [
  { id: 1, admin: 'admin', action: 'CREATE', module: 'CONTENT', detail: '新增话术: "你今天真好看"', ip: '192.168.1.100', timestamp: '2023-10-25 14:30:22', status: 'success' },
  { id: 2, admin: 'super_admin', action: 'UPDATE', module: 'USER', detail: '修改用户 1024 权限为 VIP', ip: '10.0.0.5', timestamp: '2023-10-25 11:15:00', status: 'success' },
  { id: 3, admin: 'admin', action: 'DELETE', module: 'CONTENT', detail: '删除了 3 条违规话术', ip: '192.168.1.100', timestamp: '2023-10-24 16:45:11', status: 'success' },
  { id: 4, admin: 'system', action: 'LOGIN', module: 'AUTH', detail: '超级管理员 admin 登录成功', ip: '127.0.0.1', timestamp: '2023-10-24 09:00:00', status: 'success' },
  { id: 5, admin: 'guest', action: 'LOGIN', module: 'AUTH', detail: '尝试暴力破解密码被拦截', ip: '45.33.12.98', timestamp: '2023-10-23 23:59:59', status: 'fail' },
  { id: 6, admin: 'editor', action: 'UPDATE', module: 'SETTINGS', detail: '开启了系统维护模式', ip: '10.0.0.8', timestamp: '2023-10-23 10:20:30', status: 'success' },
  { id: 7, admin: 'editor', action: 'APPROVE', module: 'UGC', detail: '审核通过 UGC 编号 #8892', ip: '10.0.0.8', timestamp: '2023-10-22 15:40:12', status: 'success' },
  { id: 8, admin: 'admin', action: 'REJECT', module: 'UGC', detail: '拒绝了 5 条垃圾投稿', ip: '192.168.1.100', timestamp: '2023-10-22 14:10:05', status: 'success' },
];

const actionColors = {
  CREATE: 'text-emerald-700 bg-emerald-100 border-emerald-200',
  UPDATE: 'text-blue-700 bg-blue-100 border-blue-200',
  DELETE: 'text-red-700 bg-red-100 border-red-200',
  LOGIN: 'text-purple-700 bg-purple-100 border-purple-200',
  APPROVE: 'text-teal-700 bg-teal-100 border-teal-200',
  REJECT: 'text-orange-700 bg-orange-100 border-orange-200'
};

const moduleNames = {
  CONTENT: '内容管理',
  USER: '用户管理',
  AUTH: '身份认证',
  SETTINGS: '系统设置',
  UGC: '用户投稿'
};

const Logs = () => {

  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setLogs(data.data.list || data.data);
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.ip.includes(searchTerm);
      const matchesModule = filterModule === 'ALL' || log.module === filterModule;
      return matchesSearch && matchesModule;
    });
  }, [searchTerm, filterModule]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">操作日志</h2>
          <p className="text-slate-500 mt-2">审计管理员操作，追踪系统关键事件。</p>
        </div>

        <button
          onClick={() => exportToCSV(filteredLogs, 'activity_logs')}
          className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download size={18} />
          <span className="text-sm font-medium">导出数据</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索操作员、详情或 IP 地址..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 outline-none"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative min-w-[180px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Filter className="w-5 h-5" />
          </div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border-none rounded-xl appearance-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">所有模块</option>
            {Object.entries(moduleNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 whitespace-nowrap">操作员</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 whitespace-nowrap">动作类型</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 whitespace-nowrap">模块</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 w-1/3">操作详情</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 whitespace-nowrap">IP 地址</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 whitespace-nowrap">发生时间</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-center whitespace-nowrap">状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {log.admin.charAt(0).toUpperCase()}
                        </div>
                        <span>{log.admin}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${actionColors[log.action] || 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {moduleNames[log.module] || log.module}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 line-clamp-2" title={log.detail}>
                      {log.detail}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-mono">
                      {log.ip}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {log.status === 'success' ? (
                        <div className="inline-flex p-1.5 bg-emerald-50 text-emerald-500 rounded-lg border border-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="inline-flex p-1.5 bg-red-50 text-red-500 rounded-lg border border-red-100" title="操作失败或异常">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <History className="w-12 h-12 text-slate-300" />
                      <p>未找到匹配的日志记录</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;