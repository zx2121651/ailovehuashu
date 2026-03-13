import React from 'react';
import { X, Zap, Crown, Award, ChevronRight, TrendingUp, Info } from 'lucide-react';

export default function PointsDrawer({ isOpen, onClose, profile, onShowToast }) {
  if (!isOpen) return null;

  // Mock transaction history
  const transactions = [
    { id: 1, type: 'earn', title: '每日签到', time: '今天 08:30', amount: '+10' },
    { id: 2, type: 'earn', title: '完成每日任务：学习5个话术', time: '昨天 21:15', amount: '+20' },
    { id: 3, type: 'spend', title: '解锁高级进阶话术包', time: '昨天 19:00', amount: '-50' },
    { id: 4, type: 'earn', title: '成功分享海报给好友', time: '2023-10-25', amount: '+30' },
    { id: 5, type: 'earn', title: '新用户注册奖励', time: '2023-10-20', amount: '+200' },
  ];

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className="bg-transparent rounded-t-3xl w-full max-h-[95vh] flex flex-col relative z-10 animate-in slide-in-from-bottom-full duration-300 h-full">

        {/* Header */}
        <div className="flex justify-between items-center p-5 love-card rounded-t-3xl shadow-sm z-10 sticky top-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            积分与段位
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Top Hero Section */}
          <div className="bg-gradient-to-br from-orange-50 via-orange-100/30 to-rose-50 p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p className="text-orange-600/80 text-xs font-medium mb-1">当前可用积分</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-orange-600 tracking-tight mr-2">{profile.points}</span>
                  <span className="text-orange-500/80 text-sm font-medium">分</span>
                </div>
              </div>
              <button
                className="bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-md shadow-orange-500/30 active:scale-95 transition-transform flex items-center group hover:shadow-lg"
                onClick={async () => {
                  if (profile.points < 100) {
                     onShowToast('积分不足100，无法兑换');
                     return;
                  }
                  try {
                    const { exchangeVip } = await import('../../services/api');
                    const res = await exchangeVip(100, 1);
                    if (res.code === 200) {
                       onShowToast('兑换成功！VIP天数已增加');
                       window.location.reload(); // Simple way to refresh data for this demo
                    } else {
                       onShowToast(res.message || '兑换失败');
                    }
                  } catch(e) {
                    onShowToast('兑换出错，请重试');
                  }
                }}
              >
                100积分换1天VIP <ChevronRight size={14} className="ml-1 opacity-80 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Rank Card */}
            <div className="love-card/80 backdrop-blur-md rounded-[1.25rem] p-5 shadow-sm border border-white relative z-10">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-white shadow-inner">
                    <Crown size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">当前段位</p>
                    <h3 className="text-[15px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">{profile.rank}</h3>
                  </div>
                </div>
                <div className="text-right flex items-center text-xs text-orange-500 font-medium cursor-pointer hover:opacity-80" onClick={() => onShowToast('段位说明')}>
                  特权 <ChevronRight size={14} className="ml-0.5" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                  <span className="text-orange-600">距离下一段位</span>
                  <span className="text-gray-400">差 150 积分</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-orange-400 to-rose-500 h-2 rounded-full w-[70%] relative">
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold">
                  <span className="text-gray-800">{profile.rank}</span>
                  <span className="text-gray-400">情场鬼见愁</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tasks */}
          <div className="px-5 pt-6 pb-2">
            <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center">
              <TrendingUp size={16} className="text-orange-500 mr-1.5" /> 赚取积分
            </h3>
            <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
              <div className="min-w-[140px] love-card rounded-[1rem] p-3 shadow-sm border border-gray-50">
                <p className="text-xs font-bold text-gray-800 mb-1">每日签到</p>
                <p className="text-[10px] text-gray-500 mb-2">+10 ~ 50 积分</p>
                <button className="w-full bg-orange-50 text-orange-600 text-[11px] font-bold py-1.5 rounded-lg active:bg-orange-100">去签到</button>
              </div>
              <div className="min-w-[140px] love-card rounded-[1rem] p-3 shadow-sm border border-gray-50">
                <p className="text-xs font-bold text-gray-800 mb-1">贡献话术</p>
                <p className="text-[10px] text-gray-500 mb-2">采纳得 +50 积分</p>
                <button className="w-full bg-orange-50 text-orange-600 text-[11px] font-bold py-1.5 rounded-lg active:bg-orange-100">去发布</button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="px-5 pt-4 pb-8">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-[13px] font-bold text-gray-800 flex items-center">
                 <Zap size={16} className="text-blue-500 mr-1.5" /> 积分明细
               </h3>
               <span className="text-[11px] text-gray-400 flex items-center cursor-pointer"><Info size={12} className="mr-1"/> 积分规则</span>
             </div>

             <div className="love-card rounded-[1.25rem] shadow-sm border border-gray-50 overflow-hidden">
               {transactions.map((t, i) => (
                 <div key={t.id} className={`p-4 flex justify-between items-center ${i !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                   <div>
                     <p className="text-[13px] font-bold text-gray-800 mb-0.5">{t.title}</p>
                     <p className="text-[10px] text-gray-400">{t.time}</p>
                   </div>
                   <div className={`font-extrabold text-[15px] ${t.type === 'earn' ? 'text-orange-500' : 'text-gray-800'}`}>
                     {t.amount}
                   </div>
                 </div>
               ))}
               <div className="p-3 text-center text-xs text-gray-400 bg-transparent/50">已显示最近 30 天记录</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
