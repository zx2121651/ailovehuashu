const prisma = require('../../utils/prisma');

const statController = {
  getDashboardStats: async (req, res) => {
    try {
      // 基础统计数据
      const totalUsers = await prisma.user.count();
      const totalScripts = await prisma.script.count();
      const totalArticles = await prisma.article.count();
      const pendingContributions = await prisma.contribution.count({
        where: { status: 'pending' }
      });

      // 获取最近7天的用户增长数据（真实数据）
      const userGrowthData = await getUserGrowthData();

      // 获取话术分类分布数据（真实数据）
      const scriptDistribution = await getScriptDistribution();

      res.json({
        success: true,
        data: {
          totalUsers,
          totalScripts,
          totalArticles,
          pendingContributions,
          userGrowth: userGrowthData,
          scriptDistribution: scriptDistribution
        }
      });
    } catch (err) {
      console.error('getDashboardStats error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

/**
 * 获取最近7天的用户增长数据
 */
async function getUserGrowthData() {
  const result = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // 查询当天新增用户数
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    // 格式化日期显示（MM/DD）
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    result.push({
      name: `${month}/${day}`,
      users: count
    });
  }

  return result;
}

/**
 * 获取话术分类分布数据（使用实际统计）
 */
async function getScriptDistribution() {
  // 获取所有话术分类，并统计每个分类的实际话术数量
  const categoriesWithCount = await prisma.category.findMany({
    where: {
      type: 'SCRIPT'
    },
    select: {
      id: true,
      name: true
    }
  });

  // 如果没有分类，返回空数组
  if (!categoriesWithCount || categoriesWithCount.length === 0) {
    return [];
  }

  // 统计每个分类的实际话术数量
  const distribution = [];
  for (const category of categoriesWithCount) {
    const count = await prisma.script.count({
      where: {
        categoryId: category.id
      }
    });

    // 只显示有话术的分类
    if (count > 0) {
      distribution.push({
        name: category.name,
        value: count
      });
    }
  }

  // 按数量降序排序，取前5个
  distribution.sort((a, b) => b.value - a.value);
  return distribution.slice(0, 5);
}

module.exports = statController;
