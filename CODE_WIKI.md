# 「恋爱话术库」系统 Code Wiki

> 本仓库是一个**全栈商业闭环**系统，围绕「恋爱话术库」提供话术语料、AI 智能回复、社区互动、互动剧本、盲盒/签到、VIP、三级分销与提现、原生话术输入法等能力。
> 本文档描述项目整体架构、模块职责、关键类/函数、依赖关系与运行方式。

---

## 1. 项目总览

### 1.1 仓库结构

```
/workspace
├── huashu-app/          # 用户端前端（移动端 Web H5）  React 19 + Vite + Tailwind
├── huashu-admin/        # 管理后台前端（PC Web）       React 19 + Vite + react-router
├── huashu-backend/      # 后端 API 服务                Node.js + Express + Prisma + PostgreSQL
├── huashu-uniappx/      # 跨平台移动端（App/H5/小程序） uni-app x (UTS) + Vue 3
│   └── uni_modules/huashu-keyboard/  # 原生话术输入法（Android InputMethodService，Kotlin/UTS）
├── huashu-android/      # Android 壳工程（Gradle/Kotlin，托管原生输入法模块）
├── data/postgres/       # 本地方案 PostgreSQL 数据卷目录
├── patches/             # 历史一次性修复脚本（patch_*.js / fix_*.py 等）
├── lianaijiapan/        # 竞品/历史截图素材
├── docker-compose.yml   # 最小编排（db+backend+app+admin）
├── docker-compose.all.yml # 完整编排（postgres+backend+frontend+admin）
├── docker-start.sh / docker-start.bat  # 一键启动脚本（菜单交互）
├── start_services.sh    # nodemon/本地多进程启动脚本
└── README.md            # 项目总 README（商业化特性说明）
```

### 1.2 技术栈总表

| 端 | 技术 | 关键依赖 |
|---|---|---|
| huashu-backend | Node.js + Express 4 | `@prisma/client` `bcryptjs` `jsonwebtoken` `decimal.js` `multer` `cors` `dotenv` |
| huashu-app | React 19 + Vite + Tailwind | `framer-motion` `lucide-react` `axios`（业务用 fetch） |
| huashu-admin | React 19 + Vite + Tailwind + react-router | `recharts` `axios` `@tailwindcss/vite` |
| huashu-uniappx | uni-app x (UTS) + Vue 3 | `uni.request` 封装，原生模块 `huashu-keyboard`（Kotlin） |
| 数据库 | PostgreSQL 15 | Prisma ORM |

### 1.3 后端、前端之间端口与访问约定

| 服务 | 容器端口 | 宿主端口 | 说明 |
|---|---|---|---|
| PostgreSQL | 5432 | 5432 | 库 `huashu_db`，账号详见各 compose 文件 |
| Backend API | 3000 | 3000 | 基路径 `/api/v1` |
| 用户端 H5 | 80（app 镜像）| 5173(docker-compose.all) / 80 | Nginx 托管静态构建 |
| 管理后台 | 80（admin 镜像）| 3001（dev）/ 8080 / 3001 | Nginx 托管 |
| App dev server (Vite) | - | 5174（start_services）| H5 dev |

---

## 2. 后端 huashu-backend（核心）

### 2.1 目录结构与分层

遵循经典三层结构：

```
src/
├── index.js               # 应用入口：中间件 + 路由挂载 + 404/错误处理 + 启动
├── routes/                # 路由层：定义 HTTP 路径，绑定控制器与中间件
├── controllers/           # 控制器层：业务逻辑（普通 + admin 子目录）
│   ├── actionController.js / aiController.js / commentController.js /
│   ├── commissionController.js / courseController.js / favoriteController.js /
│   ├── floatScriptController.js / paymentController.js / postController.js /
│   ├── scriptController.js / serviceController.js / storyController.js / userController.js
│   └── admin/             # 管理后台控制器（约 17 个）
├── middleware/            # 鉴权中间件
├── data/db.js             # （兼容用）数据库连接
├── utils/
│   ├── prisma.js          # Prisma 客户端单例
│   └── wechatPay.js       # 微信支付 V3 验签/解密工具
prisma/
├── schema.prisma          # 数据模型定义
└── seed.js                # 种子数据
```

### 2.2 应用入口 `src/index.js`

- 加载 `dotenv`，创建 `express` 实例。
- 全局中间件：`cors`、`express.json()`、`express.urlencoded({extended:true})`。
- 静态托管 `/uploads`（对应 `../public/uploads`）。
- 健康检查 `GET /health`。
- 挂载全部路由统一前缀 `/api/v1`（注意各路由模块内部也前缀拼接）。
- 兜底：404 响应 `{code:404}`；400 全局错误处理返回 500。
- `app.listen(PORT)`，PORT 默认 3000。

