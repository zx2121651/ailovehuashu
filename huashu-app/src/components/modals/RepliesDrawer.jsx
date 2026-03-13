import React from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import CommentSection from '../common/CommentSection';

export default function RepliesDrawer({ script, onClose, copiedId, onCopy }) {
  if (!script) return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={onClose}></div>
      <div className="absolute bottom-0 w-full bg-[#F5F7FA] rounded-t-[2rem] z-50 animate-in slide-in-from-bottom-full duration-300 max-h-[85%] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
        <div className="w-full flex justify-center py-3"><div className="w-12 h-1.5 bg-gray-300 rounded-full"></div></div>
        <div className="px-5 pb-4 flex justify-between items-center border-b border-gray-200/50">
           <h3 className="font-bold text-gray-800 text-lg">全部高分回复</h3>
           <X size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
           <div className="bg-gray-100/80 p-3.5 rounded-2xl text-sm text-gray-700 font-medium mb-6 flex items-start">
             <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mr-2 mt-0.5 shrink-0">对方说</span>{script.question}
           </div>
           {script.answers.map((answer, idx) => (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group" key={idx}>
                 <div className="absolute -left-2 -top-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm shadow-pink-200">{idx+1}</div>
                 <p className="text-[14px] text-gray-800 leading-relaxed pt-1 pr-6">{answer}</p>
                 <button onClick={() => onCopy('drawer-'+idx, answer)} className="mt-3 w-full bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center">
                    {copiedId === 'drawer-'+idx ? <><CheckCircle2 size={14} className="mr-1"/>已复制</> : <><Copy size={14} className="mr-1"/>一键复制</>}
                 </button>
              </div>
           ))}

           {/* 评论区 */}
           <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <CommentSection targetType="SCRIPT" targetId={script.id} />
           </div>

           <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}
