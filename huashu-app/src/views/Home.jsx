import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getCategories, getScripts, getArticles, getRecommendedCourses } from '../services/api';
import ScrollableRow from '../components/common/ScrollableRow';
import ScriptCard from '../components/common/ScriptCard';
import {
  Search, Heart, MessageCircle, UserCheck, PlayCircle,
  Bell, Smile, Zap, Crown, CheckCircle2, ChevronRight,
  Flame, Edit3, TrendingUp, Compass, Volume2, Calendar,
  Quote, Timer, Target, AlertTriangle, Sparkles
} from 'lucide-react';

export default function Home() {
  const {
    setActiveTab,
    setShowVipModal,
    showToast,
    setActiveServicePage,
    setDiscoverState,
    setAiState,
    copiedId,
    handleCopy,
    favoriteIds,
    toggleFavorite,
    setRepliesDrawerScript
  } = useContext(AppContext);

  const [homeSearchInput, setHomeSearchInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 从 API 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, scriptsData, articlesData, coursesData] = await Promise.all([
          getCategories(),
          getScripts({ pageSize: 10 }),
          getArticles(),
          getRecommendedCourses().catch(() => [])
        ]);
        setCategories(cats);
        setScripts(scriptsData.list || []);
        setArticles(articlesData || []);
        setRecommendedCourses(coursesData || []);
      } catch (error) {
        console.error('获取数据失败:', error);
        showToast('数据加载失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [showToast]);

  const executeSearch = (query) => {
    if (!query.trim()) return;
    setDiscoverState(prev => ({ ...prev, searchQuery: query, activeCategory: null, filterTag: '全部', isSearchFocused: false }));
    setActiveTab('discover');
  };

  const handleOpenArticle = (article) => {
    setActiveServicePage({ id: 'article', data: article });
  };

  // 获取按点赞数排序的前3个话术
  const topScripts = [...scripts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 scrollbar-hide bg-transparent">
      <div className="love-card px-5 pt-8 pb-5 rounded-b-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative animate-fade-in-up">
        <div className="flex justify-between items-center mb-5 pr-20">
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-800 tracking-tight flex items-center">
              恋爱话术库
              <span onClick={() => setShowVipModal(true)} className="ml-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] px-2 py-0.5 rounded-full font-normal shadow-sm animate-pulse-slow cursor-pointer">Pro</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">今天想撩谁？一句顶一万句</p>
          </div>
          <div onClick={() => showToast('暂无新通知')} className="w-9 h-9 bg-transparent rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-transparent cursor-pointer hover:bg-gray-100 transition-colors">
            <Bell size={18} />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-gray-400 group-focus-within:text-pink-500 transition-colors" /></div>
          <input
            type="text" value={homeSearchInput} onChange={(e) => setHomeSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeSearch(homeSearchInput)}
            className="block w-full pl-11 pr-20 py-3.5 bg-transparent border border-transparent rounded-2xl text-sm placeholder-gray-400 focus:border-pink-300 focus:love-card focus:ring-4 focus:ring-pink-50 transition-all outline-none"
            placeholder='搜一下：女生说"早安"怎么回'
          />
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <button onClick={() => executeSearch(homeSearchInput)} className="bg-gray-900 hover:bg-black text-white text-xs px-4 py-2 rounded-xl shadow-md font-medium active:scale-95 transition-all">搜索</button>
          </div>
        </div>

        {/* 热门搜索词标签 */}
        <ScrollableRow className="flex items-center mt-4 space-x-2 pb-1">
          <span className="text-[11px] font-bold text-gray-700 shrink-0 flex items-center"><TrendingUp size={14} className="mr-1 text-pink-500" /> 猜你想搜</span>
          {['相亲怎么聊', '被拒绝', '生日祝福', '惹她生气'].map((tag, idx) => (
             <span key={idx} onClick={() => executeSearch(tag)} className="text-[11px] bg-transparent border border-transparent text-gray-500 px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm hover:bg-pink-50 hover:text-pink-500 transition-colors">{tag}</span>
          ))}
        </ScrollableRow>
      </div>

      {/* 脱单战报/通知广播 */}
      <div className="px-5 mt-4 animate-fade-in-up">
        <div className="bg-orange-50/80 border border-orange-100/50 text-orange-600 px-3 py-2.5 rounded-[1rem] text-[11px] flex items-center overflow-hidden shadow-sm">
          <Volume2 size={14} className="mr-2 shrink-0 text-orange-500" />
          <div className="flex-1 overflow-hidden relative h-4">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center h-full w-max">
              <span className="mr-8">🎉 恭喜 杭州的李同学 通过话术成功邀约女神！</span>
              <span className="mr-8">❤️ 恭喜 北京的张先生 挽回前任成功！</span>
              <span className="mr-8">🎁 恭喜 上海的王女士 领取了专属恋爱白皮书！</span>
              <span className="mr-8">🎉 恭喜 杭州的李同学 通过话术成功邀约女神！</span>
              <span className="mr-8">❤️ 恭喜 北京的张先生 挽回前任成功！</span>
              <span className="mr-8">🎁 恭喜 上海的王女士 领取了专属恋爱白皮书！</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷四宫格分类 */}
      <div className="px-5 mt-5 grid grid-cols-4 gap-3 animate-fade-in-up delay-100">
        {[
          { icon: <MessageCircle size={20} className="text-blue-500" />, label: '约会没话', catId: 1 },
          { icon: <Heart size={20} className="text-pink-500" />, label: '惹生气了', catId: 4 },
          { icon: <Zap size={20} className="text-orange-500" />, label: '神级破冰', catId: 1 },
          { icon: <Crown size={20} className="text-purple-500" />, label: '睡前晚安', catId: 5 }
        ].map((item, idx) => (
          <div key={idx} onClick={() => { setActiveTab('discover'); setDiscoverState(prev => ({ ...prev, activeCategory: item.catId, searchQuery: '' })); }} className="flex flex-col items-center justify-center love-card p-3 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform">
            <div className="bg-transparent p-2 rounded-full mb-1.5">{item.icon}</div>
            <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 每日灵感 & 签到 */}
      <div className="px-4 mt-5 animate-fade-in-up delay-150">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-4 text-white shadow-md shadow-purple-200/50 flex justify-between items-center relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 w-24 h-24 love-card/10 rounded-full blur-xl"></div>
           <div className="relative z-10 flex-1 pr-4">
              <div className="flex items-center text-[10px] love-card/20 w-max px-2 py-0.5 rounded-md backdrop-blur-sm mb-2 border border-white/20 font-medium">
                 <Calendar size={12} className="mr-1"/> 每日灵感 · 今日
              </div>
              <p className="text-[13px] font-medium leading-relaxed italic tracking-wide">"真正的吸引不是刻意讨好，而是展示你独特的生活态度。"</p>
           </div>
           <div className="flex flex-col items-center relative z-10 shrink-0">
             <button onClick={() => showToast('签到成功，获得 10 积分！')} className="love-card text-purple-600 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform flex items-center justify-center">
                <CheckCircle2 size={12} className="mr-1"/> 签到领积分
             </button>
             <span className="text-[9px] text-purple-100 mt-1.5 opacity-80">已连续签到 3 天</span>
           </div>
           <Quote size={60} className="absolute -right-2 -top-2 text-white/10 rotate-12" />
        </div>
      </div>

      {/* 新人限时特惠卡片 */}
      <div className="px-4 mt-4 animate-fade-in-up delay-[180ms]">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 rounded-[1.25rem] p-4 text-white shadow-md shadow-red-200/50 flex justify-between items-center relative overflow-hidden cursor-pointer active:scale-95 transition-transform" onClick={() => setShowVipModal(true)}>
           <div className="absolute -left-6 -top-6 w-20 h-20 love-card/10 rounded-full blur-lg"></div>
           <div className="relative z-10 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                 <span className="font-bold text-[15px] tracking-wide">新人限时特惠</span>
                 <span className="love-card/20 px-1.5 py-0.5 rounded text-[10px] flex items-center backdrop-blur-sm border border-white/20"><Timer size={10} className="mr-1 animate-pulse"/> 距结束 02:14:59</span>
              </div>
              <p className="text-[11px] text-white/90 font-medium">终身 Pro 会员仅需 ¥98，立省 ¥201</p>
           </div>
           <div className="relative z-10 love-card text-pink-500 font-extrabold px-4 py-2 rounded-full text-xs shadow-sm flex-shrink-0 ml-2">
              立即抢购
           </div>
        </div>
      </div>

      {/* AI 恋爱神器 */}
      <div className="mt-6 animate-fade-in-up delay-200">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px] flex items-center"><Crown size={18} className="text-purple-500 mr-1.5" /> AI 恋爱神器</h3>
          <span className="text-[11px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">无限畅聊</span>
        </div>
        <div className="px-4 grid grid-cols-2 gap-3">
           {[
             { title: '朋友圈文案', desc: '高级感拉满', icon: <Edit3 size={16} className="text-blue-500" />, bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100', query: '帮我写一段发朋友圈的文案，展现我积极阳光的生活状态，带点幽默感' },
             { title: '高情商道歉', desc: '秒变乖狗狗', icon: <Smile size={16} className="text-orange-500" />, bg: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-100', query: '我惹女朋友生气了，帮我写一段真诚又带点幽默的高情商道歉话术' },
             { title: '土味情话', desc: '撩到她脸红', icon: <Heart size={16} className="text-pink-500" />, bg: 'bg-pink-50/50', border: 'border-pink-100', text: 'text-pink-700', iconBg: 'bg-pink-100', query: '给我来5句土味情话，越土越好' },
             { title: '冷场急救', desc: '破解尴尬', icon: <Zap size={16} className="text-yellow-500" />, bg: 'bg-yellow-50/50', border: 'border-yellow-100', text: 'text-yellow-700', iconBg: 'bg-yellow-100', query: '现在聊天冷场了，不知道说什么，给我提供几个有趣的话题破冰' }
           ].map((tool, idx) => (
             <div key={idx} onClick={() => { setActiveTab('ai'); setAiState({ chatInput: tool.query }); }} className={`${tool.bg} border ${tool.border} p-3 rounded-2xl flex items-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm`}>
               <div className={`w-8 h-8 rounded-full ${tool.iconBg} flex items-center justify-center mr-2.5 shrink-0 shadow-sm`}>
                 {tool.icon}
               </div>
               <div>
                 <h4 className={`text-[13px] font-bold ${tool.text}`}>{tool.title}</h4>
                 <p className="text-[10px] text-gray-500 mt-0.5">{tool.desc}</p>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 课程推荐区域 */}
      {recommendedCourses.length > 0 && (
        <div className="px-4 mt-6 animate-fade-in-up delay-[250ms]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-[17px] flex items-center">
              <Crown size={18} className="text-yellow-500 mr-1.5" /> 精选课程
            </h3>
          </div>
          <ScrollableRow className="flex pb-4 space-x-4">
            {recommendedCourses.map(course => (
              <div key={course.id} onClick={() => course.link ? window.open(course.link, '_blank') : setActiveServicePage({ id: 'course', data: course })} className="relative min-w-[240px] h-[160px] rounded-[1.5rem] overflow-hidden shadow-lg shadow-pink-200/40 group bg-gradient-to-br from-rose-400 via-pink-400 to-purple-500 cursor-pointer flex-shrink-0 ring-2 ring-pink-100/50 hover:ring-pink-300 transition-all duration-300">
                <img src={course.cover} alt="Banner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-overlay" onError={(e) => e.target.style.display = 'none'} />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 mb-1.5">
                    {course.tags && course.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">{tag}</span>
                    ))}
                    {course.rating > 0 && (
                      <span className="love-card/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md flex items-center border border-white/10">
                        <Flame size={10} className="mr-1 text-orange-400" /> {course.rating}分
                      </span>
                    )}
                  </div>
                  <h2 className="text-white font-bold text-[17px] mb-1 drop-shadow-md truncate">{course.title}</h2>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-200 text-[11px] opacity-90 truncate max-w-[130px]">{course.desc}</p>
                    <button className="flex items-center text-[10px] font-bold text-gray-900 love-card rounded-full px-2.5 py-1 shadow-sm group-hover:bg-pink-50 transition-colors">
                      学习 <PlayCircle size={10} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </ScrollableRow>
        </div>
      )}

      {/* 实战场景大分类栏 */}
      <div className="mt-6 animate-fade-in-up delay-300">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px]">实战场景</h3>
          <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-pink-500 transition-colors" onClick={() => { setActiveTab('discover'); setDiscoverState(prev => ({ ...prev, activeCategory: 1, searchQuery: '' })); }}>全部 <ChevronRight size={14} /></span>
        </div>
        <ScrollableRow className="flex px-5 pb-4 space-x-3.5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center flex-shrink-0 group" onClick={() => { setActiveTab('discover'); setDiscoverState(prev => ({ ...prev, activeCategory: cat.id, searchQuery: '' })); }}>
              <div className={`w-[56px] h-[56px] rounded-[1rem] bg-gradient-to-br ${cat.color} text-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all transform group-active:scale-95 border border-white/50 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-5 h-5 love-card/20 rounded-bl-full"></div>{cat.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-700 mt-2">{cat.name}</span>
            </div>
          ))}
        </ScrollableRow>
      </div>

      {/* 每日情商挑战 */}
      <div className="px-4 mt-3 animate-fade-in-up delay-[320ms]">
        <div className="bg-gradient-to-br from-white to-pink-50/50 border border-pink-100 rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(236,72,153,0.1)] transition-all duration-500">
           <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-[10px] px-3 py-1.5 rounded-bl-2xl font-bold flex items-center shadow-sm"><Target size={12} className="mr-1"/> 每日心动测验</div>
           <div className="absolute -bottom-4 -right-4 text-pink-500/10 transform rotate-12 group-hover:scale-110 transition-transform duration-700"><Heart size={80} className="fill-current" /></div>
           <h3 className="font-bold text-gray-800 text-[15px] mb-2 flex items-center relative z-10">情商挑战：送命题怎么回？ <Sparkles size={14} className="ml-1 text-pink-400" /></h3>
           <p className="text-[13px] text-gray-700 mb-4 love-card/80 backdrop-blur-sm p-3.5 rounded-xl border border-pink-100/50 relative z-10 shadow-sm leading-relaxed">女生突然对你说："我好像发烧到39度了，好难受..." 你该怎么回？</p>
           <div className="space-y-2.5 relative z-10">
             <button onClick={()=>showToast('太直男了！扣10分！正确做法请看解析')} className="w-full love-card/90 hover:love-card hover:text-rose-500 hover:border-rose-200 border border-white p-3.5 rounded-xl text-left text-[13px] text-gray-600 transition-all flex justify-between items-center shadow-sm hover:shadow-md active:scale-[0.98]">
               <span>A. "多喝热水，吃药了吗？快去休息吧。"</span>
             </button>
             <button onClick={()=>showToast('高情商！加10分！')} className="w-full love-card/90 hover:love-card hover:text-green-600 hover:border-green-200 border border-white p-3.5 rounded-xl text-left text-[13px] text-gray-600 transition-all flex justify-between items-center shadow-sm hover:shadow-md active:scale-[0.98]">
               <span>B. "开门，我在楼下带了药和粥。"</span>
             </button>
           </div>
           <div className="mt-4 pt-3 border-t border-pink-200/50 text-center relative z-10">
             <span className="text-rose-500 text-[11px] font-bold cursor-pointer hover:text-rose-600 transition-colors flex items-center justify-center love-card/50 w-max mx-auto px-4 py-1.5 rounded-full" onClick={()=> {setActiveTab('ai'); setAiState({ chatInput: '女生说她发烧到39度了，除了说多喝热水，我该怎么高情商回复并表现出关心？' });}}>
               让 AI 导师给出更多满分回答 <ChevronRight size={14} className="ml-0.5" />
             </span>
           </div>
        </div>
      </div>

      {/* 金牌导师 1v1 */}
      <div className="mt-6 animate-fade-in-up delay-[350ms]">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px] flex items-center"><UserCheck size={18} className="text-indigo-500 mr-1.5" /> 金牌导师 1V1</h3>
          <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-pink-500" onClick={() => setActiveServicePage({ id: 'support' })}>查看全部 <ChevronRight size={14} /></span>
        </div>
        <ScrollableRow className="flex px-5 pb-4 space-x-3.5">
          {[
            { name: '苏苏导师', tag: '挽回前任', rate: '99%', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
            { name: '陈先生', tag: '关系破冰', rate: '98%', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' },
            { name: '林夕导师', tag: '长期关系', rate: '99%', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop' }
          ].map((tutor, idx) => (
            <div key={idx} className="love-card border border-transparent p-3 rounded-2xl shadow-sm min-w-[120px] flex flex-col items-center flex-shrink-0 relative">
              <span className="absolute top-2 right-2 bg-green-50 text-green-600 border border-green-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10 flex items-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>在线</span>
              <div className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-sm border-2 border-pink-100 ring-4 ring-white relative mt-2">
                 <img src={tutor.avatar} className="w-full h-full object-cover" alt={tutor.name} />
              </div>
              <h4 className="font-bold text-[13px] text-gray-800">{tutor.name}</h4>
              <p className="text-[10px] text-gray-500 mt-1 mb-3 bg-transparent px-2 py-0.5 rounded-md border border-transparent">{tutor.tag}</p>
              <button onClick={() => setActiveServicePage({ id: 'support' })} className="w-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 hover:from-rose-200 hover:to-pink-200 shadow-sm text-[11px] font-bold py-2 rounded-xl active:scale-95 transition-all">立即咨询</button>
            </div>
          ))}
        </ScrollableRow>
      </div>

      {/* 恋爱避坑指南 */}
      <div className="mt-4 animate-fade-in-up delay-[400ms]">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px] flex items-center"><AlertTriangle size={18} className="text-pink-500 mr-1.5" /> 恋爱避坑指南</h3>
          <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-pink-500" onClick={() => setActiveServicePage({ id: 'all-pitfalls' })}>更多避坑 <ChevronRight size={14} /></span>
        </div>
        <ScrollableRow className="flex px-5 pb-4 space-x-3.5">
          {articles.slice(0, 3).map((item, idx) => (
            <div key={idx} onClick={() => handleOpenArticle(item)} className="love-card border border-transparent p-3.5 rounded-2xl shadow-sm min-w-[150px] flex-shrink-0 cursor-pointer hover:bg-transparent transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-50 text-pink-500 flex items-center justify-center mb-2.5">
                <AlertTriangle size={14} />
              </div>
              <h4 className="font-bold text-[13px] text-gray-800 mb-1">{item.title.substring(0, 10)}...</h4>
              <p className="text-[10px] text-gray-500 line-clamp-1 mb-2.5">{item.desc}</p>
              <div className="text-[9px] text-gray-400 flex items-center"><Flame size={10} className="mr-1 text-gray-300"/> {item.views} 浏览</div>
            </div>
          ))}
        </ScrollableRow>
      </div>

      <div className="px-4 mt-2 pb-6 animate-fade-in-up delay-500">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800 text-[17px]">高分回复榜</h3>
          <span className="text-[10px] bg-red-50 text-pink-500 px-2 py-1 rounded-md font-bold flex items-center border border-red-100"><Flame size={12} className="mr-1 fill-current" /> 全网热搜</span>
        </div>
        <div className="space-y-3.5">
          {topScripts.map((script) => (
            <ScriptCard key={script.id} script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} />
          ))}
        </div>
      </div>
    </div>
  );
}
