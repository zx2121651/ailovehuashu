/**
 * 生活方式 / 情感增值控制器
 * 覆盖四大头部对标功能：
 *  1) 恋爱人格测评 -> AI 个性化画像   (对标 Soul MBTI)
 *  2) 装扮中心：头像框 / 徽章 / 虚拟礼物  (对标 Soul 情绪价值虚拟物品)
 *  3) 纪念日 / 恋爱天数  (对标 恋爱记 / 小恩爱)
 */
// 复用全局共享 Prisma 实例；DB 未就绪时优雅降级为 mock，保证联调可用
let prisma = null;
try {
  prisma = require('../utils/prisma');
} catch (e) {
  prisma = null;
}

/* ---------------- 恋爱人格测评 ---------------- */

const LOVERS = [
  { type: '浪漫画家', emoji: '🎨', traits: ['共情', '细腻', '浪漫'], style: '暖心情话',
    desc: '你拥有敏锐的情绪雷达，能第一时间读懂对方心思。适合用走心的情话与共情来升温关系，让暧昧变得有质感。',
    opening: '嗨，我猜你今天心情不错——因为遇见好天气的人，眼里会有光。先认识一下？' },
  { type: '理性推拉大师', emoji: '♟️', traits: ['策略', '幽默', '推拉'], style: '幽默接梗',
    desc: '你擅长制造张弛有度的聊天节奏，幽默是你的破冰利器。适合用接梗与欲擒故纵制造稀缺感，让对方追着你聊。',
    opening: '通常我不会轻易加人，但你这条动态挺特别。赌一包辣条，我们聊三句你就会被逗笑。' },
  { type: '阳光行动派', emoji: '🌞', traits: ['主动', '真诚', '直接'], style: '直球勇',
    desc: '你热情直接，最擅长把心动变成行动。适合用真诚的直球与邀约快速推进关系，避免因为套路而错过。',
    opening: '第一眼就被你吸引了，我这个人不喜欢绕弯子——周末有空的话，想约你喝杯咖啡了解一下彼此。' }
];

exports.getAssessmentQuestions = (req, res) => {
  // 供前端渲染测评问卷源（该份题目为产品演示用简化版）
  res.json({ code: 200, data: SOURCE_QUESTIONS });
};

// 测评题目（简化版）
const SOURCE_QUESTIONS = [
  { id: 1, q: '和喜欢的人冷场了，你的第一反应是？', options: [{ v: 'a', t: '主动换个话题暖场' }, { v: 'b', t: '抛个幽默段子试探' }, { v: 'c', t: '直接问对方想聊什么' }] },
  { id: 2, q: 'TA 发来一句负能量抱怨，你会怎么接？', options: [{ v: 'a', t: '共情安慰，先稳住情绪' }, { v: 'b', t: '幽默化解 逗TA开心' }, { v: 'c', t: '给出解决办法并约见面' }] },
  { id: 3, q: '表白被拒绝了，你会？', options: [{ v: 'a', t: '温柔表达理解 继续陪伴' }, { v: 'b', t: '优雅退后 保留余味联系' }, { v: 'c', t: '坦诚心意 至此不再纠缠' }] },
  { id: 4, q: '聊天中你最看重的是？', options: [{ v: 'a', t: 'TA 的情绪和感受' }, { v: 'b', t: '聊天的节奏和趣味' }, { v: 'c', t: '关系和进度的发展' }] },
  { id: 5, q: '朋友送了个难题让你在恋爱中做选择，你更倾向？', options: [{ v: 'a', t: '怎么让彼此都舒服' }, { v: 'b', t: '怎么显得从容有魅力' }, { v: 'c', t: '怎么快速推进关系' }] }
];

exports.submitAssessment = async (req, res) => {
  const { answers = [] } = req.body; // [{id, v:'a'|'b'|'c'}]
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ code: 400, message: '请先完成测评题目' });
  }

  // 统计倾向：a=共情 / b=策略 / c=行动
  let a = 0, b = 0, c = 0;
  answers.forEach(ans => {
    if (ans.v === 'a') a++;
    else if (ans.v === 'b') b++;
    else if (ans.v === 'c') c++;
  });

  const type = c >= Math.max(a, b) && c > 0 ? '阳光行动派' : (b >= a ? '理性推拉大师' : '浪漫画家');
  const result = LOVERS.find(l => l.type === type);

  const aiSuggestion = { type: result.type, style: result.style, opening: result.opening };
  // 持久化到 User.lovePalette（auth 中间件注入的是 req.user.userId）
  const userId = req.user?.userId;
  let saved = false;
  if (prisma && userId) {
    try {
      await prisma.user.update({ where: { id: userId }, data: { lovePalette: JSON.stringify(result) } });
      saved = true;
    } catch (e) {}
  }

  res.json({ code: 200, data: { ...result, score: { a, b, c }, aiSuggestion, saved } });
};

/* ---------------- 装扮中心：头像框/徽章 ---------------- */

const SKINS = [
  { id: 'frame_pink', kind: 'frame', name: '初恋粉框', price: 0, badge: false, type: 'free',
    css: 'border-2 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,.5)]' },
  { id: 'frame_gold', kind: 'frame', name: '星光金框', price: 500, badge: false, type: 'points',
    css: 'border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,.5)]' },
  { id: 'frame_grad', kind: 'frame', name: '心动渐变框', price: 1500, badge: false, type: 'points', vipOnly: true,
    css: 'p-[3px] bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-400 rounded-full shadow-[0_0_16px_rgba(236,72,153,.45)]' },
  { id: 'badge_egg', kind: 'badge', name: '恋爱新手', price: 0, badge: true, type: 'free', css: 'bg-emerald-400' },
  { id: 'badge_sweet', kind: 'badge', name: '甜言蜜语', price: 300, badge: true, type: 'points', css: 'bg-pink-400' },
  { id: 'badge_god', kind: 'badge', name: '情圣', price: null, badge: true, type: 'vip', vipOnly: true, css: 'bg-gradient-to-tr from-amber-400 to-yellow-500' }
];

