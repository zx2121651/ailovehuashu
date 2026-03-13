import React from 'react';
import { Heart, Copy, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';

export default function ScriptCard({ script, copiedId, onCopy, simple = false, isFavorite, onToggleFav, onShowMore, onShare }) {
  return (
    <div className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
      <div className="absolute top-4 right-4 flex space-x-3 items-center">
        {onShare && <Share2 size={16} onClick={(e) => { e.stopPropagation(); onShare(script); }} className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />}
        <Heart size={18} onClick={onToggleFav} className={`cursor-pointer transition-all active:scale-75 ${isFavorite ? 'fill-pink-500 text-pink-500 drop-shadow-sm' : 'text-gray-300 hover:text-pink-300'}`} />
      </div>
      <div className="flex items-start mb-3">
        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mr-3 mt-0.5 shadow-sm">问</div>
        <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2.5 text-[14px] text-gray-800 font-medium border border-gray-100 pr-8">{script.question}</div>
      </div>
      <div className="flex items-start">
        <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-bold text-xs shrink-0 mr-3 mt-1 shadow-sm">答</div>
        <div className="flex-1 space-y-2">
          <div className="bg-gradient-to-br from-pink-50/80 to-rose-50/50 rounded-2xl rounded-tr-none px-4 py-3 text-[14px] text-gray-800 relative group/inner border border-pink-100/50">
            <p className="pr-5 leading-relaxed">{script.answers[0]}</p>
            <button onClick={() => onCopy(script.id, script.answers[0])} className="absolute -bottom-2.5 right-2 bg-white text-gray-500 border border-gray-100 shadow-sm p-1.5 rounded-full hover:text-pink-500 hover:scale-110 active:scale-95 transition-all">
              {copiedId === script.id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          {!simple && (
            <div className="flex justify-between items-center text-[11px] text-gray-400 pl-1 pt-1.5">
              <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-md font-medium">{script.type}</span>
              <span onClick={onShowMore} className="text-pink-500 cursor-pointer flex items-center font-bold hover:underline">更多回复 ({script.answers.length}) <ChevronRight size={12} className="ml-0.5" /></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
