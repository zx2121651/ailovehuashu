const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getLogs = async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      code: 200,
      success: true,
      message: '获取操作日志列表成功',
      data: { list: logs, total: logs.length }
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getLogs
};
