import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ProfileListItem({ icon, title, subtitle, border = true, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors ${border ? 'border-b border-gray-50/80' : ''}`}>
      <div className="flex items-center">
        <div className="mr-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">{icon}</div><span className="text-[15px] text-gray-700 font-medium">{title}</span>
      </div>
      <div className="flex items-center">
        {subtitle && <span className="text-xs text-gray-400 mr-2 font-medium">{subtitle}</span>}<ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  );
}
