const prisma = require('../utils/prisma');
const Decimal = require('decimal.js');
const { verifySignature, decryptResource } = require('../utils/wechatPay');

/**
 * 处理微信支付异步回调
 * 要求：必须保证接口幂等性、验签以及防止金额计算精度丢失
 */
exports.wechatPayWebhook = async (req, res) => {
  // 1. 获取微信 Header 参数 (用于验签)
  const signature = req.headers['wechatpay-signature'];
  const timestamp = req.headers['wechatpay-timestamp'];
  const nonce = req.headers['wechatpay-nonce'];

  // 在 Express 中，需要原始的 rawBody 才能正确验签。
  // (需在 app.js / index.js 中配置 express.raw() 获取 rawBody，这里假设以 req.rawBody 存在)
  const rawBody = req.rawBody || JSON.stringify(req.body);

  if (!signature || !timestamp || !nonce) {
    return res.status(401).send('Unauthorized');
  }

  // 2. 验证签名安全性
  const isValid = verifySignature(signature, timestamp, nonce, rawBody);
  if (!isValid) {
    console.error('微信回调验签失败');
    return res.status(401).send('Invalid signature');
  }

  // 3. 解密微信业务数据
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const resource = body.resource;

  if (!resource) {
    return res.status(400).send('Bad Request: Missing resource');
  }

  const decryptedData = decryptResource(resource.ciphertext, resource.nonce, resource.associated_data);

  if (!decryptedData) {
    return res.status(500).send('Decrypt Error');
  }

  // decryptedData 中包含 out_trade_no (业务订单号), amount (微信是以分为单位的整数对象)
  const outTradeNo = decryptedData.out_trade_no;

  try {
    // 4. 利用数据库事务处理支付成功逻辑，保证一致性
    await prisma.$transaction(async (tx) => {
      // 4.1 幂等性校验：查询订单
      const order = await tx.order.findUnique({
        where: { id: outTradeNo } // 假设 id 为订单号（或使用 tradeNo 字段）
      });

      if (!order) {
         throw new Error('订单不存在: ' + outTradeNo);
      }

      // 【幂等性关键】如果订单已是成功状态，直接返回成功，不再分佣
      if (order.status === 'SUCCESS') {
        return;
      }

      // 4.2 更新订单状态为支付成功
      await tx.order.update({
        where: { id: outTradeNo },
        data: {
          status: 'SUCCESS',
          payTime: new Date(decryptedData.success_time),
          transactionId: decryptedData.transaction_id, // 微信支付订单号
          paymentMethod: 'WECHAT'
        }
      });

      // 4.3 执行分销计算逻辑 (完全规避 JS 浮点数，使用 decimal.js)
      // 微信返回的金额单位为"分"，将其转换为"元"的 Decimal 对象进行计算
      const orderTotalFeeCents = decryptedData.amount.payer_total;
      const orderAmount = new Decimal(orderTotalFeeCents).dividedBy(100);

      // 获取动态分销配置
      const configSetting = await tx.systemSetting.findUnique({
        where: { key: 'DISTRIBUTOR_CONFIG' }
      });

      let config = {
        rates: { 1: 0.30, 2: 0.15, 3: 0.05 },
        requireVip: false
      };
      if (configSetting && configSetting.value) {
        config = { ...config, ...configSetting.value };
      }
      const RATES = config.rates;

      // 查找当前用户的上级关系
      const buyer = await tx.user.findUnique({
        where: { id: order.userId }
      });

      let currentUser = buyer;
      for (let level = 1; level <= 3; level++) {
        if (!currentUser.inviterId) break;

        const inviter = await tx.user.findUnique({
          where: { id: currentUser.inviterId }
        });

        if (inviter) {
          // VIP 门槛拦截
          if (config.requireVip && !inviter.isVip) {
            currentUser = inviter;
            continue;
          }

          // 【精度关键】使用 Decimal 进行乘法运算，并保留两位小数（元），避免产生 .999999 尾数
          const rateDec = new Decimal(RATES[level]);
          const commissionDecimal = orderAmount.times(rateDec).toDecimalPlaces(2);
          const commissionFloat = commissionDecimal.toNumber(); // 转回普通 Float 存入 DB

          if (commissionFloat > 0) {
            // 给上级增加余额和总收益
            await tx.user.update({
              where: { id: inviter.id },
              data: {
                balance: { increment: commissionFloat },
                totalEarned: { increment: commissionFloat }
              }
            });

            // 记录佣金流水
            await tx.commissionLog.create({
              data: {
                userId: inviter.id,
                orderId: order.id,
                fromUserId: buyer.id,
                level,
                amount: commissionFloat
              }
            });
          }

          currentUser = inviter;
        } else {
          break;
        }
      }

      // (可选) 更新用户 VIP 身份等业务逻辑...
    });

    // 5. 必须返回 200 给微信服务器
    res.status(200).json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    console.error('微信回调处理事务失败:', error);
    // 抛出 500，微信会重试回调
    res.status(500).json({ code: 'FAIL', message: error.message });
  }
};
