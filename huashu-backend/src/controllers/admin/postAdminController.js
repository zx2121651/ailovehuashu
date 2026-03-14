const prisma = require('../../utils/prisma');

// 获取所有帖子 (管理端)
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '', status = '', categoryId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where = {};

    if (keyword) {
      where.content = { contains: keyword, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, color: true } }
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        list: posts,
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Admin get posts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 创建帖子 (管理端)
exports.createPost = async (req, res) => {
  try {
    const { content, images, tags, status, categoryId } = req.body;

    // 如果是导师发帖，则直接使用自己的 userId
    // 如果是系统管理员发帖，我们需要一个明确的官方账号ID，而不是随机取第一个用户
    let postUserId;

    if (req.admin.role === 'MENTOR') {
      postUserId = req.admin.id;
    } else {
      // 获取超级管理员发帖专用的官方账号
      let systemUser = await prisma.user.findFirst({
        where: { name: '官方管理员' }
      });

      if (!systemUser) {
         // 如果不存在则临时创建一个特殊账号
         systemUser = await prisma.user.create({
           data: {
             name: '官方管理员',
             avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
             role: 'ADMIN'
           }
         });
      }
      postUserId = systemUser.id;
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        images: images || [],
        tags: tags || [],
        status: status || 'ACTIVE',
        categoryId: categoryId ? parseInt(categoryId) : null,
        userId: postUserId
      }
    });

    res.json({ success: true, data: newPost, message: 'Post created successfully' });
  } catch (error) {
    console.error('Admin create post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新帖子 (包含状态、内容等)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images, tags, status, categoryId } = req.body;

    const data = {};
    if (content !== undefined) data.content = content;
    if (images !== undefined) data.images = images;
    if (tags !== undefined) data.tags = tags;
    if (categoryId !== undefined) data.categoryId = categoryId ? parseInt(categoryId) : null;
    if (status !== undefined) {
      const validStatuses = ['ACTIVE', 'HIDDEN', 'DELETED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      data.status = status;
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({ success: true, data: post, message: 'Post updated successfully' });
  } catch (error) {
    console.error('Admin update post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新帖子状态 (审核通过/隐藏)
exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'HIDDEN', 'DELETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Admin update post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 彻底删除帖子
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Admin delete post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};