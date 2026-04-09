const fs = require('fs');

const file = 'src/routes/paymentRoutes.js';
let content = fs.readFileSync(file, 'utf8');

const authMid = `const auth = require('../middleware/auth');\n`;

if(!content.includes('unified-order')) {
  const newRoute = `// 微信支付 V3 统一下单接口 (获取 prepay_id)
router.post('/wechat/unified-order', auth, paymentController.createUnifiedOrder);\n`;
  content = authMid + content + newRoute;
  fs.writeFileSync(file, content, 'utf8');
}
