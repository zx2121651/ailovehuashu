/**
 * 模拟调用 AI 大模型生成高情商回复
 */
exports.generateReply = (req, res) => {
  const { prompt, tone } = req.body;

  if (!prompt) {
    return res.status(400).json({ code: 400, message: "请提供对方说的话(prompt)" });
  }

  // 模拟 AI 思考延迟 (1.5秒)
  setTimeout(() => {
    let suggestions = [];

    // 简单的关键词匹配模拟 AI 逻辑
    if (prompt.includes('早安')) {
      suggestions = [
        { label: '方案A：甜言蜜语', text: '早安！昨晚睡得好吗？我可是梦到你了哦。', color: 'pink' },
        { label: '方案B：幽默拉扯', text: '这么早就醒了？是不是想我想得睡不着？', color: 'blue' }
      ];
    } else if (prompt.includes('朋友')) {
      suggestions = [
        { label: '方案A：以退为进', text: '好啊，那作为朋友，周末请我喝杯奶茶不过分吧？', color: 'blue' },
        { label: '方案B：幽默化解', text: '其实我也这么想，做恋人容易吵架，做朋友我就可以理直气壮地蹭你饭了。', color: 'purple' }
      ];
    } else {
      // 默认万能回复
      suggestions = [
        { label: '方案A：顺势而为', text: `我觉得你说的挺有意思，让我对你有了一个新的认识。`, color: 'blue' },
        { label: '方案B：反向推拉', text: '哈哈，被你发现了，那还不赶紧奖励我一朵小红花？', color: 'purple' }
      ];
    }

    res.json({
      code: 200,
      message: "生成成功",
      data: {
        analysis: "对方可能是在测试你的反应边界，建议保持轻松幽默的态度来化解。",
        suggestions
      }
    });
  }, 1500);
};

/**
 * 语境粘贴生成（对标「心动恋聊/恋爱键盘」核心能力）
 * 输入对方原话 → 情绪阶梯拆解 → 多风格回复选项
 */
exports.generateContextReply = async (req, res) => {
  const { context = '', stage = '暧昧期', style = 'all', personality, count = 4 } = req.body;

  if (!context.trim()) {
    return res.status(400).json({ code: 400, message: "请粘贴对方说的话(context)" });
  }

  const picked = (context || '').trim().slice(0, 12);

  // 1) 情绪阶梯拆解（共情 → 价值 → 试探拉升）
  const ladder = stage === '闹别扭' || stage === '吵架'
    ? ['先接住情绪、不争对错', '承认TA的感受并给台阶', '用一个爱的行动收尾']
    : ['共情回应：让TA觉得被懂', '价值赋能：给到安全感与期待', '试探拉升：自然递进关系'];

  // 2) 多风格文案池
  const pool = [
    { key: '高情商', color: 'blue', text: stage === '闹别扭' || stage === '吵架'
        ? `${picked}…我知道你现在肯定很难受，这件事怪我没注意到你的感受。不争谁对谁错，我只想让你知道我一直都在。`
        : `${picked}…你这句话让我对你又多了一层新的认识，越来越觉得遇见你真的很特别。` },
    { key: '幽默接梗', color: 'purple', text: stage === '闹别扭' || stage === '吵架'
        ? `我现在申请当你的「专职消气师」成功吗？包吃住的，佣金只要你一个笑~ ${picked}这种事交给明天的我去烦恼！`
        : `哈哈被你句话说到了，小本本记下了。下次见面你得请我喝奶茶，不然我就去“报复”你。` },
    { key: '直球勇', color: 'red', text: `${picked}…说认真的，我其实挺喜欢和你聊天，也很想多了解你一点，缺一个继续聊下去的机会，你会给吗？` },
    { key: '撒娇软化', color: 'pink', text: `${picked}…哼，你还学会套路我啦！不过这句话我先收藏了，等我心情好了再好好治你~` },
    { key: '暖心情话', color: 'green', text: `听你说${picked ? '这些' : ''}，我就想让你知道：别人怎么想我不在乎，你的心情我是在乎的。` }
  ];

  const styleMap = {
    '高情商': '高情商', '幽默接梗': '幽默接梗', '直球勇': '直球勇', '撒娇软化': '撒娇软化', '暖心情话': '暖心情话'
  };

  let selected;
  if (style === 'all') selected = pool;
  else selected = pool.filter(p => styleMap[style] === p.key).length ? pool.filter(p => styleMap[style] === p.key) : pool;

  const suggestions = selected.slice(0, count).map((s, i) => ({ ...s, label: `方案${'ABCD'[i]} · ${s.key}` }));

  // 3) 个性化（基于恋爱人格画像）
  let personalized = '';
  if (personality) {
    const tip = {
      '浪漫画家': '你偏共情型，这组方案里「暖心情话」最适合你。',
      '理性推拉大师': '你偏策略型，「幽默接梗/直球」跟你气质最搭。',
      '阳光行动派': '你偏主动型，直接选「直球勇」成功率更高。'
    }[personality] || '结合你的画像，优先使用与你人格匹配的风格。';
    personalized = tip;
  }

  setTimeout(() => {
    res.json({
      code: 200,
      message: "生成成功",
      data: {
        emotionLadder: ladder,
        analysis: `对方说“${context.trim().slice(0, 20) || '这句话'}”，可能是想在${stage}阶段测试你的反应。先接住情绪，再递进关系。`,
        styleUsed: style === 'all' ? '多风格混排' : style,
        personalized,
        suggestions
      }
    });
  }, 800);
};
