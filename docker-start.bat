@echo off
chcp 65001 >nul

:: 恋爱话术库 - Docker 一键启动脚本 (Windows)
:: 支持：后端 API、前端用户端、管理后台、PostgreSQL 数据库

echo ==================================
echo 🚀 恋爱话术库 - Docker 一键启动
echo ==================================
echo.

:: 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：Docker 未安装
    echo 请先安装 Docker: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：Docker Compose 未安装
    echo 请先安装 Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

:: 显示菜单
echo 请选择启动模式：
echo.
echo 1) 🌐 启动全部服务（后端 + 数据库 + 前端 + 管理后台）
echo 2) 🔧 仅启动后端服务（API + 数据库）
echo 3) 🗄️  仅启动数据库
echo 4) 🛑 停止所有服务
echo 5) 🧹 停止并清理数据（删除容器和数据卷）
echo.

set /p choice="请输入选项 [1-5]: "

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_db
if "%choice%"=="4" goto stop_all
if "%choice%"=="5" goto clean_all

echo ❌ 无效选项
pause
exit /b 1

:start_all
echo 🌐 启动全部服务...
echo.

:: 创建日志目录
if not exist logs mkdir logs

:: 1. 启动后端和数据库
echo ⏳ 启动后端服务（API + PostgreSQL）...
cd huashu-backend
docker-compose up -d --build
cd ..

:: 等待数据库就绪
echo ⏳ 等待数据库初始化...
timeout /t 5 /nobreak >nul

:: 2. 检查并启动前端
echo ⏳ 启动用户端前端（http://localhost:5173）...
start "用户端前端" cmd /k "cd huashu-app && npm install && npm run dev"

echo ⏳ 启动管理后台（http://localhost:3001）...
start "管理后台" cmd /k "cd huashu-admin && npm install && npm run dev"

echo.
echo ✅ 所有服务启动成功！
echo.
echo ==================================
echo 📱 用户端前端: http://localhost:5173
echo 🔧 管理后台:   http://localhost:3001
echo 🔌 API 地址:   http://localhost:3000
echo 🗄️  数据库:     localhost:5432
echo ==================================
echo.
echo 管理后台登录：
echo   用户名: admin
echo   密码:   admin123
echo.
pause
goto end

:start_backend
echo 🔧 启动后端服务...
cd huashu-backend
docker-compose up -d --build
cd ..
echo.
echo ✅ 后端服务启动成功！
echo.
echo ==================================
echo 🔌 API 地址: http://localhost:3000
echo 🗄️  数据库:   localhost:5432
echo ==================================
pause
goto end

:start_db
echo 🗄️  仅启动数据库...
cd huashu-backend
docker-compose up -d postgres
cd ..
echo.
echo ✅ 数据库启动成功！
echo.
echo ==================================
echo 🗄️ 数据库: localhost:5432
echo   用户名: huashu
echo   密码:   huashu_password
echo   数据库: huashu_db
echo ==================================
pause
goto end

:stop_all
echo 🛑 停止所有服务...

:: 停止 Docker 容器
cd huashu-backend
docker-compose down
cd ..

:: 停止前端进程
echo ⏳ 停止前端进程...
taskkill /F /FI "WINDOWTITLE eq 用户端前端*" 2>nul
taskkill /F /FI "WINDOWTITLE eq 管理后台*" 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo ✅ 所有服务已停止
pause
goto end

:clean_all
echo 🧹 停止并清理数据...
echo ⚠️  警告：这将删除所有容器和数据！
set /p confirm="确定要继续吗？[y/N]: "

if /i "%confirm%"=="y" (
    :: 停止并删除容器和数据卷
    cd huashu-backend
    docker-compose down -v
    cd ..
    
    :: 停止前端进程
    taskkill /F /FI "WINDOWTITLE eq 用户端前端*" 2>nul
    taskkill /F /FI "WINDOWTITLE eq 管理后台*" 2>nul
    taskkill /F /IM node.exe 2>nul
    
    :: 删除日志
    if exist logs rmdir /S /Q logs
    
    echo.
    echo ✅ 清理完成
) else (
    echo 已取消
)
pause
goto end

:end
echo.
echo 脚本执行完成！
