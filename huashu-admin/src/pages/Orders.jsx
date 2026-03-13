import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle, FileText, ExternalLink, Calendar } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';
import { useAuth } from '../context/AuthContext';

const mockOrders = [
  { id: 'ORD-20231025-8891', userId: '1024', userName: '用户A', type: 'VIP_MONTH', amount: 19.9, status: 'SUCCESS', paymentMethod: 'WECHAT', createTime: '2023-10-25 14:30:22', payTime: '2023-10-25 14:30:25' },
  { id: 'ORD-20231025-3342', userId: '2056', userName: '恋爱小白', type: 'VIP_YEAR', amount: 168.0, status: 'SUCCESS', paymentMethod: 'ALIPAY', createTime: '2023-10-25 10:15:00', payTime: '2023-10-25 10:15:10' },
  { id: 'ORD-20231024-1120', userId: '3089', userName: '游客99', type: 'POINTS_100', amount: 9.9, status: 'PENDING', paymentMethod: 'WECHAT', createTime: '2023-10-24 16:20:11', payTime: null },
  { id: 'ORD-20231023-5567', userId: '4112', userName: '高手', type: 'VIP_LIFETIME', amount: 298.0, status: 'FAILED', paymentMethod: 'ALIPAY', createTime: '2023-10-23 09:00:00', payTime: null },
  { id: 'ORD-20231022-9988', userId: '5566', userName: '用户B', type: 'VIP_MONTH', amount: 19.9, status: 'REFUNDED', paymentMethod: 'WECHAT', createTime: '2023-10-22 20:30:00', payTime: '2023-10-22 20:30:15' },
];

const typeLabels = {
  VIP_MONTH: '包月会员',
  VIP_QUARTER: '包季会员',
  VIP_YEAR: '包年会员',
  VIP_LIFETIME: '终身会员',
  POINTS_100: '100 积分',
  POINTS_500: '500 积分',
};

const statusLabels = {
  SUCCESS: { label: '支付成功', icon: <CheckCircle size={16} className="text-emerald-500 mr-1.5" />, color: 'text-emerald-600 bg-emerald-50' },
  PENDING: { label: '待支付', icon: <Clock size={16} className="text-amber-500 mr-1.5" />, color: 'text-amber-600 bg-amber-50' },
  FAILED: { label: '支付失败', icon: <XCircle size={16} className="text-rose-500 mr-1.5" />, color: 'text-rose-600 bg-rose-50' },
  REFUNDED: { label: '已退款', icon: <Clock size={16} className="text-slate-500 mr-1.5" />, color: 'text-slate-600 bg-slate-50' },
};

const methodLabels = {
  WECHAT: '微信支付',
  ALIPAY: '支付宝',
};

const Orders = () => {

  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setOrders(data.data.list || data.data);
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.userId.includes(searchTerm);
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const successfulOrders = orders.filter(o => o.status === 'SUCCESS');
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.amount, 0);
    return {
      total: orders.length,
      successCount: successfulOrders.length,
      revenue: totalRevenue.toFixed(2)
    };
  }, [orders]);

  const handleOpenModal = (order) => {
    setCurrentOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">订单管理</h2>
          <p className="text-slate-500 mt-2">管理用户的 VIP 订阅及积分充值交易记录。</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => exportToCSV(filteredOrders, 'orders_export')}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="text-sm font-medium">导出报表</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">总订单数</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">成功订单</p>
            <h3 className="text-2xl font-bold text-emerald-600">{stats.successCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">累计成功交易额</p>
            <h3 className="text-2xl font-bold text-rose-600">¥ {stats.revenue}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-lg">
            ¥
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative group w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="搜索订单号、用户名或 ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all"
          />
        </div>

        <select
          className="w-full sm:w-auto pl-4 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm shadow-sm text-slate-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">全部状态</option>
          <option value="SUCCESS">支付成功</option>
          <option value="PENDING">待支付</option>
          <option value="FAILED">支付失败</option>
          <option value="REFUNDED">已退款</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">订单信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">用户信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">交易金额</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    没有找到符合条件的订单。
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-semibold text-slate-800 font-mono">{order.id}</span>
                        <div className="flex items-center text-xs text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-2">{typeLabels[order.type]}</span>
                          {methodLabels[order.paymentMethod]}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{order.createTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {order.userName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">{order.userName}</span>
                          <span className="text-xs text-slate-400 font-mono">ID: {order.userId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800">¥ {order.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${statusLabels[order.status].color}`}>
                        {statusLabels[order.status].icon}
                        {statusLabels[order.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(order)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-end ml-auto"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                订单详情
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center justify-center py-4 border-b border-dashed border-slate-200 mb-4">
                <span className="text-sm text-slate-500 mb-1">实付金额</span>
                <span className="text-4xl font-bold text-slate-800 tracking-tight">¥ {currentOrder.amount.toFixed(2)}</span>
                <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusLabels[currentOrder.status].color}`}>
                  {statusLabels[currentOrder.status].icon}
                  {statusLabels[currentOrder.status].label}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">订单编号</span>
                  <span className="text-slate-800 font-mono font-medium">{currentOrder.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">购买商品</span>
                  <span className="text-slate-800 font-medium">{typeLabels[currentOrder.type]}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">支付方式</span>
                  <span className="text-slate-800">{methodLabels[currentOrder.paymentMethod]}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">买家用户</span>
                  <span className="text-slate-800">{currentOrder.userName} <span className="text-slate-400 text-xs font-mono">(ID: {currentOrder.userId})</span></span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">创建时间</span>
                  <span className="text-slate-800 font-mono text-xs flex items-center">
                    <Calendar size={12} className="mr-1 text-slate-400" />
                    {currentOrder.createTime}
                  </span>
                </div>
                {currentOrder.payTime && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">支付时间</span>
                    <span className="text-slate-800 font-mono text-xs flex items-center">
                      <Calendar size={12} className="mr-1 text-slate-400" />
                      {currentOrder.payTime}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm w-full sm:w-auto"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;