**关键路由挂载对应表：**

| 路由文件 | 挂载前缀 | 说明 |
|---|---|---|
| userRoutes | `/api/v1` | 用户/认证/签到/VIP 兑换 |
| scriptRoutes | `/api/v1` | 话术库/分类/热搜/排序标签 |
| aiRoutes | `/api/v1` | AI 导师对话 |
| actionRoutes | `/api/v1` | UGC、点赞、举报 |
| serviceRoutes | `/api/v1` | 文章/避坑指南 |
| commissionRoutes | `/api/v1/commission` | 分销/团队/提现 |
| courseRoutes | `/api/v1/courses` | 课程 |
| commentRoutes | `/api/v1/comments` | 评论/评论点赞 |
| postRoutes | `/api/v1/posts` | 社区帖子/悬赏 |
| favoriteRoutes | `/api/v1` | 收藏 |
| uploadRoutes | `/api/v1/upload` | 文件上传(multer) |
| floatScriptRoutes | `/api/v1/float-scripts` | 浮窗话术 |
| storyRoutes | `/api/v1` | 互动剧本 |
| paymentRoutes | `/api/v1/payment` | 微信支付 |
| adminRoutes | `/api/v1/admin` | 全部管理接口 |

### 2.3 数据模型（Prisma `schema.prisma`）

核心模型（`model` → 关键字段 / 用途）：

| Model | 关键字段 | 用途 |
|---|---|---|
| `User` | wxOpenId, password, points, isVip, role(USER/MENTOR/ADMIN), inviteCode/inviterId（分销）, balance/totalEarned, lastSignInAt/continuousSignDays, vipExpireAt | 用户/导师/分销/签到/VIP |
| `Admin` | username, password, role(superadmin/admin/editor/reviewer), status | 后台账号，兼容 MENTOR 登录 |
| `AdminLog` | action, module, detail, ip, status | 后台操作审计日志 |
| `SystemSetting` | key(unique), value(Json) | 全局设置（含 `DISTRIBUTOR_CONFIG` 分销配置）|
| `Banner` | type(BANNER/ANNOUNCEMENT), status, sortOrder | 轮播/公告 |
| `Feedback` | type(BUG/SUGGESTION/ACCOUNT/OTHER), status, reply, images[] | 用户反馈 |
| `Notification` | target(ALL/VIP/SPECIFIC), status | 通知/站内信 |
| `Order` | type(VIP_MONTH/VIP_YEAR/POINTS_100...), status(PENDING/SUCCESS/FAILED/REFUNDED), amount | 订单（与分佣关联）|
| `CommissionLog` | level(1/2/3), amount, orderId, fromUserId | 三级分销流水 |
| `Withdrawal` | amount, status, accountInfo(Json) | 提现申请 |
| `Category` / `CategoryTag` | type(SCRIPT/POST), count | 分类及分类标签 |
| `ScriptSortTab` | key, sort, isDefault | 话术排序标签配置 |
| `Script` | question, type, tags[], answers[], likes, isNew, isFeatured | 话术语料库 |
| `Article` | title, desc, content(Json block) | 避坑指南文章 |
| `Contribution` | question, answer, status(pending/approved/rejected) | UGC 投稿审核 |
| `HotSearch` | keyword, order | 热搜词 |
| `Course` | title, desc, cover, isRecommended, instructor/lessons(Json) | 课程 |
| `Comment` / `CommentLike` | targetType(SCRIPT/ARTICLE/COURSE/POST), status, isAccepted | 评论体系 |
| `Post` / `PostLike` / `Report` | content, images[9], tags, isUrgent/rewardPoints/resolved | 社区帖子、悬赏 |
| `Favorite` | targetType, targetId, userId | 通用收藏 |
| `BlindBoxCard` | content, type(QUOTE/TIP), author | 每日盲盒卡片 |
| `InteractiveStory` / `StoryNode` / `StoryChoice` / `UserStoryProgress` | difficulty, isPremium, pointsRequired, affectionChange, affectionScore, status | 互动剧本引擎 |
| `FloatScript` | question, answer, category, order | 浮窗话术 |

### 2.4 鉴权中间件 `middleware/`

