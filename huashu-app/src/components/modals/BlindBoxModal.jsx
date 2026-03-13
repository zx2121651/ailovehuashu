import React, { useState } from 'react';
import { Gift, X, Sparkles, CheckCircle2 } from 'lucide-react';
import * as api from '../../services/api';

const BlindBoxModal = ({ isOpen, onClose, user, onSignInSuccess, showToast }) => {
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleOpenBox = async () => {
    setOpening(true);
    try {
      const data = await api.dailySignIn();
      if (data.code === 200) {
        setResult(data.data);
        if (onSignInSuccess) {
           onSignInSuccess(data.data);
        }
      } else {
        showToast(data.message || '签到失败');
        onClose();
      }
    } catch (_error) {
      showToast('网络错误，请稍后再试');
      onClose();
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={result ? onClose : undefined}></div>
      <div className="relative w-[85%] max-w-sm bg-gradient-to-b from-indigo-50 to-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">

        {/* Close Button */}
        {result && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm z-10">
            <X size={20} />
          </button>
        )}

        {!result ? (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-pink-200 animate-bounce relative">
               <Sparkles className="absolute -top-3 -right-3 text-yellow-400 animate-spin-slow" size={24} />
               <Gift size={48} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">每日情感盲盒</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              拆开盲盒，获取今日专属高情商语录<br/>还能获得积分兑换 VIP 体验哦！
            </p>

            <button
              onClick={handleOpenBox}
              disabled={opening}
              className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold py-3.5 rounded-full shadow-lg shadow-pink-500/30 active:scale-95 transition-all text-[15px] flex items-center justify-center"
            >
              {opening ? <span className="animate-pulse">正在拆开...</span> : '立即拆开盲盒'}
            </button>
            <p className="text-xs text-gray-400 mt-4">已连续签到 {user?.continuousSignDays || 0} 天</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-4 animate-in slide-in-from-bottom-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">签到成功！</h3>
            <div className="flex items-center space-x-2 text-pink-500 font-bold text-xl mb-4">
               <span>+{result.earnedPoints} 积分</span>
               {result.isBigPrize && <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full animate-bounce">连续7天大奖!</span>}
            </div>

            {/* Blind Box Content Card */}
            {result.blindBox && (
              <div className="w-full bg-white border border-indigo-100 rounded-2xl p-4 mb-6 shadow-inner text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-3xl opacity-50"></div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 block">
                  {result.blindBox.type === 'QUOTE' ? '今日语录' : (result.blindBox.type === 'TIP' ? '脱单锦囊' : '精选话术')}
                </span>
                <p className="text-[13px] text-gray-700 leading-relaxed font-medium italic">
                  "{result.blindBox.content}"
                </p>
                {result.blindBox.author && (
                  <p className="text-right text-[11px] text-gray-400 mt-2">— {result.blindBox.author}</p>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors text-[14px]"
            >
              开心收下
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlindBoxModal;
