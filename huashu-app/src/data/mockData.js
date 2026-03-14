export const categories = [
  { id: 1, name: '开场破冰', icon: '🧊', color: 'from-blue-400 to-cyan-300', count: 128 },
  { id: 2, name: '幽默撩人', icon: '😜', color: 'from-pink-400 to-rose-300', count: 256 },
  { id: 3, name: '情感升温', icon: '🔥', color: 'from-orange-400 to-red-300', count: 96 },
  { id: 4, name: '巧妙化解', icon: '🛡️', color: 'from-indigo-400 to-purple-300', count: 112 },
  { id: 5, name: '睡前情话', icon: '🌙', color: 'from-violet-400 to-fuchsia-300', count: 340 },
  { id: 6, name: '长期关系', icon: '💑', color: 'from-teal-400 to-emerald-300', count: 85 },
];

export const popularTags = ['全部', '#相亲开场', '#微信首聊', '#酒吧搭讪', '#高情商', '#幽默', '#暖心'];

export const allScripts = [
  { id: 1, categoryId: 1, question: '女生说：“在干嘛呢？”', type: '高情商', likes: 1250, isNew: false, tags: ['#微信首聊', '#高情商'], isFeatured: true, answers: ['在想怎么回复一个漂亮女孩的消息。', '刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。', '在做一道选择题：是继续想你，还是去找你。'] },
  { id: 2, categoryId: 3, question: '女生说：“我今天好累哦”', type: '暖心/幽默', likes: 3420, isNew: true, tags: ['#暖心', '#高情商'], isFeatured: true, answers: ['怎么啦？是不是在我的脑海里跑了一整天累坏了？', '摸摸头，辛苦啦。今晚的月亮很温柔，早点休息，我们在梦里见。', '给你发个虚拟肩膀，靠一下吧（拍一拍）'] },
  { id: 3, categoryId: 1, question: '不知道聊什么，怎么自然开场？', type: '开场白', likes: 890, isNew: false, tags: ['#相亲开场', '#微信首聊'], isFeatured: false, answers: ['刚刚在路边看到一只猫，跟你头像一样可爱，忍不住想跟你分享。', '我发现一个关于你的秘密，你想不想听？（引发好奇）', '今天的天气太好了，好到我不仅想晒太阳，还想跟你说句话。'] },
  { id: 4, categoryId: 2, question: '女生问：“你喜欢我什么？”', type: '幽默/化解', likes: 5600, isNew: false, tags: ['#幽默', '#高情商'], isFeatured: true, answers: ['本来以为只是图你长得好看，后来发现你还挺有趣的，这下亏大了。', '喜欢你这个问题问得好，让我有了一辈子时间来回答。', '大概是第一次见你时，连周遭的空气都变甜了吧。'] },
  { id: 5, categoryId: 5, question: '该睡觉了，怎么说晚安？', type: '睡前情话', likes: 2100, isNew: true, tags: ['#暖心'], isFeatured: false, answers: ['晚安，希望你今晚的梦里有我，如果没有，那我明天再来问一遍。', '月亮不睡我不睡，但你得睡了。晚安好梦~', '把今天的烦恼都关掉，我们梦里见。'] },
  { id: 6, categoryId: 2, question: '怎么要微信比较自然？', type: '高情商', likes: 430, isNew: true, tags: ['#酒吧搭讪', '#高情商'], isFeatured: false, answers: ['我手机刚才中病毒了，只有加个漂亮女孩的微信才能解锁，帮个忙？', '我觉得我们聊得挺投缘的，要不要转移到微信战场继续？'] }
];

export const pitfallsData = [
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

export const hotSearches = ['早安怎么回', '惹女人生气了', '怎么要微信', '被拒绝怎么化解', '睡前撩人情话', '不知道聊什么'];

export const courseData = {
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

export const mockPosts = [
  {
    id: 1,
    content: "第一次相亲，对方一直看手机，我该怎么破冰？求指导！",
    images: [],
    tags: ["相亲", "破冰技巧"],
    likes: 45,
    comments: 12,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 101,
      name: "情感小白",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      role: "USER"
    },
    category: {
      id: 1,
      name: "实战求助",
      color: "bg-blue-100 text-blue-600"
    },
    _count: {
      likes: 45,
      comments: 12
    }
  },
  {
    id: 2,
    content: "分享一个今天刚用的高情商回复，女生说「好累啊」，我回了这句，她瞬间开心了！",
    images: ["https://picsum.photos/400/300"],
    tags: ["高情商回复", "日常聊天"],
    likes: 128,
    comments: 34,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: 102,
      name: "苏苏导师",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Susu",
      role: "MENTOR"
    },
    category: {
      id: 2,
      name: "经验分享",
      color: "bg-green-100 text-green-600"
    },
    _count: {
      likes: 128,
      comments: 34
    }
  }
];
