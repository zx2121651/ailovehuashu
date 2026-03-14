import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { MessageCircle, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const { handleLogin, showToast } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const onLoginClick = async () => {
    setIsLoading(true);
    const success = await handleLogin();
    setIsLoading(false);
    if (success) {
      showToast('登录成功');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-pink-50 via-white to-white relative overflow-hidden animate-in fade-in duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-pink-200/50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute top-[20%] right-[-10%] w-48 h-48 bg-rose-200/40 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-56 h-56 bg-purple-200/30 rounded-full blur-3xl opacity-50"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 -mt-10">

        {/* Logo/Icon */}
        <div className="relative mb-8 group">
          <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-[2rem] flex items-center justify-center shadow-xl shadow-pink-200/50 rotate-3 transition-transform group-hover:rotate-6">
            <MessageCircle size={48} className="text-white drop-shadow-md" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 love-card rounded-full flex items-center justify-center shadow-lg">
             <Heart size={20} className="text-pink-500 animate-pulse" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">
            高情商恋爱<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">话术库</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">10,000+ 实战话术，教你谈一场高分恋爱</p>
        </div>

        {/* Feature List */}
        <div className="w-full max-w-[280px] space-y-4 mb-14">
           {[
             { icon: <MessageCircle size={18} />, text: '海量场景，精准回复', color: 'text-blue-500', bg: 'bg-blue-50' },
             { icon: <Heart size={18} />, text: '情感问答，专家支招', color: 'text-pink-500', bg: 'bg-pink-50' },
             { icon: <ShieldCheck size={18} />, text: '隐私保护，安全无忧', color: 'text-green-500', bg: 'bg-green-50' },
           ].map((item, idx) => (
             <div key={idx} className="flex items-center space-x-3 love-card/60 backdrop-blur-sm p-3 rounded-2xl border border-white/80 shadow-sm">
                <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shadow-inner`}>
                   {item.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700">{item.text}</span>
             </div>
           ))}
        </div>

        {/* Login Button */}
        <button
          onClick={onLoginClick}
          disabled={isLoading}
          className="w-full max-w-[280px] h-[52px] bg-[#07C160] hover:bg-[#06ad56] active:bg-[#05964a] text-white rounded-full font-bold text-base shadow-lg shadow-[#07C160]/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {/* Wechat Icon SVG */}
              <svg viewBox="0 0 1024 1024" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                 <path d="M682.666667 426.666667c0-141.226667-152.746667-256-341.333334-256S0 285.44 0 426.666667c0 81.92 45.653333 154.453333 115.626667 203.093333l-29.866667 89.6 102.4-51.2c45.653333 16.213333 97.28 25.6 153.173333 25.6 188.586667 0 341.333333-114.773333 341.333334-256z m-448-42.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667s19.2-42.666667 42.666667-42.666667 42.666667 19.2 42.666667 42.666667-19.2 42.666667-42.666667 42.666667z m256 0c-23.466667 0-42.666667-19.2-42.666667-42.666667s19.2-42.666667 42.666667-42.666667 42.666667 19.2 42.666667 42.666667-19.2 42.666667-42.666667 42.666667zM1024 640c0-117.76-114.773333-213.333333-256-213.333333s-256 95.573333-256 213.333333 114.773333 213.333333 256 213.333333c41.386667 0 79.786667-8.533333 114.346667-21.333333l76.8 38.4-22.186667-67.413333c52.48-36.693333 87.04-92.586667 87.04-163z m-341.333333-32c-17.92 0-32-14.08-32-32s14.08-32 32-32 32 14.08 32 32-14.08 32-32 32z m170.666666 0c-17.92 0-32-14.08-32-32s14.08-32 32-32 32 14.08 32 32-14.08 32-32 32z"></path>
              </svg>
              <span>微信一键登录</span>
              <ArrowRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </>
          )}
        </button>

        <p className="mt-5 text-[11px] text-gray-400">
          登录即代表您同意 <span className="text-pink-500 cursor-pointer">《用户协议》</span> 和 <span className="text-pink-500 cursor-pointer">《隐私政策》</span>
        </p>
      </div>
    </div>
  );
}