const DEFAULT_OWNED = ['frame_pink', 'badge_egg']; // 默认赠送基础款

// 读取用户已拥有装扮（DB 存的是 JSON 字符串，需异步查询）
async function getOwnedSkins(userId) {
  if (!prisma || !userId) return DEFAULT_OWNED;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { ownedSkins: true } });
    const owned = user?.ownedSkins ? JSON.parse(user.ownedSkins) : null;
    return Array.isArray(owned) && owned.length ? owned : DEFAULT_OWNED;
  } catch (e) {
    return DEFAULT_OWNED;
  }
}

async function persistOwned(userId, owned) {
  if (!prisma || !userId) return;
  try { await prisma.user.update({ where: { id: userId }, data: { ownedSkins: JSON.stringify(owned) } }); } catch (e) {}
}

function isVipUser(user) {
  return !!(user?.vipExpireAt && new Date(user.vipExpireAt).getTime() > Date.now());
}

exports.getSkins = async (req, res) => {
  const owned = await getOwnedSkins(req.user?.userId);
  res.json({ code: 200, data: { list: SKINS, owned } });
};

exports.purchaseSkin = async (req, res) => {
  const { skinId } = req.body;
  const skin = SKINS.find(s => s.id === skinId);
  if (!skin) return res.status(400).json({ code: 400, message: '装扮不存在' });
  const userId = req.user?.userId;
  const owned = await getOwnedSkins(userId);
  if (owned.includes(skinId)) return res.json({ code: 200, data: { ok: true, owned, message: '已拥有' } });

  if (skin.type === 'free') {
    const newOwned = [...owned, skinId];
    await persistOwned(userId, newOwned);
    return res.json({ code: 200, data: { ok: true, owned: newOwned, message: '已添加' } });
  }

  // DB 不可用（降级演示模式）：直接放行，前端本地兜底
  if (!prisma || !userId) {
    return res.json({ code: 200, data: { ok: true, owned: [...owned, skinId], message: '购买成功' } });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
  if (skin.vipOnly && !isVipUser(user)) {
    return res.json({ code: 403, data: { ok: false, message: '该装扮为会员专属' } });
  }
  // 积分购买：校验并扣减
  if (skin.type === 'points' && (user?.points || 0) < skin.price) {
    return res.json({ code: 402, data: { ok: false, message: '积分不足' } });
  }

  const newOwned = [...owned, skinId];
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ownedSkins: JSON.stringify(newOwned),
        ...(skin.type === 'points' ? { points: { decrement: skin.price } } : {})
      }
    });
  } catch (e) {}
  res.json({ code: 200, data: { ok: true, owned: newOwned, message: '购买成功' } });
};

/* ---------------- 虚拟礼物 ---------------- */

exports.sendGift = async (req, res) => {
  const { to, giftId = 'gift_rose' } = req.body;
  const gifts = { gift_rose: { name: '心动玫瑰', points: 20 }, gift_beer: { name: '快乐啤酒', points: 30 }, gift_ring: { name: '订婚戒指', points: 200 } };
  const g = gifts[giftId] || gifts.gift_rose;
  const userId = req.user?.userId;

  // 校验并扣减积分（DB 不可用时跳过，演示模式直接成功）
  if (prisma && userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if ((user?.points || 0) < g.points) {
        return res.json({ code: 402, data: { ok: false, message: '积分不足' } });
      }
      await prisma.user.update({ where: { id: userId }, data: { points: { decrement: g.points } } });
    } catch (e) {}
  }
  res.json({ code: 200, data: { ok: true, to, ...g, message: `已送出「${g.name}」` } });
};

/* ---------------- 纪念日 / 恋爱天数 ---------------- */

exports.getMemorial = async (req, res) => {
  const userId = req.user?.userId;
  let start = null;
  if (prisma && userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.loveStartDate) start = user.loveStartDate;
    } catch (e) {}
  }
  const startStr = start || dateOnly(new Date(new Date().setDate(new Date().getDate() - 120))); // 默认 120 天前演示
  res.json({ code: 200, data: { startDate: startStr, days: calcDays(startStr), nextAnniversary: nextAnniversaryDays(startStr) } });
};

exports.saveMemorial = async (req, res) => {
  const { startDate } = req.body;
  if (!startDate) return res.status(400).json({ code: 400, message: '请选择开始日期' });
  const userId = req.user?.userId;
  let saved = false;
  if (prisma && userId) {
    try {
      await prisma.user.update({ where: { id: userId }, data: { loveStartDate: startDate } });
      saved = true;
    } catch (e) {}
  }
  res.json({ code: 200, data: { ok: true, saved, startDate, days: calcDays(startDate), nextAnniversary: nextAnniversaryDays(startDate) } });
};

/* ---- 工具 ---- */
function dateOnly(d) { return d.toISOString().split('T')[0]; }
function calcDays(start) { return Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 86400000)); }
function nextAnniversaryDays(start) {
  const s = new Date(start); const now = new Date();
  let a = new Date(now.getFullYear(), s.getMonth(), s.getDate());
  if (a.getTime() <= now.getTime()) a.setFullYear(now.getFullYear() + 1);
  return Math.ceil((a.getTime() - now.getTime()) / 86400000);
}