const prisma = require('../utils/prisma');

// 获取帖子分类列表 (公开)
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { type: 'POST' },
      orderBy: { id: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 获取帖子排序标签配置 (公开)
exports.getSortTabs = async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'postSortTabs' }
    });
    
    // 如果没有配置，返回默认值
    const defaultTabs = [
      { key: 'latest', label: '最新', sort: 'new', default: true },
      { key: 'hot', label: '最热', sort: 'hot' },
      { key: 'urgent', label: '急诊', sort: 'urgent' },
      { key: 'featured', label: '精华', sort: 'featured' },
      { key: 'following', label: '关注', sort: 'following' }
    ];
    
    const tabs = setting?.value || defaultTabs;
    res.json({ success: true, data: tabs });
  } catch (error) {
    console.error('Get sort tabs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 举报帖子
exports.reportPost = async (req, res) => {
  try {
    const reporterId = req.user.userId;
    const postId = parseInt(req.params.id);
    const { reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: '举报原因不能为空' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // 可选：检查用户是否已举报过该贴
    const existingReport = await prisma.report.findFirst({
      where: { reporterId, postId }
    });

    if (existingReport) {
      return res.status(400).json({ success: false, message: '您已经举报过该帖子，我们正在处理中。' });
    }

    const report = await prisma.report.create({
      data: {
        reason,
        details: details || null,
        reporterId,
        postId
      }
    });

    res.status(201).json({ success: true, message: '举报成功，我们将尽快处理。', data: report });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content, images = [], tags = [], categoryId, isUrgent = false, rewardPoints = 0 } = req.body;

    if (!content && images.length === 0) {
      return res.status(400).json({ success: false, message: '内容和图片不能同时为空' });
    }

    let user;
    if (isUrgent) {
      if (rewardPoints <= 0) {
         return res.status(400).json({ success: false, message: '悬赏积分必须大于 0' });
      }
      user = await prisma.user.findUnique({ where: { id: userId } });
      if (user.points < rewardPoints) {
        return res.status(400).json({ success: false, message: '积分不足，无法发布此悬赏' });
      }
    }

    const postData = {
      content,
      images,
      tags,
      categoryId: categoryId ? parseInt(categoryId) : null,
      userId,
      isUrgent,
      rewardPoints: isUrgent ? parseInt(rewardPoints) : 0,
      expireAt: isUrgent ? new Date(Date.now() + 60 * 60 * 1000) : null // 默认1小时后过期
    };

    let post;
    if (isUrgent && rewardPoints > 0) {
      // 使用事务：扣除积分并创建帖子
      const [newPost, _updatedUser] = await prisma.$transaction([
        prisma.post.create({
          data: postData,
          include: {
            user: { select: { name: true, avatar: true, role: true } },
            category: true
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { points: { decrement: parseInt(rewardPoints) } }
        })
      ]);
      post = newPost;
    } else {
      post = await prisma.post.create({
        data: postData,
        include: {
          user: { select: { name: true, avatar: true, role: true } },
          category: true
        }
      });
    }

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 采纳急救悬赏回复
exports.acceptUrgentAnswer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = parseInt(req.params.id);
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ success: false, message: '请提供要采纳的回复ID' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.userId !== userId) {
      return res.status(403).json({ success: false, message: '只有发帖人可以采纳回复' });
    }
    if (!post.isUrgent) {
      return res.status(400).json({ success: false, message: '该帖不是悬赏求助帖' });
    }
    if (post.resolved) {
      return res.status(400).json({ success: false, message: '该帖已经采纳过回复了' });
    }

    const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
    if (!comment || comment.postId !== postId) {
      return res.status(400).json({ success: false, message: '无效的评论ID' });
    }

    if (comment.userId === userId) {
      return res.status(400).json({ success: false, message: '不能采纳自己的回复' });
    }

    // 事务处理：更新帖子状态、标记评论被采纳、给被采纳者加积分
    const result = await prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.updateMany({
        where: { id: postId, resolved: false },
        data: { resolved: true, acceptedCommentId: comment.id }
      });

      if (updatedPost.count === 0) {
        throw new Error('ALREADY_RESOLVED');
      }

      await tx.comment.update({
        where: { id: comment.id },
        data: { isAccepted: true }
      });

      await tx.user.update({
        where: { id: comment.userId },
        data: { points: { increment: post.rewardPoints } }
      });

      return true;
    });

    res.json({ success: true, message: '采纳成功，积分已发放给答主' });
  } catch (error) {
    console.error('Accept urgent answer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 获取帖子列表 (支持分页和标签/分类筛选)
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const userId = req.user?.userId;

    let where = { status: 'ACTIVE' };
    if (tag) {
      where.tags = { has: tag };
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Determine sort order based on 'sort' param
    let orderBy = { createdAt: 'desc' }; // default: latest
    if (req.query.sort === 'hot') {
      orderBy = [
        { likes: 'desc' },
        { createdAt: 'desc' }
      ];
    } else if (req.query.sort === 'urgent') {
      where.isUrgent = true;
      orderBy = [
        { resolved: 'asc' }, // 未解决的在前
        { createdAt: 'desc' }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: { select: { name: true, avatar: true, role: true } },
          category: true,
          _count: {
            select: { likedBy: true }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    // 如果用户已登录，附加 hasLiked 状态
    let finalPosts = posts;
    if (userId && posts.length > 0) {
      const likedPostIds = await prisma.postLike.findMany({
        where: {
          userId,
          postId: { in: posts.map(p => p.id) }
        },
        select: { postId: true }
      });
      const likedSet = new Set(likedPostIds.map(l => l.postId));

      finalPosts = posts.map(p => ({
        ...p,
        hasLiked: likedSet.has(p.id)
      }));
    } else {
      finalPosts = posts.map(p => ({ ...p, hasLiked: false }));
    }

    res.json({
      success: true,
      data: {
        list: finalPosts,
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 点赞/取消点赞帖子
exports.toggleLikePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    let newLikesCount;

    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.postLike.delete({ where: { id: existingLike.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { likes: { decrement: 1 } }
        })
      ]);
      newLikesCount = Math.max(0, post.likes - 1);
      return res.json({ success: true, data: { isLiked: false, likes: newLikesCount } });
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.postLike.create({
          data: { userId, postId }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likes: { increment: 1 } }
        })
      ]);
      newLikesCount = post.likes + 1;
      return res.json({ success: true, data: { isLiked: true, likes: newLikesCount } });
    }
  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};