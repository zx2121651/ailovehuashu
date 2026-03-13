# 恋爱话术库 App - 用户端前端

本项目是「恋爱话术库」的前端用户端，专为移动端 Web 浏览设计，使用 React 19 + Vite + TailwindCSS 构建。

## 🌟 功能简介

- **发现与首页**：浏览最新的话术推荐、热门搜索。
- **话术库**：通过分类筛选（如开场白、进阶、挽回等）查找并复制高情商回复。
- **社区广场**：用户可以分享交流实战经验（UGC）。
- **AI 导师**：调用后端 AI 接口，输入女生的话，一键生成多条回复建议。
- **个人中心**：管理个人资料、收藏夹、积分、我的发布等。

## 🛠️ 技术栈

- **核心框架**: React 19, Vite
- **状态管理**: React Context API
- **路由**: 自定义/React Router (视具体实现而定，主导航基于 Context)
- **UI 样式**: TailwindCSS, Lucide React (图标)
- **网络请求**: Fetch API / Axios
- **列表滚动**: react-intersection-observer (无限滚动)

## 🚀 快速启动

### 1. 环境准备
请确保您的电脑上已安装 Node.js (推荐 v18+)。

### 2. 安装依赖
```bash
cd huashu-app
npm install
```

### 3. 本地开发服务器
```bash
npm run dev
```

启动后，访问 `http://localhost:5173`。如果您在手机上预览，请确保手机与电脑在同一局域网下，并访问终端提示的 Network 地址。

## ⚙️ 环境变量配置

默认情况下，API 请求会指向本机的后端服务（`http://localhost:3000/api/v1`）。如需修改：
在 `src/services/api.js` 中调整 `BASE_URL`，或通过 `.env` 文件进行配置（如果项目支持）。

*注意：在本地开发时，如果没有启动后端，项目内置了自动容错机制，将使用预置的 mock 数据进行渲染，不影响 UI 的预览和调试。*

## 📂 项目结构简述

```text
huashu-app/
├── public/           # 静态资源
├── src/
│   ├── assets/       # 图片、图标等资源
│   ├── components/   # 可复用的 UI 组件（如 Button, Modal, ScriptList）
│   ├── contexts/     # 全局状态管理（如 AppContext, 包含用户鉴权）
│   ├── data/         # 模拟数据 (Mock data)
│   ├── hooks/        # 自定义 Hook (如无限滚动、下拉刷新)
│   ├── pages/        # 页面级组件 (Home, Discover, Community, Profile 等)
│   ├── services/     # API 请求封装 (api.js)
│   ├── App.jsx       # 根组件，路由与 Context 注入
│   ├── index.css     # 全局样式及 Tailwind 指令
│   └── main.jsx      # 入口文件
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 📄 License

MIT
