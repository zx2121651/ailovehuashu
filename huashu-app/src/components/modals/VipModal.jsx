import React from 'react';
import { X, Crown, CheckCircle2 } from 'lucide-react';

export default function VipModal({ isOpen, onClose, onShowToast }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-[85%] rounded-[2rem] p-6 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl border border-gray-700">
         <X size={20} className="absolute top-4 right-4 text-gray-400 cursor-pointer" onClick={onClose} />
         <div className="flex justify-center mb-4"><Crown size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" /></div>
         <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 text-center mb-2">解锁恋爱高阶玩法</h2>
         <p className="text-gray-400 text-xs text-center mb-6">开通终身会员，脱单快人一步</p>
         <div className="space-y-3 mb-6">
           {['解锁 10,000+ 专属高情商话术', 'AI 导师无限次畅聊诊断', '专家实战脱单课程免费看'].map((privilege, i) => (
              <div key={i} className="flex items-center text-sm text-gray-200"><CheckCircle2 size={16} className="text-yellow-500 mr-2 shrink-0" /> {privilege}</div>
           ))}
         </div>
         <div className="bg-gray-800/50 rounded-2xl p-4 border border-yellow-500/30 mb-6 flex justify-between items-center">
           <div><p className="text-yellow-500 font-bold text-lg">终身卡</p><p className="text-gray-400 text-[10px] line-through">原价 ¥299</p></div>
           <div className="text-right"><span className="text-2xl font-extrabold text-white">¥98</span></div>
         </div>
         <button onClick={() => { onClose(); onShowToast('支付接口接入中...'); }} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-extrabold py-3.5 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] active:scale-95 transition-transform">立即开通特权</button>
         <p className="text-center text-[10px] text-gray-500 mt-4">支付即同意《会员服务协议》</p>
      </div>
    </div>
  );
}
