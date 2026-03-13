const prisma = require('../utils/prisma');

/**
 * 添加收藏
 */
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误' });
    }

    // 检查是否已经收藏
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId: parseInt(targetId)
        }
      }
    });

    if (existing) {
      return res.status(200).json({ code: 200, message: '已经收藏过了' });
    }

    // 验证目标是否存在
    let targetExists = false;
    if (targetType === 'SCRIPT') {
      targetExists = await prisma.script.findUnique({ where: { id: parseInt(targetId) } });
    } else if (targetType === 'COURSE') {
      targetExists = await prisma.course.findUnique({ where: { id: parseInt(targetId) } });
    } else if (targetType === 'POST') {
      targetExists = await prisma.post.findUnique({ where: { id: parseInt(targetId) } });
    } else if (targetType === 'ARTICLE') {
      targetExists = await prisma.article.findUnique({ where: { id: parseInt(targetId) } });
    }

    if (!targetExists) {
      return res.status(404).json({ code: 404, message: '目标内容不存在' });
    }

    await prisma.favorite.create({
      data: {
        userId,
        targetType,
        targetId: parseInt(targetId)
      }
    });

    res.json({ code: 200, message: '收藏成功' });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

/**
 * 取消收藏
 */
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId: parseInt(targetId)
        }
      }
    });

    if (!existing) {
      return res.status(200).json({ code: 200, message: '未收藏该内容' });
    }

    await prisma.favorite.delete({
      where: {
        id: existing.id
      }
    });

    res.json({ code: 200, message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

/**
 * 检查是否已收藏
 */
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误' });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId: parseInt(targetId)
        }
      }
    });

    res.json({
      code: 200,
      data: {
        isFavorited: !!favorite
      }
    });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

/**
 * 获取我的收藏列表
 */
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereCondition = { userId };
    if (type) {
      whereCondition.targetType = type;
    }

    const [total, favorites] = await Promise.all([
      prisma.favorite.count({ where: whereCondition }),
      prisma.favorite.findMany({
        where: whereCondition,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // 由于是通用表，需要分别查询对应的实体数据
    const result = await Promise.all(favorites.map(async (fav) => {
      let detail = null;
      if (fav.targetType === 'SCRIPT') {
        detail = await prisma.script.findUnique({ where: { id: fav.targetId }, include: { category: true } });
      } else if (fav.targetType === 'COURSE') {
        detail = await prisma.course.findUnique({ where: { id: fav.targetId } });
      } else if (fav.targetType === 'POST') {
        detail = await prisma.post.findUnique({ where: { id: fav.targetId }, include: { user: { select: { name: true, avatar: true } } } });
      } else if (fav.targetType === 'ARTICLE') {
        detail = await prisma.article.findUnique({ where: { id: fav.targetId } });
      }

      return {
        id: fav.id,
        targetType: fav.targetType,
        targetId: fav.targetId,
        createdAt: fav.createdAt,
        detail
      };
    }));

    // 过滤掉可能已经被删除的实体
    const validResult = result.filter(item => item.detail !== null);

    res.json({
      code: 200,
      data: {
        list: validResult,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};
