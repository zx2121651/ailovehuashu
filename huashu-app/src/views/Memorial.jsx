import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import * as api from '../services/api';
import { ChevronLeft, Heart, CalendarHeart, CalendarClock, Check } from 'lucide-react';

function calcDays(startDate) {
  if (!startDate) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000));
}

function nextAnniversary(startDate) {
  if (!startDate) return 0;
  const s = new Date(startDate); const now = new Date();
  let a = new Date(now.getFullYear(), s.getMonth(), s.getDate());
  if (a.getTime() <= now.getTime()) a.setFullYear(now.getFullYear() + 1);
  return Math.ceil((a.getTime() - now.getTime()) / 86400000);
}

export default function Memorial() {
  const { setActiveTab, memorial, setMemorial, showToast } = useContext(AppContext);
  const [startDate, setStartDate] = useState(memorial?.startDate || '');
  const [saved, setSaved] = useState(memorial || null);

  useEffect(() => { if (!memorial) api.getMemorial().then(m => { if (m) { setSaved(m); setStartDate(m.startDate); } }).catch(() => {}); }, [memorial]);

  const save = async () => {
    if (!startDate) { showToast('请选择开始日期'); return; }
    const res = await api.saveMemorial(startDate);
    const withDays = { startDate, days: res.days ?? calcDays(startDate), nextAnniversary: nextAnniversary(startDate) };
    setSaved(withDays);
    setMemorial(withDays);
    showToast('保存成功');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-50 to-[#F5F7FA] animate-in zoom-in-95 duration-300">
      <div className="love-card px-5 pt-8 pb-3 z-20 shadow-sm relative flex items-center justify-between">
        <ChevronLeft size={24} className="text-gray-800 cursor-pointer hover:text-pink-500" onClick={() => setActiveTab('profile')} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-800">纪念日 · 恋爱天数</h1>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">记录每一个心动的开始</p>
        </div>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-10 scrollbar-hide">
        {saved && (
          <div className="text-center mb-6 animate-pop">
            <div className="relative inline-flex items-center justify-center w-44 h-44 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 shadow-xl shadow-pink-300/40 mb-5">
              <div className="absolute inset-2 rounded-full border-2 border-white/30"></div>
              <div className="text-white">
                <div className="text-5xl font-extrabold">{saved.days}</div>
                <div className="text-[12px] mt-1 tracking-widest">天</div>
              </div>
              <Heart size={22} className="absolute -top-1 right-8 text-yellow-200 animate-heartbeat" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">我们在一起 · 第 {saved.days} 天</h2>
            <p className="text-[13px] text-gray-500">开始于 {saved.startDate}</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <span className="flex items-center text-[12px] bg-white text-orange-500 px-3 py-1.5 rounded-full shadow-sm font-medium"><CalendarClock size={14} className="mr-1"/>还有 {saved.nextAnniversary} 天到纪念日</span>
            </div>
          </div>
        )}

        <div className="love-card rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800 flex items-center mb-4"><CalendarHeart size={17} className="text-orange-500 mr-1.5"/>设置开始日期</h3>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#FBFBFF] border border-gray-200 rounded-2xl px-4 py-3 text-[14px] text-gray-700 focus:border-pink-300 outline-none" />
          <button onClick={save} className="mt-4 w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-2xl font-bold shadow-md shadow-pink-300/30 active:scale-95 transition-transform flex items-center justify-center">
            <Check size={16} className="mr-1.5"/>保存并计算天数
          </button>
        </div>
      </div>
    </div>
  );
}