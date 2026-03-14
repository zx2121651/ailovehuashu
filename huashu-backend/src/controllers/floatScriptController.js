const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 用户端：获取启用的悬浮窗话术（带 VIP 校验）
exports.getFloatScripts = async (req, res) => {
  try {
    const user = req.user; // 从 auth 中间件获取

    // 检查是否为 VIP
    const isVip = user && user.vipExpireAt && new Date(user.vipExpireAt) > new Date();

    if (!isVip) {
      return res.status(403).json({
        success: false,
        message: '此功能为 VIP 专属，请先开通或续费 VIP'
      });
    }

    const scripts = await prisma.floatScript.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: scripts
    });
  } catch (error) {
    console.error('Get float scripts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 管理端：获取所有悬浮窗话术（支持分页和搜索）
exports.adminGetFloatScripts = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = keyword ? {
      OR: [
        { question: { contains: keyword, mode: 'insensitive' } },
        { answer: { contains: keyword, mode: 'insensitive' } }
      ]
    } : {};

    const [scripts, total] = await Promise.all([
      prisma.floatScript.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ order: 'desc' }, { createdAt: 'desc' }]
      }),
      prisma.floatScript.count({ where })
    ]);

    res.json({
      success: true,
      data: scripts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get float scripts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 管理端：创建悬浮窗话术
exports.adminCreateFloatScript = async (req, res) => {
  try {
    const { question, answer, category, isActive, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const newScript = await prisma.floatScript.create({
      data: {
        question,
        answer,
        category: category || '默认',
        isActive: isActive !== undefined ? isActive : true,
        order: parseInt(order) || 0
      }
    });

    res.status(201).json({ success: true, data: newScript });
  } catch (error) {
    console.error('Admin create float script error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 管理端：更新悬浮窗话术
exports.adminUpdateFloatScript = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, isActive, order } = req.body;

    const script = await prisma.floatScript.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order: parseInt(order) })
      }
    });

    res.json({ success: true, data: script });
  } catch (error) {
    console.error('Admin update float script error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 管理端：删除悬浮窗话术
exports.adminDeleteFloatScript = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.floatScript.delete({ where: { id } });
    res.json({ success: true, message: 'Float script deleted successfully' });
  } catch (error) {
    console.error('Admin delete float script error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
