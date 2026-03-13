const prisma = require('../../utils/prisma');

const userController = {
  getUsers: async (req, res) => {
    try {
      const { page = 1, pageSize = 20, keyword } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const take = parseInt(pageSize);
      
      let where = {};
      if (keyword) {
        where.OR = [
          { name: { contains: keyword, mode: 'insensitive' } },
          { id: { contains: keyword } }
        ];
      }

      const total = await prisma.user.count({ where });
      const users = await prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: {
          list: users,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (err) {
      console.error('Admin getUsers error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Prevent updating sensitive core fields via this generic endpoint
      delete updates.id;
      delete updates.wxOpenId;

      const user = await prisma.user.update({
        where: { id },
        data: updates
      });

      res.json({ success: true, data: user });
    } catch (err) {
      console.error('Admin updateUser error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Ensure super admins cannot delete themselves
      if (req.user && req.user.id === id) {
        return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Instead of hard deleting which could break relations (orders, comments, etc.),
      // we soft delete / ban by scrambling their openId and changing role
      // In a real production system, you might want to fully anonymize or add an 'isBanned' column.
      // Here we change role to 'BANNED' and clear identifying info to effectively remove them.
      await prisma.user.update({
        where: { id },
        data: {
          role: 'BANNED',
          name: '已注销用户',
          avatar: null,
          bio: '',
          wxOpenId: null, // Free up the openId if they want to register a fresh account
          password: null
        }
      });

      res.json({ success: true, message: 'User deleted (banned)' });
    } catch (err) {
      console.error('Admin deleteUser error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = userController;
