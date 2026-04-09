const fs = require('fs');

const file = 'README.md';
let content = fs.readFileSync(file, 'utf8');

const newFeatures = `
## 🚀 核心商业化特性 (Commercial Features)

本项目已完成从工具到**完整商业闭环**的高级架构演进：

### 1. 微信生态资金安全底座 (Financial Security)
*   **高精度结算**：全后端抛弃原生 JavaScript 浮点数，引入 \`decimal.js\`，彻底解决三级分销返佣（如 \`0.1+0.2 != 0.3\`）带来的资金库账目不平隐患。
*   **V3 支付防并发锁**：微信异步回调 (Webhook) 采用原生 \`Wechatpay-Signature\` 验签，并巧妙结合 Prisma \`updateMany(status: PENDING)\` 的**行级乐观锁**，实现绝对的接口幂等性，杜绝高并发幻读。
*   **真实鉴权流**：后端已集成 \`jscode2session\` 真实换取 OpenID 及 \`createUnifiedOrder\` V3 统一下单接口（生成 prepay_id 和 RSA 签名拉起收银台）。

### 2. 沉浸式互动剧本引擎 (WeChat Simulator)
*   **高转化 UI**：摒弃重度的二次元游戏画风，在 React (Web) 前端通过 \`framer-motion\` 和 Tailwind 重构了**高度本土化的“微信聊天模拟器”风格**（灰底、气泡尾巴、底部快捷回复选项）。
*   **好感度防作弊**：前端仅作 \`Dumb UI\` 展示，所有的选项流转、结局判断、以及耗费积分购买重玩次数，皆由后端 Prisma 事务强校验，保障虚拟资产不流失。

### 3. 终极转化入口：原生话术键盘 (Android Hybrid IME)
*   位于 \`huashu-uniappx\` 跨平台端内，基于 UTS/Kotlin 编写的**真正操作系统级底层输入法服务** (InputMethodService)。
*   **无缝上屏**：打破 App 隔离，用户在微信/QQ 聊天界面中直接唤出话术键盘，点击话术秒速 \`commitText\` 进微信输入框。
*   **双模混拼引擎**：行业罕见的**“话术/键盘热切换”**设计。不仅能发话术，键盘内置了一个 **MVP 级的中文拼音匹配引擎**（支持缓冲动态下划线组词和横向候选词长廊），未来可无缝对接 SQLite 开源中文词库。
*   **VIP 流量拦截墙**：键盘原生内置 \`isVip\` 鉴权。普通用户点击高级神回复时，触发原生 \`Toast\` 并拦截上屏，引导引流回主 App 内置购买，实现商业模式闭环。
`;

// 插入到 "## 🚀 快速开始" 前面
if (content.includes('## 🚀 快速开始')) {
  content = content.replace('## 🚀 快速开始', newFeatures + '\n## 🚀 快速开始');
  fs.writeFileSync(file, content, 'utf8');
  console.log('README.md 更新成功');
} else {
  console.log('未找到替换锚点');
}
