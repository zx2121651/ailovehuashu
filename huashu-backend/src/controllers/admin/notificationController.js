const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      code: 200,
      success: true,
      message: '获取推送列表成功',
      data: { list: notifications, total: notifications.length }
    });
  } catch (error) {
    console.error('获取推送列表失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, content, target, specificUsers, isScheduled, scheduledTime } = req.body;

    const sendTime = isScheduled && scheduledTime ? new Date(scheduledTime) : new Date();
    const status = isScheduled ? 'PENDING' : 'SENT';

    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        target,
        status,
        sendTime,
        successCount: status === 'SENT' ? Math.floor(Math.random() * 1000) : 0
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '创建推送成功',
      data: notification
    });
  } catch (error) {
    console.error('创建推送失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({
      where: { id: Number(id) }
    });

    res.json({
      code: 200,
      success: true,
      message: '删除推送成功'
    });
  } catch (error) {
    console.error('删除推送失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  deleteNotification
};
