# 恋爱话术库 App - 管理后台

本项目是「恋爱话术库」的管理后台系统，专为 PC 浏览器设计，使用 React 19 + Vite + TailwindCSS 构建。

## 🌟 功能简介

- **数据看板**：包含用户增长、活跃度、分类数据等图表统计信息。
- **话术管理**：支持对所有话术和分类进行增删改查。
- **UGC 内容审核**：用户在前台提交的原创话术在此被审核，支持通过（奖励积分）或拒绝。
- **用户管理**：展示注册用户列表、状态管理（如封号）、角色分配。
- **系统设置**：包括基础信息配置、支付设置、分销参数等系统级别的调整。

## 🛠️ 技术栈

- **核心框架**: React 19, Vite
- **状态管理**: React Context API
- **UI 组件库**: TailwindCSS，结合 `lucide-react` 用于图标展示
- **数据可视化**: `recharts` (AreaChart, PieChart 等)
- **网络请求**: 原生 `fetch` (手动携带 Token 处理请求)

## 🚀 快速启动

### 1. 环境准备
请确保您的电脑上已安装 Node.js (推荐 v18+)。

### 2. 安装依赖
```bash
cd huashu-admin
npm install
```

### 3. 本地开发服务器
```bash
npm run dev
```

启动后，访问 `http://localhost:3001`（具体端口可查看终端提示或 `vite.config.js` 配置）。

### 4. 默认登录信息
在连接真实后端或本地模拟开发时，可使用以下凭据进行登录体验：
- **管理员账号**: `admin`
- **密码**: `admin123`

## ⚙️ 环境变量配置

所有的系统设置与接口均与后端配合。默认 API 地址为 `http://localhost:3000/api/v1`。
登录成功后，前端会在 `localStorage` 中保存 `adminToken` 和 `adminUser` 状态。

## 📂 项目结构简述

```text
huashu-admin/
├── public/           # 静态资源
├── src/
│   ├── assets/       # 图标与全局资源
│   ├── components/   # 可复用的后台组件 (Layout, Sidebar, Header, Modal)
│   ├── contexts/     # 鉴权状态管理 (AuthContext.jsx)
│   ├── pages/        # 管理页面 (Dashboard, Scripts, Categories, Users, Review, Settings)
│   ├── App.jsx       # 路由配置与全局上下文入口
│   ├── index.css     # 全局样式及 Tailwind 指令 (包含自定义动画 keyframes)
│   └── main.jsx      # 入口文件
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 📄 License

MIT