| 文件 | 作用 |
|---|---|
| `auth.js` | 普通用户认证：解析 `Authorization: Bearer`，设置 `req.user`，失败返回 401 |
| `adminAuth.js` | 后台认证：先用 admin 密钥验 token；失败再尝试以**用户密钥**验 token，若角色为 `MENTOR` 则构建 `req.admin`（导师身份登录后台）|
| `checkRole.js` | 角色权限校验：检查 `req.user.role` 是否满足所需角色，不足 403 |
| `optionalAuth.js` | 可选认证：解析 token 但不强制，供游客接口使用 |
| `requireSuperAdmin.js` | 超级管理员保护：拒绝 `MENTOR` 或无 admin 上下文，用于高危写操作 |

### 2.5 管理后台路由权限布局（`routes/adminRoutes.js`）

- 公开：`POST /login`
- 需 `adminAuth`：`GET /me`、`/stats`、分类/话术/投稿/评论/帖子/课程/通知/Banner/剧本/盲盒等的**读取或编辑**
- 需 `adminAuth + requireSuperAdmin`：用户管理、订单、Banner 写操作、管理员管理、日志、设置、分销/提现审核、脚本标签写操作、剧本写操作等所有**高危/写操作**

### 2.6 关键业务实现

#### 2.6.1 微信登录：`userController` 的 wx-login
- `POST /auth/wx-login`，通过 `jscode2session` 换取 OpenID（真实实现）；支持角色机制。

#### 2.6.2 微信支付与分销（`paymentController.js`）— **资金安全重点**
- **统一下单** `createUnifiedOrder`：
  - 记录 `PENDING` 订单（本地生成商户单号 `HS+timestamp+rand`）。
  - 金额用 `decimal.js` 转「分」避免浮点误差，组装微信 V3 JSAPI 参数。
  - 缺少商户环境变量时返回 **Mock prepay_id 供测试**。
- **回调** `wechatPayWebhook`：
  - 读 `wechatpay-signature/timestamp/nonce`，用 `wechatPay.verifySignature` 验签。
  - 用 `decryptResource` 解密 `resource.ciphertext`。
  - `prisma.$transaction` 事务内：
    - **幂等**：订单状态已是 `SUCCESS` 直接 return（配合行级乐观锁 `updateMany(status:PENDING)` 思想）。
    - 更新订单为 SUCCESS。
    - 按 `DISTRIBUTOR_CONFIG`（rates 1/2/3 级，默认 30%/15%/5%，可选 `requireVip` 门槛）向上遍历 3 级上级，用 `decimal.js` 计算并记录 `CommissionLog`，`balance/totalEarned` 增量更新。

#### 2.6.3 三级分销（`commissionController.js`）
- 我的分销信息 `distributor-info`、团队 `my-team`、佣金流水、`withdraw` 申请提现、`simulate-order`（可模拟订单）。

#### 2.6.4 互动剧本（`storyController.js` + `admin/storyAdminController.js`）
- 用户：列表、进度查询、**选择分支**（后端事务强校验好感度结算、结局判定、`replay` 扣积分重玩）。
- 后台：`/interactive-stories/generate`（AI 生成剧本）、剧本/节点/选项 CRUD。

#### 2.6.5 每日签到与盲盒（`userController.js`）
- `POST /user/daily-signin`：事务扣/发积分、更新 `continuousSignDays`，随机 `BlindBoxCard`。
- `POST /user/exchange-vip`：积分兑换 VIP（写 `vipExpireAt`）。

#### 2.6.6 上传（`uploadRoutes.js`）
- `POST /`，使用 `multer`，`combinedAuth` 允许普通用户或管理员 token，返回文件 URL（存入 `/uploads`）。

### 2.7 依赖清单（package.json）
- 运行时：`@prisma/client`、`bcryptjs`、`cors`、`decimal.js`、`dotenv`、`express`、`jsonwebtoken`、`multer`。
- 开发：`nodemon`、`prisma`。
- 脚本：`start` = `node src/index.js`，`dev` = `nodemon src/index.js`，seed 由 prisma 配置调用。

---

## 3. 用户端前端 huashu-app

### 3.1 架构要点
- **非路由驱动**：无 `react-router`，由全局 Context `AppContext.activeTab` + 底部 TabBar 切换首页视图。
- 入口：[`src/main.jsx`](./huashu-app/src/main.jsx) 用 `AppProvider` 包裹 `App`。
- 主界面 [`src/App.jsx`](./huashu-app/src/App.jsx) 依 `activeTab` 渲染 `Home / Discover / AI / Favorites / Profile`，含底部导航与悬浮 AI 按钮。
- Vite 配置：`/api` 代理到 `localhost:3000`，vendor chunk 优化。

### 3.2 全局状态 `context/AppContext.jsx`
集中管理：`activeTab`、token、登录/登出、用户资料、收藏、外卖(mock)、AI 状态、Toast、盲盒弹窗等。

