const prisma = require('../../utils/prisma');

const contentController = {
  // --- Scripts CRUD ---
  getScripts: async (req, res) => {
    try {
      const { page = 1, pageSize = 20, categoryId } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const take = parseInt(pageSize);
      
      let where = {};
      if (categoryId) where.categoryId = parseInt(categoryId);

      const total = await prisma.script.count({ where });
      const scripts = await prisma.script.findMany({
        where,
        skip,
        take,
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: { list: scripts, total, page: parseInt(page), pageSize: parseInt(pageSize) } });
    } catch (err) {
      console.error('Admin getScripts error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  createScript: async (req, res) => {
    try {
      const script = await prisma.script.create({ data: req.body });
      res.json({ success: true, data: script });
    } catch (err) {
      console.error('Admin createScript error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateScript: async (req, res) => {
    try {
      const { id } = req.params;
      const script = await prisma.script.update({
        where: { id: parseInt(id) },
        data: req.body
      });
      res.json({ success: true, data: script });
    } catch (err) {
      console.error('Admin updateScript error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteScript: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.script.delete({ where: { id: parseInt(id) } });
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      console.error('Admin deleteScript error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // --- Categories CRUD ---
  getCategories: async (req, res) => {
    try {
      const { type } = req.query;
      let where = {};
      if (type) {
        where.type = type;
      }

      const categories = await prisma.category.findMany({
        where,
        orderBy: { id: 'asc' },
        include: {
          _count: {
            select: { scripts: true, posts: true }
          }
        }
      });

      const formattedCategories = categories.map(cat => {
        // If it's a POST type category, count posts instead of scripts for the dashboard
        const count = cat.type === 'POST' ? (cat._count ? cat._count.posts : 0) : (cat._count ? cat._count.scripts : 0);
        const newCat = { ...cat, count };
        delete newCat._count;
        return newCat;
      });

      res.json({ success: true, data: formattedCategories });
    } catch (err) {
      console.error('Admin getCategories error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: req.body
      });
      res.json({ success: true, data: category });
    } catch (err) {
      console.error('Admin updateCategory error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, icon, color, type } = req.body;

      if (!name || !icon || !color) {
        return res.status(400).json({ success: false, message: '分类名称、图标和颜色不能为空' });
      }

      const newCategory = await prisma.category.create({
        data: { name, icon, color, type: type || 'SCRIPT' }
      });

      res.status(201).json({ success: true, data: newCategory });
    } catch (err) {
      console.error('Admin createCategory error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) }
      });

      if (!category) {
        return res.status(404).json({ success: false, message: '分类不存在' });
      }

      // We should check if this category has scripts or posts before deleting
      const scriptsCount = await prisma.script.count({ where: { categoryId: parseInt(id) } });
      const postsCount = await prisma.post.count({ where: { categoryId: parseInt(id) } });

      if (scriptsCount > 0 || postsCount > 0) {
        return res.status(400).json({ success: false, message: '该分类下还有话术或动态，无法直接删除' });
      }

      await prisma.category.delete({
        where: { id: parseInt(id) }
      });

      res.json({ success: true, message: '分类删除成功' });
    } catch (err) {
      console.error('Admin deleteCategory error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = contentController;
