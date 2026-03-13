import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, RefreshCw } from 'lucide-react';

const Distributors = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const { token } = useAuth();

  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/distributors?keyword=${keyword}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDistributors(data.data.list);
      }
    } catch (err) {
      console.error('Failed to fetch distributors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">分销商列表</h2>
          <p className="text-sm text-slate-500 mt-1">查看所有参与分销的用户及其收益情况</p>
        </div>
        <button
          onClick={fetchDistributors}
          className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索用户名..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDistributors()}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={fetchDistributors}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          查询
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">分销商</th>
              <th className="px-6 py-4">身份状态</th>
              <th className="px-6 py-4">直推人数</th>
              <th className="px-6 py-4">可提现余额</th>
              <th className="px-6 py-4">累计总收益</th>
              <th className="px-6 py-4">加入时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {distributors.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img src={user.avatar || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                    <span className="ml-3 font-medium text-slate-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.isVip ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">VIP 分销商</span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">普通分销商</span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">{user.teamSizeLevel1} 人</td>
                <td className="px-6 py-4 font-bold text-slate-800">¥ {user.balance.toFixed(2)}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">¥ {user.totalEarned.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {distributors.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 mb-2 text-slate-300" />
                    <p>暂无数据</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Distributors;