### 3.3 API 封装 `services/api.js`（核心）
- `request(url, options)`：统一读取 `localStorage.token` 并注入 `Authorization: Bearer`，非 2xx 抛 `API Error: status`。
- 对关键接口做 **mock 降级**（后端不可用时返回 mock 数据保证 UI 可渲染）：
  - `getUserProfile`、`getPosts`、`dailySignIn`。
- 已封装模块：分类/话术/热搜/排序标签/分类标签、文章、课程、AI、社区帖子/举报/评论/点赞、收藏、微信登录、分销/提现、投稿、签到、积分兑 VIP、上传。

### 3.4 视图 `views/`
`Home / Discover / AI / Favorites / Profile / Login / Community / ServicePages`。UI 为「微信聊天模拟器」风格（灰底气泡），AI 助手与社区为主要互动区。

---

## 4. 管理后台前端 huashu-admin

### 4.1 架构要点
- **路由驱动**：使用 `react-router-dom`，入口直接渲染 `App`。
- 权限：`App.jsx` 内 `ProtectedRoute` 通过 `useAuth()` 判断 `admin` 是否存在，未登录重定向 `/login`；用 `AuthProvider` 包裹路由。
- Vite：dev 端口 `3001`，`/api` 代理到 `localhost:3000`。
- 图表使用 `recharts`。

### 4.2 认证 `context/AuthContext.jsx`
管理 `adminToken`、`admin`、加载状态；通过 `GET /api/v1/admin/me` 校验登录态。

### 4.3 页面 `pages/`
`Dashboard / Users / Content / Categories / ScriptTags / Courses / Comments / Posts / UGC / Orders / Notifications / Banners / Feedback / Admins / Logs / Settings / BlindBoxList / InteractiveStoryManagement / FloatScripts / Login` 等，对应后端各 admin 路由模块。

---

## 5. 跨平台移动端 huashu-uniappx

### 5.1 架构
- 技术：uni-app x（`main.uts` 用 `createSSRApp(App)`），Page 配置在 [`pages.json`](./huashu-uniappx/pages.json)，App 生命周期在 `App.uvue`，全局样式 `common/global.css`。
- 状态：`store/app.uts` 用 `reactive` 维护 token、用户信息、activeTab、toast、VIP 弹窗，含 `logout`。
- API：`services/api.uts` 基于 `uni.request` 的 Promise 封装，自动带 token，处理 401/403 自动登出。

### 5.2 页面分组（`pages/`）
- 首页：`index`、`discover`、`community`、`favorites`、`profile`
- 话术：`script-detail`、`all-pitfalls`、`contribute`(投稿)、`contributions`、`articles`(文章)
- AI：`ai/ai`、`ai/tool`、`ai-history`、`keyboard-assistant`
- 商业化：`course`、`blind-box`(每日盲盒)、`invite`(邀请)、`distributor/`(分销 index/team/withdraw)、`points`、`tasks`、`vip`（`VipModal`）
- 剧本：`story/list`、`story/play`
- 工具/其他：`assessment`(恋爱评测)、`custom`(话术定制)、`feedback`、`history`、`notes`、`login`、`download`、`support`、`topic`、`settings`、`profile-edit`

### 5.3 原生话术键盘 `uni_modules/huashu-keyboard/`
- UTS 封装：`utssdk/index.uts` 暴露 `openIMESettings()` 跳转系统输入法设置。
- Android 原生（Kotlin）：
  - `AndroidManifest.xml` 把 `com.huashu.keyboard.HuashuIME` 注册为 `InputMethod` 服务（`BIND_INPUT_METHOD`），绑定 `res/xml/method.xml`。
  - `HuashuIME.kt : InputMethodService()`：`onCreateInputView()` 构建键盘面板；展示分类/话术列表，内置 **VIP 鉴权**（非 VIP 点击高级神回复 → 原生 Toast 拦截上屏），VIP 或解锁后通过 `currentInputConnection.commitText(...)` 直接上屏到微信/QQ。
  - 内置 MVP 中文拼音混拼候选引擎（缓冲下划线组词 + 横向候选词长廊）。
- 商业模式：普通用户在键盘内被拦截后引导回主 App 内置购买（引流闭环）。

---

## 6. Android 壳工程 huashu-android

- Gradle(DSL) / 可空工程，托管、打包原生输入法模块。`app/src/main/AndroidManifest.xml` 声明应用入口；`gradle.properties` 配置构建；`gradlew` 可直接构建。
- ⚠️ 说明：当前该目录源码较少，主要作为「原生话术输入法」在 Android 侧打包/挂载的宿主壳。

