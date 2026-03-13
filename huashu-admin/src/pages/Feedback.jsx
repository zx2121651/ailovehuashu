import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, Clock, Trash2, X, Send, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';
import { useAuth } from '../context/AuthContext';

const mockFeedback = [
  { id: 1, userId: '1024', userName: '用户A', type: 'BUG', content: '打开话术详情页闪退', status: 'PENDING', createTime: '2023-10-25 14:30:22', images: [] },
  { id: 2, userId: '2056', userName: '恋爱小白', type: 'SUGGESTION', content: '希望能增加更多关于相亲场景的话术分类，现在的有点少。', status: 'REPLIED', reply: '感谢您的建议，我们将在下个版本中补充相亲类话术！', createTime: '2023-10-24 09:15:00', images: ['https://via.placeholder.com/150'] },
  { id: 3, userId: '3089', userName: '测试人员', type: 'ACCOUNT', content: '充值了 VIP 但是没有生效，急！', status: 'PENDING', createTime: '2023-10-25 11:20:11', images: [] },
  { id: 4, userId: '4112', userName: '游客110', type: 'OTHER', content: 'UI 颜色能不能换个暖色调的？', status: 'IGNORED', createTime: '2023-10-20 10:00:00', images: [] },
];

const typeLabels = {
  BUG: { label: '程序错误', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  SUGGESTION: { label: '功能建议', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ACCOUNT: { label: '账户/支付', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  OTHER: { label: '其他', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const statusLabels = {
  PENDING: { label: '待处理', icon: <Clock size={16} className="text-amber-500 mr-1.5" /> },
  REPLIED: { label: '已回复', icon: <CheckCircle size={16} className="text-emerald-500 mr-1.5" /> },
  IGNORED: { label: '已忽略', icon: <X size={16} className="text-slate-400 mr-1.5" /> },
};

const Feedback = () => {

  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/feedbacks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setFeedbacks(data.data.list || data.data);
      }
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const [feedbacks, setFeedbacks] = useState(mockFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Filtering
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const matchSearch = f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [feedbacks, searchTerm, statusFilter]);

  // Handlers
  const handleOpenModal = (feedback) => {
    setCurrentFeedback(feedback);
    setReplyContent(feedback.reply || '');
    setIsModalOpen(true);
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setFeedbacks(feedbacks.map(f =>
      f.id === currentFeedback.id ? { ...f, status: 'REPLIED', reply: replyContent } : f
    ));
    setIsModalOpen(false);
  };

  const handleIgnore = (id) => {
    setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'IGNORED' } : f));
  };

  const handleDelete = (id) => {
    if(window.confirm('确定要删除该条反馈记录吗？')) {
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">用户反馈管理</h2>
          <p className="text-slate-500 mt-2">处理用户提交的错误报告、建议及账户工单。</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => exportToCSV(filteredFeedbacks, 'user_feedback')}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="text-sm font-medium">导出记录</span>
          </button>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="搜索反馈内容或用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all w-64"
            />
          </div>

          <select
            className="pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm shadow-sm text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">全部状态</option>
            <option value="PENDING">待处理</option>
            <option value="REPLIED">已回复</option>
            <option value="IGNORED">已忽略</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">反馈信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/4">反馈内容</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/6">状态</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    没有找到符合条件的反馈记录。
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-semibold text-slate-800">{item.userName}</span>
                        <span className="text-xs text-slate-400 font-mono">ID: {item.userId}</span>
                        <span className="text-xs text-slate-400 mt-1">{item.createTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start space-y-2">
                        <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded border ${typeLabels[item.type]?.color || typeLabels.OTHER.color}`}>
                          {typeLabels[item.type]?.label || '未知类型'}
                        </span>
                        <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">{item.content}</p>
                        {item.images && item.images.length > 0 && (
                          <div className="flex space-x-2 mt-1">
                            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded flex items-center">
                              附带图片 ({item.images.length})
                            </span>
                          </div>
                        )}
                        {item.status === 'REPLIED' && (
                          <div className="w-full bg-slate-50 p-2 rounded-lg text-xs text-slate-600 mt-2 border border-slate-100 flex items-start">
                            <Send size={12} className="mt-0.5 mr-1.5 text-blue-500 flex-shrink-0" />
                            <span className="line-clamp-1">回复: {item.reply}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center font-medium text-sm">
                        {statusLabels[item.status]?.icon}
                        <span className={
                          item.status === 'PENDING' ? 'text-amber-600' :
                          item.status === 'REPLIED' ? 'text-emerald-600' : 'text-slate-500'
                        }>
                          {statusLabels[item.status]?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-1 transition-colors" title="回复"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button
                            onClick={() => handleIgnore(item.id)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg mr-2 transition-colors" title="忽略"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {item.status === 'REPLIED' && (
                        <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg mr-2 transition-colors" title="查看回复"
                          >
                            <Search size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
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

      {/* Reply Modal */}
      {isModalOpen && currentFeedback && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {currentFeedback.status === 'REPLIED' ? '查看反馈详情' : '回复用户反馈'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* User Feedback Detail */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {currentFeedback.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{currentFeedback.userName}</div>
                      <div className="text-xs text-slate-400">{currentFeedback.createTime}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded border ${typeLabels[currentFeedback.type]?.color || typeLabels.OTHER.color}`}>
                    {typeLabels[currentFeedback.type]?.label || '未知类型'}
                  </span>
                </div>
                <div className="text-slate-700 text-sm mt-3 whitespace-pre-wrap leading-relaxed">
                  {currentFeedback.content}
                </div>
                {/* Images if any */}
                {currentFeedback.images && currentFeedback.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentFeedback.images.map((img, i) => (
                      <div key={i} className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} alt="feedback attachment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {currentFeedback.status !== 'REPLIED' ? (
                <form id="replyForm" onSubmit={handleSubmitReply}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">回复内容 <span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="输入要回复给用户的信息..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                  />
                </form>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">官方回复</label>
                  <div className="bg-blue-50/50 border border-blue-100 text-slate-700 p-4 rounded-xl text-sm leading-relaxed">
                    {currentFeedback.reply}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-white font-medium transition-colors shadow-sm"
              >
                关闭
              </button>
              {currentFeedback.status !== 'REPLIED' && (
                <button
                  type="submit"
                  form="replyForm"
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/20 flex items-center"
                >
                  <Send size={16} className="mr-2" />
                  发送回复
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;