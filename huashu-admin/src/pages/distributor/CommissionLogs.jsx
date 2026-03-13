import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';

const CommissionLogs = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/commissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.list);
      }
    } catch (err) {
      console.error('获取佣金记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">全站佣金明细</h1>
          <p className="text-slate-500 text-sm mt-1">查看各级分销佣金产生记录</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
              <th className="p-4">记录ID</th>
              <th className="p-4">获佣用户</th>
              <th className="p-4">层级</th>
              <th className="p-4">佣金金额</th>
              <th className="p-4">来源订单</th>
              <th className="p-4">产生时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">加载中...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">暂无佣金流水数据</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">#{log.id}</td>
                  <td className="p-4 font-medium text-slate-800">{log.user.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      log.level === 1 ? 'bg-blue-100 text-blue-700' :
                      log.level === 2 ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {log.level}级分销
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">+¥{log.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="text-slate-800">{log.order.type}订单</div>
                    <div className="text-xs text-slate-500 mt-0.5">来源用户: {log.order.userName}</div>
                  </td>
                  <td className="p-4 text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionLogs;