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
