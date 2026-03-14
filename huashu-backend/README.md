# 恋爱话术库 App - 后端服务 (Node.js/Express)

这是配合「恋爱话术库」前端项目（用户端和管理后台）的后端 API 服务，使用 Node.js、Express 框架搭建，并结合 Prisma ORM 和 PostgreSQL 数据库进行数据持久化。

## 目录结构

```text
huashu-backend/
├── prisma/               # 数据库 schema 及迁移文件 (schema.prisma)
├── src/
│   ├── controllers/      # 控制器层：处理核心业务逻辑
│   │   ├── actionController.js  # UGC贡献、用户操作相关
│   │   ├── aiController.js      # AI 对话回复生成模拟
│   │   ├── scriptController.js  # 话术内容、分类获取
│   │   ├── serviceController.js # 课程、避坑指南文章获取
│   │   └── userController.js    # 用户登录、资料管理
│   ├── middleware/       # 鉴权中间件 (adminAuth, requireSuperAdmin 等)
│   ├── routes/           # 路由层：定义 API 路径并绑定控制器
│   │   ├── adminRoutes.js
│   │   ├── actionRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── scriptRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── userRoutes.js
│   └── index.js          # 应用入口文件，装载中间件及所有路由
├── package.json
├── .env.example          # 环境变量示例
└── README.md
```

## 🚀 快速启动

### 1. 数据库准备
请确保您已经安装并运行了 PostgreSQL 15+ 数据库。若不想本地安装，也可以使用项目根目录提供的 Docker Compose 一键启动 `huashu-postgres`。

### 2. 进入后端目录并安装依赖
```bash
cd huashu-backend
npm install
```

### 3. 配置环境变量
在项目根目录复制 `.env.example`（或新建 `.env` 文件），配置以下必要的环境变量：

```env
# 您的 PostgreSQL 连接字符串
DATABASE_URL="postgresql://huashu:huashu123@localhost:5432/huashu_db?schema=public"

# JWT 签名密钥
JWT_SECRET="huashu_user_secret_key_2026"
```

### 4. 数据库迁移 (同步 Schema)
执行 Prisma 迁移命令，将 `schema.prisma` 中的表结构应用到 PostgreSQL 数据库中：
```bash
npx prisma db push
# 或使用: npx prisma migrate dev --name init
```

### 5. 启动开发服务器
```bash
npm run dev
# 或直接运行: node src/index.js
```
服务默认运行在 `http://localhost:3000`。

## 🧩 核心接口说明 (Base URL: `/api/v1`)

### 1. 管理后台模块 (`/admin`)
- 提供图表看板数据获取。
- 分类 (`Category`)、话术 (`Script`) 的增删改查。
- UGC 内容审核 (`/contributions/:id/review`)。
- 系统全局设置管理（需管理员权限校验）。

### 2. 用户模块
- `POST /auth/wx-login` : 微信登录（支持角色机制，例如 'USER', 'MENTOR', 'BANNED'）。
- `GET /user/profile` : 获取个人主页信息，包含积分、签到状态、VIP 期限。
- `PUT /user/profile` : 修改个人主页信息。

### 3. 内容库模块
- `GET /categories` : 获取话术分类列表（含统计数据）。
- `GET /scripts/hot-searches` : 获取热搜词。
- `GET /scripts` : 获取话术列表 (支持分页、分类筛选和搜索)。
- `GET /scripts/:id` : 获取单个话术详情。

### 4. AI 导师模块
- `POST /ai/chat` : 提交对话并获取 AI 回复建议。

### 5. 互动与 UGC 模块
- `POST /contributions` : 提交原创话术（写入 Prisma 关联表，等待后台审核）。
- 急急急悬赏系统：创建紧急提问并使用积分作为悬赏，扣除积分支持事务操作以避免并发问题。

## ⚙️ 进阶开发

### JWT 鉴权
部分用户路由受 JWT 保护。请求时需在 Header 中添加 `Authorization: Bearer <Your_Token>`。
管理路由受 `adminAuth` 及 `requireSuperAdmin` 保护，需要管理员账号 Token 且保证具有合法权限。

### 生产部署
推荐使用 Docker。项目内置了 `Dockerfile` 和根目录的 `docker-compose.yml`，可以直接使用 `docker-compose up --build -d` 进行生产级别部署。

## 📄 License

MIT
