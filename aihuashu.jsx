import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Heart, MessageCircle, User, Home, Copy, Sparkles, 
  Flame, CheckCircle2, ChevronRight, PlayCircle, MoreHorizontal, 
  X, Zap, Crown, Settings, HelpCircle, ChevronLeft, Send,
  Bell, Smile, PlusCircle, Mic, Star, ThumbsUp, 
  ThumbsDown, RefreshCw, MessageSquare, Gift, FileText, Headset,
  Loader2, Trash2, CheckSquare, Square, Award, ShieldCheck, Info,
  PauseCircle, Clock, UserCheck, Maximize2, Edit3, TrendingUp, Compass,
  Volume2, Calendar, Quote, Timer, Target, AlertTriangle, Share2,
  Download, Edit2, FolderHeart, FileDown, History, BookOpen, MessageSquareText, PenTool
} from 'lucide-react';

// --- 模拟全局数据 ---
const categories = [
  { id: 1, name: '开场破冰', icon: '🧊', color: 'from-blue-400 to-cyan-300', count: 128 },
  { id: 2, name: '幽默撩人', icon: '😜', color: 'from-pink-400 to-rose-300', count: 256 },
  { id: 3, name: '情感升温', icon: '🔥', color: 'from-orange-400 to-red-300', count: 96 },
  { id: 4, name: '巧妙化解', icon: '🛡️', color: 'from-indigo-400 to-purple-300', count: 112 },
  { id: 5, name: '睡前情话', icon: '🌙', color: 'from-violet-400 to-fuchsia-300', count: 340 },
  { id: 6, name: '长期关系', icon: '💑', color: 'from-teal-400 to-emerald-300', count: 85 },
];

const allScripts = [
  { id: 1, categoryId: 1, question: '女生说：“在干嘛呢？”', type: '高情商', likes: 1250, isNew: false, answers: ['在想怎么回复一个漂亮女孩的消息。', '刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。', '在做一道选择题：是继续想你，还是去找你。'] },
  { id: 2, categoryId: 3, question: '女生说：“我今天好累哦”', type: '暖心/幽默', likes: 3420, isNew: true, answers: ['怎么啦？是不是在我的脑海里跑了一整天累坏了？', '摸摸头，辛苦啦。今晚的月亮很温柔，早点休息，我们在梦里见。', '给你发个虚拟肩膀，靠一下吧（拍一拍）'] },
  { id: 3, categoryId: 1, question: '不知道聊什么，怎么自然开场？', type: '开场白', likes: 890, isNew: false, answers: ['刚刚在路边看到一只猫，跟你头像一样可爱，忍不住想跟你分享。', '我发现一个关于你的秘密，你想不想听？（引发好奇）', '今天的天气太好了，好到我不仅想晒太阳，还想跟你说句话。'] },
  { id: 4, categoryId: 2, question: '女生问：“你喜欢我什么？”', type: '幽默/化解', likes: 5600, isNew: false, answers: ['本来以为只是图你长得好看，后来发现你还挺有趣的，这下亏大了。', '喜欢你这个问题问得好，让我有了一辈子时间来回答。', '大概是第一次见你时，连周遭的空气都变甜了吧。'] },
  { id: 5, categoryId: 5, question: '该睡觉了，怎么说晚安？', type: '睡前情话', likes: 2100, isNew: true, answers: ['晚安，希望你今晚的梦里有我，如果没有，那我明天再来问一遍。', '月亮不睡我不睡，但你得睡了。晚安好梦~', '把今天的烦恼都关掉，我们梦里见。'] },
  { id: 6, categoryId: 2, question: '怎么要微信比较自然？', type: '高情商', likes: 430, isNew: true, answers: ['我手机刚才中病毒了，只有加个漂亮女孩的微信才能解锁，帮个忙？', '我觉得我们聊得挺投缘的，要不要转移到微信战场继续？'] }
];

