const prisma = require('../../utils/prisma');

const ugcController = {
  getContributions: async (req, res) => {
    try {
      const { status, page = 1, pageSize = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const take = parseInt(pageSize);
      
      let where = {};
      if (status) where.status = status;

      const total = await prisma.contribution.count({ where });
      const contributions = await prisma.contribution.findMany({
        where,
        skip,
        take,
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: {
          list: contributions,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (err) {
      console.error('Admin getContributions error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  reviewContribution: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason, categoryId, type, tags } = req.body; // action: 'approve' or 'reject'

      const contribution = await prisma.contribution.findUnique({ where: { id: parseInt(id) } });
      
      if (!contribution) {
        return res.status(404).json({ success: false, message: 'Contribution not found' });
      }

      if (action === 'approve') {
        if (!categoryId || !type) {
           return res.status(400).json({ success: false, message: 'CategoryId and Type are required to approve' });
        }

        // 1. Update contribution status
        await prisma.contribution.update({
          where: { id: parseInt(id) },
          data: { status: 'approved' }
        });

        // 2. Add to Script library
        await prisma.script.create({
           data: {
             question: contribution.question,
             answers: [contribution.answer],
             type: type,
             categoryId: parseInt(categoryId),
             tags: tags || [],
             isNew: true
           }
        });

        // 3. Reward user (e.g. give 50 points)
        await prisma.user.update({
           where: { id: contribution.userId },
           data: { points: { increment: 50 } }
        });

        res.json({ success: true, message: 'Contribution approved and converted to script' });
      } else if (action === 'reject') {
        await prisma.contribution.update({
          where: { id: parseInt(id) },
          data: { 
            status: 'rejected',
            reason: reason || 'Not suitable'
          }
        });
        res.json({ success: true, message: 'Contribution rejected' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid action' });
      }

    } catch (err) {
      console.error('Admin reviewContribution error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = ugcController;
