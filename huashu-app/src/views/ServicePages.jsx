import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getCategories, getFeaturedCourse, getArticles } from '../services/api';
import { categories as mockCategories, allScripts, pitfallsData, courseData as mockCourseData } from '../data/mockData';
import ScrollableRow from '../components/common/ScrollableRow';
import ScriptCard from '../components/common/ScriptCard';
import TaskItem from '../components/common/TaskItem';
import { ChevronLeft, Zap, Calendar, Share2, MessageCircle, Edit3, BookOpen, Trash2, Target, CheckCircle2, PlayCircle, Loader2, PauseCircle, Maximize2, Crown, UserCheck, Sparkles, AlertTriangle, FileText, Gift, Heart, User, Flame, MessageSquare, ThumbsUp, Star, X, Users, Clock, Send, ChevronRight, Headset, CheckCircle, MessageSquareText } from 'lucide-react';

export default function ServicePages() {
  const {
    activeServicePage, setActiveServicePage,
    showToast, setActiveTab, setAiState,
    handleCopy, copiedId, setShowVipModal,
    favoriteIds, toggleFavorite, setRepliesDrawerScript
  } = useContext(AppContext);

  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [courseTab, setCourseTab] = useState('outline');
  const [categories, setCategories] = useState(mockCategories);
  const [courseData, setCourseData] = useState(mockCourseData);
  const [, setArticles] = useState(pitfallsData);
  const [, setLoading] = useState(true);
  const [contributeCategory, setContributeCategory] = useState(mockCategories[0]?.id || 1);

  // 从 API 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, course, arts] = await Promise.all([
          getCategories(),
          getFeaturedCourse(),
          getArticles()
        ]);
        if (cats.length > 0) setCategories(cats);
        if (course) setCourseData(course);
        if (arts.length > 0) setArticles(arts);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, []);

  const [activeContributeTab, setActiveContributeTab] = useState('all');

  if (!activeServicePage || typeof activeServicePage !== 'object' || !activeServicePage.id) {
    // Fallback or ignore invalid state if activeServicePage is a string or null
    return null;
  }

  const id = activeServicePage.id;
  const activeArticle = activeServicePage.data;

  const serviceConfig = {
    'assessment': { title: '恋爱评测' },
    'invite': { title: '邀请有礼' },
    'custom': { title: '话术定制' },
    'support': { title: '专属客服' },
    'feedback': { title: '帮助与反馈' },
    'course': { title: '课程详情' },
    'topic': { title: '专题详情' },
    'contribute': { title: '贡献原创话术' },
    'article': { title: '避坑指南' },
    'all-pitfalls': { title: '避坑专栏' },
    'tasks': { title: '每日任务' },
    'history': { title: '浏览足迹' },
    'contributions': { title: '我的贡献' },
    'ai-history': { title: 'AI 聊天记录' },
    'notes': { title: '情商错题本' }
  };

  const mockContributions = [
    { id: 1, question: '女生说：“我今天好累啊”', answer: '那我把肩膀借给你靠一下，或者你想吃点什么好吃的，我带你去？', status: 'approved', time: '今天 10:20', likes: 12 },
    { id: 2, question: '女生问：“你喜欢我什么？”', answer: '喜欢你像个小朋友一样可爱，也喜欢你认真时的样子，反正就是觉得你哪里都好。', status: 'pending', time: '昨天 15:30', likes: 0 },
    { id: 3, question: '女生说：“在干嘛呢？”', answer: '在思考怎么回复一个漂亮女孩的消息。', status: 'rejected', time: '2023-10-25', likes: 0, reason: '库内已有类似高分话术' }
  ];

  const handlePlayLesson = (idx) => {
    if (courseData.lessons[idx].free) {
      setActiveLesson(idx);
      setIsPlaying(true);
      setCourseTab('outline');
    } else {
      setShowVipModal(true);
    }
  };

  return (
    <div className="absolute inset-0 z-[60] bg-transparent animate-in slide-in-from-right-full duration-300 flex flex-col">
       <div className="love-card/90 backdrop-blur-md px-5 pt-12 pb-3 z-50 shadow-sm sticky top-0 flex items-center justify-between border-b border-transparent">
          <ChevronLeft size={24} className="text-gray-800 cursor-pointer" onClick={() => setActiveServicePage(null)} />
          <h1 className="text-lg font-bold text-gray-800">{serviceConfig[id]?.title}</h1>
          <div className="w-6"></div>
       </div>
       <div className="flex-1 overflow-y-auto p-4 relative scrollbar-hide pb-24">

          {/* 我的贡献 (Contributions) */}
          {id === 'contributions' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {/* Tabs */}
               <div className="flex love-card rounded-full p-1 shadow-sm border border-gray-50 mb-2 sticky top-0 z-10">
                 {['all', 'approved', 'pending'].map(tab => (
                   <button
                     key={tab}
                     onClick={() => setActiveContributeTab(tab)}
                     className={`flex-1 text-[13px] font-medium py-2 rounded-full transition-colors ${activeContributeTab === tab ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-gray-600 hover:bg-transparent'}`}
                   >
                     {tab === 'all' ? '全部' : tab === 'approved' ? '已收录' : '审核中'}
                   </button>
                 ))}
               </div>

               {/* List */}
               <div className="space-y-4 pb-8">
                 {mockContributions.filter(c => activeContributeTab === 'all' || c.status === activeContributeTab).map(c => (
                   <div key={c.id} className="love-card rounded-[1.25rem] p-4 shadow-sm border border-gray-50 relative group transition-all hover:shadow-md">

                     {/* Status Badge */}
                     <div className="absolute top-4 right-4 text-[10px] font-bold z-10">
                       {c.status === 'approved' && <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center"><CheckCircle size={10} className="mr-1"/> 已收录</span>}
                       {c.status === 'pending' && <span className="text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 flex items-center"><Clock size={10} className="mr-1"/> 审核中</span>}
                       {c.status === 'rejected' && <span className="text-gray-500 bg-transparent px-2.5 py-1 rounded-full border border-gray-200">未收录</span>}
                     </div>

                     {/* Content */}
                     <div className="flex items-start mb-3 pr-16 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mr-2.5 shadow-sm mt-0.5">问</div>
                        <div className="text-[14px] text-gray-800 font-bold leading-snug">{c.question}</div>
                     </div>
                     <div className="flex items-start bg-transparent rounded-xl p-3 border border-transparent/50">
                        <div className="w-6 h-6 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-bold text-[10px] shrink-0 mr-2.5 shadow-sm">答</div>
                        <div className="text-[13px] text-gray-700 leading-relaxed font-medium">{c.answer}</div>
                     </div>

                     {/* Footer Info */}
                     <div className="mt-3.5 pt-3 flex justify-between items-center text-[11px] border-t border-gray-50">
                       <span className="text-gray-400 font-medium">{c.time}</span>
                       {c.status === 'approved' ? (
                         <span className="text-pink-500 flex items-center font-bold bg-pink-50 px-2 py-1 rounded"><ThumbsUp size={12} className="mr-1.5"/> {c.likes} 赞</span>
                       ) : c.status === 'rejected' ? (
                         <span className="text-red-400 flex items-center font-medium"><MessageSquare size={12} className="mr-1.5"/> 原因: {c.reason}</span>
                       ) : (
                         <span className="text-gray-400 flex items-center font-medium bg-transparent px-2 py-1 rounded">预计 24h 内审核完毕</span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {id === 'tasks' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
               <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 love-card/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/30 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                      <h2 className="text-[22px] font-extrabold tracking-tight flex items-center">
                        <Zap size={24} className="text-yellow-400 mr-2 drop-shadow-md fill-yellow-400"/>
                        我的积分
                      </h2>
                    </div>
                    <button onClick={() => showToast('积分明细加载中')} className="text-[10px] font-medium love-card/20 hover:love-card/30 transition-colors px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center">
                      明细 <ChevronRight size={12} className="ml-0.5" />
                    </button>
                  </div>

                  <div className="flex items-end mb-6 relative z-10 px-1">
                    <span className="text-[40px] font-black leading-none tracking-tighter drop-shadow-md">350</span>
                    <span className="text-[13px] font-bold opacity-80 mb-2 ml-1">分</span>
                  </div>

                  <div className="love-card/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md border border-white/20 relative z-10 shadow-inner group">
                     <p className="text-[12px] opacity-90 leading-relaxed max-w-[65%] font-medium">积分可用于抵扣 <span className="text-yellow-300 font-bold border-b border-yellow-300/30 pb-0.5">VIP 会员</span> 费用，或兑换高级服务。</p>
                     <button onClick={() => showToast('积分商城开发中')} className="love-card text-indigo-600 text-[13px] font-bold px-4 py-2.5 rounded-full shadow-[0_4px_10px_-2px_rgba(0,0,0,0.2)] active:scale-95 transition-all hover:bg-transparent hover:shadow-lg shrink-0 group-hover:animate-pulse">
                       去兑换
                     </button>
                  </div>
               </div>

               <div className="love-card rounded-[2rem] p-6 shadow-sm border border-transparent">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-gray-800 text-[16px] flex items-center"><Target size={18} className="text-blue-500 mr-1.5" /> 赚取积分</h3>
                      <p className="text-[11px] text-gray-400 mt-1">每天零点重置任务进度</p>
                    </div>
                    <div className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/50">今日已赚 10 分</div>
                  </div>

                  <div className="space-y-3">
                    <TaskItem icon={<Calendar size={18} className="text-green-500" />} title="每日签到" points="+10" status="已完成" onClick={() => showToast('今天已经签到过啦')} />
                    <TaskItem icon={<Share2 size={18} className="text-blue-500" />} title="分享小程序给好友" points="+20" status="去完成" onClick={() => showToast('调用微信分享接口...')} />
                    <TaskItem icon={<MessageSquareText size={18} className="text-purple-500" />} title="使用一次 AI 导师" points="+15" status="去完成" onClick={() => { setActiveServicePage(null); setActiveTab('ai'); }} />
                    <TaskItem icon={<Edit3 size={18} className="text-orange-500" />} title="贡献一条原创话术" points="+50" status="去完成" onClick={() => setActiveServicePage({ id: 'contribute' })} />
                    <TaskItem icon={<BookOpen size={18} className="text-pink-500" />} title="完整阅读一篇避坑指南" points="+10" status="去完成" onClick={() => setActiveServicePage({ id: 'all-pitfalls' })} />
                  </div>
               </div>
            </div>
          )}

          {id === 'history' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
               <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-2xl p-4 flex items-center justify-between border border-blue-100/50 shadow-sm">
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-blue-100/80 text-blue-500 rounded-full flex items-center justify-center">
                     <Clock size={20} />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-gray-800">浏览足迹</h3>
                     <p className="text-[10px] text-gray-500 mt-0.5">本地保存，清除缓存后失效</p>
                   </div>
                 </div>
                 <button
                   onClick={() => showToast('已清空浏览足迹')}
                   className="text-[11px] text-gray-400 flex items-center love-card px-3 py-1.5 rounded-full border border-transparent shadow-sm hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors"
                 >
                   <Trash2 size={12} className="mr-1"/>清空
                 </button>
               </div>

               <div className="space-y-3">
                 {[allScripts[0], allScripts[2], allScripts[5]].map((script, idx) => (
                    <div key={'hist-'+script.id} className="relative group">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <ScriptCard script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} />
                      <div className="absolute right-3 bottom-3 text-[10px] text-gray-300 font-medium">今天 14:{30 - idx * 10}</div>
                    </div>
                 ))}
               </div>
               <div className="flex items-center justify-center space-x-2 mt-8 opacity-60">
                 <div className="h-[1px] w-12 bg-gray-300"></div>
                 <span className="text-xs text-gray-400 font-medium">没有更多记录了</span>
                 <div className="h-[1px] w-12 bg-gray-300"></div>
               </div>
            </div>
          )}

          {id === 'contributions' && (
            <div className="space-y-4 animate-fade-in-up pb-10">
               <div className="flex space-x-3 mb-2">
                  <div className="flex-1 love-card p-4 rounded-3xl shadow-sm text-center border border-transparent">
                     <p className="text-2xl font-extrabold text-gray-800">12</p>
                     <p className="text-[11px] text-gray-500 mt-1">已投递 (条)</p>
                  </div>
                  <div className="flex-1 love-card p-4 rounded-3xl shadow-sm text-center border border-transparent">
                     <p className="text-2xl font-extrabold text-green-500">5</p>
                     <p className="text-[11px] text-gray-500 mt-1">已采纳 (条)</p>
                  </div>
                  <div className="flex-1 love-card p-4 rounded-3xl shadow-sm text-center border border-transparent">
                     <p className="text-2xl font-extrabold text-pink-500">15</p>
                     <p className="text-[11px] text-gray-500 mt-1">获奖励 (天)</p>
                  </div>
               </div>

               <div className="space-y-3">
                 {[
                   { q: '怎么不回消息？', a: '正在想怎么回复能让你开心一整天呢。', status: '已采纳', color: 'green', time: '2023-11-01' },
                   { q: '你觉得我胖了吗？', a: '你那不是胖，是可爱膨胀了。', status: '审核中', color: 'orange', time: '2023-11-05' },
                   { q: '多喝热水', a: '开门，我在楼下。', status: '未通过', color: 'red', time: '2023-10-20' }
                 ].map((item, idx) => (
                   <div key={idx} className="love-card p-4 rounded-2xl shadow-sm border border-transparent relative group">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[11px] text-gray-400 font-medium">{item.time}</span>
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${item.color === 'green' ? 'bg-green-50 text-green-600 border-green-200' : item.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{item.status}</span>
                      </div>
                      <div className="bg-transparent rounded-xl p-3 mb-2">
                         <p className="text-[13px] font-bold text-gray-800"><span className="text-blue-500 mr-1 text-xs">问:</span>{item.q}</p>
                      </div>
                      <div className="bg-pink-50/50 rounded-xl p-3 border border-pink-100/50">
                         <p className="text-[13px] text-gray-700 leading-relaxed"><span className="text-pink-500 mr-1 font-bold text-xs">答:</span>{item.a}</p>
                      </div>
                   </div>
                 ))}
               </div>

               <button onClick={() => setActiveServicePage({ id: 'contribute' })} className="w-full bg-pink-50 text-pink-600 font-bold py-3.5 rounded-2xl border border-pink-200 mt-2 active:scale-95 transition-transform flex items-center justify-center shadow-sm">
                  <Edit3 size={16} className="mr-2" /> 继续贡献赚 VIP
               </button>
            </div>
          )}

          {id === 'ai-history' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
               <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/50 rounded-2xl p-4 flex items-center justify-between border border-purple-100/50 shadow-sm">
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-purple-100/80 text-purple-500 rounded-full flex items-center justify-center">
                     <MessageSquareText size={20} />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-gray-800">AI 聊天记录</h3>
                     <p className="text-[10px] text-gray-500 mt-0.5">云端加密，仅保留最近 30 天</p>
                   </div>
                 </div>
                 <button
                   onClick={() => showToast('已清空 AI 记录')}
                   className="text-[11px] text-gray-400 flex items-center love-card px-3 py-1.5 rounded-full border border-transparent shadow-sm hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors"
                 >
                   <Trash2 size={12} className="mr-1"/>清空
                 </button>
               </div>

               <div className="space-y-3">
                 {[
                   { q: '她刚对我说：“我觉得我们还是做朋友比较好” 怎么回？？', a: '好啊，那作为朋友，周末请我喝杯奶茶不过分吧？', time: '今天 10:25' },
                   { q: '发烧到39度了', a: '除了多喝热水，你可以直接带药去楼下...', time: '昨天 15:40' },
                   { q: '帮我写一个高级的朋友圈文案', a: '阳光正好，微风不燥，万物可爱，人间值得。', time: '11-05 09:20' }
                 ].map((item, idx) => (
                   <div key={idx} className="love-card p-4 rounded-[1.25rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-transparent cursor-pointer hover:shadow-md hover:border-purple-200/50 transition-all group" onClick={() => { setActiveTab('ai'); setAiState({ chatInput: item.q }); setActiveServicePage(null); }}>
                     <div className="flex justify-between items-start mb-3">
                       <p className="text-[14px] font-bold text-gray-800 line-clamp-2 flex-1 pr-3 leading-snug">
                         <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded mr-2 align-middle border border-blue-100/50">我</span>
                         {item.q}
                       </p>
                       <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 font-medium">{item.time}</span>
                     </div>
                     <div className="flex items-start bg-transparent/80 p-3 rounded-xl border border-transparent/50 group-hover:bg-purple-50/30 group-hover:border-purple-100/50 transition-colors">
                       <Sparkles size={14} className="text-purple-500 mr-2 shrink-0 mt-0.5"/>
                       <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{item.a}</p>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="flex items-center justify-center space-x-2 mt-8 opacity-60">
                 <div className="h-[1px] w-12 bg-gray-300"></div>
                 <span className="text-xs text-gray-400 font-medium">没有更多记录了</span>
                 <div className="h-[1px] w-12 bg-gray-300"></div>
               </div>
            </div>
          )}

          {id === 'notes' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
               <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100/80 p-5 rounded-[1.5rem] mb-2 relative overflow-hidden shadow-sm flex items-center justify-between">
                  <Target size={60} className="absolute -right-4 -bottom-4 text-orange-200/50 rotate-12" />
                  <div className="relative z-10">
                    <h3 className="font-bold text-orange-800 text-[16px] mb-1.5 flex items-center">情商雷区记录</h3>
                    <p className="text-[12px] text-orange-600/80 leading-relaxed max-w-[85%]">复习错题能帮你快速提升聊天段位，避开直男/女雷区。</p>
                  </div>
                  <button
                    onClick={() => showToast('已清空错题本')}
                    className="relative z-10 text-[11px] text-orange-500 flex flex-col items-center love-card/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-orange-200/50 shadow-sm hover:bg-orange-100 transition-colors"
                  >
                    <Trash2 size={14} className="mb-0.5"/>
                    <span className="font-medium">清空</span>
                  </button>
               </div>

               {[
                 { q: '女生突然对你说：“我好像发烧到39度了，好难受...” 你该怎么回？', wrong: '多喝热水，吃药了吗？快去休息吧。', right: '开门，我在楼下带了药和粥。', time: '2023-11-06' },
                 { q: '女生说：“随便，吃什么都行。”', wrong: '那去吃海底捞？不行的话去吃烤肉？', right: '我知道有一家新开的私房菜环境超棒，我带你去。', time: '2023-10-28' }
               ].map((item, idx) => (
                  <div key={idx} className="love-card p-4 pb-5 rounded-3xl shadow-sm border border-transparent relative pt-8 mt-3 hover:shadow-md transition-shadow">
                     <div className="absolute top-0 left-5 bg-gradient-to-r from-gray-800 to-gray-700 text-white text-[10px] px-3 py-1.5 rounded-b-xl font-bold shadow-md flex items-center"><FileText size={10} className="mr-1.5"/> 错题 #{idx + 1}</div>
                     <div className="absolute top-3 right-4 text-[10px] text-gray-400 font-medium bg-transparent px-2 py-0.5 rounded-full">{item.time}</div>

                     <div className="flex items-start mb-4">
                       <span className="text-[14px] font-black text-gray-800 leading-snug">{item.q}</span>
                     </div>

                     <div className="space-y-3 relative">
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-200 to-green-200 rounded-full z-0"></div>
                        <div className="love-card p-3.5 rounded-2xl border border-red-100 shadow-[0_2px_8px_-4px_rgba(252,165,165,0.4)] relative z-10 ml-2">
                           <div className="flex items-center text-[11px] text-red-500 font-bold mb-2 bg-red-50 inline-flex px-2 py-0.5 rounded-md"><X size={12} className="mr-1"/> 你的低分回复</div>
                           <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{item.wrong}</p>
                        </div>

                        <div className="bg-green-50/30 p-3.5 rounded-2xl border border-green-200 shadow-[0_2px_8px_-4px_rgba(134,239,172,0.4)] relative overflow-hidden z-10 ml-2">
                           <div className="absolute -top-4 -right-2"><CheckCircle2 size={50} className="text-green-500/10" /></div>
                           <div className="flex items-center text-[11px] text-green-600 font-bold mb-2 bg-green-100/50 inline-flex px-2 py-0.5 rounded-md relative z-10"><CheckCircle2 size={12} className="mr-1"/> 满分高情商回复</div>
                           <p className="text-[13px] text-gray-800 relative z-10 leading-relaxed font-bold">{item.right}</p>
                        </div>
                     </div>
                  </div>
               ))}

               <div className="flex items-center justify-center space-x-2 mt-8 opacity-60">
                 <div className="h-[1px] w-12 bg-gray-300"></div>
                 <span className="text-xs text-gray-400 font-medium">定期清空错题本，早日成为嘴强王者</span>
                 <div className="h-[1px] w-12 bg-gray-300"></div>
               </div>
            </div>
          )}

          {id === 'all-pitfalls' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 flex items-center justify-between border border-red-100/50 shadow-sm mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100/80 text-red-500 rounded-full flex items-center justify-center shadow-inner shadow-red-200">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">避坑指南</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">防范于未然，做高情商猎手</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {pitfallsData.map((item) => (
                  <div key={item.id} onClick={() => setActiveServicePage({ id: 'article', data: item })} className="love-card border border-transparent p-4 rounded-[1.25rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-md hover:border-red-200/50 transition-all flex items-start group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 text-red-500 flex items-center justify-center mr-3.5 shrink-0 group-hover:scale-105 transition-transform shadow-sm border border-red-100/50">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4 className="font-bold text-[15px] text-gray-800 mb-1.5 leading-snug group-hover:text-red-500 transition-colors truncate">{item.title}</h4>
                      <p className="text-[12px] text-gray-500 line-clamp-1 mb-3 leading-relaxed">{item.desc}</p>

                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center bg-transparent rounded-full pr-2.5 py-0.5 border border-transparent/80">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center mr-1.5 text-white font-bold text-[8px] shadow-sm">{item.author[0]}</div>
                          <span className="font-medium">{item.author}</span>
                          <span className="mx-1.5 text-gray-300 scale-75">|</span>
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center font-medium bg-red-50 text-red-400 px-2 py-0.5 rounded-full"><Flame size={12} className="mr-1 text-red-500"/> {item.views}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-2 mt-8 opacity-60">
                 <div className="h-[1px] w-12 bg-gray-300"></div>
                 <span className="text-xs text-gray-400 font-medium">更多干货持续更新中</span>
                 <div className="h-[1px] w-12 bg-gray-300"></div>
               </div>
            </div>
          )}

          {id === 'article' && activeArticle && (
            <div className="space-y-5 animate-fade-in-up pb-10 love-card min-h-full p-5 rounded-3xl shadow-sm border border-transparent">
              <h2 className="text-xl font-extrabold text-gray-800 leading-snug">{activeArticle.title}</h2>
              <div className="flex items-center justify-between border-b border-transparent pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xs">
                    {activeArticle.author[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-700">{activeArticle.author}</p>
                    <p className="text-[10px] text-gray-400">{activeArticle.date}</p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 bg-transparent px-2 py-1 rounded-md flex items-center">
                  <Flame size={12} className="mr-1 text-red-400"/> {activeArticle.views} 浏览
                </div>
              </div>

              <div className="text-[15px] text-gray-700 leading-loose space-y-4">
                {activeArticle.content.map((block, i) => {
                  if (block.type === 'p') return <p key={i} className="text-gray-600">{block.text}</p>;
                  if (block.type === 'h3') return <h3 key={i} className="text-[16px] font-bold text-gray-800 mt-6 mb-2 border-l-4 border-pink-500 pl-2">{block.text}</h3>;
                  if (block.type === 'tip') return (
                    <div key={i} className="bg-orange-50 text-orange-700 p-4 rounded-xl text-[13px] leading-relaxed border border-orange-100/50 flex items-start my-4">
                      <AlertTriangle size={16} className="shrink-0 mr-2 mt-1 text-orange-500"/>
                      <span>{block.text}</span>
                    </div>
                  );
                  return null;
                })}
              </div>

              {/* 评论区 */}
              <CommentSection targetType="ARTICLE" targetId={activeArticle.id} />
            </div>
          )}

          {id === 'assessment' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="love-card rounded-[2rem] p-7 shadow-xl shadow-pink-100/50 border border-pink-50 relative overflow-hidden">
                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                   <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                   <div className="relative z-10 text-center mb-8 mt-2">
                     <div className="relative w-24 h-24 mx-auto mb-6">
                       <div className="absolute inset-0 bg-pink-400 rounded-3xl rotate-6 opacity-20"></div>
                       <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-200/50 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                         <Heart size={44} className="text-white fill-white" />
                       </div>
                       <div className="absolute -right-2 -top-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm rotate-12">PRO</div>
                     </div>
                     <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-3 tracking-tight">综合情感段位评测</h3>
                     <p className="text-[13px] text-gray-500 leading-relaxed px-2 font-medium">包含 20 道专业情商测试题，精准评估你的撩汉/妹等级，并为你定制<span className="text-pink-500 font-bold mx-1">专属脱单路线图</span>。</p>
                   </div>

                   <div className="love-card/60 backdrop-blur-md rounded-2xl p-5 mb-8 border border-transparent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
                     <div className="flex items-center text-[13px] text-gray-600 mb-4 pb-4 border-b border-transparent border-dashed">
                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3 shrink-0"><Users size={16}/></div>
                       <div className="flex-1">
                         <p className="font-bold text-gray-800">125,482 人已测</p>
                         <p className="text-[10px] text-gray-400 mt-0.5">昨日新增测算 1,208 人</p>
                       </div>
                       <div className="flex -space-x-2">
                         <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar"/>
                         <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar"/>
                         <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">+</div>
                       </div>
                     </div>
                     <div className="flex items-center text-[13px] text-gray-600">
                       <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mr-3 shrink-0"><Clock size={16}/></div>
                       <div className="flex-1">
                         <p className="font-bold text-gray-800">预计耗时 3-5 分钟</p>
                         <p className="text-[10px] text-gray-400 mt-0.5">共 20 道选择题</p>
                       </div>
                     </div>
                   </div>

                   <button onClick={() => showToast('题目加载中...请稍候')} className="relative z-10 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-400/30 active:scale-95 transition-all hover:shadow-gray-400/50 flex justify-center items-center text-[16px] group overflow-hidden">
                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                     开始免费评测 <ChevronRight size={20} className="ml-1 opacity-80 group-hover:translate-x-1 transition-transform" />
                   </button>

                   <p className="text-center text-[10px] text-gray-400 mt-4 relative z-10 font-medium">题目由资深情感导师团队研发，准确率达 98.5%</p>
                </div>
              </div>
            )}

            {/* 邀请有礼页面 */}
            {id === 'invite' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-[2rem] p-7 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 love-card/10 rounded-full -mt-20 -mr-20 blur-3xl pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-400/30 rounded-full blur-2xl -mb-10 -ml-10 pointer-events-none"></div>

                   <div className="relative z-10 flex items-center mb-4">
                     <div className="w-12 h-12 love-card/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-md border border-white/30 shadow-inner">
                       <Gift size={24} className="text-yellow-300 drop-shadow-md" />
                     </div>
                     <div>
                       <h3 className="text-[22px] font-extrabold tracking-tight">邀请好友赚收益</h3>
                       <p className="text-[11px] text-purple-100 font-medium mt-0.5">躺赚无上限，提现秒到账</p>
                     </div>
                   </div>

                   <div className="love-card/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 relative z-10 mb-6 shadow-inner group">
                     <p className="text-[13px] opacity-90 leading-relaxed font-medium">每邀请一位好友注册并开通 VIP，你可获得 <span className="text-yellow-300 font-bold text-lg mx-1 inline-block transform group-hover:scale-110 transition-transform">30%</span> 高额现金返利！</p>
                   </div>

                   <div className="love-card/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 relative z-10 flex items-center justify-between mb-6 shadow-sm group hover:love-card/15 transition-colors">
                     <div>
                       <p className="text-[10px] text-purple-100 mb-0.5 font-medium">你的专属邀请码</p>
                       <p className="text-[28px] font-black tracking-[0.2em] text-yellow-300 drop-shadow-sm font-mono">A8X92K</p>
                     </div>
                     <button onClick={() => handleCopy('invite_code', 'A8X92K')} className={`text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all ${copiedId === 'invite_code' ? 'bg-green-400 text-white border border-green-300' : 'love-card text-purple-600 hover:shadow-md hover:bg-transparent'}`}>
                       {copiedId === 'invite_code' ? '已复制' : '复制'}
                     </button>
                   </div>

                   <button onClick={() => showToast('海报生成中，请稍后分享...')} className="relative z-10 w-full bg-gradient-to-r from-yellow-300 to-yellow-500 text-purple-900 font-black py-4 rounded-2xl shadow-xl shadow-yellow-500/30 active:scale-95 transition-transform flex items-center justify-center text-[15px] overflow-hidden group">
                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                     <Share2 size={18} className="mr-2 opacity-80" /> 生成专属邀请海报
                   </button>
                </div>

                <div className="love-card rounded-[2rem] p-6 shadow-sm border border-transparent relative">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-bold text-gray-800 text-[16px] flex items-center"><Gift size={18} className="text-orange-500 mr-1.5"/> 收益明细</h4>
                    <span className="text-[11px] bg-orange-50 text-orange-500 font-bold px-2.5 py-1 rounded-full border border-orange-100/50">当前余额 ¥119.10</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50/80 group">
                       <div className="flex items-center">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mr-3 border border-indigo-100/50">
                           <User size={16} className="text-indigo-400" />
                         </div>
                         <div>
                           <p className="text-[13px] text-gray-800 font-bold mb-0.5">尾号 9281 用户</p>
                           <p className="text-[10px] text-gray-400 font-medium">今天 14:30 开通年卡</p>
                         </div>
                       </div>
                       <span className="text-green-500 font-black text-[16px]">+ ¥29.40</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 group">
                       <div className="flex items-center">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mr-3 border border-indigo-100/50">
                           <User size={16} className="text-indigo-400" />
                         </div>
                         <div>
                           <p className="text-[13px] text-gray-800 font-bold mb-0.5">尾号 3324 用户</p>
                           <p className="text-[10px] text-gray-400 font-medium">昨天 09:15 开通终身卡</p>
                         </div>
                       </div>
                       <span className="text-green-500 font-black text-[16px]">+ ¥89.70</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-transparent border-dashed flex justify-between items-center">
                    <div className="text-[12px] text-gray-500">累计已提现 <span className="font-bold text-gray-700">¥350.00</span></div>
                    <button onClick={() => showToast('已发起提现申请')} className="text-indigo-600 text-[13px] font-bold bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-xl shadow-sm border border-indigo-100/50">立即提现</button>
                  </div>
                </div>
              </div>
            )}

            {/* 定制服务页面 */}
            {id === 'custom' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2rem] p-7 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden border border-gray-800">
                   <div className="absolute -top-10 -right-10 opacity-5"><Crown size={180} /></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600"></div>

                   <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 text-yellow-400 text-[11px] font-black px-3 py-1.5 rounded-full mb-4 border border-yellow-400/30 backdrop-blur-sm">
                     <Crown size={12} className="mr-1.5 text-yellow-400"/> 首席导师 1对1 私教
                   </div>

                   <h3 className="text-[26px] font-black mb-3 relative z-10 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600">
                     高端情感定制服务
                   </h3>
                   <p className="text-[13px] text-gray-400 leading-relaxed relative z-10 mb-8 font-medium">平台 Top 1% 情感专家亲自操刀，提供全天候代聊、心态建设、约会实战指导等一站式服务，好评率 <span className="text-yellow-400 font-bold">99.8%</span>。</p>

                   <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                     {[
                       { title: '情感挽回', desc: '打破冷战僵局' },
                       { title: '深度脱单', desc: '高价值展示面建设' },
                       { title: '聊天代聊', desc: '导师实时指导回复' },
                       { title: '约会设计', desc: '从牵手到确定关系' }
                     ].map((item, idx) => (
                       <div key={idx} className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 hover:bg-gray-800 transition-colors group">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                           <CheckCircle2 size={16} className="text-yellow-500" />
                         </div>
                         <h4 className="font-bold text-[14px] text-gray-100 mb-1">{item.title}</h4>
                         <p className="text-[10px] text-gray-500 font-medium leading-tight">{item.desc}</p>
                       </div>
                     ))}
                   </div>

                   <div className="bg-gradient-to-r from-yellow-500/10 to-transparent p-4 rounded-2xl border-l-4 border-yellow-500 mb-8 relative z-10">
                     <p className="text-[12px] text-yellow-100/80 leading-relaxed font-medium">「 每个月仅限 5 个名额，确保导师精力充足，为你提供最高质量的服务效果。」</p>
                   </div>

                   <button onClick={() => showToast('正在为您分配专属顾问...')} className="relative z-10 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-black py-4.5 rounded-2xl shadow-xl shadow-yellow-500/20 active:scale-95 transition-all hover:shadow-yellow-500/40 flex items-center justify-center text-[16px] group overflow-hidden">
                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                     添加首席导师，获取免费评估方案
                   </button>
                </div>
              </div>
            )}

            {/* 专属客服页面 */}
            {id === 'support' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="love-card rounded-[2rem] p-7 shadow-xl shadow-blue-100/30 border border-blue-50 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60"></div>
                   <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-50 to-transparent rounded-tr-full opacity-60"></div>

                   <div className="relative z-10">
                     <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-5 relative shadow-inner border border-blue-200/50">
                       <Headset size={44} className="text-blue-500 drop-shadow-sm" />
                       <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center">
                         <div className="w-1.5 h-1.5 love-card rounded-full animate-pulse"></div>
                       </div>
                     </div>
                     <h3 className="font-extrabold text-gray-800 text-[20px] mb-1.5 tracking-tight">人工客服 甜甜</h3>
                     <p className="text-[12px] text-blue-500 font-medium mb-7 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100/50">在线时间：工作日 09:00 - 18:00</p>

                     <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 text-left border border-transparent shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] mb-7 relative">
                       <div className="absolute -top-3 left-6 w-4 h-4 bg-transparent border-t border-l border-transparent transform rotate-45"></div>
                       <p className="text-[14px] text-gray-700 leading-relaxed mb-4 font-medium relative z-10">Hi~ 我是专属客服甜甜！关于账号异常、VIP开通、课程使用等任何疑问，都可以随时戳我哦 (๑•ᴗ•๑)</p>
                       <div className="flex items-center justify-between love-card p-3.5 rounded-xl border border-transparent shadow-sm">
                         <div className="flex items-center text-[12px] font-bold text-gray-500">
                           <MessageCircle size={14} className="mr-1.5 text-blue-400" /> 微信号
                         </div>
                         <span className="text-[15px] font-black tracking-wider text-gray-900 select-all font-mono">huashu_service</span>
                       </div>
                     </div>

                     <button onClick={() => handleCopy('wx_service', 'huashu_service')} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center text-[15px] hover:shadow-blue-500/40">
                       {copiedId === 'wx_service' ? '已复制微信号，快去添加吧' : '一键复制微信号'}
                     </button>
                   </div>
                </div>
              </div>
            )}

            {/* 意见反馈页面 */}
            {id === 'feedback' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="love-card rounded-[2rem] p-6 shadow-xl shadow-pink-100/30 border border-pink-50 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>

                   <div className="relative z-10">
                     <h3 className="font-extrabold text-gray-800 text-[20px] mb-2 flex items-center tracking-tight"><Edit3 size={22} className="mr-2 text-pink-500" /> 倾听你的声音</h3>
                     <p className="text-[12px] text-gray-500 mb-6 leading-relaxed font-medium">你的每一个建议都是我们前进的动力。一旦被采纳，我们将送出 <span className="text-pink-500 font-bold bg-pink-50 px-1.5 py-0.5 rounded">1个月 Pro 会员</span> 作为特别感谢！</p>

                     <div className="mb-6">
                        <label className="block text-[13px] font-bold text-gray-700 mb-3 flex items-center"><Target size={14} className="mr-1.5 text-blue-500" /> 选择反馈类型</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['功能建议', 'Bug报告', '内容纠错', '其他'].map((type, i) => (
                            <span key={i} className={`text-[12px] px-4 py-2 border rounded-full cursor-pointer transition-all shadow-sm font-medium ${i === 0 ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-800 scale-105 shadow-md' : 'love-card text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}>
                              {type}
                            </span>
                          ))}
                        </div>
                     </div>

                     <div className="mb-6 relative group">
                        <label className="block text-[13px] font-bold text-gray-700 mb-3 flex items-center"><FileText size={14} className="mr-1.5 text-pink-500" /> 问题描述</label>
                        <div className="absolute -left-1.5 top-8 bottom-0 w-0.5 bg-gray-100 rounded-full group-focus-within:bg-pink-300 transition-colors"></div>
                        <textarea rows={5} className="w-full bg-transparent/80 border border-gray-200 rounded-2xl p-4 text-[13px] focus:border-pink-300 focus:bg-pink-50/30 focus:ring-4 focus:ring-pink-100/50 transition-all outline-none resize-none placeholder-gray-400 font-medium shadow-inner" placeholder="请详细描述您遇到的问题或您的绝佳创意，我们将尽快跟进处理..."></textarea>
                     </div>

                     <div className="mb-8 relative group">
                        <label className="block text-[13px] font-bold text-gray-700 mb-3 flex items-center"><MessageCircle size={14} className="mr-1.5 text-green-500" /> 联系方式 (选填)</label>
                        <div className="absolute -left-1.5 top-8 bottom-0 w-0.5 bg-gray-100 rounded-full group-focus-within:bg-green-300 transition-colors"></div>
                        <input type="text" className="w-full bg-transparent/80 border border-gray-200 rounded-xl px-4 py-3.5 text-[13px] focus:border-green-300 focus:bg-green-50/30 focus:ring-4 focus:ring-green-100/50 transition-all outline-none placeholder-gray-400 font-medium shadow-inner" placeholder="留下您的微信或手机号，方便我们发放奖励" />
                     </div>

                     <button onClick={() => { showToast('感谢您的反馈！我们会认真评估。'); setTimeout(() => setActiveServicePage(null), 1500); }} className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-300/50 active:scale-95 transition-transform flex items-center justify-center text-[15px] hover:shadow-gray-400/50">
                       <Send size={18} className="mr-2 opacity-80" /> 提交反馈
                     </button>
                   </div>
                </div>
              </div>
            )}

            {/* 精选专题页面 */}

            {id === 'ai-tool' && data && (
              <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
                <FloatingHearts isTriggered={showHeartEffect} onComplete={() => setShowHeartEffect(false)} />
                <div className={`p-5 ${data.bg} border-b ${data.border} flex flex-col items-center justify-center relative overflow-hidden`}>
                   <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                   <div className="relative z-10 flex flex-col items-center">
                     <div className={`w-14 h-14 ${data.iconBg} rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/50`}>
                       {data.icon}
                     </div>
                     <h3 className={`font-extrabold text-xl ${data.text} mb-1 tracking-tight`}>{data.title}</h3>
                     <p className={`text-[12px] font-medium opacity-80 ${data.text}`}>{data.desc}</p>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col space-y-4">
                   <div className="flex w-full mt-2 space-x-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm border border-white">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100/80 text-[13px] text-gray-700 leading-relaxed">
                          你好！我是你的专属【{data.title}】助手。告诉我现在的情况，我马上帮你生成专属方案。
                        </div>
                      </div>
                   </div>

                   <div className="flex w-full justify-end space-x-3 max-w-[85%] self-end">
                      <div>
                        <div className={`bg-gradient-to-r from-gray-800 to-gray-900 p-3.5 rounded-2xl rounded-tr-sm shadow-md text-[13px] text-white leading-relaxed`}>
                          {data.query}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden shadow-sm border border-white">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full bg-blue-50" alt="Me" />
                      </div>
                   </div>

                   {data.suggestedChips && data.suggestedChips.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-4 ml-12">
                       {data.suggestedChips.map((chip, idx) => (
                         <div key={idx} onClick={() => {
                           setIsTyping(true);
                           setTimeout(() => { setIsTyping(false); setShowHeartEffect(true); }, 1500);
                         }} className="bg-white border border-gray-200 text-gray-600 text-[12px] px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 cursor-pointer flex items-center active:scale-95 transition-all duration-300">
                           <span className="mr-1.5 text-blue-500">👉</span> {chip}
                         </div>
                       ))}
                     </div>
                   )}

                   {isTyping && (
                     <div className="flex w-full mt-2 space-x-3 max-w-[85%] animate-fade-in-up">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm border border-white">
                          <Sparkles size={14} />
                        </div>
                        <div>
                          <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100/80 text-[13px] text-gray-700 leading-relaxed">
                            <div className="flex space-x-1.5 items-center mb-1">
                              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-gray-400 text-xs">AI 正在飞速为你思考中...</span>
                          </div>
                        </div>
                     </div>
                   )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="bg-gray-100/80 rounded-[1.5rem] p-1.5 flex items-end shadow-inner border border-gray-200/50">
                    <textarea
                      value={aiInputText}
                      onChange={(e) => setAiInputText(e.target.value)}
                      className="flex-1 bg-transparent max-h-24 min-h-[40px] text-[13px] px-3 py-2.5 focus:outline-none resize-none placeholder-gray-400 text-gray-700"
                      placeholder="继续输入更多细节..."
                      rows="1"
                    ></textarea>
                    <button onClick={() => {
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setShowHeartEffect(true);
                        }, 1500);
                      }} className="w-9 h-9 flex-shrink-0 bg-gradient-to-r from-gray-900 to-black text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform mb-0.5 mr-0.5 hover:shadow-lg hover:shadow-pink-500/30">
                      <Send size={15} className="-ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {id === 'topic' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="relative h-56 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 mb-2 group">
                  <img src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt="Topic" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90"></div>
                  <div className="absolute top-4 right-4 love-card/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center border border-white/30 shadow-sm">
                    <Users size={12} className="text-white mr-1.5" />
                    <span className="text-[10px] text-white font-bold tracking-wider">2.5W 人在看</span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold mb-3 inline-flex items-center shadow-md shadow-pink-500/30 border border-pink-400">
                      <Flame size={10} className="mr-1" /> 本周强推
                    </span>
                    <h2 className="text-white text-2xl font-black mb-2 drop-shadow-lg tracking-tight leading-snug">情人节特辑：如何用<br/>一句话让她沦陷？</h2>
                    <p className="text-white/80 text-[12px] line-clamp-2 drop-shadow-md font-medium leading-relaxed max-w-[90%]">收录全网 50+ 句高赞表白神回复，拒绝油腻土味情话，用顶级高情商一秒搞定心动女孩。</p>
                  </div>
                </div>

                <div className="love-card rounded-[2rem] p-6 shadow-sm border border-transparent relative -mt-6 z-10">
                  <div className="flex items-center justify-between mb-5 border-b border-transparent pb-4">
                    <h3 className="font-extrabold text-gray-800 text-[17px] flex items-center tracking-tight"><Sparkles size={18} className="text-pink-500 mr-2" /> 专题精选语录</h3>
                    <div className="text-[10px] bg-pink-50 text-pink-500 px-2.5 py-1 rounded-full font-bold border border-pink-100">共 12 条</div>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100 rounded-full z-0"></div>
                    {[allScripts[3], allScripts[4], allScripts[0]].map((script, idx) => (
                      <div key={'topic-' + script.id} className="relative z-10 flex">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-50 border-4 border-white shadow-sm flex items-center justify-center text-pink-500 font-bold text-[14px] shrink-0 mt-2">
                          {idx + 1}
                        </div>
                        <div className="flex-1 ml-3 relative">
                          <ScriptCard script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} simple={false} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center space-x-2 mt-8 opacity-60">
                    <div className="h-[1px] w-12 bg-gray-300"></div>
                    <span className="text-xs text-gray-400 font-medium tracking-wider">持续更新中</span>
                    <div className="h-[1px] w-12 bg-gray-300"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 贡献原创话术页面 */}
            {id === 'contribute' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="love-card rounded-[2rem] p-6 shadow-sm border border-transparent relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"></div>
                   <div className="absolute top-0 right-0 bg-gradient-to-bl from-gray-900 to-gray-800 text-white text-[10px] px-3.5 py-1.5 rounded-bl-2xl font-black shadow-md">UGC 计划</div>

                   <div className="mt-4 mb-6">
                     <h3 className="font-extrabold text-gray-800 text-[20px] mb-1.5 flex items-center tracking-tight"><Edit3 size={22} className="mr-2 text-pink-500" /> 分享神回复赚特权</h3>
                     <p className="text-[12px] text-gray-500 leading-relaxed">你的高情商发言将点亮他人，审核采纳后，你将获得 <span className="text-pink-500 font-bold bg-pink-50 px-1.5 py-0.5 rounded">3天 Pro 会员</span> 及专属勋章！</p>
                   </div>

                   <div className="mb-6 relative group">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2.5 flex items-center"><MessageCircle size={16} className="mr-1.5 text-blue-500" /> 对方说了什么？</label>
                      <div className="absolute -left-1.5 top-8 bottom-0 w-0.5 bg-blue-100 rounded-full group-focus-within:bg-blue-400 transition-colors"></div>
                      <textarea rows={2} className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl p-4 text-[14px] focus:border-blue-400 focus:bg-blue-50/50 focus:ring-4 focus:ring-blue-100/50 transition-all outline-none resize-none placeholder-blue-300/80 font-medium text-gray-800 shadow-inner" placeholder="例如：你到底喜欢我什么？"></textarea>
                   </div>

                   <div className="mb-6 relative group">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2.5 flex items-center"><Sparkles size={16} className="mr-1.5 text-pink-500" /> 你的高分回复是？</label>
                      <div className="absolute -left-1.5 top-8 bottom-0 w-0.5 bg-pink-100 rounded-full group-focus-within:bg-pink-400 transition-colors"></div>
                      <textarea rows={3} className="w-full bg-pink-50/30 border border-pink-100 rounded-2xl p-4 text-[14px] focus:border-pink-400 focus:bg-pink-50/50 focus:ring-4 focus:ring-pink-100/50 transition-all outline-none resize-none placeholder-pink-300/80 font-medium text-gray-800 shadow-inner" placeholder="例如：喜欢你这个问题问得好，让我有了一辈子时间来回答。"></textarea>
                   </div>

                   <div className="mb-8 bg-transparent/80 rounded-2xl p-4 border border-transparent/50">
                      <label className="block text-[12px] font-bold text-gray-500 mb-3 flex items-center"><Target size={14} className="mr-1.5"/> 为你的话术选择一个分类</label>
                      <div className="flex flex-wrap gap-2.5">
                         {categories.map(c => (
                           <span
                             key={c.id}
                             onClick={() => setContributeCategory(c.id)}
                             className={`text-[12px] px-4 py-2 border rounded-full cursor-pointer transition-all shadow-sm font-medium ${contributeCategory === c.id ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-800 scale-105 shadow-md' : 'love-card text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}
                           >
                             {c.name}
                           </span>
                         ))}
                      </div>
                   </div>

                   <button onClick={() => { showToast('提交成功！等待系统审核...'); setTimeout(() => setActiveServicePage(null), 1500); }} className="relative w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-300/50 active:scale-95 transition-all hover:shadow-gray-400/50 flex items-center justify-center text-[15px] group overflow-hidden">
                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                     <Send size={18} className="mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> 立即投递，领会员奖励
                   </button>
                </div>

                <div className="text-center px-6">
                  <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                    投递须知：请勿提交包含低俗、暴力、敏感或无意义的内容，违规者将被永久封停账号。
                  </p>
                </div>
              </div>
            )}

            {/* 课程详情页面 */}
            {id === 'course' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">

                {/* 顶部视频/预览区 */}
                {activeLesson !== null ? (
                  <div className="relative w-full h-[220px] bg-black rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/60 flex flex-col justify-between animate-in zoom-in-95 duration-300">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      {isPlaying ? (
                        <div className="flex flex-col items-center bg-black/40 px-4 py-3 rounded-2xl backdrop-blur-md">
                          <Loader2 size={32} className="animate-spin text-pink-500 mb-2 opacity-90" />
                          <span className="text-white/90 text-xs font-bold tracking-widest drop-shadow-sm">正在缓冲视频...</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 love-card/20 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border border-white/30" onClick={() => setIsPlaying(true)}>
                          <PlayCircle size={36} className="text-white ml-1 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    {/* 顶部标题栏 */}
                    <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent p-5 pb-10 z-10 flex justify-between items-start">
                      <p className="text-white text-[15px] font-bold truncate pr-4 drop-shadow-md">{courseData.lessons[activeLesson].title}</p>
                      <span className="bg-black/40 backdrop-blur-md text-white/80 text-[10px] px-2 py-0.5 rounded border border-white/20">高清</span>
                    </div>
                    {/* 底部控制栏 */}
                    <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 pt-12 z-10 flex flex-col">
                      <div className="w-full h-1.5 love-card/30 rounded-full mb-4 cursor-pointer relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full ${isPlaying ? 'w-1/3 transition-all duration-1000' : 'w-0'}`}></div>
                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 love-card rounded-full shadow-md border-2 border-pink-500 transition-all scale-0 group-hover:scale-100 ${isPlaying ? 'left-1/3' : 'left-0'}`}></div>
                      </div>
                      <div className="flex justify-between items-center text-white">
                        <div className="flex items-center space-x-5 cursor-pointer">
                          {isPlaying ? (
                            <PauseCircle size={24} onClick={() => setIsPlaying(false)} className="hover:text-pink-400 drop-shadow-md transition-colors" />
                          ) : (
                            <PlayCircle size={24} onClick={() => setIsPlaying(true)} className="hover:text-pink-400 drop-shadow-md transition-colors" />
                          )}
                          <span className="text-[11px] font-bold opacity-90 drop-shadow-sm font-mono tracking-wider">
                            {isPlaying ? '04:12' : '00:00'} / {courseData.lessons[activeLesson].duration}
                          </span>
                        </div>
                        <Maximize2 size={18} className="cursor-pointer hover:text-pink-400 opacity-90 transition-colors drop-shadow-sm" onClick={() => showToast('全屏模式开发中')} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-[220px] bg-gray-900 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 flex items-center justify-center group cursor-pointer animate-in fade-in" onClick={() => handlePlayLesson(0)}>
                     <img src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-110" alt="Course" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>
                     <div className="absolute top-4 left-4 bg-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded border border-pink-400 shadow-md">精品课程</div>
                     <div className="relative z-10 flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                       <div className="w-16 h-16 love-card/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] mb-3">
                         <PlayCircle size={36} className="text-white ml-1 drop-shadow-md" />
                       </div>
                       <span className="text-white text-[13px] font-black tracking-[0.2em] drop-shadow-lg">立即试看</span>
                     </div>
                  </div>
                )}

                {/* 课程基本信息 */}
                <div className="love-card rounded-3xl p-5 shadow-sm border border-transparent relative z-10 -mt-2">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-2">
                       {courseData.tags.map(tag => (
                         <span key={tag} className="bg-pink-50 text-pink-600 text-[10px] px-2.5 py-1 rounded-md font-bold border border-pink-100">{tag}</span>
                       ))}
                     </div>
                     <span className="text-xs text-gray-500 flex items-center font-medium"><Star size={14} className="text-yellow-400 mr-1 fill-current" /> {courseData.rating} ({courseData.students}人)</span>
                   </div>
                   <h2 className="text-[19px] font-extrabold text-gray-800 mb-2">{courseData.title}</h2>
                   <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{courseData.desc}</p>
                </div>

                {/* Tabs 切換 */}
                <div className="flex border-b border-gray-200/50 px-2 mt-4">
                  <div
                    onClick={() => setCourseTab('outline')}
                    className={`flex-1 text-center py-3 text-[14px] font-bold cursor-pointer relative transition-colors ${courseTab === 'outline' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    课程目录
                    {courseTab === 'outline' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-pink-500 rounded-t-full"></div>}
                  </div>
                  <div
                    onClick={() => setCourseTab('intro')}
                    className={`flex-1 text-center py-3 text-[14px] font-bold cursor-pointer relative transition-colors ${courseTab === 'intro' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    课程简介
                    {courseTab === 'intro' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-pink-500 rounded-t-full"></div>}
                  </div>
                </div>

                {/* Tab 内容区 */}
                <div className="min-h-[300px]">

                  {/* 目录 Tab */}
                  {courseTab === 'outline' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center px-1 mb-2">
                        <span className="text-[13px] font-bold text-gray-700 flex items-center"><Clock size={14} className="mr-1.5 text-pink-500" /> 更新至第 {courseData.lessons.length} 节</span>
                        <span className="text-xs text-gray-400">完整版共 12 节</span>
                      </div>
                      {courseData.lessons.map((lesson, idx) => {
                        const isCurrentPlaying = activeLesson === idx;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${isCurrentPlaying ? 'bg-pink-50/80 border-pink-200 shadow-sm' : 'love-card border-transparent hover:bg-transparent hover:border-gray-200'}`}
                            onClick={() => handlePlayLesson(idx)}
                          >
                            <div className="flex items-center flex-1 pr-4">
                              {isCurrentPlaying ? (
                                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center mr-3 shadow-md shadow-pink-200 shrink-0">
                                  <Loader2 size={16} className="text-white animate-spin" />
                                </div>
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0 ${lesson.free ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-400'}`}>
                                  {idx + 1}
                                </div>
                              )}
                              <div>
                                <p className={`text-[13px] font-bold leading-tight ${isCurrentPlaying ? 'text-pink-600' : (lesson.free ? 'text-gray-800' : 'text-gray-500')}`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center mt-1.5 space-x-2">
                                  <span className={`text-[10px] ${isCurrentPlaying ? 'text-pink-400' : 'text-gray-400'}`}>{lesson.duration}</span>
                                  {lesson.free && !isCurrentPlaying && <span className="text-[9px] bg-green-50 text-green-500 border border-green-200 px-1.5 py-0.5 rounded font-medium">试看</span>}
                                  {isCurrentPlaying && <span className="text-[9px] bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded font-bold">正在播放</span>}
                                </div>
                              </div>
                            </div>
                            {lesson.free ? (
                              isCurrentPlaying ? (
                                <PauseCircle size={20} className="text-pink-500 shrink-0" />
                              ) : (
                                <PlayCircle size={20} className="text-pink-400 shrink-0 opacity-60" />
                              )
                            ) : (
                              <div className="bg-transparent p-1.5 rounded-full shrink-0 border border-transparent"><Crown size={14} className="text-gray-400" /></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 简介 Tab */}
                  {courseTab === 'intro' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="love-card rounded-3xl p-5 shadow-sm border border-transparent">
                        <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center"><UserCheck size={16} className="mr-1.5 text-blue-500" /> 导师介绍</h3>
                        <div className="flex items-center mb-3">
                          <img src={courseData.instructor.avatar} className="w-12 h-12 rounded-full object-cover mr-3 shadow-sm border border-transparent" alt="Instructor" />
                          <div>
                            <p className="font-bold text-gray-800 text-[14px]">{courseData.instructor.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{courseData.instructor.title}</p>
                          </div>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed bg-transparent p-3 rounded-xl border border-transparent/50">
                          苏苏导师专注于情感关系升温与脱单实战指导，曾帮助上万名学员成功脱单、挽回前任。擅长利用心理学原理打破聊天僵局。
                        </p>
                      </div>

                      <div className="love-card rounded-3xl p-5 shadow-sm border border-transparent">
                        <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center"><Sparkles size={16} className="mr-1.5 text-orange-500" /> 你将获得</h3>
                        <ul className="space-y-3 text-[13px] text-gray-600">
                          <li className="flex items-start"><CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="leading-relaxed">掌握 10+ 种高频聊天场景的推拉技巧，告别冷场。</span></li>
                          <li className="flex items-start"><CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="leading-relaxed">学会通过情绪价值吸引对方，建立强大的个人框架。</span></li>
                          <li className="flex items-start"><CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="leading-relaxed">突破友谊区，实现从普通朋友到暧昧对象的快速跃迁。</span></li>
                        </ul>
                      </div>

                      {/* 课程评论区 */}
                      <div className="love-card rounded-3xl px-5 pb-5 shadow-sm border border-transparent">
                        <CommentSection targetType="COURSE" targetId={activeServicePage.data?.id || 1} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 底部吸底操作栏 (如果未开通 VIP 且未在播放时显示) */}
                {activeLesson === null && (
                  <div className="absolute bottom-0 left-0 right-0 love-card/95 backdrop-blur-md border-t border-transparent p-3 px-5 z-40 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex space-x-3">
                    <div onClick={() => setActiveTab('ai')} className="w-12 h-12 bg-transparent rounded-2xl flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 border border-gray-200/60 shrink-0">
                      <MessageCircle size={20} className="text-gray-600 mb-0.5" />
                      <span className="text-[9px] text-gray-500 font-medium">咨询</span>
                    </div>
                    <button onClick={() => setShowVipModal(true)} className="flex-1 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-gray-400/20 active:scale-95 transition-transform flex justify-center items-center">
                      <Crown size={18} className="mr-2 text-yellow-400" /> 解锁全部课程
                    </button>
                  </div>
                )}
              </div>
            )}

       </div>

       {id === 'article' && activeArticle && (
          <div className="absolute bottom-0 left-0 right-0 love-card border-t border-transparent p-3 px-6 pb-safe z-40 flex items-center justify-between shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)]">
             <div className="flex-1">
               <input type="text" placeholder="写下你的想法..." className="w-full bg-transparent rounded-full py-2 px-4 text-xs outline-none focus:love-card focus:border focus:border-pink-200 transition-colors" />
             </div>
             <div className="flex items-center space-x-4 ml-4 text-gray-500">
               <div className="flex flex-col items-center cursor-pointer hover:text-pink-500" onClick={() => showToast('已点赞')}>
                  <ThumbsUp size={18} className="mb-0.5" />
               </div>
               <div className="flex flex-col items-center cursor-pointer hover:text-yellow-500" onClick={() => showToast('已收藏此文章')}>
                  <Star size={18} className="mb-0.5" />
               </div>
               <div className="flex flex-col items-center cursor-pointer hover:text-indigo-500" onClick={() => showToast('调起分享面板')}>
                  <Share2 size={18} className="mb-0.5" />
               </div>
             </div>
          </div>
       )}
    </div>
  );
}
