const prisma = require('../../utils/prisma');

/**
 * 获取提现申请列表 (Admin)
 */
exports.getWithdrawals = async (req, res) => {
  const { status, page = 1, pageSize = 10 } = req.query;

  try {
    const where = {};
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: { name: true, avatar: true, balance: true, totalEarned: true }
          }
        }
      }),
      prisma.withdrawal.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: withdrawals
      }
    });
  } catch (error) {
    console.error('获取提现列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
};

/**
 * 获取分销商列表 (Admin)
 */
exports.getDistributors = async (req, res) => {
  const { page = 1, pageSize = 10, keyword = '' } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where = {};
    if (keyword) {
      where.name = { contains: keyword };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { totalEarned: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          avatar: true,
          balance: true,
          totalEarned: true,
          isVip: true,
          createdAt: true,
          _count: {
            select: { invitees: true } // 仅统计直接邀请的人数
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const distributors = users.map(user => {
      const u = { ...user, teamSizeLevel1: user._count.invitees };
      delete u._count;
      return u;
    });

    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: distributors
      }
    });
  } catch (error) {
    console.error('获取分销商列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
};

/**
 * 审核提现申请 (Admin)
 */
exports.reviewWithdrawal = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED, REJECTED

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: '无效的状态' });
  }

  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: '提现记录不存在' });
    }
    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: '该记录已处理' });
    }

    // 开启事务处理
    await prisma.$transaction(async (tx) => {
      // 1. 更新提现状态
      const updated = await tx.withdrawal.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      // 2. 如果是驳回，需要将冻结的金额退还给用户余额
      if (status === 'REJECTED') {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            balance: { increment: withdrawal.amount }
          }
        });
      }

      // 3. 记录日志 (可选，目前通过 adminLogs 处理)
      await tx.adminLog.create({
        data: {
          adminUsername: req.admin.username,
          action: status === 'APPROVED' ? 'APPROVE_WITHDRAWAL' : 'REJECT_WITHDRAWAL',
          module: 'COMMISSION',
          detail: `审核用户(${withdrawal.userId})提现 ${withdrawal.amount} 元：${status}`,
          status: 'success'
        }
      });
    });

    res.json({ success: true, message: `提现申请已${status === 'APPROVED' ? '通过' : '驳回'}` });
  } catch (error) {
    console.error('审核提现失败:', error);
    res.status(500).json({ success: false, message: '审核失败' });
  }
};

/**
 * 获取所有佣金流水记录 (Admin)
 */
exports.getAllCommissionLogs = async (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const [logs, total] = await Promise.all([
      prisma.commissionLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { name: true } },
          order: { select: { type: true, amount: true, userName: true } }
        }
      }),
      prisma.commissionLog.count()
    ]);

    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: logs
      }
    });
  } catch (error) {
    console.error('获取佣金流水失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
};
