const prisma = require('../../utils/prisma');

const statController = {
  getDashboardStats: async (req, res) => {
    try {
      const totalUsers = await prisma.user.count();
      const totalScripts = await prisma.script.count();
      const totalArticles = await prisma.article.count();
      const pendingContributions = await prisma.contribution.count({
        where: { status: 'pending' }
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          totalScripts,
          totalArticles,
          pendingContributions
        }
      });
    } catch (err) {
      console.error('getDashboardStats error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = statController;
