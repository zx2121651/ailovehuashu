const prisma = require('../utils/prisma');

/**
 * 获取一级分类列表
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { type: 'SCRIPT' },
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { scripts: true }
        }
      }
    });

    // 将动态聚合统计的话术数量赋值给 count 字段返回给前端
    const formattedCategories = categories.map(cat => ({
      ...cat,
      count: cat._count.scripts
    }));

    // 这里移除 _count 属性，保持向后兼容
    formattedCategories.forEach(cat => delete cat._count);

    res.json({
      code: 200,
      message: "获取成功",
      data: formattedCategories
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 获取全网热搜词
 */
exports.getHotSearches = async (req, res) => {
  try {
    const hotSearches = await prisma.hotSearch.findMany({
      orderBy: { order: 'asc' }
    });

    // 只返回关键词列表
    const keywords = hotSearches.map(h => h.keyword);

    res.json({
      code: 200,
      message: "获取成功",
      data: keywords
    });
  } catch (error) {
    console.error('获取热搜错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 获取话术列表 (支持分页、分类过滤、关键词搜索、标签过滤、排序)
 */
exports.getScripts = async (req, res) => {
  const { categoryId, keyword, tag, sort = 'default', page = 1, pageSize = 10 } = req.query;

  try {
    // 构建查询条件
    const where = {};

    // 1. 分类过滤
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // 2. 关键词模糊搜索
    if (keyword) {
      where.OR = [
        { question: { contains: keyword } },
        { answers: { hasSome: [keyword] } }
      ];
    }

    // 3. 标签过滤
    if (tag && tag !== '全部') {
      where.OR = [
        { type: { contains: tag } },
        { tags: { hasSome: [tag] } }
      ];
    }

    // 4. 构建排序
    let orderBy = {};
    if (sort === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'hot') {
      orderBy = { likes: 'desc' };
    } else {
      orderBy = { id: 'asc' };
    }

    // 5. 分页查询
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const [scripts, total] = await Promise.all([
      prisma.script.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: { name: true, icon: true }
          }
        }
      }),
      prisma.script.count({ where })
    ]);

    res.json({
      code: 200,
      message: "获取成功",
      data: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: scripts
      }
    });
  } catch (error) {
    console.error('获取话术列表错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 根据 ID 获取单条话术详情
 */
exports.getScriptById = async (req, res) => {
  const { id } = req.params;

  try {
    const script = await prisma.script.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: { name: true, icon: true, color: true }
        }
      }
    });

    if (!script) {
      return res.status(404).json({ code: 404, message: "话术不存在" });
    }

    res.json({
      code: 200,
      message: "获取成功",
      data: script
    });
  } catch (error) {
    console.error('获取话术详情错误:', error);
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 获取话术库排序标签
 */
exports.getScriptSortTabs = async (req, res) => {
  try {
    const tabs = await prisma.scriptSortTab.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      select: {
        key: true,
        label: true,
        sort: true,
        isDefault: true
      }
    });

    res.json({
      success: true,
      data: tabs
    });
  } catch (error) {
    console.error('获取排序标签错误:', error);
    res.status(500).json({ success: false, message: "获取失败" });
  }
};

/**
 * 获取指定分类的标签
 */
exports.getCategoryTags = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const tags = await prisma.categoryTag.findMany({
      where: { categoryId: parseInt(categoryId) },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        sortOrder: true
      }
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取分类标签错误:', error);
    res.status(500).json({ success: false, message: "获取失败" });
  }
};
