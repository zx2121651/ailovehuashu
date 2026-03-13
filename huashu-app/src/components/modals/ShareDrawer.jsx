import React from 'react';
import { X, Download, Share2 } from 'lucide-react';

export default function ShareDrawer({ isOpen, onClose, script }) {
  if (!isOpen || !script) return null;

  const handleSave = () => {
    // Mock save action
    alert('海报已保存到相册！(模拟)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className="bg-transparent rounded-t-3xl w-full max-h-[90vh] flex flex-col relative z-10 animate-in slide-in-from-bottom-full duration-300">

        {/* Header */}
        <div className="flex justify-between items-center p-5 love-card rounded-t-3xl rounded-b-xl shadow-sm z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Share2 className="mr-2 text-pink-500" size={20} />
            分享神回复
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Poster Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-xl overflow-hidden border border-white">

            {/* Poster Header */}
            <div className="bg-pink-500 text-white p-4 text-center">
              <h3 className="font-bold text-lg tracking-wider">恋爱话术库 PRO</h3>
              <p className="text-xs opacity-80 mt-1">今天想撩谁？一句顶一万句</p>
            </div>

            {/* Poster Content */}
            <div className="p-6 love-card/60 backdrop-blur-sm">
              <div className="mb-6 relative">
                <span className="absolute -left-2 -top-2 text-3xl text-blue-200 font-serif">"</span>
                <p className="text-gray-600 text-sm font-medium leading-relaxed z-10 relative pl-4">
                  {script.question}
                </p>
              </div>

              <div className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-xl p-4 relative border border-pink-100">
                <div className="absolute -left-3 top-4 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm shadow-pink-200 z-10">答</div>
                <p className="text-gray-800 text-base font-bold leading-relaxed pl-2 relative z-0">
                  {script.answers[0]}
                </p>
              </div>
            </div>

            {/* Poster Footer */}
            <div className="love-card p-4 flex items-center justify-between border-t border-transparent">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div>
                  <p className="text-xs font-bold text-gray-800">扫码获取更多神回复</p>
                  <p className="text-[10px] text-gray-400">长按识别小程序码</p>
                </div>
              </div>
            </div>

          </div>
          <p className="text-xs text-gray-400 mt-6 text-center">预览效果，生成后更清晰</p>
        </div>

        {/* Actions */}
        <div className="p-5 love-card border-t border-transparent pb-8 flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
          >
            取消分享
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-200 text-sm flex items-center justify-center"
          >
            <Download size={18} className="mr-2" />
            保存海报到相册
          </button>
        </div>

      </div>
    </div>
  );
}