---

## 7. 辅助脚本与运行时脚本

| 文件 | 用途 |
|---|---|
| `docker-start.sh` / `.bat` | 一键 Docker 启动菜单（全部/仅后端/仅库/停止/清理数据）|
| `start_services.sh` | 本地并行启动 backend/admin(5173)/app(5174)，写 pid 文件 |
| `huashu-backend/docker-compose.yml` | 后端子编排 |
| 根 `docker-compose.yml` / `docker-compose.all.yml` | 全栈编排（前者含本地方案 `./data/postgres` 卷）|
| `patches/*` | 历史一次性 UI/路由修复脚本 |
| `fix_*.py` | 历史 CSS/UI 修复脚本 |
| `gallery.html` / `generate_gallery.py` | 截图画廊生成 |
| `lianaijiapan/*.jpg` | 竞品「恋话宝」对比截图 |
| `恋爱话术库_vs_恋话宝_竞品分析报告.md` | 竞品分析文档 |

---

## 8. 运行方式

### 8.1 Docker 一键（推荐）
```bash
# Linux/Mac
./docker-start.sh          # 交互菜单；或直接：
docker-compose -f docker-compose.all.yml up -d --build
# Windows
docker-start.bat
```
启动后可访问：
- 用户端 H5：`http://localhost:5173`
- 管理后台：`http://localhost:3001`（默认 `admin / admin123`）
- 后端 API：`http://localhost:3000/api/v1`
- PostgreSQL：`localhost:5432`（详见各 compose）

### 8.2 本地开发
```bash
# 1. 数据库 + 后端
cd huashu-backend
npx prisma db push && node prisma/seed.js   # 同步 schema + 种子
npm install
npm run dev                                 # 后端 :3000

# 2. 用户端 / 管理后台（各自开终端）
cd ../huashu-app && npm install && npm run dev      # Vite H5
cd ../huashu-admin && npm install && npm run dev    # :3001
```

### 8.3 常用运维命令
```bash
docker logs huashu-backend / huashu-postgres
docker exec -it huashu-postgres psql -U huashu -d huashu_db
docker-compose -f docker-compose.all.yml down       # 停止
docker-compose -f docker-compose.all.yml down -v     # 停止并清数据(慎用)
```

---

## 9. 关键环境变量（huashu-backend/.env.example）

```env
DATABASE_URL="postgresql://huashu:huashu_password@localhost:5432/huashu_db?schema=public"
PORT=3000
JWT_SECRET="your-secret-key-here"     # 用户 token 密钥（adminAuth 另有独立默认备用密钥）
NODE_ENV=production
# 微信支付 V3（可选，缺省走 Mock）：
# WX_PAY_MCHID / WX_APP_ID / WX_PAY_NOTIFY_URL / 支付平台验签公钥与商户私钥（wechatPay.js 使用）
```

---

## 10. 依赖关系图（简）

```
huashu-app ┐                          ┌→ PostgreSQL:5432 (huashu_db)
huashu-admin ┤ ——HTTP /api/v1——→  huashu-backend:3000  Prisma →┘
huashu-uniappx ┘   (Authorization: Bearer JWT)
       │  ├─(Android) huashu-keyboard(InputMethodService) → commitText 上屏到微信/QQ
       │  └─(H5/小程序) 同一套后端
               │
               └─── 微信开放平台: jscode2session / 微信支付V3(统一下单+回调验签)
```

### 10.1 一次完整商业行为链路（示例：充值VIP）
1. 用户在 huashu-app/uniappx 点购买 → 调 `POST /api/v1/payment/wechat/unified-order`。
2. 后端建 `PENDING` 订单，转分后用 `decimal.js` + 商户私钥调微信 V3 统一下单 → 返回 prepay_id + RSA 签名。
3. 前端拉起收银台支付。
4. 微信异步回调 `/api/v1/payment/wechat/webhook` → 验签 → 事务内幂等更新订单为 `SUCCESS` → 按分销配置给 1/2/3 级上级结算 `CommissionLog`，更新 `balance/totalEarned`。
5. 分销用户可在 huashu-app 查看团队/申请提现；后台 `requireSuperAdmin` 审核提现。

---

## 11. 依赖清单（前端依赖速查）

- **huashu-app**：react 19、react-dom、framer-motion、lucide-react、axios、vite、@vitejs/plugin-react、tailwindcss、postcss、autoprefixer。
- **huashu-admin**：react 19、react-dom、react-router-dom、recharts、axios、vite、@vitejs/plugin-react、@tailwindcss/vite、tailwindcss、eslint。
- **huashu-backend**：见 §2.7。