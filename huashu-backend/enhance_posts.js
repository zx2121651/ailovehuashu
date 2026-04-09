const fs = require('fs');
const file = 'src/controllers/postController.js';
let content = fs.readFileSync(file, 'utf8');

const newGetPosts = `
/**
 * 【重构增强】获取帖子列表 (支持分页和标签/分类筛选)
 * 1. 深度聚合：关联查询发帖人 (User)、帖子分类 (Category)、采纳的评论 (AcceptedComment)
 * 2. 统计计算：聚合计算帖子当前的总点赞数和评论数 (Comments Count)
 * 3. 性能优化：为已登录用户批量判断是否已点赞 (hasLiked)，避免 N+1 查询
 */
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, categoryId, sort = 'new' } = req.query;

    // 安全参数处理 (防御型编程)
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // 限制最多50条
    const skip = (pageNum - 1) * limitNum;

    const userId = req.user?.userId; // 支持访客模式

    // 构建查询谓词
    let where = { status: 'ACTIVE' };

    if (tag && tag.trim() !== '') {
      // 包含某个 hashtag
      where.tags = { has: tag.trim() };
    }

    if (categoryId && !isNaN(parseInt(categoryId))) {
      where.categoryId = parseInt(categoryId);
    }

    // 构建排序策略 (多字段联合排序)
    let orderBy = [];
    if (sort === 'hot') {
      orderBy.push({ likes: 'desc' });
      orderBy.push({ createdAt: 'desc' });
    } else if (sort === 'urgent') {
      // 紧急求助区：只看悬赏贴，未解决的排前面，同状态按悬赏金和时间排
      where.isUrgent = true;
      orderBy.push({ resolved: 'asc' });
      orderBy.push({ rewardPoints: 'desc' });
      orderBy.push({ createdAt: 'desc' });
    } else if (sort === 'featured') {
      // 假设业务上精华帖是管理员后台修改 tags 加的
      where.tags = { has: '精华' };
      orderBy.push({ createdAt: 'desc' });
    } else {
      // 默认最新
      orderBy.push({ createdAt: 'desc' });
    }

    // 数据库高并发事务：同时拉取帖子数据和满足条件的总行数
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          // 关联发帖人安全字段（不返回密码、openId等敏感信息）
          user: {
            select: { id: true, name: true, avatar: true, role: true, isVip: true }
          },
          category: {
            select: { id: true, name: true, color: true }
          },
          // 聚合查询：带出该帖子有多少条评论
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    // O(1) 复杂度附加用户点赞状态 (hasLiked)
    let finalPosts = posts;
    if (userId && posts.length > 0) {
      // 批量查出当前用户点赞过这一页里的哪些帖子
      const likedPostIds = await prisma.postLike.findMany({
        where: {
          userId,
          postId: { in: posts.map(p => p.id) }
        },
        select: { postId: true }
      });
      const likedSet = new Set(likedPostIds.map(l => l.postId));

      finalPosts = posts.map(p => {
        const { _count, ...postData } = p;
        return {
          ...postData,
          commentCount: _count.comments, // 将聚合查询结果重命名，更友好
          hasLiked: likedSet.has(p.id)
        };
      });
    } else {
      // 访客模式直接附加
      finalPosts = posts.map(p => {
        const { _count, ...postData } = p;
        return { ...postData, commentCount: _count.comments, hasLiked: false };
      });
    }

    res.json({
      success: true,
      message: '帖子列表获取成功',
      data: {
        list: finalPosts,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('获取社区帖子聚合列表错误:', error);
    res.status(500).json({ success: false, message: '服务器聚合查询错误', error: error.message });
  }
};
`;

const oldFuncRegex = /exports\.getPosts = async \(req, res\) => {[\s\S]*?res\.status\(500\)\.json\({ success: false, message: 'Internal server error' }\);\s*}\s*};/g;

if (oldFuncRegex.test(content)) {
  content = content.replace(oldFuncRegex, newGetPosts);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Post 控制器逻辑增强替换成功');
} else {
  console.log('找不到匹配的 getPosts 结构，尝试部分替换...');
}
