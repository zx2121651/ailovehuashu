const prisma = require('../utils/prisma');

/**
 * 获取避坑指南文章列表
 */
exports.getArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        desc: true,
        views: true,
        author: true,
        date: true
        // 不包含 content 字段，减轻传输
      }
    });

    res.json({
      code: 200,
      message: "获取成功",
      data: articles
    });
  } catch (error) {
    console.error('获取文章列表错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 获取避坑指南文章详情
 */
exports.getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      return res.status(404).json({ code: 404, message: "文章不存在" });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: article
    });
  } catch (error) {
    console.error('获取文章详情错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 获取精选课程
 */
exports.getFeaturedCourse = async (req, res) => {
  try {
    // 获取第一个课程作为精选课程
    const course = await prisma.course.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!course) {
      return res.json({
        code: 200,
        message: "获取成功",
        data: null
      });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: course
    });
  } catch (error) {
    console.error('获取课程错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};
