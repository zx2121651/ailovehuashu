const prisma = require('../utils/prisma');

/**
 * 提交原创话术 (UGC)
 */
exports.submitContribution = async (req, res) => {
  const { categoryId, question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ code: 400, message: "问句和答句不能为空" });
  }

  try {
    // 获取当前用户
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(401).json({ code: 401, message: "请先登录" });
    }

    const newContribution = await prisma.contribution.create({
      data: {
        userId: user.id,
        categoryId: categoryId ? parseInt(categoryId) : null,
        question,
        answer,
        status: 'pending',
        time: new Date().toISOString().split('T')[0],
        likes: 0,
        reason: null
      }
    });

    res.json({
      code: 200,
      message: "提交成功，等待审核",
      data: newContribution
    });
  } catch (error) {
    console.error('提交投稿错误:', error);
    res.status(500).json({ code: 500, message: "提交失败" });
  }
};

/**
 * 获取我的投递记录
 */
exports.getMyContributions = async (req, res) => {
  try {
    // 获取当前用户
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(401).json({ code: 401, message: "请先登录" });
    }

    const contributions = await prisma.contribution.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      code: 200,
      message: "获取成功",
      data: contributions
    });
  } catch (error) {
    console.error('获取投稿记录错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};
