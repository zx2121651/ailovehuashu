import React, { useState, useEffect, useContext, useRef } from 'react';
import { ChevronLeft, Users, QrCode, ShieldAlert } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';

const DistributorCenter = () => {
  const { setActiveTab, showToast } = useContext(AppContext);
  const [data, setData] = useState({
    balance: 0,
    totalEarned: 0,
    teamSize: 0,
    inviteCode: '',
    isVip: false,
    config: null
  });
  const [showPoster, setShowPoster] = useState(false);
  const posterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, teamData] = await Promise.all([
           import('../../services/api').then(api => api.getDistributorInfo()),
           import('../../services/api').then(api => api.getMyTeam())
        ]);

        setData({
          balance: infoData?.balance || 0,
          totalEarned: infoData?.totalEarned || 0,
          teamSize: teamData?.counts?.total || 0,
          inviteCode: infoData?.inviteCode || '',
          isVip: infoData?.isVip || false,
          config: infoData?.config || null
        });
      } catch (err) {
        console.error('获取分销数据失败', err);
      }
    };
    fetchData();

  }, []);

  const shareUrl = `${window.location.origin}/?invite=${data.inviteCode}`;

  const isRestricted = data.config?.requireVip && !data.isVip;

  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">专属权限提示</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          为了保障分销商的权益，系统目前已开启门槛控制。您需要先升级为 <span className="text-rose-500 font-bold">VIP 会员</span> 才能开启专属推广赚佣金功能。
        </p>
        <button
          onClick={() => setActiveTab('profile')}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-transform"
        >
          返回个人中心
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between px-4 py-3">
        <button onClick={() => setActiveTab('profile')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">分销中心</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-indigo-100 text-sm mb-1">可提现余额 (元)</p>
              <p className="text-3xl font-bold">¥ {data.balance.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setActiveTab('distributor_withdraw')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium backdrop-blur-sm transition-colors"
            >
              去提现
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-indigo-100 text-xs mb-1">累计收益</p>
              <p className="text-lg font-semibold">¥ {data.totalEarned.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1">我的邀请码</p>
              <p className="text-lg font-semibold tracking-wider">{data.inviteCode}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('distributor_team')}
            className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Users size={24} />
            </div>
            <span className="font-medium text-slate-800">我的团队</span>
            <span className="text-xs text-slate-500 mt-1">{data.teamSize} 人</span>
          </button>

          <button
            onClick={() => setShowPoster(true)}
            className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-3">
              <QrCode size={24} />
            </div>
            <span className="font-medium text-slate-800">推广海报</span>
            <span className="text-xs text-slate-500 mt-1">专属二维码</span>
          </button>
        </div>
      </div>

      {showPoster && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-8 animate-in fade-in duration-200" onClick={() => setShowPoster(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()} ref={posterRef}>
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-center text-white">
              <h2 className="text-2xl font-black italic tracking-wider mb-2">话术库精选</h2>
              <p className="text-sm opacity-90">高情商恋爱话术，助你轻松脱单</p>
            </div>
            <div className="p-8 flex flex-col items-center bg-rose-50/30">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-rose-100 mb-4">
                <QRCodeSVG value={shareUrl} size={160} level="H" includeMargin={false} fgColor="#e11d48" />
              </div>
              <p className="text-sm text-slate-500 mb-2">扫描上方二维码注册</p>
              <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-xs font-mono font-medium tracking-widest border border-slate-200">
                邀请码: {data.inviteCode}
              </div>
            </div>
            <button
              onClick={() => {
                showToast('请使用手机截屏保存海报分享');
                setTimeout(() => setShowPoster(false), 2000);
              }}
              className="w-full py-4 bg-slate-900 text-white font-bold tracking-widest hover:bg-slate-800 active:bg-black transition-colors"
            >
              保存海报图片
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DistributorCenter;
