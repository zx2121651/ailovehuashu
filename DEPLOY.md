# 话术库全栈项目部署指南 (Windows 11 本地 Docker 部署版)

此文档指导您如何在 **Windows 11 本地环境**下，通过 Docker 一键部署和运行本项目。
由于本项目包含数据库(PostgreSQL)、后端(Node.js API)和两个前端(App & Admin)，通过 Docker Compose 统一启动可以完全免除您在本地配置数据库、Node.js 环境的烦恼。

---

## 一、 环境准备 (安装 Docker Desktop)

在 Windows 11 上运行 Docker，最推荐也是最简单的方式是使用 **Docker Desktop**。

1. **下载并安装**：
   前往 [Docker 官方网站](https://www.docker.com/products/docker-desktop/)，点击 "Download for Windows" 进行下载并安装。

2. **启用 WSL 2 (如果需要)**：
   Docker Desktop 在 Windows 上通常依赖于 WSL 2 (Windows Subsystem for Linux)。安装过程中如果提示需要启用或更新 WSL，请按照弹出的提示完成操作。

3. **启动 Docker**：
   安装完成后，从开始菜单启动 "Docker Desktop"。看到右下角出现绿色图标，或者软件界面显示 "Engine running" 即可。

---

## 二、 启动服务

当您将项目代码准备好后，无需安装任何 Node.js 依赖，只需打开 Windows 自带的终端（例如 **PowerShell** 或 **CMD**），执行以下步骤：

### 1. 进入项目根目录

在 PowerShell 中，使用 `cd` 命令进入包含 `docker-compose.yml` 的项目根目录。例如：
```powershell
cd C:\Users\YourName\Documents\huashu-project
```

### 2. 执行一键构建与启动

在项目根目录下，执行以下命令：
```powershell
docker-compose up -d --build
```

> **注意：** 第一次运行 `--build` 参数非常重要，Docker 将开始：
> 1. 下载基础镜像（Node、Nginx、Postgres）。
> 2. 将 React 前端项目 (`huashu-app` 和 `huashu-admin`) 编译成静态文件打包到 Nginx 容器。
> 3. 运行后端并自动执行 Prisma 数据库表结构初始化 (`npx prisma db push`)。
>
> 整个过程可能需要几分钟，请耐心等待直到控制台提示 `Started`。

---

## 三、 访问系统与验证

构建并启动完成后，您的服务就已经在本地跑起来了！您可以直接打开浏览器访问：

*   📱 **客户端 (App)**: 浏览器访问 `http://localhost` (默认映射在 80 端口)
*   💻 **管理后台 (Admin)**: 浏览器访问 `http://localhost:8080`

*(由于我们在 Nginx 镜像里配置了反向代理，您的前端请求会自动被转发给内部的后端 API 容器，完美规避跨域等问题)*

---

## 四、 数据持久化说明

在 `docker-compose.yml` 中，PostgreSQL 的数据已经被映射到了您项目目录下的 `./data/postgres` 文件夹中。

即使您执行了关闭或删除容器的操作，**只要您不删除 Windows 本地的 `./data/postgres` 文件夹**，您添加的话术、用户、评论等数据就**永远不会丢失**。下次重新启动容器时，它会自动读取这里的数据。

---

## 五、 日常使用与命令

在日常的 Windows 开发测试中，您可以随时开关这组服务：

*   **查看运行状态与日志：**
    您不仅可以使用命令行，也可以直接打开 **Docker Desktop** 软件，在 "Containers" 标签页中直观地点击启动、停止按钮，或点击各个容器（如 `huashu-backend`）查看日志。

*   **停止所有服务 (命令行)：**
    ```powershell
    docker-compose down
    ```

*   **重启所有服务：**
    ```powershell
    docker-compose restart
    ```

*   **如果您修改了代码，需要重新部署：**
    ```powershell
    docker-compose up -d --build
    ```