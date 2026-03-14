import React from 'react';
import { Zap } from 'lucide-react';

export default function TaskItem({ icon, title, points, status, onClick }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center">
         <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3 shadow-sm border border-blue-100/50">{icon}</div>
         <div>
            <p className="text-[13px] font-bold text-gray-800 mb-0.5">{title}</p>
            <p className="text-[11px] text-yellow-600 font-medium flex items-center"><Zap size={10} className="mr-0.5 fill-current"/> 奖励 {points} 积分</p>
         </div>
      </div>
      <button onClick={onClick} className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-colors ${status === '已完成' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95'}`}>{status}</button>
    </div>
  );
}
