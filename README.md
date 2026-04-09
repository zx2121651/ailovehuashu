# 恋爱话术库系统

欢迎来到「恋爱话术库」项目！这是一个完整的全栈解决方案，旨在帮助用户提升沟通技巧，包含丰富的语料库、AI 智能回复建议、社区互动等功能。

本项目包含前端用户端、跨平台原生端、管理后台、后端 API 和 PostgreSQL 数据库，支持使用 Docker 一键本地启动，方便开发与测试。

## 📁 核心子项目

| 模块 | 描述 | 技术栈 |
|---|---|---|
| [👉 **huashu-app**](./huashu-app/) | 前端用户端（移动端 Web 前台） | React 19, Vite, TailwindCSS |
| [👉 **huashu-uniappx**](./huashu-uniappx/) | 跨平台移动端（可编译 App/H5/小程序）| uni-app x (UTS), Vue 3 |
| [👉 **huashu-admin**](./huashu-admin/) | 管理后台（PC Web 界面） | React 19, Vite, TailwindCSS |
| [👉 **huashu-backend**](./huashu-backend/) | 后端 API 服务 | Node.js, Express, Prisma, PostgreSQL |


## 🚀 核心商业化特性 (Commercial Features)

本项目已完成从工具到**完整商业闭环**的高级架构演进：

### 1. 微信生态资金安全底座 (Financial Security)
*   **高精度结算**：全后端抛弃原生 JavaScript 浮点数，引入 `decimal.js`，彻底解决三级分销返佣（如 `0.1+0.2 != 0.3`）带来的资金库账目不平隐患。
*   **V3 支付防并发锁**：微信异步回调 (Webhook) 采用原生 `Wechatpay-Signature` 验签，并巧妙结合 Prisma `updateMany(status: PENDING)` 的**行级乐观锁**，实现绝对的接口幂等性，杜绝高并发幻读。
*   **真实鉴权流**：后端已集成 `jscode2session` 真实换取 OpenID 及 `createUnifiedOrder` V3 统一下单接口（生成 prepay_id 和 RSA 签名拉起收银台）。

### 2. 沉浸式互动剧本引擎 (WeChat Simulator)
*   **高转化 UI**：摒弃重度的二次元游戏画风，在 React (Web) 前端通过 `framer-motion` 和 Tailwind 重构了**高度本土化的“微信聊天模拟器”风格**（灰底、气泡尾巴、底部快捷回复选项）。
*   **好感度防作弊**：前端仅作 `Dumb UI` 展示，所有的选项流转、结局判断、以及耗费积分购买重玩次数，皆由后端 Prisma 事务强校验，保障虚拟资产不流失。

### 3. 终极转化入口：原生话术键盘 (Android Hybrid IME)
*   位于 `huashu-uniappx` 跨平台端内，基于 UTS/Kotlin 编写的**真正操作系统级底层输入法服务** (InputMethodService)。
*   **无缝上屏**：打破 App 隔离，用户在微信/QQ 聊天界面中直接唤出话术键盘，点击话术秒速 `commitText` 进微信输入框。
*   **双模混拼引擎**：行业罕见的**“话术/键盘热切换”**设计。不仅能发话术，键盘内置了一个 **MVP 级的中文拼音匹配引擎**（支持缓冲动态下划线组词和横向候选词长廊），未来可无缝对接 SQLite 开源中文词库。
*   **VIP 流量拦截墙**：键盘原生内置 `isVip` 鉴权。普通用户点击高级神回复时，触发原生 `Toast` 并拦截上屏，引导引流回主 App 内置购买，实现商业模式闭环。

## 🚀 快速开始 (Docker 一键启动)

使用 Docker，您可以一次性启动所有服务，无需在本地配置繁琐的环境。

### 方式一：使用启动脚本（推荐）

#### Windows
```bash
docker-start.bat
```

#### Linux/Mac
```bash
chmod +x docker-start.sh
./docker-start.sh
```

菜单选项：
- **1) 启动全部服务** - 一键启动后端 + 数据库 + React 前端 + 管理后台
- **2) 仅启动后端** - 只启动 API 和数据库
- **3) 仅启动数据库** - 只启动 PostgreSQL
- **4) 停止所有服务** - 停止并清理
- **5) 清理数据** - 停止并删除所有持久化数据

### 方式二：使用 Docker Compose 命令行

#### 仅启动后端和数据库
```bash
cd huashu-backend
docker-compose up -d --build
```

#### 启动全部服务（包括 React 前端和后台）
```bash
docker-compose -f docker-compose.all.yml up -d --build
```

## 🔗 服务访问地址

容器全部启动后，您可以通过以下地址访问各模块：

| 服务 | 本地访问地址 | 默认账号密码 | 描述 |
|------|------|------|------|
| **React 用户端** | [http://localhost:5173](http://localhost:5173) | 无需登录即可浏览 | 移动端体验，普通用户使用的前端页面 |
| **React 管理后台** | [http://localhost:3001](http://localhost:3001) | 用户名: `admin`<br>密码: `admin123` | 管理员系统，处理审核及系统设置 |
| **Node.js 后端 API** | [http://localhost:3000/api/v1](http://localhost:3000/api/v1) | - | RESTful API 基础路径 |
| **PostgreSQL 数据库** | `localhost:5432` | 账号: `huashu`<br>密码: `huashu123`<br>DB: `huashu_db` | 数据存储层 |

*(注：如果您想体验原生 App 版本，请查阅 `huashu-uniappx` 目录下的运行指南，使用 HBuilderX 进行编译)*

## 🛠️ 本地开发模式

如果您希望独立开发并使用热更新功能，请参考对应子项目的 `README.md`。一般步骤如下：

### 1. 启动数据库与后端
```bash
cd huashu-backend
# 启动 PostgreSQL 容器
docker-compose up -d

# 安装依赖并本地启动后端服务
npm install
npm run dev
```

### 2. 启动前端项目 (多开终端)
```bash
# 用户端前台
cd huashu-app
npm install
npm run dev

# 管理后台
cd huashu-admin
npm install
npm run dev
```

## 📝 Docker 常用管理命令

```bash
# 查看运行中的容器
docker ps

# 查看后端日志
docker logs huashu-backend

# 查看数据库日志
docker logs huashu-postgres

# 进入后端容器
docker exec -it huashu-backend sh

# 进入数据库
docker exec -it huashu-postgres psql -U huashu -d huashu_db

# 停止所有服务
docker-compose -f docker-compose.all.yml down

# 停止并删除数据卷 (警告: 这会清除数据库数据)
docker-compose -f docker-compose.all.yml down -v
```

## ⚠️ 注意事项

1. **端口占用**：在启动前，请确保您的计算机上 3000、3001、5173 和 5432 端口未被其他程序占用。
2. **Docker 环境**：需要预先安装好 Docker Desktop 或 Docker Engine。
3. **数据持久化**：数据库的数据存储在 Docker Volume 中，只要不使用 `-v` 参数销毁它，重新启动容器数据均会保留。

## 📄 License

MIT
