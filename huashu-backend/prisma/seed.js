const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // ========== 1. 创建管理员账号 ==========
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'superadmin'
    }
  });
  console.log('管理员账号创建成功:', admin.username);

  // ========== 2. 创建用户 ==========
  const user = await prisma.user.upsert({
    where: { id: 'user-001' },
    update: {},
    create: {
      id: 'user-001',
      name: '微信用户',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
      gender: '男生',
      bio: '正在努力学习脱单...',
      daysLearned: 12,
      rank: '嘴强王者',
      points: 350,
      isVip: false
    }
  });
  console.log('用户创建成功:', user.name);

  // ========== 3. 创建分类 ==========
  // 使用 name 作为唯一标识，不指定固定 id，让数据库自增
  const categories = [
    { name: '开场破冰', icon: '🧊', color: 'from-blue-400 to-cyan-300', count: 128 },
    { name: '幽默撩人', icon: '😜', color: 'from-pink-400 to-rose-300', count: 256 },
    { name: '情感升温', icon: '🔥', color: 'from-orange-400 to-red-300', count: 96 },
    { name: '巧妙化解', icon: '🛡️', color: 'from-indigo-400 to-purple-300', count: 112 },
    { name: '睡前情话', icon: '🌙', color: 'from-violet-400 to-fuchsia-300', count: 340 },
    { name: '长期关系', icon: '💑', color: 'from-teal-400 to-emerald-300', count: 85 }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }
  console.log('分类数据初始化完成');

  // ========== 3.1 创建分类标签 ==========
  // 获取刚创建的分类
  const createdCategories = await prisma.category.findMany({
    where: { type: 'SCRIPT' }
  });
  
  // 为每个分类创建对应的标签
  const categoryTagsMap = {
    '开场破冰': ['#相亲开场', '#微信首聊', '#酒吧搭讪'],
    '幽默撩人': ['#高情商', '#幽默', '#暖心'],
    '情感升温': ['#暧昧期', '#表白', '#约会'],
    '巧妙化解': ['#送命题', '#误会', '#冷战'],
    '睡前情话': ['#晚安', '#撒娇', '#甜蜜'],
    '长期关系': ['#纪念日', '#吵架', '#见家长']
  };
  
  for (const cat of createdCategories) {
    const tags = categoryTagsMap[cat.name] || [];
    for (let i = 0; i < tags.length; i++) {
      await prisma.categoryTag.upsert({
        where: { 
          categoryId_name: {
            categoryId: cat.id,
            name: tags[i]
          }
        },
        update: {},
        create: {
          name: tags[i],
          categoryId: cat.id,
          sortOrder: i
        }
      });
    }
  }
  console.log('分类标签初始化完成');

  // ========== 3.2 创建话术库排序标签 ==========
  const scriptSortTabs = [
    { key: 'latest', label: '最新', sort: 'new', isDefault: false, sortOrder: 0 },
    { key: 'hot', label: '最热', sort: 'hot', isDefault: false, sortOrder: 1 },
    { key: 'recommend', label: '推荐', sort: 'default', isDefault: true, sortOrder: 2 }
  ];
  
  for (const tab of scriptSortTabs) {
    await prisma.scriptSortTab.upsert({
      where: { key: tab.key },
      update: {},
      create: tab
    });
  }
  console.log('话术库排序标签初始化完成');

  // ========== 4. 创建话术 ==========
  const scripts = [
    {
      id: 1,
      categoryId: 1,
      question: '女生说："在干嘛呢？"',
      type: '高情商',
      likes: 1250,
      isNew: false,
      isFeatured: true,
      tags: ['#微信首聊', '#高情商'],
      answers: ['在想怎么回复一个漂亮女孩的消息。', '刚吃完饭，正在思考宇宙的终极奥秘，顺便想想你。', '在做一道选择题：是继续想你，还是去找你。']
    },
    {
      id: 2,
      categoryId: 3,
      question: '女生说："我今天好累哦"',
      type: '暖心/幽默',
      likes: 3420,
      isNew: true,
      isFeatured: true,
      tags: ['#暖心', '#高情商'],
      answers: ['怎么啦？是不是在我的脑海里跑了一整天累坏了？', '摸摸头，辛苦啦。今晚的月亮很温柔，早点休息，我们在梦里见。', '给你发个虚拟肩膀，靠一下吧（拍一拍）']
    },
    {
      id: 3,
      categoryId: 1,
      question: '不知道聊什么，怎么自然开场？',
      type: '开场白',
      likes: 890,
      isNew: false,
      isFeatured: false,
      tags: ['#相亲开场', '#微信首聊'],
      answers: ['刚刚在路边看到一只猫，跟你头像一样可爱，忍不住想跟你分享。', '我发现一个关于你的秘密，你想不想听？（引发好奇）', '今天的天气太好了，好到我不仅想晒太阳，还想跟你说句话。']
    },
    {
      id: 4,
      categoryId: 2,
      question: '女生问："你喜欢我什么？"',
      type: '幽默/化解',
      likes: 5600,
      isNew: false,
      isFeatured: true,
      tags: ['#幽默', '#高情商'],
      answers: ['本来以为只是图你长得好看，后来发现你还挺有趣的，这下亏大了。', '喜欢你这个问题问得好，让我有了一辈子时间来回答。', '大概是第一次见你时，连周遭的空气都变甜了吧。']
    },
    {
      id: 5,
      categoryId: 5,
      question: '该睡觉了，怎么说晚安？',
      type: '睡前情话',
      likes: 2100,
      isNew: true,
      isFeatured: false,
      tags: ['#暖心'],
      answers: ['晚安，希望你今晚的梦里有我，如果没有，那我明天再来问一遍。', '月亮不睡我不睡，但你得睡了。晚安好梦~', '把今天的烦恼都关掉，我们梦里见。']
    },
    {
      id: 6,
      categoryId: 2,
      question: '怎么要微信比较自然？',
      type: '高情商',
      likes: 430,
      isNew: true,
      isFeatured: false,
      tags: ['#酒吧搭讪', '#高情商'],
      answers: ['我手机刚才中病毒了，只有加个漂亮女孩的微信才能解锁，帮个忙？', '我觉得我们聊得挺投缘的，要不要转移到微信战场继续？']
    },
    {
      id: 7,
      categoryId: 4,
      question: '女生说："我们还是做朋友吧"',
      type: '巧妙化解',
      likes: 3200,
      isNew: false,
      isFeatured: true,
      tags: ['#化解尴尬', '#高情商'],
      answers: ['朋友有很多种，我想做那种可以一起吃饭看电影的朋友。', '好啊，那就从朋友开始，但我可是那种会升级的朋友。', '做朋友没问题，但我有个缺点，就是对朋友太好了。']
    },
    {
      id: 8,
      categoryId: 3,
      question: '女生发朋友圈说生病了',
      type: '暖心关怀',
      likes: 1800,
      isNew: false,
      isFeatured: false,
      tags: ['#关心', '#暖心'],
      answers: ['看到消息我第一反应是想飞过去照顾你，第二反应是我得先学会飞。', '好好吃药，快快好起来，不然我会心疼的。', '需要我送药上门吗？我演技很好可以装作外卖小哥。']
    }
  ];

  for (const script of scripts) {
    await prisma.script.upsert({
      where: { id: script.id },
      update: {},
      create: script
    });
  }
  console.log('话术数据初始化完成');

  // ========== 5. 创建热搜词 ==========
  const hotSearches = [
    { keyword: '早安怎么回', order: 1 },
    { keyword: '惹女人生气了', order: 2 },
    { keyword: '怎么要微信', order: 3 },
    { keyword: '被拒绝怎么化解', order: 4 },
    { keyword: '睡前撩人情话', order: 5 },
    { keyword: '不知道聊什么', order: 6 }
  ];

  for (const hs of hotSearches) {
    await prisma.hotSearch.upsert({
      where: { keyword: hs.keyword },
      update: {},
      create: hs
    });
  }
  console.log('热搜词初始化完成');

  // ========== 6. 创建文章 ==========
  const articles = [
    {
      id: 1,
      title: '千万别这样表白，感动自己却吓跑对方',
      desc: '感动自己，吓跑对方',
      views: '10.5w',
      author: '苏苏导师',
      date: '2023-10-24',
      content: [
        { type: 'p', text: '很多男生在表白时，喜欢搞隆重的仪式，甚至在众目睽睽之下摆蜡烛、弹吉他。这不仅不会让女生感动，反而会给她带来巨大的社交压力。' },
        { type: 'h3', text: '为什么"感动式表白"会失败？' },
        { type: 'p', text: '表白应该是最终胜利时的号角，而不是发起进攻的冲锋号。如果你们平时的互动还没有达到暧昧的顶峰，突如其来的表白只会让对方觉得你"莫名其妙"，甚至产生防备心理。' },
        { type: 'tip', text: '正确做法：先通过日常推拉、肢体接触试探对方的底线，当她对你不抗拒且表现出依赖时，在一个自然放松的环境下（如散步时）顺其自然地牵起她的手，这比任何言语都有效。' }
      ]
    },
    {
      id: 2,
      title: '女生说"随便"，到底是什么意思？',
      desc: '解码女生潜台词',
      views: '8.2w',
      author: '情感导师小李',
      date: '2023-11-05',
      content: [
        { type: 'p', text: '当女生说"随便"的时候，80%的情况都不是真的随便。这是一种测试，看你是否了解她的喜好。' },
        { type: 'h3', text: '如何应对？' },
        { type: 'p', text: '不要真的随便选！你可以说："我知道一家很棒的日料店，你应该会喜欢，不去的话我就带你吃你最爱的火锅？"这样既展示了你的主见，又给了她选择权。' }
      ]
    },
    {
      id: 3,
      title: '第一次约会，千万不要做的5件事',
      desc: '避开这些雷区',
      views: '15.3w',
      author: '恋爱顾问阿杰',
      date: '2023-11-12',
      content: [
        { type: 'p', text: '第一次约会是建立印象的关键时刻，以下5件事千万不要做：' },
        { type: 'h3', text: '1. 迟到' },
        { type: 'p', text: '守时是最基本的尊重，迟到会让对方觉得你不重视这次约会。' },
        { type: 'h3', text: '2. 一直看手机' },
        { type: 'p', text: '这会让对方觉得你心不在焉，对她的陪伴不感兴趣。' },
        { type: 'tip', text: '建议：提前安排好时间，约会时把手机调成静音放在包里。' }
      ]
    }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {},
      create: article
    });
  }
  console.log('文章数据初始化完成');

  // ========== 7. 创建课程 ==========
  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: '高情商聊天实战课',
      desc: '从零开始，21天成为聊天高手',
      cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      tags: ['聊天技巧', '情商提升', '实战案例'],
      rating: 4.9,
      students: 12580,
      instructor: {
        name: '苏苏导师',
        title: '资深情感咨询师',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
        desc: '10年情感咨询经验，帮助5000+学员脱单'
      },
      lessons: [
        { title: '第一课：聊天的心态建设', duration: '15:30', free: true },
        { title: '第二课：开场白的艺术', duration: '22:15', free: true },
        { title: '第三课：如何让话题源源不断', duration: '18:45', free: false },
        { title: '第四课：幽默感的培养', duration: '25:00', free: false },
        { title: '第五课：识别女生的好感信号', duration: '20:20', free: false }
      ]
    }
  });
  console.log('课程数据初始化完成:', course.title);

  // ========== 8. 创建社区分类（如果不存在）==========
  const communityCategory = await prisma.category.upsert({
    where: { name: '恋爱技巧' },
    update: {},
    create: {
      name: '恋爱技巧',
      icon: '💕',
      color: 'from-pink-400 to-rose-300',
      type: 'POST',
      count: 0
    }
  });
  console.log('社区分类初始化完成:', communityCategory.name, 'ID:', communityCategory.id);

  // ========== 9. 创建社区帖子 ==========
  const posts = [
    {
      id: 1,
      content: '刚刚在咖啡厅遇到一个女生，她看了我一眼然后笑了，这是什么意思？',
      images: [],
      tags: ['脱单经验', '聊天技巧'],
      likes: 42,
      status: 'ACTIVE',
      isUrgent: false,
      rewardPoints: 0,
      resolved: false,
      userId: 'user-001',
      categoryId: communityCategory.id
    },
    {
      id: 2,
      content: '求助！女生说"我们还是做朋友吧"，该怎么回复才能逆转局面？',
      images: [],
      tags: ['情感求助'],
      likes: 128,
      status: 'ACTIVE',
      isUrgent: true,
      rewardPoints: 50,
      resolved: false,
      userId: 'user-001',
      categoryId: communityCategory.id
    },
    {
      id: 3,
      content: '分享一个今天成功的约会经历，用了话术库里的开场白，效果超棒！',
      images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'],
      tags: ['约会分享', '脱单经验'],
      likes: 256,
      status: 'ACTIVE',
      isUrgent: false,
      rewardPoints: 0,
      resolved: false,
      userId: 'user-001',
      categoryId: communityCategory.id
    }
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: post
    });
  }
  console.log('社区帖子初始化完成');

  // ========== 10. 初始化系统设置（排序标签）==========
  const defaultSortTabs = [
    { key: 'latest', label: '最新', sort: 'new', default: true },
    { key: 'hot', label: '最热', sort: 'hot' },
    { key: 'urgent', label: '急诊', sort: 'urgent' },
    { key: 'featured', label: '精华', sort: 'featured' },
    { key: 'following', label: '关注', sort: 'following' }
  ];

  await prisma.systemSetting.upsert({
    where: { key: 'postSortTabs' },
    update: {},
    create: {
      key: 'postSortTabs',
      value: defaultSortTabs,
      description: '社区帖子排序标签配置'
    }
  });
  console.log('系统设置初始化完成: 排序标签');





  // ========== 11. 初始化互动剧本小说数据 ==========
  console.log('开始初始化互动剧本...');
  const story = await prisma.interactiveStory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: '初恋的夏天 - 模拟约会',
      description: '回到那个充满阳光的午后，你是否能把握住机会，让她成为你的初恋？这不仅是一个故事，更是约会技巧的实战演练。',
      coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
      category: '校园纯爱',
      authorName: '官方团队',
      difficulty: 2,
      isPremium: false,
      pointsRequired: 0,
      status: 'ACTIVE'
    }
  });

  // 删除旧节点避免冲突
  await prisma.storyNode.deleteMany({ where: { storyId: story.id } });

  const node1 = await prisma.storyNode.create({
    data: {
      storyId: story.id,
      name: '开场：咖啡馆的偶遇',
      content: '午后的阳光透过咖啡馆的玻璃窗洒在她的侧脸上。她正看着一本书，面前的焦糖玛奇朵还冒着热气。你深吸一口气，走了过去。',
      speakerName: '旁白',
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
      isEnd: false
    }
  });

  const node2_good = await prisma.storyNode.create({
    data: {
      storyId: story.id,
      name: '进展：成功搭讪',
      content: '“这本书我也很喜欢，不过我觉得男主的决定太傻了。”她抬起头，眼睛里闪过一丝惊喜：“你也看东野圭吾？太巧了，快坐！”',
      speakerName: '林夏',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
      isEnd: false
    }
  });

  const node2_bad = await prisma.storyNode.create({
    data: {
      storyId: story.id,
      name: '进展：尴尬的开场',
      content: '“美女，可以加个微信吗？”她微微皱眉，把书合上：“抱歉，我男朋友去洗手间了，马上回来。”气氛瞬间降至冰点。',
      speakerName: '林夏',
      imageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=800&auto=format&fit=crop',
      isEnd: true
    }
  });

  const node3_end_good = await prisma.storyNode.create({
    data: {
      storyId: story.id,
      name: '结局：完美收官',
      content: '你们聊了一整个下午，从悬疑小说聊到喜欢的乐队。离开前，她主动拿出了手机：“如果不介意的话，扫个码？下次一起去看LIVE。”恭喜你，达成完美结局【心动的信号】！',
      speakerName: '旁白',
      isEnd: true
    }
  });

  // 创建选项关系
    await prisma.storyChoice.createMany({
    data: [
      {
        nodeId: node1.id,
        content: '观察她正在看的书，以此为话题切入',
        nextNodeId: node2_good.id,
        affectionChange: 15
      },
      {
        nodeId: node1.id,
        content: '直接走上去要微信，展示自信',
        nextNodeId: node2_bad.id,
        affectionChange: -20
      },
      {
        nodeId: node2_good.id,
        content: '顺着小说话题，展示你幽默的一面，并在高潮时提议加微信',
        nextNodeId: node3_end_good.id,
        affectionChange: 25
      }
    ]
  });
  console.log('互动剧本小说初始化完成');

}
main().catch((e) => { console.error("初始化失败:", e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
