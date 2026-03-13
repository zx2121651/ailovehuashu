import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { categories } from '../../data/mockData';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';

export default function ContributeDrawer() {
  const { isContributeDrawerOpen, setIsContributeDrawerOpen, showToast } = useContext(AppContext);
  const [contributeCategory, setContributeCategory] = useState(categories[0].id);

  if (!isContributeDrawerOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-300"
        onClick={() => setIsContributeDrawerOpen(false)}
      ></div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#F8F9FA] rounded-t-3xl z-[70] animate-in slide-in-from-bottom-full duration-300 pb-safe">
        <div className="bg-white rounded-t-3xl p-5 shadow-sm relative border-b border-gray-100">
          <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-10 h-1.5 bg-gray-300 rounded-full"></div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-gray-800 text-[18px]">贡献神回复</h3>
            <X size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setIsContributeDrawerOpen(false)} />
          </div>
          <p className="text-xs text-gray-400 mb-2">审核通过可得 3 天 Pro 会员</p>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide bg-white">
           <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2 flex items-center"><MessageCircle size={14} className="mr-1.5 text-blue-500" /> 对方说了什么？</label>
              <textarea rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[14px] focus:border-gray-800 focus:bg-white transition-all outline-none resize-none placeholder-gray-400" placeholder="例如：你到底喜欢我什么？"></textarea>
           </div>

           <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2 flex items-center"><Sparkles size={14} className="mr-1.5 text-pink-500" /> 你的高分回复是？</label>
              <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[14px] focus:border-gray-800 focus:bg-white transition-all outline-none resize-none placeholder-gray-400" placeholder="例如：喜欢你这个问题问得好，让我有了一辈子时间来回答。"></textarea>
           </div>

           <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-3">选择一个分类</label>
              <div className="flex flex-wrap gap-2.5">
                 {categories.map(c => (
                   <span
                     key={c.id}
                     onClick={() => setContributeCategory(c.id)}
                     className={`text-[12px] px-4 py-2 border rounded-full cursor-pointer transition-all shadow-sm ${contributeCategory === c.id ? 'bg-gray-900 text-white border-gray-900 font-bold scale-105' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                   >
                     {c.name}
                   </span>
                 ))}
              </div>
           </div>

           <button onClick={() => { showToast('提交成功！等待系统审核...'); setIsContributeDrawerOpen(false); }} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center text-[15px]">
             <Send size={18} className="mr-2" /> 立即投递
           </button>
        </div>
      </div>
    </>
  );
}
