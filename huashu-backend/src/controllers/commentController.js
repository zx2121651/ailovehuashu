const prisma = require('../utils/prisma');

// 创建评论 (App 端)
exports.createComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetType, targetId, content } = req.body;

    if (!targetType || !targetId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const validTypes = ['SCRIPT', 'ARTICLE', 'COURSE', 'POST'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid target type' });
    }

    const comment = await prisma.comment.create({
      data: {
        targetType,
        targetId: parseInt(targetId),
        content,
        userId
      },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      }
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 获取评论列表 (App 端)
exports.getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user?.userId; // user might be undefined if not logged in

    const comments = await prisma.comment.findMany({
      where: {
        targetType,
        targetId: parseInt(targetId),
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      }
    });

    // If user is logged in, attach `hasLiked` field to each comment
    let finalComments = comments;
    if (userId && comments.length > 0) {
      const likedCommentIds = await prisma.commentLike.findMany({
        where: {
          userId,
          commentId: { in: comments.map(c => c.id) }
        },
        select: { commentId: true }
      });
      const likedSet = new Set(likedCommentIds.map(l => l.commentId));

      finalComments = comments.map(c => ({
        ...c,
        hasLiked: likedSet.has(c.id)
      }));
    } else {
      finalComments = comments.map(c => ({ ...c, hasLiked: false }));
    }

    res.json({ success: true, data: finalComments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 点赞或取消点赞评论 (App 端)
exports.toggleLikeComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const commentId = parseInt(req.params.id);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId }
      }
    });

    let newLikesCount;

    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.commentLike.delete({ where: { id: existingLike.id } }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likes: { decrement: 1 } }
        })
      ]);
      newLikesCount = Math.max(0, comment.likes - 1);
      return res.json({ success: true, data: { isLiked: false, likes: newLikesCount } });
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.commentLike.create({
          data: { userId, commentId }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likes: { increment: 1 } }
        })
      ]);
      newLikesCount = comment.likes + 1;
      return res.json({ success: true, data: { isLiked: true, likes: newLikesCount } });
    }
  } catch (error) {
    console.error('Toggle like comment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
