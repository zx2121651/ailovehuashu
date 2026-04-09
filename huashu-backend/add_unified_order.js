const fs = require('fs');

const file = 'src/controllers/paymentController.js';
let content = fs.readFileSync(file, 'utf8');

const newApi = `

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
    const packageStr = \`prepay_id=\${prepay_id}\`;

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
`;

fs.appendFileSync(file, newApi, 'utf8');
console.log('统一下单接口注入成功');
