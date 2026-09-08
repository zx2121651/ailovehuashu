import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import * as api from '../services/api';
import { ChevronLeft, Crown, Check, Sparkles, Gift } from 'lucide-react';

export default function DressUp() {
  const { setActiveTab, userProfile, setUserProfile, decor, setDecor, showToast, setShowVipModal } = useContext(AppContext);
  const [tab, setTab] = useState('frame'); // frame | badge | gift
  const [data, setData] = useState({ list: [], owned: [] });

  useEffect(() => {
    api.getSkins().then(d => {
      if (d) {
        setData(d);
        // 后端已启用的装扮同步到全局 decor
        if (d.active) setDecor({ frame: d.active.frame, badge: d.active.badge });
      }
    }).catch(() => {});
  }, []);

  const frames = data.list.filter(s => s.kind === 'frame');
  const badges = data.list.filter(s => s.kind === 'badge');

  const buy = async (skin) => {
    if (skin.vipOnly && !userProfile.isVip) { setShowVipModal(true); return; }
    if (skin.type === 'points' && (userProfile.points || 0) < skin.price) {
      showToast(`积分不足，还差 ${skin.price - (userProfile.points || 0)}`);
      return;
    }
    const res = await api.purchaseSkin(skin.id);
    if (res && res.ok !== false) {
      showToast(res.message || '购买成功');
      setData(prev => ({ ...prev, owned: res.owned || [...prev.owned, skin.id] }));
      // 本地同步扣减积分，保持与后端一致
      if (skin.type === 'points') {
        setUserProfile(prev => ({ ...prev, points: Math.max(0, (prev.points || 0) - skin.price) }));
      }
    } else {
      showToast((res && res.message) || '购买失败');
    }
  };

  const apply = async (skin, kind) => {
    try {
      const res = await api.applySkin(skin.id);
      if (res && res.ok !== false && res.active) {
        const next = { frame: res.active.frame || decor.frame, badge: res.active.badge || decor.badge };
        if (kind === 'frame') next.frame = skin.id;
        else if (kind === 'badge') next.badge = skin.id;
        setDecor(next);
        showToast(res.message || `已使用「${skin.name}」`);
        return;
      }
    } catch (e) {}
    // 本地兜底（后端未落库 / 不可用）
    setDecor({ ...decor, frame: kind === 'frame' ? skin.id : decor.frame, badge: kind === 'badge' ? skin.id : decor.badge });
    showToast(`已使用「${skin.name}」`);
  };

  const renderItem = (skin, kind) => {
    const owned = data.owned.includes(skin.id);
    const active = kind === 'frame' ? decor.frame === skin.id : decor.badge === skin.id;

    return (
      <div key={skin.id} className={`relative love-card rounded-2xl p-4 shadow-sm border transition-all card-lift ${active ? 'border-pink-400 ring-2 ring-pink-200' : 'border-gray-100'}`}>
        {skin.kind === 'frame' ? (
          <div className={`w-16 h-16 rounded-full ${skin.css} flex items-center justify-center mx-auto mb-3 mt-1`}>
            <img src={userProfile.avatar} className="rounded-full object-cover" style={{ width: 'calc(100% - 6px)', height: 'calc(100% - 6px)' }} alt="" />
          </div>
        ) : (
          <div className={`w-14 h-14 ${skin.css} rounded-full flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-3 mt-1 shadow-sm`}>爱</div>
        )}
        <p className="text-center text-[13px] font-bold text-gray-800">{skin.name}</p>
        <p className="text-center text-[11px] text-gray-400 mt-0.5 mb-3">
          {skin.type === 'free' ? '免费' : skin.vipOnly ? <span className="inline-flex items-center"><Crown size={11} className="text-yellow-500 mr-0.5"/>会员专属</span> : `${skin.price} 积分`}
        </p>
        {owned ? (
          <button onClick={() => apply(skin, kind)}
            className={`w-full py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${active ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'}`}>
            {active ? '✓ 使用中' : '使用'}
          </button>
        ) : (
          <button onClick={() => { skin.type === 'free' ? apply(skin, kind) : buy(skin); }}
            className="w-full py-1.5 rounded-full text-[12px] font-bold bg-gray-900 text-white hover:bg-gray-700 active:scale-95 transition-all">
            {skin.type === 'free' ? '一键使用' : skin.vipOnly ? '开通解锁' : '购买'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-[#F5F7FA] animate-in zoom-in-95 duration-300">
      <div className="love-card px-5 pt-8 pb-3 z-20 shadow-sm relative flex items-center justify-between">
        <ChevronLeft size={24} className="text-gray-800 cursor-pointer hover:text-pink-500" onClick={() => setActiveTab('profile')} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-800">装扮中心</h1>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">个性装扮 · 情绪价值装饰</p>
        </div>
        <div onClick={() => setShowVipModal(true)} className="text-yellow-500"><Crown size={22} /></div>
      </div>

      <div className="flex space-x-2 px-5 py-3">
        {[{ k: 'frame', t: '头像框', icon: <Sparkles size={14} className="mr-1"/> }, { k: 'badge', t: '徽章', icon: <Check size={14} className="mr-1"/> }, { k: 'gift', t: '虚拟礼物', icon: <Gift size={14} className="mr-1"/> }].map(x => (
          <button key={x.k} onClick={() => setTab(x.k)}
            className={`flex items-center px-4 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${tab === x.k ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-300/40' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {x.icon}{x.t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 scrollbar-hide">
        {tab === 'frame' && (
          <div className="grid grid-cols-3 gap-3">
            {frames.map(s => renderItem(s, 'frame'))}
            <div className="love-card rounded-2xl p-4 shadow-sm border border-dashed border-pink-200 flex flex-col items-center justify-center text-center">
              <Gift size={20} className="text-pink-400 mb-1"/>
              <p className="text-[11px] text-gray-400">更多装扮<br/>敬请期待</p>
            </div>
          </div>
        )}
        {tab === 'badge' && (
          <div className="grid grid-cols-3 gap-3">
            {badges.map(s => renderItem(s, 'badge'))}
            <div className="love-card rounded-2xl p-4 shadow-sm border border-dashed border-pink-200 flex flex-col items-center justify-center text-center">
              <Sparkles size={20} className="text-pink-400 mb-1"/>
              <p className="text-[11px] text-gray-400">成就徽章<br/>任务解锁</p>
            </div>
          </div>
        )}
        {tab === 'gift' && (
          <div className="space-y-3">
            {[{ id: 'gift_rose', n: '心动玫瑰', p: 20, e: '🌹' }, { id: 'gift_beer', n: '快乐啤酒', p: 30, e: '🍺' }, { id: 'gift_ring', n: '订婚戒指', p: 200, e: '💍' }].map(g => (
              <div key={g.id} className="love-card rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 card-lift">
                <div className="flex items-center">
                  <span className="text-3xl mr-3 animate-float">{g.e}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-[14px]">{g.n}</p>
                    <p className="text-[12px] text-gray-400">送给最近的灵感 TA</p>
                  </div>
                </div>
                <button onClick={async () => {
                    if ((userProfile.points || 0) < g.p) { showToast(`积分不足，还差 ${g.p - (userProfile.points || 0)}`); return; }
                    const res = await api.sendGift('TA', g.id);
                    if (res && res.ok === false) { showToast(res.message || '赠送失败'); return; }
                    setUserProfile(prev => ({ ...prev, points: Math.max(0, (prev.points || 0) - g.p) }));
                    showToast(res.message || `已送出「${g.n}」`);
                  }} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-[12px] font-bold shadow-md shadow-pink-300/40 active:scale-95 transition-transform">
                  {g.p} 积分 送出
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}