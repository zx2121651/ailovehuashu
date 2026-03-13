const fs = require('fs');
const path = 'huashu-backend/src/controllers/userController.js';
let content = fs.readFileSync(path, 'utf8');

const signinRegex = /exports\.dailySignIn = async \(req, res\) => {[\s\S]*?}(?=\n\nexports\.exchangeVip)/;

const newSignin = `exports.dailySignIn = async (req, res) => {
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
}`;

if (content.match(signinRegex)) {
  content = content.replace(signinRegex, newSignin);
} else {
  // If not found, append it
  content += "\n\n" + newSignin + "\n";
}

fs.writeFileSync(path, content, 'utf8');
