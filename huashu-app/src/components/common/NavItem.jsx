import React from 'react';

export default function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-12 transition-all duration-300 ${isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>{icon}</div>
      <span className="text-[10px] font-bold">{label}</span>
      <div className={`w-1 h-1 rounded-full bg-pink-500 mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
    </button>
  );
}
