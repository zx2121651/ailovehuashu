const prisma = require('../../utils/prisma');

// 获取所有评论（分页、搜索、过滤）
exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '', targetType = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where = {};

    if (keyword) {
      where.content = { contains: keyword, mode: 'insensitive' };
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (status) {
      where.status = status;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.comment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        list: comments,
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Admin get comments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更改评论状态 (审核/隐藏)
exports.updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'HIDDEN', 'DELETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Admin update comment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Admin delete comment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};