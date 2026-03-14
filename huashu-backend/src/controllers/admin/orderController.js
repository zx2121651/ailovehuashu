const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all orders with pagination and filtering
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '获取订单列表成功',
      data: {
        list: orders,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getOrders
};
