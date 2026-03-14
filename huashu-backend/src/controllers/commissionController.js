const prisma = require('../utils/prisma');

/**
 * 获取分销中心基础信息 (余额、收益、邀请码等)
 */
exports.getDistributorInfo = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, totalEarned: true, inviteCode: true, isVip: true }
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const configSetting = await prisma.systemSetting.findUnique({
      where: { key: 'DISTRIBUTOR_CONFIG' }
    });

    let config = {
      rates: { 1: 0.30, 2: 0.15, 3: 0.05 },
      requireVip: false
    };
    if (configSetting && configSetting.value) {
      config = { ...config, ...configSetting.value };
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...user,
        config
      }
    });
  } catch (error) {
    console.error('获取分销信息失败:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

/**
 * 获取我的团队列表 (一、二、三级)
 */
exports.getMyTeam = async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1级下线
    const level1 = await prisma.user.findMany({
      where: { inviterId: userId },
      select: { id: true, name: true, avatar: true, createdAt: true, totalEarned: true }
    });
    const level1Ids = level1.map(u => u.id);

    // 2级下线
    let level2 = [];
    if (level1Ids.length > 0) {
      level2 = await prisma.user.findMany({
        where: { inviterId: { in: level1Ids } },
        select: { id: true, name: true, avatar: true, createdAt: true, totalEarned: true }
      });
    }
    const level2Ids = level2.map(u => u.id);

    // 3级下线
    let level3 = [];
    if (level2Ids.length > 0) {
      level3 = await prisma.user.findMany({
        where: { inviterId: { in: level2Ids } },
        select: { id: true, name: true, avatar: true, createdAt: true, totalEarned: true }
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        level1,
        level2,
        level3,
        counts: {
          level1: level1.length,
          level2: level2.length,
          level3: level3.length,
          total: level1.length + level2.length + level3.length
        }
      }
    });
  } catch (error) {
    console.error('获取团队失败:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

/**
 * 获取佣金明细
 */
exports.getCommissionLogs = async (req, res) => {
  const userId = req.user.userId;

  try {
    const logs = await prisma.commissionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: { type: true, amount: true, userName: true }
        }
      }
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: logs
    });
  } catch (error) {
    console.error('获取佣金明细失败:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
};

/**
 * 申请提现
 */
exports.applyWithdrawal = async (req, res) => {
  const userId = req.user.userId;
  const { amount, accountInfo } = req.body;

  if (!amount || amount <= 0 || !accountInfo) {
    return res.status(400).json({ code: 400, message: '参数错误' });
  }

  try {
    // 使用事务确保扣款和记录同时成功
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.balance < amount) {
        throw new Error('余额不足');
      }

      // 扣除余额
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } }
      });

      // 创建提现记录
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          accountInfo
        }
      });

      return withdrawal;
    });

    res.json({
      code: 200,
      message: '提现申请已提交，等待审核',
      data: result
    });
  } catch (error) {
    console.error('提现申请失败:', error);
    res.status(500).json({ code: 500, message: error.message || '申请失败' });
  }
};

/**
 * 模拟购买订单并自动结算分销佣金
 * (生产环境应该是在微信/支付宝支付成功回调接口中执行)
 */
exports.simulateOrderWithCommission = async (req, res) => {
  const userId = req.user.userId;
  const { amount, type = 'VIP_YEAR' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ code: 400, message: '订单金额无效' });
  }

  try {
    // 动态获取系统分销配置
    const configSetting = await prisma.systemSetting.findUnique({
      where: { key: 'DISTRIBUTOR_CONFIG' }
    });

    // 默认配置
    let config = {
      rates: { 1: 0.30, 2: 0.15, 3: 0.05 },
      requireVip: false
    };

    if (configSetting && configSetting.value) {
      config = { ...config, ...configSetting.value };
    }

    const RATES = config.rates;

    await prisma.$transaction(async (tx) => {
      // 1. 获取下单用户
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { inviter: true }
      });

      if (!user) throw new Error('用户不存在');

      // 2. 创建订单
      const order = await tx.order.create({
        data: {
          userId,
          userName: user.name,
          type,
          amount,
          paymentMethod: 'WECHAT',
          status: 'SUCCESS',
          payTime: new Date()
        }
      });

      // 3. 计算并分发佣金
      let currentUser = user;
      for (let level = 1; level <= 3; level++) {
        // 如果没有上级了，跳出循环
        if (!currentUser.inviterId) break;

        const inviter = await tx.user.findUnique({
          where: { id: currentUser.inviterId }
        });

        if (inviter) {
          // 检查 VIP 门槛拦截：如果要求必须是 VIP 且当前上级不是 VIP，则不分发佣金
          if (config.requireVip && !inviter.isVip) {
            currentUser = inviter;
            continue;
          }

          const commissionAmount = amount * RATES[level];

          // 给上级增加余额和总收益
          await tx.user.update({
            where: { id: inviter.id },
            data: {
              balance: { increment: commissionAmount },
              totalEarned: { increment: commissionAmount }
            }
          });

          // 记录佣金流水
          await tx.commissionLog.create({
            data: {
              userId: inviter.id,
              orderId: order.id,
              fromUserId: user.id,
              level,
              amount: commissionAmount
            }
          });

          // 游标上移，准备给上级的上级分佣
          currentUser = inviter;
        } else {
          break;
        }
      }
    });

    res.json({ code: 200, message: '支付成功并已结算佣金' });
  } catch (error) {
    console.error('订单支付失败:', error);
    res.status(500).json({ code: 500, message: error.message || '支付处理失败' });
  }
};
