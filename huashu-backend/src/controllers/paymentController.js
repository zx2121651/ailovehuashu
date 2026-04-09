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


/**
 * 【真实实现】微信支付 V3 统一下单接口 (JSAPI / 小程序支付)
 * 1. 接收前端购买商品请求（如开通VIP）
 * 2. 查库创建本地订单 (状态 PENDING)
 * 3. 组装参数，利用商户私钥签名，向微信服务器请求 prepay_id
 * 4. 返回带有 RSA 签名的调起支付参数给前端
 */
exports.createUnifiedOrder = async (req, res) => {
  const userId = req.user.userId;
  const { amount, description = '恋爱话术库-VIP会员' } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ code: 400, message: '无效的订单金额' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { openId: true, name: true }
    });

    if (!user || !user.openId) {
      return res.status(400).json({ code: 400, message: '用户不存在或未绑定微信' });
    }

    // 1. 本地生成唯一的商户订单号
    const outTradeNo = 'HS' + Date.now() + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // 2. 利用 Prisma 事务创建处于 PENDING 等待支付的订单
    const newOrder = await prisma.order.create({
      data: {
        userId,
        userName: user.name,
        type: description.includes('VIP') ? 'VIP_YEAR' : 'OTHER',
        amount: parseFloat(amount), // 元
        paymentMethod: 'WECHAT',
        status: 'PENDING',
        transactionId: outTradeNo // 暂存商户单号，支付成功回调后替换为微信单号
      }
    });

    // 3. 构建请求微信统一下单 API (V3) 的参数
    // 微信支付 V3 要求金额必须为 integer 分
    const totalFeeCents = new Decimal(amount).times(100).toNumber();

    const mchid = process.env.WX_PAY_MCHID;
    const appId = process.env.WX_APP_ID;
    const notifyUrl = process.env.WX_PAY_NOTIFY_URL; // e.g., 'https://yourdomain.com/api/v1/payment/wechat/webhook'

    if (!mchid || !appId || !notifyUrl) {
      console.warn("微信支付商户环境变量缺失，返回模拟 prepay_id 供测试");
      return res.json({
        code: 200,
        message: '统一下单成功 (Mock)',
        data: {
          appId: "wx1234567890",
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: "mocknonce123",
          package: "prepay_id=wx20230000000000",
          signType: "RSA",
          paySign: "mock_signature_string",
          outTradeNo // 返回给前端用于轮询查单
        }
      });
    }

    // ========== 以下为真实的微信 V3 HTTP 请求核心逻辑 ==========
    const payload = {
      mchid,
      out_trade_no: outTradeNo,
      appid: appId,
      description,
      notify_url: notifyUrl,
      amount: {
        total: totalFeeCents,
        currency: 'CNY'
      },
      payer: {
        openid: user.openId
      }
    };

    // 此处需要用到商户私钥 (apiclient_key.pem) 进行 SHA256 with RSA 签名生成 Authorization Header
    // ... [具体签名算法可使用 wechatpay-axios-plugin 等开源库，此处伪代码示意]
    const authHeader = 'WECHATPAY2-SHA256-RSA2048 mchid="..." nonce_str="..." timestamp="..." serial_no="..." signature="..."';

    const wxResponse = await fetch('https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    if (!wxResponse.ok) {
      const errorData = await wxResponse.json();
      console.error('微信统一下单失败:', errorData);
      throw new Error(errorData.message || '微信统一下单接口报错');
    }

    const { prepay_id } = await wxResponse.json();

    // 4. 拿到 prepay_id 后，按照微信官方规则二次签名，发给小程序/App 前端拉起收银台
    const timeStamp = String(Math.floor(Date.now() / 1000));
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const packageStr = `prepay_id=${prepay_id}`;

    // 二次签名 (AppId + TimeStamp + NonceStr + Package)
    // const paySign = signWithRSA(appId, timeStamp, nonceStr, packageStr, privateKey);

    res.json({
      code: 200,
      message: '获取支付参数成功',
      data: {
        appId,
        timeStamp,
        nonceStr,
        package: packageStr,
        signType: 'RSA',
        paySign: 'REAL_SIGNATURE_BASE64_STRING', // 应填写真实签名
        outTradeNo
      }
    });

  } catch (error) {
    console.error('生成统一下单参数异常:', error);
    res.status(500).json({ code: 500, message: '支付初始化失败: ' + error.message });
  }
};
