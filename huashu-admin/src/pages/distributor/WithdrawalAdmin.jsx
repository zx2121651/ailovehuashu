import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';

const WithdrawalAdmin = () => {
  const { token } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/withdrawals?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setWithdrawals(data.data.list);
      }
    } catch (err) {
      console.error('获取提现记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (!window.confirm(`确认要 ${status === 'APPROVED' ? '通过' : '驳回'} 审核吗？`)) return;

    try {
      const response = await fetch(`/api/v1/admin/withdrawals/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchWithdrawals(); // 重新加载列表
      } else {
        alert(data.message || '操作失败');
      }
    } catch (err) {
      console.error('审核失败', err);
      alert('操作失败，请重试');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">提现审核管理</h1>
          <p className="text-slate-500 text-sm mt-1">处理用户的佣金提现申请</p>
        </div>
        <div className="flex space-x-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'ALL' ? '' : status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (statusFilter === status || (status === 'ALL' && statusFilter === ''))
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? '全部' : status === 'PENDING' ? '待审核' : status === 'APPROVED' ? '已通过' : '已驳回'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                <th className="p-4">申请ID</th>
                <th className="p-4">申请人</th>
                <th className="p-4">提现金额</th>
                <th className="p-4">收款账号 (支付宝)</th>
                <th className="p-4">申请时间</th>
                <th className="p-4">状态</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">加载中...</td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">暂无提现申请数据</td>
                </tr>
              ) : (
                withdrawals.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">#{item.id}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <img src={item.user.avatar || 'https://via.placeholder.com/32'} alt="avatar" className="w-8 h-8 rounded-full mr-3" />
                        <div>
                          <div className="font-medium text-slate-800">{item.user.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">余额: ¥{item.user.balance.toFixed(2)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-rose-600">¥{item.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="text-slate-800">{item.accountInfo.account}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.accountInfo.name}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status === 'PENDING' ? '待审核' : item.status === 'APPROVED' ? '已打款' : '已驳回'}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.status === 'PENDING' ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleReview(item.id, 'APPROVED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="标记为已打款"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReview(item.id, 'REJECTED')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="驳回申请并退款"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 text-xs">-</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalAdmin;