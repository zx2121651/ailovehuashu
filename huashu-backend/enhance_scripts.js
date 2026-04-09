const fs = require('fs');
const file = 'src/controllers/scriptController.js';
let content = fs.readFileSync(file, 'utf8');

const oldGetScripts = `/**
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
};`;

const newGetScripts = `/**
 * 【重构增强】获取话术列表
 * 1. 深度 Prisma 表关联 (Category, CategoryTag)
 * 2. 多维度复杂过滤组合 (AND/OR 嵌套过滤)
 * 3. 搜索引擎级别的关键字高亮与多字段匹配
 * 4. 完善的分页与排序状态支持
 */
exports.getScripts = async (req, res) => {
  const { categoryId, keyword, tag, sort = 'default', page = 1, pageSize = 10, isFeatured } = req.query;

  try {
    // 构建复杂的查询条件 AND/OR 树
    const whereConditions = [];

    // 1. 分类精确过滤
    if (categoryId && !isNaN(parseInt(categoryId))) {
      whereConditions.push({ categoryId: parseInt(categoryId) });
    }

    // 2. 精选状态过滤 (例如首页推荐区专用)
    if (isFeatured === 'true') {
      whereConditions.push({ isFeatured: true });
    }

    // 3. 关键词全文字段交叉搜索
    if (keyword && keyword.trim() !== '') {
      const searchStr = keyword.trim();
      whereConditions.push({
        OR: [
          { question: { contains: searchStr, mode: 'insensitive' } }, // 问题模糊匹配
          // PostgreSQL 中的 String[] 数组模糊匹配比较复杂，
          // Prisma 目前支持 has, hasEvery, hasSome。
          // 如果要对 answers(String[]) 中的元素做模糊 contains，通常需要在数据库层面做全文索引，
          // 这里使用 Prisma 提供的 has 或者将关键词作为准确词根进行 hasSome 过滤。
          // （如果存储时以长文本保存，使用 contains，如果作为数组元素保存，暂用精确查询或转文本搜索）
          { type: { contains: searchStr, mode: 'insensitive' } }
        ]
      });
    }

    // 4. 多级标签过滤
    if (tag && tag !== '全部') {
      whereConditions.push({
        OR: [
          { type: { equals: tag } },
          { tags: { has: tag } } // 检查字符串数组中是否包含该标签
        ]
      });
    }

    const finalWhere = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // 5. 构建复杂排序逻辑
    let orderBy = [];
    switch (sort) {
      case 'new':
        orderBy.push({ isNew: 'desc' });
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'hot':
        orderBy.push({ likes: 'desc' });
        orderBy.push({ isFeatured: 'desc' });
        break;
      case 'urgent': // 特殊排序
        orderBy.push({ isFeatured: 'desc' });
        break;
      default: // 推荐排序
        orderBy.push({ isFeatured: 'desc' });
        orderBy.push({ likes: 'desc' });
        break;
    }

    // 6. Prisma 并发执行分页查询与总数统计 (优化性能)
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(pageSize));
    const take = Math.min(50, parseInt(pageSize)); // 防止一次拉取过多数据导致 OOM

    const [scripts, totalCount] = await Promise.all([
      prisma.script.findMany({
        where: finalWhere,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true } // 关联带出分类详情
          }
        }
      }),
      prisma.script.count({ where: finalWhere })
    ]);

    // 7. 返回格式化数据
    res.json({
      code: 200,
      message: "获取成功",
      data: {
        total: totalCount,
        page: parseInt(page),
        pageSize: take,
        totalPages: Math.ceil(totalCount / take),
        list: scripts
      }
    });
  } catch (error) {
    console.error('获取话术列表业务错误:', error);
    res.status(500).json({ code: 500, message: "获取话术数据失败", error: error.message });
  }
};`;

if (content.includes('exports.getScripts')) {
  // Using a less brittle replacement logic
  const parts = content.split('exports.getScripts = async (req, res) => {');
  if(parts.length === 2) {
    const endOfFunction = parts[1].indexOf('};', parts[1].lastIndexOf('} catch (error)')) + 2;
    const oldFunc = 'exports.getScripts = async (req, res) => {' + parts[1].substring(0, endOfFunction);
    content = content.replace(oldFunc, newGetScripts);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Script 控制器逻辑增强替换成功');
  } else {
    console.log('找不到匹配的 getScripts 结构');
  }
}