// 扩充避坑指南文章数据
const pitfallsData = [
  { 
    id: 1, 
    title: '千万别这样表白，感动自己却吓跑对方', 
    desc: '感动自己，吓跑对方', 
    views: '10.5w', 
    author: '苏苏导师', 
    date: '2023-10-24', 
    content: [
      { type: 'p', text: '很多男生在表白时，喜欢搞隆重的仪式，甚至在众目睽睽之下摆蜡烛、弹吉他。这不仅不会让女生感动，反而会给她带来巨大的社交压力。' },
      { type: 'h3', text: '为什么“感动式表白”会失败？' },
      { type: 'p', text: '表白应该是最终胜利时的号角，而不是发起进攻的冲锋号。如果你们平时的互动还没有达到暧昧的顶峰，突如其来的表白只会让对方觉得你“莫名其妙”，甚至产生防备心理。' },
      { type: 'tip', text: '正确做法：先通过日常推拉、肢体接触试探对方的底线，当她对你不抗拒且表现出依赖时，在一个自然放松的环境下（如散步时）顺其自然地牵起她的手，这比任何言语都有效。' }
    ]
  },
  { 
    id: 2, 
    title: '约会三大禁忌话题，一开口就注定单身', 
    desc: '一开口就注定单身', 
    views: '8.2w', 
    author: '陈先生', 
    date: '2023-10-20', 
    content: [
      { type: 'h3', text: '禁忌一：查户口式盘问' },
      { type: 'p', text: '“你多大？”“做什么工作？”“谈过几次恋爱？” 这种连珠炮似的提问会让约会变得像面试，让人非常反感。' },
      { type: 'h3', text: '禁忌二：过度吹嘘自己' },
      { type: 'p', text: '一直强调自己多有钱、认识多少牛人，只会暴露你的极度不自信。真正的价值是“展示”出来的，而不是“说”出来的。' },
      { type: 'tip', text: '核心心法：约会的目的是“情绪交流”而不是“信息交换”。多聊感受、童年趣事、旅行见闻和未来的梦想。' }
    ]
  },
  { 
    id: 3, 
    title: '过度付出的陷阱：如何逆转“舔狗”命运', 
    desc: '如何逆转舔狗命运', 
    views: '12.1w', 
    author: '林夕导师', 
    date: '2023-10-15', 
    content: [
      { type: 'p', text: '“只要我全心全意对她好，她总有一天会被我感动的。” 这句话骗了多少老实人。' },
      { type: 'p', text: '在两性关系中，单方面的过度付出不仅换不来爱情，反而会降低你的个人价值，让你沦为备胎。' },
      { type: 'h3', text: '什么是“沉没成本”？' },
      { type: 'p', text: '不仅你要对她好，更要引导她为你投资（时间、精力、情感）。她为你付出得越多，她离开你的成本就越高。' },
      { type: 'tip', text: '停止无底线的讨好！学会偶尔“拒绝”她不合理的要求，建立你自己的框架和底线，反而会赢得她的尊重与好奇。' }
    ]
  },
  { 
    id: 4, 
    title: '女生说“随便”，到底是什么意思？', 
    desc: '别真的随便，那是送命题', 
    views: '9.8w', 
    author: '苏苏导师', 
    date: '2023-11-01', 
    content: [
      { type: 'p', text: '当女生说“随便”的时候，她其实是在说：“请展示你的带领能力，给我一个满意的方案。”' },
      { type: 'tip', text: '破解之法：直接给出A/B选项（如“我们去吃日料还是火锅？”），或者强势带领（“我知道一家超棒的私房菜，跟我走就行”）。' }
    ]
  },
  { 
    id: 5, 
    title: '查户口式聊天的3大急救话术', 
    desc: '把面试变成暧昧', 
    views: '15.2w', 
    author: '陈先生', 
    date: '2023-11-05', 
    content: [
      { type: 'p', text: '不知不觉把天聊死了？因为你总是在索取信息，而不是提供情绪价值。' },
      { type: 'tip', text: '转变思路：用“状态+感受”代替“提问”。例如不要问“在干嘛”，改成“刚看了一部超搞笑的电影，笑得肚子疼，你今天过得咋样？”' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [homeSearchInput, setHomeSearchInput] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([1, 4]); 
  
  // 2级功能状态
  const [toastMsg, setToastMsg] = useState('');
  const [showVipModal, setShowVipModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeServicePage, setActiveServicePage] = useState(null);
  const [repliesDrawerScript, setRepliesDrawerScript] = useState(null);
  const [discoverSort, setDiscoverSort] = useState('default');
  const [activeFilterTag, setActiveFilterTag] = useState('全部');
  
  // 收藏页专属状态
  const [favFilter, setFavFilter] = useState('全部');
  const [isEditFav, setIsEditFav] = useState(false);
  const [checkedFavs, setCheckedFavs] = useState([]);
  const [isFavSearchVisible, setIsFavSearchVisible] = useState(false);
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const [favNotes, setFavNotes] = useState({ 1: '七夕准备用这句' }); // 模拟备注数据
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  // 话术库(发现页)状态
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const hotSearches = ['早安怎么回', '惹女人生气了', '怎么要微信', '被拒绝怎么化解', '睡前撩人情话', '不知道聊什么'];

  // 课程详情 & 文章详情状态
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [courseTab, setCourseTab] = useState('outline'); // 'outline' | 'intro'
  const [activeArticle, setActiveArticle] = useState(null); // 当前正在阅读的避坑指南文章

  // 贡献话术状态
  const [contributeCategory, setContributeCategory] = useState(1);

  // AI 聊天状态
  const [chatInput, setChatInput] = useState('');
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
    if (activeTab === 'ai' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiTyping, activeTab]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleCopy = (id, text) => {
    const fallbackCopyTextToClipboard = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    };

    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
    } else {
      navigator.clipboard.writeText(text).catch(err => {
        fallbackCopyTextToClipboard(text);
      });
    }

    setCopiedId(id);
    showToast('已复制到剪贴板');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (id) => {
    setFavoriteIds(prev => {
      const isFav = prev.includes(id);
      showToast(isFav ? '已取消收藏' : '收藏成功');
      return isFav ? prev.filter(fId => fId !== id) : [...prev, id];
    });
  };

  const executeSearch = (query) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setActiveTab('discover');
    setActiveCategory(null);
    setActiveFilterTag('全部');
    setIsSearchFocused(false);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
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

  const handleBatchDelete = () => {
    if(checkedFavs.length === 0) return setIsEditFav(false);
    setFavoriteIds(prev => prev.filter(id => !checkedFavs.includes(id)));
    setCheckedFavs([]);
    setIsEditFav(false);
    showToast(`已删除 ${checkedFavs.length} 条收藏`);
  };

  // 打开文章页
  const handleOpenArticle = (article) => {
    setActiveArticle(article);
    setActiveServicePage('article');
  };

  // 保存备注
  const handleSaveNote = () => {
    if (editingNoteId) {
      setFavNotes(prev => ({ ...prev, [editingNoteId]: tempNoteContent }));
      showToast('备注已保存');
      setEditingNoteId(null);
    }
  };

  // --- 渲染方法 ---
  const renderHome = () => (
    <div className="h-full overflow-y-auto pb-24 scrollbar-hide bg-[#F5F7FA]">
      <div className="bg-white px-5 pt-8 pb-5 rounded-b-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative animate-fade-in-up">
        <div className="flex justify-between items-center mb-5 pr-20">
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-800 tracking-tight flex items-center">
              恋爱话术库
              <span onClick={() => setShowVipModal(true)} className="ml-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] px-2 py-0.5 rounded-full font-normal shadow-sm animate-pulse-slow cursor-pointer">Pro</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">今天想撩谁？一句顶一万句</p>
          </div>
          <div onClick={() => showToast('暂无新通知')} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
            <Bell size={18} />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-gray-400 group-focus-within:text-pink-500 transition-colors" /></div>
          <input
            type="text" value={homeSearchInput} onChange={(e) => setHomeSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeSearch(homeSearchInput)}
            className="block w-full pl-11 pr-20 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm placeholder-gray-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none"
            placeholder="搜一下：女生说“早安”怎么回"
          />
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <button onClick={() => executeSearch(homeSearchInput)} className="bg-gray-900 hover:bg-black text-white text-xs px-4 py-2 rounded-xl shadow-md font-medium active:scale-95 transition-all">搜索</button>
          </div>
        </div>

        {/* 热门搜索词标签 */}
        <ScrollableRow className="flex items-center mt-4 space-x-2 pb-1">
          <span className="text-[11px] font-bold text-gray-700 shrink-0 flex items-center"><TrendingUp size={14} className="mr-1 text-red-500" /> 猜你想搜</span>
          {['相亲怎么聊', '被拒绝', '生日祝福', '惹她生气'].map((tag, idx) => (
             <span key={idx} onClick={() => executeSearch(tag)} className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm hover:bg-pink-50 hover:text-pink-500 transition-colors">{tag}</span>
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
          { icon: <MessageSquare size={20} className="text-blue-500" />, label: '约会没话', catId: 1 },
          { icon: <Heart size={20} className="text-pink-500" />, label: '惹生气了', catId: 4 },
          { icon: <Zap size={20} className="text-orange-500" />, label: '神级破冰', catId: 1 },
          { icon: <Sparkles size={20} className="text-purple-500" />, label: '睡前晚安', catId: 5 }
        ].map((item, idx) => (
          <div key={idx} onClick={() => { setActiveTab('discover'); setActiveCategory(item.catId); setSearchQuery(''); }} className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform">
            <div className="bg-gray-50 p-2 rounded-full mb-1.5">{item.icon}</div>
            <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 每日灵感 & 签到 */}
      <div className="px-4 mt-5 animate-fade-in-up delay-150">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-4 text-white shadow-md shadow-purple-200/50 flex justify-between items-center relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
           <div className="relative z-10 flex-1 pr-4">
              <div className="flex items-center text-[10px] bg-white/20 w-max px-2 py-0.5 rounded-md backdrop-blur-sm mb-2 border border-white/20 font-medium">
                 <Calendar size={12} className="mr-1"/> 每日灵感 · 今日
              </div>
              <p className="text-[13px] font-medium leading-relaxed italic tracking-wide">"真正的吸引不是刻意讨好，而是展示你独特的生活态度。"</p>
           </div>
           <div className="flex flex-col items-center relative z-10 shrink-0">
             <button onClick={() => showToast('签到成功，获得 10 积分！')} className="bg-white text-purple-600 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform flex items-center justify-center">
                <CheckCircle2 size={12} className="mr-1"/> 签到领积分
             </button>
             <span className="text-[9px] text-purple-100 mt-1.5 opacity-80">已连续签到 3 天</span>
           </div>
           <Quote size={60} className="absolute -right-2 -top-2 text-white/10 rotate-12" />
        </div>
      </div>

      {/* 新人限时特惠卡片 (高转化位) */}
      <div className="px-4 mt-4 animate-fade-in-up delay-[180ms]">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-[1.25rem] p-4 text-white shadow-md shadow-red-200/50 flex justify-between items-center relative overflow-hidden cursor-pointer active:scale-95 transition-transform" onClick={() => setShowVipModal(true)}>
           <div className="absolute -left-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
           <div className="relative z-10 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                 <span className="font-bold text-[15px] tracking-wide">新人限时特惠</span>
                 <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] flex items-center backdrop-blur-sm border border-white/20"><Timer size={10} className="mr-1 animate-pulse"/> 距结束 02:14:59</span>
              </div>
              <p className="text-[11px] text-white/90 font-medium">终身 Pro 会员仅需 ¥98，立省 ¥201</p>
           </div>
           <div className="relative z-10 bg-white text-red-500 font-extrabold px-4 py-2 rounded-full text-xs shadow-sm flex-shrink-0 ml-2">
              立即抢购
           </div>
        </div>
      </div>

      {/* AI 恋爱神器 (快捷工具入口) */}
      <div className="mt-6 animate-fade-in-up delay-200">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px] flex items-center"><Sparkles size={18} className="text-purple-500 mr-1.5" /> AI 恋爱神器</h3>
          <span className="text-[11px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">无限畅聊</span>
        </div>
        <div className="px-4 grid grid-cols-2 gap-3">
           {[
             { title: '朋友圈文案', desc: '高级感拉满', icon: <Edit3 size={16} className="text-blue-500" />, bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100', query: '帮我写一段发朋友圈的文案，展现我积极阳光的生活状态，带点幽默感' },
             { title: '高情商道歉', desc: '秒变乖狗狗', icon: <Smile size={16} className="text-orange-500" />, bg: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-100', query: '我惹女朋友生气了，帮我写一段真诚又带点幽默的高情商道歉话术' },
             { title: '土味情话', desc: '撩到她脸红', icon: <Heart size={16} className="text-pink-500" />, bg: 'bg-pink-50/50', border: 'border-pink-100', text: 'text-pink-700', iconBg: 'bg-pink-100', query: '给我来5句土味情话，越土越好' },
             { title: '冷场急救', desc: '破解尴尬', icon: <Zap size={16} className="text-yellow-500" />, bg: 'bg-yellow-50/50', border: 'border-yellow-100', text: 'text-yellow-700', iconBg: 'bg-yellow-100', query: '现在聊天冷场了，不知道说什么，给我提供几个有趣的话题破冰' }
           ].map((tool, idx) => (
             <div key={idx} onClick={() => { setActiveTab('ai'); setChatInput(tool.query); }} className={`${tool.bg} border ${tool.border} p-3 rounded-2xl flex items-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm`}>
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

      {/* 课程详情 Banner */}
      <div className="px-4 mt-6 animate-fade-in-up delay-[250ms]">
        <div onClick={() => setActiveServicePage('course')} className="relative h-[160px] rounded-[1.5rem] overflow-hidden shadow-lg shadow-pink-200/40 group bg-gradient-to-br from-purple-500 to-pink-500 cursor-pointer">
          <img src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=800&auto=format&fit=crop" alt="Banner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-overlay" onError={(e) => e.target.style.display = 'none'} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
          <div className="absolute inset-0 p-5 flex flex-col justify-end">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">必修课</span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md flex items-center border border-white/10"><Sparkles size={10} className="mr-1 text-yellow-300" /> 今日精选</span>
            </div>
            <h2 className="text-white font-bold text-[19px] mb-1 drop-shadow-md">高段位暧昧推拉术</h2>
            <div className="flex justify-between items-center">
              <p className="text-gray-200 text-xs opacity-90">教你打破友谊区，瞬间升温</p>
              <button className="flex items-center text-[10px] font-bold text-gray-900 bg-white rounded-full px-3 py-1.5 shadow-sm group-hover:bg-pink-50 transition-colors">立即学习 <PlayCircle size={12} className="ml-1" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 实战场景大分类栏 */}
      <div className="mt-6 animate-fade-in-up delay-300">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px]">实战场景</h3>
          <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-pink-500 transition-colors" onClick={() => { setActiveTab('discover'); setActiveCategory(1); setSearchQuery(''); }}>全部 <ChevronRight size={14} /></span>
        </div>
        <ScrollableRow className="flex px-5 pb-4 space-x-3.5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center flex-shrink-0 group" onClick={() => { setActiveTab('discover'); setActiveCategory(cat.id); setSearchQuery(''); }}>
              <div className={`w-[56px] h-[56px] rounded-[1rem] bg-gradient-to-br ${cat.color} text-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all transform group-active:scale-95 border border-white/50 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-5 h-5 bg-white/20 rounded-bl-full"></div>{cat.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-700 mt-2">{cat.name}</span>
            </div>
          ))}
        </ScrollableRow>
      </div>

      {/* 每日情商挑战 (互动模块) */}
      <div className="px-4 mt-3 animate-fade-in-up delay-[320ms]">
        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-blue-50 text-blue-500 text-[10px] px-3 py-1.5 rounded-bl-2xl font-bold flex items-center"><Target size={12} className="mr-1"/> 每日一测</div>
           <h3 className="font-bold text-gray-800 text-[15px] mb-2 flex items-center">情商挑战：送命题怎么回？</h3>
           <p className="text-[13px] text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100/50">女生突然对你说：“我好像发烧到39度了，好难受...” 你该怎么回？</p>
           <div className="space-y-2.5">
             <button onClick={()=>showToast('太直男了！扣10分！正确做法请看解析')} className="w-full bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 p-3.5 rounded-xl text-left text-[13px] text-gray-700 transition-colors flex justify-between items-center group shadow-sm">
               <span>A. “多喝热水，吃药了吗？快去休息吧。”</span>
               <X size={16} className="hidden group-hover:block text-red-500" />
             </button>
             <button onClick={()=>showToast('高情商！加10分！')} className="w-full bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200 border border-gray-200 p-3.5 rounded-xl text-left text-[13px] text-gray-700 transition-colors flex justify-between items-center group shadow-sm">
               <span>B. “开门，我在楼下带了药和粥。”</span>
               <CheckCircle2 size={16} className="hidden group-hover:block text-green-500" />
             </button>
           </div>
           <div className="mt-4 pt-3 border-t border-gray-50 text-center">
             <span className="text-pink-500 text-[11px] font-bold cursor-pointer hover:underline flex items-center justify-center" onClick={()=> {setActiveTab('ai'); setChatInput('女生说她发烧到39度了，除了说多喝热水，我该怎么高情商回复并表现出关心？');}}>
               让 AI 导师给出更多满分回答 <ChevronRight size={14} className="ml-0.5" />
             </span>
           </div>
        </div>
      </div>

      {/* 金牌导师 1v1 推荐列表 */}
      <div className="mt-6 animate-fade-in-up delay-[350ms]">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px] flex items-center"><UserCheck size={18} className="text-indigo-500 mr-1.5" /> 金牌导师 1V1</h3>
          <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-pink-500" onClick={() => setActiveServicePage('support')}>查看全部 <ChevronRight size={14} /></span>
        </div>
        <ScrollableRow className="flex px-5 pb-4 space-x-3.5">
          {[
            { name: '苏苏导师', tag: '挽回前任', rate: '99%', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
            { name: '陈先生', tag: '关系破冰', rate: '98%', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' },
            { name: '林夕导师', tag: '长期关系', rate: '99%', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop' }
          ].map((tutor, idx) => (
            <div key={idx} className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm min-w-[120px] flex flex-col items-center flex-shrink-0 relative">
              <span className="absolute top-2 right-2 bg-green-50 text-green-600 border border-green-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10 flex items-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>在线</span>
              <div className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-sm border-2 border-indigo-50 relative mt-2">
                 <img src={tutor.avatar} className="w-full h-full object-cover" alt={tutor.name} />
              </div>
              <h4 className="font-bold text-[13px] text-gray-800">{tutor.name}</h4>
              <p className="text-[10px] text-gray-500 mt-1 mb-3 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{tutor.tag}</p>
              <button onClick={() => setActiveServicePage('support')} className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[11px] font-bold py-2 rounded-xl active:scale-95 transition-all">立即咨询</button>
            </div>
          ))}
        </ScrollableRow>
      </div>

      {/* 恋爱避坑指南 */}
      <div className="mt-4 animate-fade-in-up delay-[400ms]">
        <div className="flex justify-between items-center px-5 mb-3">
          <h3 className="font-bold text-gray-800 text-[17px] flex items-center"><AlertTriangle size={18} className="text-red-500 mr-1.5" /> 恋爱避坑指南</h3>
          <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-pink-500" onClick={() => setActiveServicePage('all-pitfalls')}>更多避坑 <ChevronRight size={14} /></span>
        </div>
        <ScrollableRow className="flex px-5 pb-4 space-x-3.5">
          {pitfallsData.slice(0, 3).map((item, idx) => (
            <div key={idx} onClick={() => handleOpenArticle(item)} className="bg-white border border-gray-100 p-3.5 rounded-2xl shadow-sm min-w-[150px] flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2.5">
                <AlertTriangle size={14} />
              </div>
              <h4 className="font-bold text-[13px] text-gray-800 mb-1">{item.desc}</h4>
              <p className="text-[10px] text-gray-500 line-clamp-1 mb-2.5">{item.title}</p>
              <div className="text-[9px] text-gray-400 flex items-center"><Flame size={10} className="mr-1 text-gray-300"/> {item.views} 浏览</div>
            </div>
          ))}
        </ScrollableRow>
      </div>

      <div className="px-4 mt-2 pb-6 animate-fade-in-up delay-500">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800 text-[17px]">高分回复榜</h3>
          <span className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-md font-bold flex items-center border border-red-100"><Flame size={12} className="mr-1 fill-current" /> 全网热搜</span>
        </div>
        <div className="space-y-3.5">
          {[...allScripts].sort((a,b)=>b.likes-a.likes).slice(0, 3).map((script) => (
            <ScriptCard key={script.id} script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderDiscover = () => {
    let filteredScripts = allScripts;
    if (searchQuery) {
      filteredScripts = allScripts.filter(s => s.question.includes(searchQuery) || s.answers.some(a => a.includes(searchQuery)));
    } else if (activeCategory) {
      filteredScripts = allScripts.filter(s => s.categoryId === activeCategory);
    }
    
    // 二级标签过滤
    if (activeFilterTag !== '全部') {
      filteredScripts = filteredScripts.filter(s => s.type.includes(activeFilterTag));
    }

    if (discoverSort === 'new') filteredScripts.sort((a,b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1);
    if (discoverSort === 'hot') filteredScripts.sort((a,b) => b.likes - a.likes);

    const currentCat = categories.find(c => c.id === activeCategory);

    return (
      <div className="h-full flex flex-col bg-white animate-in fade-in slide-in-from-right-4 duration-300 relative">
        <div className="bg-white px-5 pt-8 pb-3 z-30 shadow-sm relative flex items-center border-b border-gray-100">
          <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className={`transition-colors ${isSearchFocused ? 'text-pink-500' : 'text-gray-400'}`} /></div>
             <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                placeholder="搜索库内话术..."
                className={`w-full bg-gray-100/80 rounded-full py-2 pl-9 pr-8 text-[13px] outline-none transition-all ${isSearchFocused ? 'bg-pink-50/50 border border-pink-200' : 'border border-transparent focus:border-pink-300'}`}
             />
             {searchQuery && <X size={14} className="absolute inset-y-0 right-3 top-2.5 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setSearchQuery('')} />}
          </div>
        </div>

        {/* 搜索展开层 (Hot Searches) */}
        {isSearchFocused && !searchQuery && (
          <>
            <div className="absolute inset-0 bg-black/20 z-20 top-[68px] animate-in fade-in duration-200"></div>
            <div className="absolute top-[68px] left-0 right-0 bg-white z-30 p-5 shadow-lg border-b border-gray-100 rounded-b-3xl animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm">全网热搜</h3>
                <RefreshCw size={14} className="text-gray-400 cursor-pointer hover:text-pink-500 transition-transform active:rotate-180 duration-300" onClick={() => showToast('已刷新热搜词')} />
              </div>
              <div className="flex flex-wrap gap-2.5">
                {hotSearches.map((hot, idx) => (
                  <span 
                    key={idx} 
                    onClick={() => { setSearchQuery(hot); setIsSearchFocused(false); }} 
                    className={`text-xs px-3.5 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm ${idx < 2 ? 'text-pink-600 bg-pink-50 font-medium border border-pink-100' : 'text-gray-600 bg-gray-50 border border-gray-100 hover:bg-gray-100'}`}
                  >
                    {idx < 2 && <Flame size={12} className="inline mr-1 text-red-500" />}
                    {hot}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-1 overflow-hidden bg-gray-50 relative z-10">
          <div className="w-[85px] bg-white overflow-y-auto scrollbar-hide pb-24 border-r border-gray-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
            {categories.map(cat => (
              <div key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); setDiscoverSort('default'); setActiveFilterTag('全部'); }} className={`py-4 flex flex-col items-center justify-center relative transition-colors cursor-pointer ${activeCategory === cat.id && !searchQuery ? 'bg-gray-50/80' : 'hover:bg-gray-50/50'}`}>
                {activeCategory === cat.id && !searchQuery && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-pink-500 rounded-r-md"></div>}
                <div className="relative"><span className={`text-[22px] mb-1 block transition-transform transform ${activeCategory === cat.id && !searchQuery ? 'scale-110' : ''}`}>{cat.icon}</span></div>
                <span className={`text-[11px] mt-1 ${activeCategory === cat.id && !searchQuery ? 'text-pink-600 font-bold' : 'text-gray-500 font-medium'}`}>{cat.name}</span>
                <span className="text-[9px] text-gray-400 mt-0.5 scale-90">{cat.count} 篇</span>
              </div>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pb-24 bg-[#F8F9FA] relative">
            <div className="animate-fade-in-up">
              <div className="sticky top-0 bg-[#F8F9FA]/90 backdrop-blur-md z-10 pb-2 pt-1 mb-2 border-b border-gray-200/50">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    {searchQuery ? `包含 "${searchQuery}"` : currentCat?.name} 
                    <span className="ml-2 text-xs font-normal bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{filteredScripts.length} 条</span>
                  </h3>
                </div>
              </div>

              {!searchQuery && (
                <>
                  {/* 精选专题 Banner */}
                  <div className="mb-4 bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 text-white shadow-md shadow-pink-200 relative overflow-hidden flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveServicePage('topic')}>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-600/30 rounded-full blur-lg"></div>
                    <div className="relative z-10">
                      <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm mb-1.5 flex items-center w-max border border-white/20"><Compass size={12} className="mr-1"/> 必看专题</span>
                      <h4 className="font-bold text-[15px] mb-0.5">七夕特辑：高分表白话术</h4>
                      <p className="text-[11px] text-white/90 flex items-center"><TrendingUp size={12} className="mr-1"/> 收录 50+ 句直击灵魂的告白</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center relative z-10 border border-white/30">
                      <ChevronRight size={16} className="text-white" />
                    </div>
                  </div>

                  {/* 二级标签过滤 */}
                  <ScrollableRow className="flex items-center space-x-2 mb-4 pb-1">
                    {['全部', '高情商', '幽默', '暖心', '化解', '开场白'].map(tag => (
                      <span 
                        key={tag} 
                        onClick={() => setActiveFilterTag(tag)} 
                        className={`text-[11px] px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer shadow-sm ${activeFilterTag === tag ? 'bg-pink-100 text-pink-600 font-bold border border-pink-200' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </ScrollableRow>

                  {/* 排序方式栏 */}
                  <ScrollableRow className="flex items-center space-x-2 mb-4 pb-1">
                    <span onClick={() => setDiscoverSort('default')} className={`text-[11px] px-3 py-1.5 rounded-full font-bold whitespace-nowrap shadow-sm cursor-pointer transition-colors ${discoverSort === 'default' ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-white text-gray-600 border border-gray-100'}`}>综合排序</span>
                    <span onClick={() => setDiscoverSort('new')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm font-medium cursor-pointer transition-colors ${discoverSort === 'new' ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-white text-gray-600 border border-gray-100'}`}>最新添加</span>
                    <span onClick={() => setDiscoverSort('hot')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm font-medium cursor-pointer transition-colors ${discoverSort === 'hot' ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-white text-gray-600 border border-gray-100'}`}>高赞最多</span>
                  </ScrollableRow>
                </>
              )}

              {filteredScripts.length > 0 ? (
                <div className="space-y-3">
                  {filteredScripts.map(script => (
                    <ScriptCard key={script.id} script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} simple={false} />
                  ))}
                  <div className="text-center text-xs text-gray-400 mt-6 pb-4">- 到底啦，快去实战吧 -</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 opacity-80">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4"><MessageCircle size={32} className="text-gray-400" /></div>
                  <p className="text-sm text-gray-600 font-bold mb-1">未找到匹配的话术</p>
                  <p className="text-xs text-gray-400 mb-6 text-center px-4">你可以尝试更换搜索词，或者直接让 AI 导师为你定制专属回复</p>
                  <div className="flex space-x-3 w-full px-6">
                    <button className="flex-1 text-xs bg-white border border-gray-200 py-2.5 rounded-xl text-gray-600 shadow-sm font-medium" onClick={() => setSearchQuery('')}>清除搜索</button>
                    <button className="flex-1 text-xs bg-pink-500 text-white py-2.5 rounded-xl shadow-md shadow-pink-200 font-bold flex items-center justify-center" onClick={() => { setActiveTab('ai'); setChatInput(searchQuery); }}>
                      <Sparkles size={14} className="mr-1" /> 问 AI 导师
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 悬浮贡献按钮 (UGC入口) */}
          <div 
            className="absolute bottom-24 right-4 bg-gray-900 text-white rounded-full shadow-lg shadow-gray-400/50 flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-40 group px-3.5 py-2.5 space-x-1.5"
            onClick={() => setActiveServicePage('contribute')}
          >
            <Edit3 size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] font-bold">贡献话术</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAI = () => (
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
                  {msg.suggestions.map((sug, idx) => (
                    <div key={idx} className={`bg-${sug.color}-50/50 p-3.5 rounded-xl border border-${sug.color}-100 relative group`}>
                      <span className={`absolute -top-2.5 left-3 bg-${sug.color}-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm`}>{sug.label}</span>
                      <p className="mt-2 text-[14px] text-gray-800 leading-relaxed">{sug.text}</p>
                      <div className="flex justify-end mt-2">
                        <button onClick={() => handleCopy(msg.id + idx, sug.text)} className={`text-[11px] flex items-center text-${sug.color}-600 font-bold bg-${sug.color}-100/50 px-2 py-1 rounded-md hover:bg-${sug.color}-200 transition-colors`}>
                           {copiedId === msg.id + idx ? <CheckCircle2 size={12} className="mr-1 text-green-500"/> : <Copy size={12} className="mr-1" />} 复制
                        </button>
                      </div>
                    </div>
                  ))}
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
            <span key={idx} onClick={() => setChatInput(chip)} className="bg-white text-gray-600 text-[12px] px-3 py-1.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap cursor-pointer active:bg-pink-50 active:text-pink-500 transition-colors">{chip}</span>
          ))}
        </ScrollableRow>
        <div className="border-t border-gray-200/80 p-3 px-4 bg-[#F4F5F7]">
          <div className="flex items-center space-x-3">
            <Mic size={26} className="text-gray-600 shrink-0 cursor-pointer hover:text-black" onClick={() => showToast('暂未获取麦克风权限')} />
            <div className="flex-1 bg-white border border-gray-200 rounded-full flex items-center px-3 py-1.5 focus-within:border-pink-300 transition-colors shadow-sm">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder="粘贴对方说的话..." className="flex-1 bg-transparent text-[15px] outline-none py-1 px-1"/>
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

  const renderFavorites = () => {
    // 收藏页过滤逻辑：ID过滤 + 标签过滤 + 关键词搜索
    let myFavs = allScripts.filter(s => favoriteIds.includes(s.id));
    if (favFilter !== '全部') {
       myFavs = myFavs.filter(s => s.type.includes(favFilter) || s.type === favFilter);
    }
    if (favSearchQuery) {
       myFavs = myFavs.filter(s => s.question.includes(favSearchQuery) || s.answers.some(a => a.includes(favSearchQuery)));
    }

    const toggleFavCheck = (id) => setCheckedFavs(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);

    return (
      <div className="h-full flex flex-col bg-[#F5F7FA] animate-in fade-in slide-in-from-right-4 duration-300 relative">
        {/* 顶部标题栏 */}
        <div className="bg-white px-5 pt-8 pb-3 z-10 shadow-sm relative flex items-center justify-between">
           <div className="w-8"></div>
           <h1 className="text-lg font-bold text-gray-800 text-center">我的收藏</h1>
           <div className="flex space-x-3 text-gray-600">
             <Search size={20} className="cursor-pointer hover:text-pink-500" onClick={() => setIsFavSearchVisible(!isFavSearchVisible)} />
             <FileDown size={20} className="cursor-pointer hover:text-blue-500" onClick={() => showToast('已将收藏导出至本地')} />
           </div>
        </div>

        {/* 收藏内搜索框展开 */}
        {isFavSearchVisible && (
          <div className="bg-white px-5 py-3 border-b border-gray-100 animate-in slide-in-from-top-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={14} className="text-gray-400" /></div>
              <input 
                type="text" 
                value={favSearchQuery} 
                onChange={(e) => setFavSearchQuery(e.target.value)} 
                placeholder="在收藏中搜索..."
                className="w-full bg-gray-100/80 rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border focus:border-pink-300 transition-all"
              />
              {favSearchQuery && <X size={14} className="absolute inset-y-0 right-3 top-2 text-gray-400 cursor-pointer" onClick={() => setFavSearchQuery('')} />}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
          {/* 模拟文件夹/标签切换 */}
          <ScrollableRow className="flex space-x-2 mb-4 pb-1">
            <span onClick={() => setFavFilter('全部')} className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '全部' ? 'bg-gray-800 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}>全部</span>
            <span onClick={() => setFavFilter('高情商')} className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '高情商' ? 'bg-pink-500 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}><FolderHeart size={12} className="mr-1"/> 重点备用</span>
            <span onClick={() => setFavFilter('幽默')} className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '幽默' ? 'bg-blue-500 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}><FolderHeart size={12} className="mr-1"/> 幽默特辑</span>
            <span onClick={() => showToast('新建文件夹功能开发中')} className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors bg-gray-50 text-gray-500 border border-dashed border-gray-300 flex items-center"><PlusCircle size={12} className="mr-1"/> 新建</span>
          </ScrollableRow>

          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-xs text-gray-500 font-medium">共找到 <span className="text-pink-500 font-bold">{myFavs.length}</span> 条内容</span>
            {myFavs.length > 0 && (
              <span onClick={() => { setIsEditFav(!isEditFav); setCheckedFavs([]); }} className={`text-[11px] bg-white shadow-sm border px-3 py-1 rounded-full cursor-pointer transition-colors ${isEditFav ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                {isEditFav ? '取消管理' : '批量管理'}
              </span>
            )}
          </div>

          {myFavs.length > 0 ? (
            <div className="space-y-4 animate-fade-in-up">
              {myFavs.map(script => (
                <div key={script.id} className="relative flex items-start">
                  {isEditFav && (
                    <div className="mr-3 mt-4 animate-in fade-in slide-in-from-left-2" onClick={() => toggleFavCheck(script.id)}>
                      {checkedFavs.includes(script.id) ? <CheckSquare className="text-pink-500" /> : <Square className="text-gray-300" />}
                    </div>
                  )}
                  <div className={`flex-1 transition-all ${isEditFav ? 'opacity-80 pointer-events-none' : ''}`}>
                    <div className="relative z-10">
                      <ScriptCard script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={true} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} />
                    </div>
                    {/* 个人备注区域 (吸附在卡片底部) */}
                    <div className="bg-yellow-50/80 border border-yellow-200/60 rounded-b-[1rem] px-4 py-2.5 -mt-3 pt-5 flex justify-between items-start relative z-0">
                       <div className="flex-1 text-[11px] text-yellow-800/80 leading-relaxed pr-2">
                         <span className="font-bold flex items-center mb-0.5"><Edit2 size={10} className="mr-1"/> 个人备注：</span>
                         {favNotes[script.id] ? favNotes[script.id] : <span className="text-yellow-600/50 italic">点击右侧添加备注，方便实战使用...</span>}
                       </div>
                       <button onClick={() => { setEditingNoteId(script.id); setTempNoteContent(favNotes[script.id] || ''); }} className="text-[10px] bg-white border border-yellow-200 text-yellow-700 px-2 py-1 rounded shadow-sm shrink-0 hover:bg-yellow-100 transition-colors">
                         {favNotes[script.id] ? '修改' : '添加'}
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <Heart size={48} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">没找到相关的收藏内容呢</p>
                <button className="mt-4 bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full shadow-sm" onClick={() => { setFavSearchQuery(''); setFavFilter('全部'); }}>清除条件</button>
             </div>
          )}
        </div>

        {/* 批量编辑底栏 */}
        {isEditFav && (
          <div className="absolute bottom-20 w-full bg-white border-t border-gray-100 p-3 px-5 z-40 flex justify-between items-center animate-in slide-in-from-bottom-5">
             <div className="flex items-center text-sm text-gray-600 cursor-pointer" onClick={() => setCheckedFavs(checkedFavs.length === myFavs.length ? [] : myFavs.map(m=>m.id))}>
                {checkedFavs.length === myFavs.length ? <CheckSquare className="text-pink-500 mr-2" /> : <Square className="text-gray-300 mr-2" />} 全选
             </div>
             <button onClick={handleBatchDelete} className={`flex items-center text-sm px-5 py-2 rounded-full font-bold shadow-md transition-all ${checkedFavs.length > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
               <Trash2 size={16} className="mr-1" /> 删除 {checkedFavs.length > 0 ? `(${checkedFavs.length})` : ''}
             </button>
          </div>
        )}

        {/* 编辑备注弹窗 */}
        {editingNoteId !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingNoteId(null)}></div>
             <div className="bg-white w-[85%] rounded-[1.5rem] p-5 relative z-10 animate-in zoom-in-95 duration-200 shadow-xl">
                <h3 className="font-bold text-gray-800 text-[15px] mb-3 flex items-center"><Edit2 size={16} className="mr-1.5 text-pink-500"/> 编辑话术备注</h3>
                <textarea 
                  autoFocus
                  value={tempNoteContent} 
                  onChange={(e) => setTempNoteContent(e.target.value)}
                  placeholder="例如：准备在跨年夜用这句表白..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-pink-300 focus:bg-white transition-all resize-none shadow-inner"
                  rows={4}
                />
                <div className="flex space-x-3 mt-4">
                  <button onClick={() => setEditingNoteId(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl active:bg-gray-200 transition-colors text-sm">取消</button>
                  <button onClick={handleSaveNote} className="flex-1 bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-pink-200 active:scale-95 transition-transform text-sm">保存备注</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="h-full flex flex-col bg-[#F5F7FA] animate-in fade-in duration-300">
      {/* 顶部个人资料区 */}
      <div className="bg-gradient-to-b from-pink-100/80 to-[#F5F7FA] px-5 pt-10 pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-[68px] h-[68px] bg-white p-1 rounded-full shadow-md">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" className="w-full h-full rounded-full object-cover" alt="User" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">微信用户</h2>
              <p className="text-[11px] text-gray-500 mt-1.5 flex items-center bg-white/60 w-max px-2.5 py-0.5 rounded-full border border-white/40 shadow-sm">
                ID: 8848123 <Copy size={10} className="ml-1 cursor-pointer" onClick={() => handleCopy(null, '8848123')} />
              </p>
            </div>
          </div>
          <div onClick={() => setShowSettings(true)} className="text-gray-600 cursor-pointer bg-white/50 p-2 rounded-full shadow-sm backdrop-blur-sm hover:text-pink-500 transition-colors"><Settings size={20} /></div>
        </div>
        
        {/* 数据面板 */}
        <div className="flex justify-around bg-white rounded-[1.25rem] p-4 shadow-sm mt-5 mb-1 border border-white/50">
          <div className="text-center flex flex-col items-center">
            <div className="font-extrabold text-[20px] text-gray-800">12<span className="text-[10px] text-gray-400 font-normal ml-0.5">天</span></div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium">累计学习</div>
          </div>
          <div className="w-px h-8 bg-gray-100 mt-1"></div>
          <div className="text-center flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('favorites')}>
            <div className="font-extrabold text-[20px] text-gray-800">{favoriteIds.length}<span className="text-[10px] text-gray-400 font-normal ml-0.5">条</span></div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium">我的收藏</div>
          </div>
          <div className="w-px h-8 bg-gray-100 mt-1"></div>
          <div className="text-center flex flex-col items-center" onClick={() => showToast('学习更多话术提升段位！')}>
            <div className="font-extrabold text-[18px] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 flex items-center mt-0.5 cursor-pointer">嘴强王者</div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">当前段位</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto scrollbar-hide pb-24">
        
        {/* 新增：资产与任务双卡片 */}
        <div className="flex space-x-3 mb-4 mt-2">
           <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm border border-orange-100 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveServicePage('tasks')}>
              <div>
                 <p className="text-[11px] text-orange-600 font-medium mb-0.5">我的积分</p>
                 <p className="text-lg font-extrabold text-orange-700 tracking-tight">350</p>
              </div>
              <div className="w-8 h-8 bg-orange-200/60 rounded-full flex items-center justify-center text-orange-600 shadow-sm"><Zap size={16}/></div>
           </div>
           <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm border border-blue-100 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveServicePage('tasks')}>
              <div>
                 <p className="text-[11px] text-blue-600 font-medium mb-1">每日任务</p>
                 <p className="text-[13px] font-bold text-blue-700 flex items-center">去完成 <ChevronRight size={14} className="ml-0.5"/></p>
              </div>
              <div className="w-8 h-8 bg-blue-200/60 rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Target size={16}/></div>
           </div>
        </div>

        {/* VIP 横幅 */}
        <div onClick={() => setShowVipModal(true)} className="mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[1.25rem] p-4 shadow-lg shadow-gray-400/20 relative overflow-hidden group cursor-pointer border border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-center relative z-10 p-0.5">
            <div className="flex items-center text-yellow-400">
              <Crown size={22} className="mr-2.5 drop-shadow-md" />
              <div className="flex flex-col">
                 <span className="font-bold text-[16px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">解锁终身会员</span>
                 <p className="text-gray-400 text-[10px] mt-0.5 font-medium">10,000+ 话术 & AI 导师无限聊</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-yellow-500/20 pointer-events-none">立即开通</button>
          </div>
        </div>

        {/* 新增：我的内容管理矩阵 */}
        <div className="bg-white rounded-[1.25rem] shadow-sm p-4 mb-4 border border-gray-50">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center"><BookOpen size={16} className="text-indigo-500 mr-1.5" /> 我的内容</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'history', icon: <History size={20} className="text-indigo-500" />, label: '浏览足迹' },
              { id: 'contributions', icon: <Edit3 size={20} className="text-green-500" />, label: '我的贡献' },
              { id: 'ai-history', icon: <MessageSquareText size={20} className="text-purple-500" />, label: 'AI 记录' },
              { id: 'notes', icon: <FileText size={20} className="text-orange-500" />, label: '错题本' }
            ].map((item, i) => (
              <div key={i} onClick={() => setActiveServicePage(item.id)} className="flex flex-col items-center justify-center cursor-pointer active:opacity-70 transition-opacity">
                <div className="bg-gray-50 p-2.5 rounded-full mb-1.5 border border-gray-100/80">{item.icon}</div>
                <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 核心服务矩阵 */}
        <div className="bg-white rounded-[1.25rem] shadow-sm p-4 mb-4 border border-gray-50">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center"><Sparkles size={16} className="text-pink-500 mr-1.5" /> 核心服务</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'assessment', icon: <Heart size={20} className="text-pink-500" />, label: '恋爱评测' },
              { id: 'invite', icon: <Gift size={20} className="text-red-500" />, label: '邀请有礼' },
              { id: 'custom', icon: <PenTool size={20} className="text-blue-500" />, label: '话术定制' },
              { id: 'support', icon: <Headset size={20} className="text-orange-500" />, label: '专属客服' }
            ].map((item, i) => (
              <div key={i} onClick={() => setActiveServicePage(item.id)} className="flex flex-col items-center justify-center cursor-pointer active:opacity-70 transition-opacity">
                <div className="bg-gray-50 p-2.5 rounded-full mb-1.5 border border-gray-100/80">{item.icon}</div>
                <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[1.25rem] shadow-sm p-1 border border-gray-50">
          <ProfileListItem icon={<Award size={18} className="text-yellow-500" />} title="我的特权" subtitle="去查看" onClick={() => setShowVipModal(true)} />
          <ProfileListItem icon={<HelpCircle size={18} className="text-gray-500" />} title="帮助与反馈" border={false} onClick={() => setActiveServicePage('feedback')} />
        </div>
      </div>
    </div>
  );

  const renderVipModal = () => showVipModal ? (
    <div className="absolute inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowVipModal(false)}></div>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-[85%] rounded-[2rem] p-6 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl border border-gray-700">
         <X size={20} className="absolute top-4 right-4 text-gray-400 cursor-pointer" onClick={() => setShowVipModal(false)} />
         <div className="flex justify-center mb-4"><Crown size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" /></div>
         <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 text-center mb-2">解锁恋爱高阶玩法</h2>
         <p className="text-gray-400 text-xs text-center mb-6">开通终身会员，脱单快人一步</p>
         <div className="space-y-3 mb-6">
           {['解锁 10,000+ 专属高情商话术', 'AI 导师无限次畅聊诊断', '专家实战脱单课程免费看'].map((privilege, i) => (
              <div key={i} className="flex items-center text-sm text-gray-200"><CheckCircle2 size={16} className="text-yellow-500 mr-2 shrink-0" /> {privilege}</div>
           ))}
         </div>
         <div className="bg-gray-800/50 rounded-2xl p-4 border border-yellow-500/30 mb-6 flex justify-between items-center">
           <div><p className="text-yellow-500 font-bold text-lg">终身卡</p><p className="text-gray-400 text-[10px] line-through">原价 ¥299</p></div>
           <div className="text-right"><span className="text-2xl font-extrabold text-white">¥98</span></div>
         </div>
         <button onClick={() => { setShowVipModal(false); showToast('支付接口接入中...'); }} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-extrabold py-3.5 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] active:scale-95 transition-transform">立即开通特权</button>
         <p className="text-center text-[10px] text-gray-500 mt-4">支付即同意《会员服务协议》</p>
      </div>
    </div>
  ) : null;

  const renderSettingsModal = () => showSettings ? (
    <div className="absolute inset-0 z-[60] bg-[#F5F7FA] animate-in slide-in-from-right-full duration-300 flex flex-col">
       <div className="bg-white px-5 pt-8 pb-3 z-10 shadow-sm relative flex items-center justify-between">
          <ChevronLeft size={24} className="text-gray-800 cursor-pointer" onClick={() => setShowSettings(false)} />
          <h1 className="text-lg font-bold text-gray-800">系统设置</h1><div className="w-6"></div>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-1">
             <ProfileListItem icon={<Bell size={18} className="text-blue-500" />} title="消息推送设置" subtitle="已开启" onClick={() => showToast('已进入推送设置')} />
             <ProfileListItem icon={<Trash2 size={18} className="text-gray-500" />} title="清理缓存" subtitle="12.5 MB" border={false} onClick={() => showToast('缓存清理成功')} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-1">
             <ProfileListItem icon={<User size={18} className="text-gray-700" />} title="账号与安全" onClick={() => showToast('账号设置开发中')} />
             <ProfileListItem icon={<ShieldCheck size={18} className="text-green-500" />} title="隐私政策" onClick={() => showToast('即将打开隐私政策')} />
             <ProfileListItem icon={<Info size={18} className="text-gray-400" />} title="关于我们" subtitle="v2.1.0" border={false} onClick={() => showToast('当前已是最新版本')} />
          </div>
          <button className="w-full bg-white text-red-500 font-bold py-3.5 rounded-2xl shadow-sm mt-8 active:bg-gray-50 transition-colors" onClick={() => { setShowSettings(false); showToast('已退出登录'); }}>退出登录</button>
       </div>
    </div>
  ) : null;

  const renderRepliesDrawer = () => repliesDrawerScript ? (
    <>
      <div className="absolute inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={() => setRepliesDrawerScript(null)}></div>
      <div className="absolute bottom-0 w-full bg-[#F5F7FA] rounded-t-[2rem] z-50 animate-in slide-in-from-bottom-full duration-300 max-h-[85%] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
        <div className="w-full flex justify-center py-3"><div className="w-12 h-1.5 bg-gray-300 rounded-full"></div></div>
        <div className="px-5 pb-4 flex justify-between items-center border-b border-gray-200/50">
           <h3 className="font-bold text-gray-800 text-lg">全部高分回复</h3>
           <X size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setRepliesDrawerScript(null)} />
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
           <div className="bg-gray-100/80 p-3.5 rounded-2xl text-sm text-gray-700 font-medium mb-6 flex items-start">
             <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mr-2 mt-0.5 shrink-0">对方说</span>{repliesDrawerScript.question}
           </div>
           {repliesDrawerScript.answers.map((answer, idx) => (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group" key={idx}>
                 <div className="absolute -left-2 -top-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm shadow-pink-200">{idx+1}</div>
                 <p className="text-[14px] text-gray-800 leading-relaxed pt-1 pr-6">{answer}</p>
                 <button onClick={() => handleCopy('drawer-'+idx, answer)} className="mt-3 w-full bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center">
                    {copiedId === 'drawer-'+idx ? <><CheckCircle2 size={14} className="mr-1"/>已复制</> : <><Copy size={14} className="mr-1"/>一键复制</>}
                 </button>
              </div>
           ))}
           <div className="h-8"></div>
        </div>
      </div>
    </>
  ) : null;

  const renderToast = () => toastMsg ? (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
       <div className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg text-sm shadow-xl font-medium animate-in fade-in zoom-in-95 duration-200">{toastMsg}</div>
    </div>
  ) : null;

  const renderServicePages = () => {
    if (!activeServicePage) return null;

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

    // 模拟课程数据
    const courseData = {
      title: '高段位暧昧推拉术',
      tags: ['必修课', '脱单必备'],
      rating: '4.9',
      students: '2.4w',
      desc: '打破友谊区，瞬间升温。本课程将教你如何通过语言的推拉，调动对方情绪，让聊天不再平淡如水，快速建立吸引力。',
      instructor: {
        name: '情感导师 - 苏苏',
        title: '国家二级心理咨询师 · 8年情感实战经验',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
      },
      lessons: [
        { title: '第一节：什么是情感推拉？', duration: '12:45', free: true },
        { title: '第二节：制造情绪过山车的 3 个技巧', duration: '15:20', free: true },
        { title: '第三节：实战演练：从冷淡到热情的破冰', duration: '18:10', free: false },
        { title: '第四节：如何化解对方的废物测试', duration: '14:30', free: false }
      ]
    };

    const handlePlayLesson = (idx) => {
      if (courseData.lessons[idx].free) {
        setActiveLesson(idx);
        isPlaying ? setIsPlaying(true) : setIsPlaying(true);
        setCourseTab('outline');
      } else {
        setShowVipModal(true);
      }
    };

    return (
      <div className="absolute inset-0 z-[60] bg-[#F5F7FA] animate-in slide-in-from-right-full duration-300 flex flex-col">
         <div className="bg-white px-5 pt-8 pb-3 z-10 shadow-sm relative flex items-center justify-between">
            <ChevronLeft size={24} className="text-gray-800 cursor-pointer" onClick={() => setActiveServicePage(null)} />
            <h1 className="text-lg font-bold text-gray-800">{serviceConfig[activeServicePage].title}</h1>
            <div className="w-6"></div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 relative scrollbar-hide pb-24">
            
            {/* 新增：每日任务页面 */}
            {activeServicePage === 'tasks' && (
              <div className="space-y-4 animate-fade-in-up pb-10">
                 <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h2 className="text-2xl font-bold mb-2">赚取积分</h2>
                    <p className="text-xs opacity-90 mb-5 leading-relaxed">积分可用于抵扣开通 VIP 的费用，或兑换高级私密话术、专家提问次数等特权服务。</p>
                    <div className="bg-white/20 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/30 relative z-10">
                       <div className="flex items-center"><Zap size={24} className="text-yellow-300 mr-2 drop-shadow-sm"/> <span className="text-3xl font-extrabold tracking-tight">350</span></div>
                       <button onClick={() => showToast('积分商城开发中')} className="bg-white text-indigo-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform hover:bg-gray-50">去兑换区</button>
                    </div>
                 </div>
                 
                 <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-[15px] mb-1">日常任务</h3>
                    <p className="text-[10px] text-gray-400 mb-4">每天零点重置任务进度</p>
                    <div className="space-y-1">
                      <TaskItem icon={<Calendar size={18}/>} title="每日签到" points="+10" status="已完成" onClick={() => showToast('今天已经签到过啦')} />
                      <TaskItem icon={<Share2 size={18}/>} title="分享小程序给好友" points="+20" status="去完成" onClick={() => showToast('调用微信分享接口...')} />
                      <TaskItem icon={<MessageCircle size={18}/>} title="使用一次 AI 导师" points="+15" status="去完成" onClick={() => { setActiveServicePage(null); setActiveTab('ai'); }} />
                      <TaskItem icon={<Edit3 size={18}/>} title="贡献一条原创话术" points="+50" status="去完成" onClick={() => setActiveServicePage('contribute')} />
                      <TaskItem icon={<BookOpen size={18}/>} title="完整阅读一篇避坑指南" points="+10" status="去完成" onClick={() => setActiveServicePage('all-pitfalls')} />
                    </div>
                 </div>
              </div>
            )}

            {/* 新增：浏览足迹页面 */}
            {activeServicePage === 'history' && (
              <div className="space-y-4 animate-fade-in-up pb-10">
                 <div className="flex justify-between items-center px-1 mb-2">
                    <span className="text-xs text-gray-500 font-medium">最近浏览记录保存在本地，清除缓存后失效</span>
                    <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-red-500" onClick={() => showToast('已清空浏览足迹')}><Trash2 size={12} className="mr-1"/>清空</span>
                 </div>
                 <div className="space-y-3">
                   {/* 模拟从 allScripts 中取几个作为历史记录 */}
                   {[allScripts[0], allScripts[2], allScripts[5]].map(script => (
                      <ScriptCard key={'hist-'+script.id} script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} />
                   ))}
                 </div>
                 <div className="text-center text-xs text-gray-400 mt-6">- 没有更多记录了 -</div>
              </div>
            )}

            {/* 我的贡献页面 */}
            {activeServicePage === 'contributions' && (
              <div className="space-y-4 animate-fade-in-up pb-10">
                 <div className="flex space-x-3 mb-2">
                    <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm text-center border border-gray-100">
                       <p className="text-2xl font-extrabold text-gray-800">12</p>
                       <p className="text-[11px] text-gray-500 mt-1">已投递 (条)</p>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm text-center border border-gray-100">
                       <p className="text-2xl font-extrabold text-green-500">5</p>
                       <p className="text-[11px] text-gray-500 mt-1">已采纳 (条)</p>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm text-center border border-gray-100">
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
                     <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group">
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-[11px] text-gray-400 font-medium">{item.time}</span>
                           <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${item.color === 'green' ? 'bg-green-50 text-green-600 border-green-200' : item.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{item.status}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 mb-2">
                           <p className="text-[13px] font-bold text-gray-800"><span className="text-blue-500 mr-1 text-xs">问:</span>{item.q}</p>
                        </div>
                        <div className="bg-pink-50/50 rounded-xl p-3 border border-pink-100/50">
                           <p className="text-[13px] text-gray-700 leading-relaxed"><span className="text-pink-500 mr-1 font-bold text-xs">答:</span>{item.a}</p>
                        </div>
                     </div>
                   ))}
                 </div>
                 
                 <button onClick={() => setActiveServicePage('contribute')} className="w-full bg-pink-50 text-pink-600 font-bold py-3.5 rounded-2xl border border-pink-200 mt-2 active:scale-95 transition-transform flex items-center justify-center shadow-sm">
                    <Edit3 size={16} className="mr-2" /> 继续贡献赚 VIP
                 </button>
              </div>
            )}

            {/* AI 记录页面 */}
            {activeServicePage === 'ai-history' && (
              <div className="space-y-3 animate-fade-in-up pb-10">
                 <div className="flex justify-between items-center px-1 mb-2">
                    <span className="text-xs text-gray-500 font-medium">仅保留最近 30 天的聊天记录</span>
                    <span className="text-[11px] text-gray-400 flex items-center cursor-pointer hover:text-red-500" onClick={() => showToast('已清空 AI 记录')}><Trash2 size={12} className="mr-1"/>清空</span>
                 </div>
                 {[
                   { q: '她刚对我说：“我觉得我们还是做朋友比较好” 怎么回？？', a: '好啊，那作为朋友，周末请我喝杯奶茶不过分吧？', time: '今天 10:25' },
                   { q: '发烧到39度了', a: '除了多喝热水，你可以直接带药去楼下...', time: '昨天 15:40' },
                   { q: '帮我写一个高级的朋友圈文案', a: '阳光正好，微风不燥，万物可爱，人间值得。', time: '11-05 09:20' }
                 ].map((item, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { setActiveTab('ai'); setChatInput(item.q); setActiveServicePage(null); }}>
                     <div className="flex justify-between items-start mb-2.5">
                       <p className="text-[13px] font-bold text-gray-800 line-clamp-2 flex-1 pr-3 leading-relaxed">
                         <span className="bg-blue-100 text-blue-600 text-[9px] px-1.5 py-0.5 rounded-sm mr-1.5 align-middle">我</span>{item.q}
                       </p>
                       <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{item.time}</span>
                     </div>
                     <p className="text-[12px] text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100"><Sparkles size={12} className="inline text-pink-500 mr-1.5 mb-0.5"/>{item.a}</p>
                   </div>
                 ))}
                 <div className="text-center text-xs text-gray-400 mt-6">- 没有更多记录了 -</div>
              </div>
            )}

            {/* 错题本页面 */}
            {activeServicePage === 'notes' && (
              <div className="space-y-4 animate-fade-in-up pb-10">
                 <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100/80 p-5 rounded-[1.5rem] mb-2 relative overflow-hidden shadow-sm">
                    <Target size={60} className="absolute -right-4 -bottom-4 text-orange-200/50 rotate-12" />
                    <h3 className="font-bold text-orange-800 text-[16px] mb-1.5 flex items-center">情商雷区记录</h3>
                    <p className="text-[12px] text-orange-600/80 leading-relaxed max-w-[85%]">温故而知新，复习错题能帮你快速提升聊天段位，避开直男/直女雷区。</p>
                 </div>
                 
                 {[
                   { q: '女生突然对你说：“我好像发烧到39度了，好难受...” 你该怎么回？', wrong: '多喝热水，吃药了吗？快去休息吧。', right: '开门，我在楼下带了药和粥。', time: '2023-11-06' },
                   { q: '女生说：“随便，吃什么都行。”', wrong: '那去吃海底捞？不行的话去吃烤肉？', right: '我知道有一家新开的私房菜环境超棒，我带你去。', time: '2023-10-28' }
                 ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 pb-5 rounded-3xl shadow-sm border border-gray-100 relative pt-7 mt-3">
                       <div className="absolute top-0 left-5 bg-gray-800 text-white text-[10px] px-2.5 py-1 rounded-b-lg font-bold shadow-sm flex items-center"><FileText size={10} className="mr-1"/> 错题 #{idx + 1}</div>
                       <div className="absolute top-2 right-4 text-[10px] text-gray-400">{item.time}</div>
                       
                       <p className="text-[14px] font-bold text-gray-800 mb-4 leading-relaxed">{item.q}</p>
                       
                       <div className="space-y-3">
                          <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
                             <div className="flex items-center text-[11px] text-red-500 font-bold mb-1.5"><X size={14} className="mr-1"/> 你的低分回复 (直男/女雷区)</div>
                             <p className="text-[13px] text-red-800/90 leading-relaxed">{item.wrong}</p>
                          </div>
                          
                          <div className="bg-green-50/50 p-3.5 rounded-2xl border border-green-100 relative overflow-hidden">
                             <div className="absolute -top-2 -right-2"><CheckCircle2 size={40} className="text-green-200/40" /></div>
                             <div className="flex items-center text-[11px] text-green-600 font-bold mb-1.5 relative z-10"><CheckCircle2 size={14} className="mr-1"/> 满分高情商回复</div>
                             <p className="text-[13px] text-green-800/90 relative z-10 leading-relaxed">{item.right}</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 <div className="text-center text-xs text-gray-400 mt-6">- 定期清空错题本，早日成为嘴强王者 -</div>
              </div>
            )}

            {/* 避坑指南列表页面 */}
            {activeServicePage === 'all-pitfalls' && (
              <div className="space-y-3 animate-fade-in-up pb-10">
                {pitfallsData.map((item) => (
                  <div key={item.id} onClick={() => handleOpenArticle(item)} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm cursor-pointer hover:bg-pink-50/50 transition-colors flex items-start group">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-3 shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[14px] text-gray-800 mb-1 leading-tight group-hover:text-pink-600 transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">{item.desc}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mr-1 text-gray-600 font-bold scale-75">{item.author[0]}</div>
                          <span>{item.author}</span>
                          <span className="mx-1.5 text-gray-300">|</span>
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center"><Flame size={10} className="mr-1 text-red-300"/> {item.views}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center text-xs text-gray-400 mt-6">- 更多干货持续更新中 -</div>
              </div>
            )}

            {/* 文章详情阅读页面 */}
            {activeServicePage === 'article' && activeArticle && (
              <div className="space-y-5 animate-fade-in-up pb-10 bg-white min-h-full p-5 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-800 leading-snug">{activeArticle.title}</h2>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xs">
                      {activeArticle.author[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-700">{activeArticle.author}</p>
                      <p className="text-[10px] text-gray-400">{activeArticle.date}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md flex items-center">
                    <Flame size={12} className="mr-1 text-red-400"/> {activeArticle.views} 浏览
                  </div>
                </div>
                
                {/* 富文本文章内容区 */}
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
              </div>
            )}

            {/* 恋爱评测页面 */}
            {activeServicePage === 'assessment' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="bg-gradient-to-br from-pink-400 to-rose-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200">
                  <h2 className="text-2xl font-bold mb-2">综合情感段位评测</h2>
                  <p className="text-sm opacity-90 mb-6">包含 20 道专业情商测试题，精准评估你的撩妹/撩汉等级，并定制专属脱单路线。</p>
                  <div className="flex items-center text-xs space-x-3 mb-4">
                    <span className="bg-white/20 px-2 py-1.5 rounded-md">耗时约 3 分钟</span>
                    <span className="bg-white/20 px-2 py-1.5 rounded-md">已有 12.4w 人评测</span>
                  </div>
                  <button onClick={() => showToast('题目加载中...')} className="w-full bg-white text-pink-500 font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform">开始免费评测</button>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">历史评测记录</h3>
                  <div className="flex flex-col items-center justify-center py-8 opacity-50">
                     <FileText size={32} className="text-gray-300 mb-2" />
                     <p className="text-xs text-gray-500">暂无评测记录</p>
                  </div>
                </div>
              </div>
            )}

            {/* 邀请有礼页面 */}
            {activeServicePage === 'invite' && (
              <div className="space-y-4 animate-fade-in-up flex flex-col items-center">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-6 text-white shadow-lg shadow-purple-200 w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <Gift size={40} className="text-yellow-300 mb-3 drop-shadow-md" />
                  <h2 className="text-2xl font-bold mb-2">邀请好友得 VIP</h2>
                  <p className="text-sm opacity-90 mb-6 leading-relaxed">每成功邀请 1 位新用户注册，你和好友均可获得 7 天高级 Pro 会员。</p>
                  <div className="bg-white/20 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/30">
                    <div>
                      <p className="text-xs opacity-80 mb-1">你的专属邀请码</p>
                      <p className="text-2xl font-extrabold tracking-widest drop-shadow-sm">A8X92K</p>
                    </div>
                    <button onClick={() => handleCopy('invite_code', 'A8X92K')} className="bg-white text-indigo-500 text-xs font-bold px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform">
                      {copiedId === 'invite_code' ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
                <button onClick={() => showToast('正在生成专属海报...')} className="w-full bg-indigo-50 text-indigo-600 font-bold py-3.5 rounded-2xl shadow-sm border border-indigo-100 mt-2 active:bg-indigo-100 transition-colors">生成分享海报</button>
                <div className="w-full bg-white rounded-2xl p-4 shadow-sm mt-2 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-800 text-sm">我的邀请记录</span>
                    <span className="text-xs text-gray-400">成功邀请 0 人</span>
                  </div>
                  <div className="text-center py-10 text-xs text-gray-400 bg-gray-50/80 rounded-xl border border-dashed border-gray-200">
                    快去邀请第一位好友吧~
                  </div>
                </div>
              </div>
            )}

            {/* 话术定制页面 */}
            {activeServicePage === 'custom' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles size={18} className="text-blue-500" />
                    <h3 className="font-bold text-gray-800 text-sm">高级导师 1V1 话术定制</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">遇到极其复杂的聊天场景？不知道怎么回？请详细描述前因后果，我们的情感专家团队将在 2 小时内为你量身定制专属回复方案。</p>
                  <textarea 
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[13px] focus:border-blue-300 focus:bg-white transition-all outline-none resize-none mb-3 shadow-inner"
                    placeholder="请详细描述背景：&#10;1. 你们现在的关系阶段？&#10;2. 对方发了什么内容？&#10;3. 你希望达到什么样的目的或效果？"
                  ></textarea>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4 px-1">
                    <span>剩余定制权益：<span className="font-bold text-blue-500 text-sm">1</span> 次</span>
                    <span onClick={() => setShowVipModal(true)} className="text-blue-500 cursor-pointer font-medium">获取更多权益</span>
                  </div>
                  <button onClick={() => showToast('需求已提交，请留意系统消息')} className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-transform">立即提交</button>
                </div>
              </div>
            )}

            {/* 专属客服页面 */}
            {activeServicePage === 'support' && (
              <div className="space-y-4 animate-fade-in-up">
                 <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center mt-8 relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-full border-4 border-white shadow-md absolute -top-10 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" alt="Customer Service" />
                    </div>
                    <div className="mt-10 mb-2">
                       <h2 className="text-lg font-bold text-gray-800 flex items-center justify-center">情感导师 - 苏苏 <CheckCircle2 size={16} className="text-green-500 ml-1" /></h2>
                       <p className="text-xs text-gray-400 mt-1.5">从业 5 年 · 解决 10w+ 情感问题</p>
                    </div>
                    <div className="w-full bg-orange-50 rounded-2xl p-4 my-5 border border-orange-100/50">
                       <p className="text-xs text-orange-600 mb-1 font-medium">官方企业微信</p>
                       <p className="text-xl font-extrabold text-orange-600 tracking-wider">LoveMaster_66</p>
                    </div>
                    <button onClick={() => handleCopy('wechat_id', 'LoveMaster_66')} className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-md shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center">
                       {copiedId === 'wechat_id' ? <CheckCircle2 size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />} 
                       {copiedId === 'wechat_id' ? '已复制微信号' : '一键复制微信号去添加'}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-5">服务时间：周一至周日 09:00 - 22:00</p>
                 </div>
              </div>
            )}

            {/* 帮助与反馈页面 */}
            {activeServicePage === 'feedback' && (
              <div className="space-y-4 animate-fade-in-up">
                {/* 常见问题 FAQ */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center">
                    <HelpCircle size={18} className="mr-2 text-blue-500" /> 常见问题
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-50 pb-3">
                      <p className="text-[13px] font-bold text-gray-700 mb-1.5">Q: 怎么取消连续包月？</p>
                      <p className="text-xs text-gray-500 leading-relaxed">A: 终身会员为一次性买断，无需取消。如果您是包月用户，请在「微信支付 - 扣费服务」中手动关闭。</p>
                    </div>
                    <div className="border-b border-gray-50 pb-3">
                      <p className="text-[13px] font-bold text-gray-700 mb-1.5">Q: AI 导师有使用次数限制吗？</p>
                      <p className="text-xs text-gray-500 leading-relaxed">A: 普通用户每天可免费对话 5 次，开通 Pro 会员后可享受无限次秒回对话特权。</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-700 mb-1.5">Q: 话术没找到想要的怎么办？</p>
                      <p className="text-xs text-gray-500 leading-relaxed">A: 你可以使用「话术定制」服务，或直接在 AI 导师页面发送对方的话，导师会为你实时生成专属回复。</p>
                    </div>
                  </div>
                </div>

                {/* 意见反馈表单 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center">
                    <MessageSquare size={18} className="mr-2 text-pink-500" /> 意见反馈
                  </h3>
                  <textarea 
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[13px] focus:border-pink-300 focus:bg-white transition-all outline-none resize-none mb-3 shadow-inner placeholder-gray-400"
                    placeholder="请详细描述您遇到的问题或优化建议，您的反馈是我们进步的动力..."
                  ></textarea>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[13px] focus:border-pink-300 focus:bg-white transition-all outline-none mb-5 shadow-inner placeholder-gray-400"
                    placeholder="联系方式（微信号/手机号，选填）"
                  />
                  <button onClick={() => { showToast('反馈已提交，感谢您的支持！'); setTimeout(() => setActiveServicePage(null), 1500); }} className="w-full bg-pink-500 text-white font-bold py-3.5 rounded-xl shadow-md shadow-pink-200 active:scale-95 transition-transform">
                    提交反馈
                  </button>
                </div>
              </div>
            )}

            {/* 专题详情页面 */}
            {activeServicePage === 'topic' && (
              <div className="space-y-4 animate-fade-in-up pb-10">
                <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <Compass size={32} className="text-pink-100 mb-3 drop-shadow-md" />
                  <h2 className="text-2xl font-bold mb-2 tracking-wide">七夕特辑：高分表白</h2>
                  <p className="text-[13px] opacity-90 leading-relaxed">收录 50+ 句直击灵魂的告白，让你在特别的日子里，一语击中 TA 的心。不落俗套，不当舔狗，高级感拉满。</p>
                  <div className="flex items-center text-xs space-x-3 mt-4 opacity-80">
                    <span className="flex items-center"><User size={14} className="mr-1" /> 12.5w 人已学习</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between px-1 mb-1 mt-6">
                  <h3 className="font-bold text-gray-800 text-[15px] flex items-center"><Flame size={16} className="text-red-500 mr-1" /> 专题精选内容</h3>
                </div>

                <div className="space-y-3">
                  {[allScripts[3], allScripts[4]].map((script) => (
                    <ScriptCard key={'topic-' + script.id} script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} simple={false} />
                  ))}
                  <div className="text-center text-xs text-gray-400 mt-6 pb-4">- 更多专题内容持续更新中 -</div>
                </div>
              </div>
            )}

            {/* 贡献原创话术页面 */}
            {activeServicePage === 'contribute' && (
              <div className="space-y-4 animate-fade-in-up pb-10">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">UGC 计划</div>
                   <h3 className="font-bold text-gray-800 text-lg mb-1 flex items-center"><Edit3 size={20} className="mr-2 text-gray-800" /> 分享你的神回复</h3>
                   <p className="text-xs text-gray-500 mb-6">审核通过并收录至话术库后，你将获得 <span className="text-pink-500 font-bold">3 天 Pro 会员</span> 奖励！</p>
                   
                   <div className="mb-5">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2 flex items-center"><MessageCircle size={14} className="mr-1.5 text-blue-500" /> 对方说了什么？</label>
                      <textarea rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[14px] focus:border-gray-800 focus:bg-white transition-all outline-none resize-none placeholder-gray-400" placeholder="例如：你到底喜欢我什么？"></textarea>
                   </div>
                   
                   <div className="mb-5">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2 flex items-center"><Sparkles size={14} className="mr-1.5 text-pink-500" /> 你的高分回复是？</label>
                      <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[14px] focus:border-gray-800 focus:bg-white transition-all outline-none resize-none placeholder-gray-400" placeholder="例如：喜欢你这个问题问得好，让我有了一辈子时间来回答。"></textarea>
                   </div>
                   
                   <div className="mb-8">
                      <label className="block text-[13px] font-bold text-gray-700 mb-3">为你的话术选择一个分类</label>
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
                   
                   <button onClick={() => { showToast('提交成功！等待系统审核...'); setTimeout(() => setActiveServicePage(null), 1500); }} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center text-[15px]">
                     <Send size={18} className="mr-2" /> 立即投递
                   </button>
                </div>
                
                <div className="text-center px-4">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    投递须知：请勿提交包含低俗、暴力、敏感或无意义的内容，违规者将被永久封停账号。
                  </p>
                </div>
              </div>
            )}

            {/* 课程详情页面 */}
            {activeServicePage === 'course' && (
              <div className="space-y-4 animate-fade-in-up pb-20">
                
                {/* 顶部视频/预览区 */}
                {activeLesson !== null ? (
                  <div className="relative w-full h-[210px] bg-black rounded-3xl overflow-hidden shadow-md flex flex-col justify-between animate-in zoom-in-95 duration-300">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {isPlaying ? (
                        <div className="flex flex-col items-center">
                          <Loader2 size={32} className="animate-spin text-pink-500 mb-2 opacity-80" />
                          <span className="text-white/80 text-xs font-medium tracking-wider">正在缓冲视频...</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(true)}>
                          <PlayCircle size={36} className="text-white ml-1" />
                        </div>
                      )}
                    </div>
                    {/* 顶部标题栏 */}
                    <div className="bg-gradient-to-b from-black/80 to-transparent p-4 pb-8 z-10">
                      <p className="text-white text-sm font-bold truncate pr-4">{courseData.lessons[activeLesson].title}</p>
                    </div>
                    {/* 底部控制栏 */}
                    <div className="bg-gradient-to-t from-black/90 to-transparent p-4 pt-10 z-10 flex flex-col">
                      <div className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer relative">
                        <div className={`absolute top-0 left-0 h-full bg-pink-500 rounded-full ${isPlaying ? 'w-1/3 transition-all duration-1000' : 'w-0'}`}></div>
                        <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-all ${isPlaying ? 'left-1/3' : 'left-0'}`}></div>
                      </div>
                      <div className="flex justify-between items-center text-white">
                        <div className="flex items-center space-x-4 cursor-pointer">
                          {isPlaying ? (
                            <PauseCircle size={22} onClick={() => setIsPlaying(false)} className="hover:text-pink-400" />
                          ) : (
                            <PlayCircle size={22} onClick={() => setIsPlaying(true)} className="hover:text-pink-400" />
                          )}
                          <span className="text-[10px] font-medium opacity-80">
                            {isPlaying ? '04:12' : '00:00'} / {courseData.lessons[activeLesson].duration}
                          </span>
                        </div>
                        <Maximize2 size={18} className="cursor-pointer hover:text-pink-400 opacity-80" onClick={() => showToast('全屏模式开发中')} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-[210px] bg-gray-900 rounded-3xl overflow-hidden shadow-md flex items-center justify-center group cursor-pointer animate-in fade-in" onClick={() => handlePlayLesson(0)}>
                     <img src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" alt="Course" />
                     <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                     <div className="relative z-10 flex flex-col items-center group-hover:scale-110 transition-transform">
                       <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg mb-2">
                         <PlayCircle size={32} className="text-white ml-1" />
                       </div>
                       <span className="text-white text-xs font-bold tracking-widest drop-shadow-md">立即试看</span>
                     </div>
                  </div>
                )}

                {/* 课程基本信息 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative z-10 -mt-2">
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
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${isCurrentPlaying ? 'bg-pink-50/80 border-pink-200 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'}`}
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
                              <div className="bg-gray-50 p-1.5 rounded-full shrink-0 border border-gray-100"><Crown size={14} className="text-gray-400" /></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 简介 Tab */}
                  {courseTab === 'intro' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center"><UserCheck size={16} className="mr-1.5 text-blue-500" /> 导师介绍</h3>
                        <div className="flex items-center mb-3">
                          <img src={courseData.instructor.avatar} className="w-12 h-12 rounded-full object-cover mr-3 shadow-sm border border-gray-100" alt="Instructor" />
                          <div>
                            <p className="font-bold text-gray-800 text-[14px]">{courseData.instructor.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{courseData.instructor.title}</p>
                          </div>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                          苏苏导师专注于情感关系升温与脱单实战指导，曾帮助上万名学员成功脱单、挽回前任。擅长利用心理学原理打破聊天僵局。
                        </p>
                      </div>

                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center"><Sparkles size={16} className="mr-1.5 text-orange-500" /> 你将获得</h3>
                        <ul className="space-y-3 text-[13px] text-gray-600">
                          <li className="flex items-start"><CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="leading-relaxed">掌握 10+ 种高频聊天场景的推拉技巧，告别冷场。</span></li>
                          <li className="flex items-start"><CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="leading-relaxed">学会通过情绪价值吸引对方，建立强大的个人框架。</span></li>
                          <li className="flex items-start"><CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="leading-relaxed">突破友谊区，实现从普通朋友到暧昧对象的快速跃迁。</span></li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* 底部吸底操作栏 (如果未开通 VIP 且未在播放时显示) */}
                {activeLesson === null && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 px-5 z-40 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex space-x-3">
                    <div onClick={() => setActiveTab('ai')} className="w-12 h-12 bg-gray-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 border border-gray-200/60 shrink-0">
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

         {/* 避坑指南文章详情底栏：点赞/分享等悬浮控制栏 */}
         {activeServicePage === 'article' && activeArticle && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 px-6 pb-safe z-40 flex items-center justify-between shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)]">
               <div className="flex-1">
                 <input type="text" placeholder="写下你的想法..." className="w-full bg-gray-50 rounded-full py-2 px-4 text-xs outline-none focus:bg-white focus:border focus:border-pink-200 transition-colors" />
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
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-md h-[100dvh] bg-white sm:shadow-xl sm:border-x sm:border-gray-200 overflow-hidden relative flex flex-col mx-auto">
        
        <div className="flex-1 overflow-hidden relative bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {activeTab === 'home' && renderHome()}
          {activeTab === 'discover' && renderDiscover()}
          {activeTab === 'ai' && renderAI()}
          {activeTab === 'favorites' && renderFavorites()}
          {activeTab === 'profile' && renderProfile()}
        </div>

        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2.5 px-6 pb-6 z-30 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mt-1.5 relative">
            <NavItem icon={<Home size={22} />} label="首页" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={<MessageCircle size={22} />} label="话术库" isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
            <div className="relative -top-7 mx-2 group" onClick={() => setActiveTab('ai')}>
              <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition-all cursor-pointer border-[5px] border-white ${activeTab === 'ai' ? 'bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-400/50 scale-105' : 'bg-gradient-to-tr from-gray-800 to-gray-700 shadow-gray-400/30 group-hover:scale-105'}`}><Sparkles size={24} className="text-white" /></div>
            </div>
            <NavItem icon={<Star size={22} />} label="收藏" isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
            <NavItem icon={<User size={22} />} label="我的" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
        </div>

        {renderRepliesDrawer()}
        {renderVipModal()}
        {renderSettingsModal()}
        {renderServicePages()}
        {renderToast()}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; }
        .delay-150 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        @keyframes pulseSlow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
        .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
        @keyframes shimmer { 100% { transform: translateX(150%); } }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}} />
    </div>
  );
}

// 提取每日任务卡片子组件
function TaskItem({ icon, title, points, status, onClick }) {
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

function ScriptCard({ script, copiedId, onCopy, simple = false, isFavorite, onToggleFav, onShowMore }) {
  return (
    <div className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
      <Heart size={18} onClick={onToggleFav} className={`absolute top-4 right-4 cursor-pointer transition-all active:scale-75 ${isFavorite ? 'fill-pink-500 text-pink-500 drop-shadow-sm' : 'text-gray-300 hover:text-pink-300'}`} />
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

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-12 transition-all duration-300 ${isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>{icon}</div>
      <span className="text-[10px] font-bold">{label}</span>
      <div className={`w-1 h-1 rounded-full bg-pink-500 mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
    </button>
  );
}

function ProfileListItem({ icon, title, subtitle, border = true, onClick }) {
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

// 通用拖拽滑动容器组件
function ScrollableRow({ children, className }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragged, setIsDragged] = useState(false);

  const handleMouseDown = (e) => { 
    isDragging.current = true; 
    setIsDragged(false); 
    startX.current = e.pageX - scrollRef.current.offsetLeft; 
    scrollLeft.current = scrollRef.current.scrollLeft; 
  };
  const handleMouseLeave = () => { isDragging.current = false; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) setIsDragged(true);
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  
  // 阻止拖拽结束时触发点击事件
  const handleClickCapture = (e) => {
    if (isDragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div 
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {children}
    </div>
  );
}
