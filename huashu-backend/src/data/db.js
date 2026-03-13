// 模拟内存数据库
const db = {
  users: [
    {
      id: "8848123",
      name: "微信用户",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      gender: "男生",
      bio: "正在努力学习脱单...",
      daysLearned: 12,
      rank: "嘴强王者",
      points: 350,
      isVip: false
    }
  ],
  categories: [
    { id: 1, name: '开场破冰', icon: '🧊', color: 'from-blue-400 to-cyan-300', count: 128 },
    { id: 2, name: '幽默撩人', icon: '😜', color: 'from-pink-400 to-rose-300', count: 256 },
    { id: 3, name: '情感升温', icon: '🔥', color: 'from-orange-400 to-red-300', count: 96 },
    { id: 4, name: '巧妙化解', icon: '🛡️', color: 'from-indigo-400 to-purple-300', count: 112 },
    { id: 5, name: '睡前情话', icon: '🌙', color: 'from-violet-400 to-fuchsia-300', count: 340 },
    { id: 6, name: '长期关系', icon: '💑', color: 'from-teal-400 to-emerald-300', count: 85 }
  ],
  scripts: [
    { id: 1, categoryId: 1, question: '女生说：“在干嘛呢？”', type: '高情商', likes: 1250, isNew: false, tags: ['#微信首聊', '#高情商'], isFeatured: true, answers: ['在想怎么回复一个漂亮女孩的消息。', '刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。', '在做一道选择题：是继续想你，还是去找你。'] },
    { id: 2, categoryId: 3, question: '女生说：“我今天好累哦”', type: '暖心/幽默', likes: 3420, isNew: true, tags: ['#暖心', '#高情商'], isFeatured: true, answers: ['怎么啦？是不是在我的脑海里跑了一整天累坏了？', '摸摸头，辛苦啦。今晚的月亮很温柔，早点休息，我们在梦里见。', '给你发个虚拟肩膀，靠一下吧（拍一拍）'] },
    { id: 3, categoryId: 1, question: '不知道聊什么，怎么自然开场？', type: '开场白', likes: 890, isNew: false, tags: ['#相亲开场', '#微信首聊'], isFeatured: false, answers: ['刚刚在路边看到一只猫，跟你头像一样可爱，忍不住想跟你分享。', '我发现一个关于你的秘密，你想不想听？（引发好奇）', '今天的天气太好了，好到我不仅想晒太阳，还想跟你说句话。'] },
    { id: 4, categoryId: 2, question: '女生问：“你喜欢我什么？”', type: '幽默/化解', likes: 5600, isNew: false, tags: ['#幽默', '#高情商'], isFeatured: true, answers: ['本来以为只是图你长得好看，后来发现你还挺有趣的，这下亏大了。', '喜欢你这个问题问得好，让我有了一辈子时间来回答。', '大概是第一次见你时，连周遭的空气都变甜了吧。'] },
    { id: 5, categoryId: 5, question: '该睡觉了，怎么说晚安？', type: '睡前情话', likes: 2100, isNew: true, tags: ['#暖心'], isFeatured: false, answers: ['晚安，希望你今晚的梦里有我，如果没有，那我明天再来问一遍。', '月亮不睡我不睡，但你得睡了。晚安好梦~', '把今天的烦恼都关掉，我们梦里见。'] },
    { id: 6, categoryId: 2, question: '怎么要微信比较自然？', type: '高情商', likes: 430, isNew: true, tags: ['#酒吧搭讪', '#高情商'], isFeatured: false, answers: ['我手机刚才中病毒了，只有加个漂亮女孩的微信才能解锁，帮个忙？', '我觉得我们聊得挺投缘的，要不要转移到微信战场继续？'] }
  ],
  hotSearches: ['早安怎么回', '惹女人生气了', '怎么要微信', '被拒绝怎么化解', '睡前撩人情话', '不知道聊什么'],
  articles: [
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
      title: '女生说“随便”，到底是什么意思？',
      desc: '别真的随便，那是送命题',
      views: '9.8w',
      author: '苏苏导师',
      date: '2023-11-01',
      content: [
        { type: 'p', text: '当女生说“随便”的时候，她其实是在说：“请展示你的带领能力，给我一个满意的方案。”' },
        { type: 'tip', text: '破解之法：直接给出A/B选项（如“我们去吃日料还是火锅？”），或者强势带领（“我知道一家超棒的私房菜，跟我走就行”）。' }
      ]
    }
  ],
  contributions: [
    { id: 1, userId: "8848123", question: '怎么不回消息？', answer: '正在想怎么回复能让你开心一整天呢。', status: 'approved', time: '2023-11-01', likes: 12, reason: null },
    { id: 2, userId: "8848123", question: '你觉得我胖了吗？', answer: '你那不是胖，是可爱膨胀了。', status: 'pending', time: '2023-11-05', likes: 0, reason: null },
    { id: 3, userId: "8848123", question: '多喝热水', answer: '开门，我在楼下。', status: 'rejected', time: '2023-10-20', likes: 0, reason: "库内已有类似高分话术" }
  ]
};

module.exports = db;
