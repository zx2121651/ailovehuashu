import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Send, Clock, Trash2, CheckCircle, Users, Bell, AlertCircle, XCircle } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: '系统维护通知', content: '系统将于今晚 12:00 进行例行维护，预计停机 2 小时。', target: 'ALL', status: 'SENT', createTime: '2023-10-24 10:00:00', sendTime: '2023-10-24 10:05:00', successCount: 15420 },
  { id: 2, title: 'VIP 续费专属优惠', content: '亲爱的 VIP 用户，您的专属续费 8 折券已发放，请查收！', target: 'VIP', status: 'SENT', createTime: '2023-10-23 09:30:00', sendTime: '2023-10-23 09:35:00', successCount: 1250 },
  { id: 3, title: '七夕活动预热', content: '七夕马上到了，新版高情商话术包已经上线，快来查看吧。', target: 'ALL', status: 'PENDING', createTime: '2023-10-25 14:00:00', sendTime: '2023-10-26 10:00:00', successCount: 0 },
];

const targetLabels = {
  ALL: { label: '全站用户', icon: <Users size={14} className="mr-1" /> },
  VIP: { label: 'VIP 会员', icon: <AlertCircle size={14} className="mr-1" /> },
  SPECIFIC: { label: '指定用户', icon: <Bell size={14} className="mr-1" /> },
};

const statusLabels = {
  SENT: { label: '已发送', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  PENDING: { label: '定时发送 (待办)', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  FAILED: { label: '发送失败', color: 'text-rose-600 bg-rose-50 border-rose-200' },
};

const Notifications = () => {

  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200 || data.success) {
        setNotifications(data.data.list || data.data || mockNotifications);
      } else {
        setNotifications(mockNotifications);
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', target: 'ALL', specificUsers: '', isScheduled: false, scheduledTime: ''
  });

  // Filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notifications, searchTerm]);

  // Handlers
  const handleOpenModal = () => {
    setFormData({
      title: '', content: '', target: 'ALL', specificUsers: '', isScheduled: false, scheduledTime: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotif = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      target: formData.target,
      status: formData.isScheduled ? 'PENDING' : 'SENT',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      sendTime: formData.isScheduled ? formData.scheduledTime.replace('T', ' ') : new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      successCount: formData.isScheduled ? 0 : Math.floor(Math.random() * 10000) // mock data
    };

    setNotifications([newNotif, ...notifications]);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('确定要删除这条推送记录吗？如果是待发送任务，删除将取消发送。')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">消息推送管理</h2>
          <p className="text-slate-500 mt-2">向应用端用户发送系统通知、活动公告及福利提醒。</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="搜索推送标题或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all w-64"
            />
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Send size={18} />
            <span className="text-sm font-medium">新建推送</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">推送信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">消息内容</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">时间范围</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态数据</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    没有找到推送记录。
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-semibold text-slate-800 line-clamp-1">{notif.title}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 w-fit">
                          {targetLabels[notif.target]?.icon}
                          {targetLabels[notif.target]?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{notif.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1 text-xs font-mono">
                        <div className="flex items-center text-slate-400">
                          <span className="w-12 text-slate-500 font-sans">创建:</span>
                          {notif.createTime}
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="w-12 text-slate-500 font-sans">发送:</span>
                          {notif.sendTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${statusLabels[notif.status].color} w-fit`}>
                          {notif.status === 'SENT' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                          {statusLabels[notif.status].label}
                        </span>
                        {notif.status === 'SENT' && (
                          <span className="text-xs text-slate-500">
                            送达: <strong className="text-slate-700">{notif.successCount.toLocaleString()}</strong> 人
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="删除"
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

      {/* Create Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Bell size={20} className="mr-2 text-blue-600" />
                新建消息推送
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <form id="notifForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">推送标题 <span className="text-rose-500">*</span></label>
                <input
                  type="text" required maxLength={50}
                  placeholder="最多 50 个字符"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">推送内容 <span className="text-rose-500">*</span></label>
                <textarea
                  required rows={4} maxLength={200}
                  placeholder="最多 200 个字符"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">推送目标 <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, target: 'ALL'})} className={`py-2 px-3 border rounded-xl text-sm font-medium transition-all ${formData.target === 'ALL' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    全站用户
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, target: 'VIP'})} className={`py-2 px-3 border rounded-xl text-sm font-medium transition-all ${formData.target === 'VIP' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    VIP 会员
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, target: 'SPECIFIC'})} className={`py-2 px-3 border rounded-xl text-sm font-medium transition-all ${formData.target === 'SPECIFIC' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    指定用户
                  </button>
                </div>
              </div>

              {formData.target === 'SPECIFIC' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">用户 ID (逗号分隔) <span className="text-rose-500">*</span></label>
                  <input
                    type="text" required={formData.target === 'SPECIFIC'}
                    placeholder="如: 1024, 2048, 4096"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    value={formData.specificUsers}
                    onChange={e => setFormData({...formData, specificUsers: e.target.value})}
                  />
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 cursor-pointer flex items-center">
                    定时发送
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isScheduled}
                      onChange={e => setFormData({...formData, isScheduled: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {formData.isScheduled && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <input
                      type="datetime-local" required={formData.isScheduled}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={formData.scheduledTime}
                      onChange={e => setFormData({...formData, scheduledTime: e.target.value})}
                    />
                  </div>
                )}
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
                form="notifForm"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/20 flex items-center"
              >
                <Send size={16} className="mr-2" />
                {formData.isScheduled ? '设定定时发送' : '立即发送'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;