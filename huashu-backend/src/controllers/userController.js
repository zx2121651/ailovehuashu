const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huashu_user_secret_key_2026';

/**
 * 微信小程序登录 (模拟)
 * 接收微信的 code，返回 token 和用户信息
 */
exports.wxLogin = async (req, res) => {
  const { code, inviteCode } = req.body;

  if (!code) {
    return res.status(400).json({ code: 400, message: "缺少 code 参数" });
  }

  try {
    // 模拟微信 openId 为 code 的值
    const mockOpenId = `wx_${code}`;
    let user = null;

    try {
      // 我们如果传的不是真正的 wx_xxx，尝试看看系统里有没有默认用户来应对当前前端的无状态请求
      if (code.startsWith('USER_')) {
         user = await prisma.user.findUnique({ where: { wxOpenId: mockOpenId } });
      } else {
         user = await prisma.user.findFirst();
      }

      if (!user) {
        // 检查邀请码
        let inviterId = null;
        if (inviteCode) {
          const inviter = await prisma.user.findUnique({ where: { inviteCode } });
          if (inviter) inviterId = inviter.id;
        }

        const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

        // 创建新用户
        user = await prisma.user.create({
          data: {
            wxOpenId: mockOpenId,
            name: `新用户_${Math.floor(Math.random() * 1000)}`,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
            gender: "男生",
            bio: "开启聊天新旅程...",
            daysLearned: 1,
            rank: "新手",
            points: 10,
            isVip: false,
            inviteCode: generateInviteCode(),
            inviterId
          }
        });
      }
    } catch (dbError) {
      console.warn("数据库连接失败，使用本地降级 Mock 用户", dbError.message);
      user = {
        id: 'mock_user_8848',
        name: '体验用户(降级)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
        isVip: false
      };
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: "登录成功",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isVip: user.isVip,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ code: 500, message: "登录失败" });
  }
};

/**
 * 获取个人资料主页信息
 */
exports.getProfile = async (req, res) => {
  try {
    // 实际应用中应该通过请求头中的 token 解析出 userId
    let user;
    if (req.user && req.user.userId) {
       user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    } else {
       user = await prisma.user.findFirst();
    }

    if (!user) {
      return res.status(404).json({ code: 404, message: "用户不存在" });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: user // This will now include `role` because we added it to schema
    });
  } catch (error) {
    console.error('获取资料错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 修改个人资料
 */
exports.updateProfile = async (req, res) => {
  const updates = req.body;

  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return res.status(404).json({ code: 404, message: "用户不存在" });
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates
    });

    res.json({
      code: 200,
      message: "资料更新成功",
      data: updatedUser
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ code: 500, message: "更新失败" });
  }
};

/**
 * 提升或修改用户角色 (由管理员调用)
 */
exports.updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.json({
      code: 200,
      message: `用户角色已更新为 ${role}`,
      data: updatedUser
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ code: 500, message: "更新失败" });
  }
};

/**
 * 每日签到 / 开启盲盒
 */
