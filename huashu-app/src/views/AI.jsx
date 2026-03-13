import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ScrollableRow from '../components/common/ScrollableRow';
import {  ChevronLeft, MoreHorizontal, Sparkles, CheckCircle2, Copy, RefreshCw, ThumbsUp, ThumbsDown, Loader2, Mic, Smile, Send, PlusCircle , Heart } from 'lucide-react';

export default function AI() {
  const { aiState, setAiState, setActiveTab, showToast, handleCopy, copiedId } = useContext(AppContext);
  const { chatInput } = aiState;

  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 'msg1', role: 'ai', type: 'text', content: '嗨！我是你的专属恋爱导师。不知道怎么回消息？把TA的话发给我，我帮你生成高情商回复方案！🥰', time: '10:24' },
    { id: 'msg2', role: 'user', type: 'text', content: '她刚对我说：“我觉得我们还是做朋友比较好” 怎么回？？在线等急！', time: '10:25' },
    { id: 'msg3', role: 'ai', type: 'suggestions', content: '为你生成以下高情商方案：', suggestions: [
      { label: '方案A：以退为进 (推荐)', text: '好啊，那作为朋友，周末请我喝杯奶茶不过分吧？', color: 'blue' },
      { label: '方案B：幽默化解', text: '其实我也这么想，做恋人容易吵架，做朋友我就可以理直气壮地蹭你饭了。', color: 'purple' }
    ], time: '10:25' }
  ]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [chatMessages, isAiTyping]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages(prev => [...prev, newUserMsg]);
    setAiState({ chatInput: '' });
    setIsAiTyping(true);

    setTimeout(() => {
      const isGreeting = chatInput.includes('你好') || chatInput.includes('哈喽');
      const newAiMsg = isGreeting
        ? { id: (Date.now() + 1).toString(), role: 'ai', type: 'text', content: '你好呀！遇到什么情感难题了吗？发给我，我来帮你参谋参谋~', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        : { id: (Date.now() + 1).toString(), role: 'ai', type: 'suggestions', content: '为你量身定制的高情商回复：', suggestions: [
            { label: '方案A：拉扯反转', text: `我觉得你说的很有道理，不过在这件事上，我可能有不一样的看法。`, color: 'blue' },
            { label: '方案B：幽默风趣', text: '哈哈，被你发现了，那还不赶紧奖励我一朵小红花？', color: 'purple' }
          ], time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };

      setChatMessages(prev => [...prev, newAiMsg]);
      setIsAiTyping(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F5F7] animate-in zoom-in-95 duration-300">
      <div className="bg-white px-5 pt-8 pb-3 z-20 shadow-sm relative flex items-center justify-between">
        <ChevronLeft size={24} className="text-gray-800 cursor-pointer hover:text-pink-500" onClick={() => setActiveTab('home')} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-800 flex items-center justify-center">
            AI 恋爱导师<span className="ml-1.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </h1>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{isAiTyping ? '导师正在输入中...' : '随时在线，秒出回复方案'}</p>
        </div>
        <MoreHorizontal size={24} className="text-gray-800 cursor-pointer" onClick={() => showToast('更多功能开发中')} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5 scrollbar-hide relative">
        <div className="flex justify-center"><span className="text-[10px] bg-gray-200/80 text-gray-500 px-2.5 py-1 rounded-md">今天 10:24</span></div>

        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
            <div className={`w-9 h-9 rounded-full shrink-0 shadow-sm mt-1 overflow-hidden flex items-center justify-center ${msg.role === 'user' ? 'ml-3 bg-gray-300' : 'mr-3 bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-200'}`}>
               {msg.role === 'user' ? <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="User" /> : <Sparkles size={18} className="text-white" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'w-full'}`}>
              {msg.type === 'text' && (
                <div className={`p-3.5 rounded-2xl shadow-sm text-[14px] leading-relaxed break-words ${msg.role === 'user' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none shadow-pink-200' : 'bg-white border border-gray-100/50 text-gray-800 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              )}
              {msg.type === 'suggestions' && (
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100/50 text-sm text-gray-800 space-y-4">
                  <p className="font-bold text-gray-900 border-b border-gray-50 pb-2">{msg.content}</p>
                  {msg.suggestions.map((sug, idx) => {
                    const colorMap = {
                      blue: {
                        bg: 'bg-blue-50/50',
                        border: 'border-blue-100',
                        badgeBg: 'bg-blue-500',
                        text: 'text-blue-600',
                        btnBg: 'bg-blue-100/50',
                        btnHover: 'hover:bg-blue-200'
                      },
                      green: {
                        bg: 'bg-green-50/50',
                        border: 'border-green-100',
                        badgeBg: 'bg-green-500',
                        text: 'text-green-600',
                        btnBg: 'bg-green-100/50',
                        btnHover: 'hover:bg-green-200'
                      },
                      pink: {
                        bg: 'bg-pink-50/50',
                        border: 'border-pink-100',
                        badgeBg: 'bg-pink-500',
                        text: 'text-pink-600',
                        btnBg: 'bg-pink-100/50',
                        btnHover: 'hover:bg-pink-200'
                      },
                      yellow: {
                        bg: 'bg-yellow-50/50',
                        border: 'border-yellow-100',
                        badgeBg: 'bg-yellow-500',
                        text: 'text-yellow-600',
                        btnBg: 'bg-yellow-100/50',
                        btnHover: 'hover:bg-yellow-200'
                      },
                      red: {
                        bg: 'bg-red-50/50',
                        border: 'border-red-100',
                        badgeBg: 'bg-red-500',
                        text: 'text-red-600',
                        btnBg: 'bg-red-100/50',
                        btnHover: 'hover:bg-red-200'
                      },
                      purple: {
                        bg: 'bg-purple-50/50',
                        border: 'border-purple-100',
                        badgeBg: 'bg-purple-500',
                        text: 'text-purple-600',
                        btnBg: 'bg-purple-100/50',
                        btnHover: 'hover:bg-purple-200'
                      },
                      gray: {
                        bg: 'bg-gray-50/50',
                        border: 'border-gray-100',
                        badgeBg: 'bg-gray-500',
                        text: 'text-gray-600',
                        btnBg: 'bg-gray-100/50',
                        btnHover: 'hover:bg-gray-200'
                      }
                    };
                    const colors = colorMap[sug.color] || colorMap.blue;

                    return (
                    <div key={idx} className={`${colors.bg} p-3.5 rounded-xl border ${colors.border} relative group`}>
                      <span className={`absolute -top-2.5 left-3 ${colors.badgeBg} text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm`}>{sug.label}</span>
                      <p className="mt-2 text-[14px] text-gray-800 leading-relaxed">{sug.text}</p>
                      <div className="flex justify-end mt-2">
                        <button onClick={() => handleCopy(msg.id + idx, sug.text)} className={`text-[11px] flex items-center ${colors.text} font-bold ${colors.btnBg} px-2 py-1 rounded-md ${colors.btnHover} transition-colors`}>
                           {copiedId === msg.id + idx ? <CheckCircle2 size={12} className="mr-1 text-green-500"/> : <Copy size={12} className="mr-1" />} 复制
                        </button>
                      </div>
                    </div>
                  )})}
                  <div className="flex items-center space-x-3 mt-2 text-gray-400">
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-pink-500 transition-colors" onClick={() => showToast('已生成新方案')}><RefreshCw size={14} /> <span className="text-[11px]">换一换</span></div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <ThumbsUp size={14} className="cursor-pointer hover:text-pink-500" onClick={() => showToast('感谢反馈！')} />
                    <ThumbsDown size={14} className="cursor-pointer hover:text-gray-600" onClick={() => showToast('我们会继续努力优化')} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isAiTyping && (
           <div className="flex items-start animate-fade-in-up">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md shadow-pink-200 mr-3 shrink-0 mt-1"><Sparkles size={18} className="text-white" /></div>
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100/50 text-[14px] text-gray-800 flex items-center space-x-1.5"><Loader2 size={16} className="animate-spin text-pink-500" /><span className="text-gray-400 text-xs">AI 正在思考中...</span></div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="absolute bottom-20 w-full bg-[#F4F5F7] z-40">
        <ScrollableRow className="flex px-3 pb-2 space-x-2">
          {['帮我幽默回复', '高情商拒绝', '怎么自然邀约', '帮我写个晚安'].map((chip, idx) => (
            <span key={idx} onClick={() => setAiState({ chatInput: chip })} className="bg-white text-gray-600 text-[12px] px-3 py-1.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap cursor-pointer active:bg-pink-50 active:text-pink-500 transition-colors">{chip}</span>
          ))}
        </ScrollableRow>
        <div className="border-t border-gray-200/80 p-3 px-4 bg-[#F4F5F7]">
          <div className="flex items-center space-x-3">
            <Mic size={26} className="text-gray-600 shrink-0 cursor-pointer hover:text-black" onClick={() => showToast('暂未获取麦克风权限')} />
            <div className="flex-1 bg-white border border-gray-200 rounded-full flex items-center px-3 py-1.5 focus-within:border-pink-300 transition-colors shadow-sm">
              <input type="text" value={chatInput} onChange={(e) => setAiState({ chatInput: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder="粘贴对方说的话..." className="flex-1 bg-transparent text-[15px] outline-none py-1 px-1"/>
              <Smile size={24} className="text-gray-400 mx-1 cursor-pointer hover:text-gray-600" onClick={() => showToast('表情包加载中...')} />
            </div>
            {chatInput.trim() ? (
               <button onClick={handleSendChat} className="bg-pink-500 text-white p-1.5 rounded-full shadow-md active:scale-90 transition-transform"><Send size={18} className="ml-0.5" /></button>
            ) : (
               <PlusCircle size={28} className="text-gray-600 shrink-0 cursor-pointer hover:text-black" onClick={() => showToast('更多功能开发中...')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
