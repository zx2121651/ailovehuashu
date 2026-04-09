const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 微信支付 V3 回调接口 (注意：这里需要原始 body 用于验签，通常在 index.js 配置 express.raw()
// 或者使用 body-parser 的 verify 选项来获取 rawBody)
router.post('/wechat/webhook', paymentController.wechatPayWebhook);

module.exports = router;
// 微信支付 V3 统一下单接口 (获取 prepay_id)
router.post('/wechat/unified-order', auth, paymentController.createUnifiedOrder);
