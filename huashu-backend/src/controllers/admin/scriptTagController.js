const prisma = require('../../utils/prisma');

/**
 * 获取所有排序标签
 */
const getScriptSortTabs = async (req, res) => {
  try {
    const tabs = await prisma.scriptSortTab.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      code: 200,
      success: true,
      data: tabs
    });
  } catch (error) {
    console.error('获取排序标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 创建排序标签
 */
const createScriptSortTab = async (req, res) => {
  try {
    const { key, label, sort, isDefault, sortOrder } = req.body;

    // 如果设置为默认，先将其他标签设为非默认
    if (isDefault) {
      await prisma.scriptSortTab.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const tab = await prisma.scriptSortTab.create({
      data: {
        key,
        label,
        sort,
        isDefault: isDefault || false,
        sortOrder: sortOrder || 0
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '创建成功',
      data: tab
    });
  } catch (error) {
    console.error('创建排序标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 更新排序标签
 */
const updateScriptSortTab = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, label, sort, isDefault, sortOrder, status } = req.body;

    // 如果设置为默认，先将其他标签设为非默认
    if (isDefault) {
      await prisma.scriptSortTab.updateMany({
        where: { isDefault: true, id: { not: parseInt(id) } },
        data: { isDefault: false }
      });
    }

    const tab = await prisma.scriptSortTab.update({
      where: { id: parseInt(id) },
      data: {
        key,
        label,
        sort,
        isDefault,
        sortOrder,
        status
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '更新成功',
      data: tab
    });
  } catch (error) {
    console.error('更新排序标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 删除排序标签
 */
const deleteScriptSortTab = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.scriptSortTab.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      code: 200,
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除排序标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 获取所有分类标签
 */
const getAllCategoryTags = async (req, res) => {
  try {
    const tags = await prisma.categoryTag.findMany({
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }]
    });

    res.json({
      code: 200,
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取分类标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 获取指定分类的标签
 */
const getCategoryTags = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const tags = await prisma.categoryTag.findMany({
      where: { categoryId: parseInt(categoryId) },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      code: 200,
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取分类标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 创建分类标签
 */
const createCategoryTag = async (req, res) => {
  try {
    const { name, categoryId, sortOrder } = req.body;

    const tag = await prisma.categoryTag.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        sortOrder: sortOrder || 0
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '创建成功',
      data: tag
    });
  } catch (error) {
    console.error('创建分类标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 更新分类标签
 */
const updateCategoryTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sortOrder } = req.body;

    const tag = await prisma.categoryTag.update({
      where: { id: parseInt(id) },
      data: {
        name,
        sortOrder
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '更新成功',
      data: tag
    });
  } catch (error) {
    console.error('更新分类标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

/**
 * 删除分类标签
 */
const deleteCategoryTag = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.categoryTag.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      code: 200,
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除分类标签失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getScriptSortTabs,
  createScriptSortTab,
  updateScriptSortTab,
  deleteScriptSortTab,
  getAllCategoryTags,
  getCategoryTags,
  createCategoryTag,
  updateCategoryTag,
  deleteCategoryTag
};
