# 恋爱话术库 App - uni-app x 跨平台版

本项目是原 `huashu-app` (React Web 端) 的跨平台原生重构版本，采用 DCloud 最新的 **uni-app x (UTS)** 框架和 Vue 3 组合式 API 编写。

通过 uni-app x，本项目可以直接被编译为高性能的原生 Android (Kotlin) / iOS (Swift) 应用，以及标准的小程序和 H5 页面。

## ⚙️ 运行环境要求

由于 `uni-app x` 采用了自研的 UTS 语言，并且涉及到原生代码的编译，**无法**像传统的 React 或普通 Vue 项目那样直接在命令行使用 `npm run dev` 运行。

**官方且唯一推荐的运行方式是使用 HBuilderX 开发工具。**

## 🚀 运行步骤

### 1. 下载 HBuilderX
请前往 DCloud 官网下载最新版的 **HBuilderX (Alpha版 或 正式版，推荐使用 Alpha 版以获得对 uni-app x 最好的支持)**：
👉 [HBuilderX 下载地址](https://www.dcloud.io/hbuilderx.html)

### 2. 导入项目
1. 打开 HBuilderX。
2. 点击顶部菜单栏的 `文件` -> `导入` -> `从本地目录导入...`。
3. 选择本目录（即包含 `manifest.json` 和此 `README.md` 的 `huashu-uniappx` 文件夹）。

### 3. 运行到目标平台
导入成功后，在 HBuilderX 的左侧项目管理器中选中本项目，然后点击顶部菜单栏的 `运行`：

- **运行到浏览器 (H5 预览)：**
  点击 `运行` -> `运行到浏览器` -> 选择 `Chrome` 或 `内置浏览器`。
  *(注：H5 环境主要用于快速预览 UI 布局与逻辑，部分原生特性可能受限)*

- **运行到手机或模拟器 (原生 App 预览 - 推荐)：**
  1. 确保您的电脑上已安装 Android 模拟器（如雷电、夜神、Android Studio 自带模拟器）或通过 USB 连接了开启“开发者模式”的真机。
  2. 点击 `运行` -> `运行到手机或模拟器` -> 选择检测到的设备。
  3. HBuilderX 会自动编译 UTS 代码为原生基座，并将 App 安装到您的设备上运行，体验丝滑的原生动画与交互。

## 🔌 关于数据与后端

- 本项目中的所有接口调用文件位于 `services/api.uts`。
- 默认情况下，API 的基准地址 (`BASE_URL`) 指向本机的 `http://127.0.0.1:3000/api/v1`（即您的 `huashu-backend` 项目）。
- **容错机制**：如果您在本地**没有启动**后端服务，所有的接口调用失败后都会被底层的 `try-catch` 捕获，并**自动使用预置的 Mock 数据**进行渲染。因此，即使没有后端，您也可以完整预览和测试 UI 交互。

## 📄 License

MIT
