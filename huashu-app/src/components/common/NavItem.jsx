import React from 'react';

export default function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-14 h-12 transition-all duration-300 rounded-2xl ${isActive ? 'text-pink-500 bg-pink-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
    >
      <div className={`mb-0.5 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-80'}`}>
        {label}
      </span>
      {/* 底部小圆点指示器 */}
      {isActive && (
        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-pink-400 transition-all duration-300 shadow-[0_0_6px_rgba(244,114,182,0.6)]"></div>
      )}
    </button>
  );
}