exports.dailySignIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ code: 404, message: "用户不存在" });

    const now = new Date();
    const lastSignIn = user.lastSignInAt;

    // 判断是否同一天
    if (lastSignIn) {
      const isSameDay = lastSignIn.getFullYear() === now.getFullYear() &&
                        lastSignIn.getMonth() === now.getMonth() &&
                        lastSignIn.getDate() === now.getDate();
      if (isSameDay) {
        return res.status(400).json({ code: 400, message: "今天已经签到过了哦" });
      }
    }

    let continuousDays = 1;
    if (lastSignIn) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = lastSignIn.getFullYear() === yesterday.getFullYear() &&
                          lastSignIn.getMonth() === yesterday.getMonth() &&
                          lastSignIn.getDate() === yesterday.getDate();
      if (isYesterday) {
        continuousDays = user.continuousSignDays + 1;
      }
    }

    // 计算奖励积分
    let earnedPoints = 10; // 基础 10 积分
    let isBigPrize = false;
    if (continuousDays > 0 && continuousDays % 7 === 0) {
      earnedPoints += 50; // 连续 7 天额外奖励 50
      isBigPrize = true;
    }

    // 获取盲盒内容
    // 优先从 BlindBoxCard 获取
    const cardCount = await prisma.blindBoxCard.count({ where: { status: 'ACTIVE' } });
    let blindBoxContent = null;
    if (cardCount > 0) {
      const skip = Math.floor(Math.random() * cardCount);
      const card = await prisma.blindBoxCard.findFirst({
        where: { status: 'ACTIVE' },
        skip: skip
      });
      blindBoxContent = card;
    } else {
      // 兜底从 Script 中随机获取一条
      const scriptCount = await prisma.script.count();
      if (scriptCount > 0) {
        const skip = Math.floor(Math.random() * scriptCount);
        const script = await prisma.script.findFirst({ skip: skip });
        blindBoxContent = { type: 'SCRIPT', content: script.question, author: '系统推荐' };
      }
    }

    // 更新用户数据
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: earnedPoints },
        lastSignInAt: now,
        continuousSignDays: continuousDays
      }
    });

    res.json({
      code: 200,
      message: "签到成功",
      data: {
        earnedPoints,
        isBigPrize,
        totalPoints: updatedUser.points,
        continuousDays: updatedUser.continuousSignDays,
        blindBox: blindBoxContent
      }
    });

  } catch (error) {
    console.error('签到失败:', error);
    res.status(500).json({ code: 500, message: "签到失败，请稍后重试" });
  }
};

/**
 * 积分兑换 VIP
 */
exports.exchangeVip = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pointsToUse, daysToGet } = req.body; // 例: pointsToUse = 100, daysToGet = 1

    if (!pointsToUse || !daysToGet) {
      return res.status(400).json({ code: 400, message: "无效的兑换参数" });
    }

    // 这里可以硬编码兑换比例，确保安全
    if (pointsToUse / daysToGet !== 100) {
       return res.status(400).json({ code: 400, message: "兑换比例错误 (100积分=1天)" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ code: 404, message: "用户不存在" });

    if (user.points < pointsToUse) {
      return res.status(400).json({ code: 400, message: "积分不足，无法兑换" });
    }

    const now = new Date();
    let newExpireAt = now;
    if (user.vipExpireAt && user.vipExpireAt > now) {
      newExpireAt = new Date(user.vipExpireAt);
    }

    // 延长 VIP 时间
    newExpireAt.setDate(newExpireAt.getDate() + daysToGet);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { decrement: pointsToUse },
        isVip: true,
        vipExpireAt: newExpireAt
      }
    });

    res.json({
      code: 200,
      message: "兑换成功！",
      data: {
        points: updatedUser.points,
        vipExpireAt: updatedUser.vipExpireAt
      }
    });
  } catch (error) {
    console.error('兑换失败:', error);
    res.status(500).json({ code: 500, message: "兑换失败，请稍后重试" });
  }
};


exports.dailySignIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });

    const now = new Date();
    const lastSignIn = user.lastSignInAt ? new Date(user.lastSignInAt) : null;

    // Check if already signed in today (basic check by date string)
    if (lastSignIn && lastSignIn.toDateString() === now.toDateString()) {
      return res.status(400).json({ code: 400, message: '今天已经签到过啦' });
    }

    let continuousDays = user.continuousSignDays || 0;

    // If last sign in was yesterday, increment, else reset
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (lastSignIn && lastSignIn.toDateString() === yesterday.toDateString()) {
      continuousDays += 1;
    } else {
      continuousDays = 1;
    }

    const isBigPrize = continuousDays % 7 === 0;
    const earnedPoints = isBigPrize ? 50 : 10;

    // Fetch a random blind box card
    const cards = await prisma.blindBoxCard.findMany({ where: { status: 'ACTIVE' } });
    let blindBox = null;
    if (cards.length > 0) {
       blindBox = cards[Math.floor(Math.random() * cards.length)];
    } else {
       // Fallback mock card
       blindBox = { type: 'QUOTE', content: '早安！这不仅是一个问候，更是我想你的证明。', author: '苏苏导师' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: earnedPoints },
        continuousSignDays: continuousDays,
        lastSignInAt: now
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '签到成功',
      data: {
        earnedPoints,
        isBigPrize,
        totalPoints: updatedUser.points,
        continuousDays: updatedUser.continuousSignDays,
        blindBox
      }
    });
  } catch (error) {
    console.error('dailySignIn error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
}
