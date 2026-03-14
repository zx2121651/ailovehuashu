const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      code: 200,
      success: true,
      message: '获取反馈列表成功',
      data: { list: feedbacks, total: feedbacks.length }
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const replyFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const feedback = await prisma.feedback.update({
      where: { id: Number(id) },
      data: {
        reply,
        status: 'REPLIED'
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '回复反馈成功',
      data: feedback
    });
  } catch (error) {
    console.error('回复反馈失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.feedback.delete({
      where: { id: Number(id) }
    });

    res.json({
      code: 200,
      success: true,
      message: '删除反馈成功'
    });
  } catch (error) {
    console.error('删除反馈失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getFeedbacks, replyFeedback, deleteFeedback
};
