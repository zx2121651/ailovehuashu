#!/bin/bash

# 恋爱话术库 - Docker 一键启动脚本
# 支持：后端 API、前端用户端、管理后台、PostgreSQL 数据库

set -e

echo "=================================="
echo "🚀 恋爱话术库 - Docker 一键启动"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误：Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ 错误：Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose"
    exit 1
fi

echo -e "${GREEN}✅ Docker 环境检查通过${NC}"
echo ""

# 显示菜单
echo "请选择启动模式："
echo ""
echo "1) 🌐 启动全部服务（后端 + 数据库 + 前端 + 管理后台）"
echo "2) 🔧 仅启动后端服务（API + 数据库）"
echo "3) 🗄️  仅启动数据库"
echo "4) 🛑 停止所有服务"
echo "5) 🧹 停止并清理数据（删除容器和数据卷）"
echo ""

read -p "请输入选项 [1-5]: " choice

case $choice in
    1)
        echo -e "${BLUE}🌐 启动全部服务...${NC}"
        echo ""
        
        # 1. 启动后端和数据库
        echo -e "${YELLOW}⏳ 启动后端服务（API + PostgreSQL）...${NC}"
        cd huashu-backend
        docker-compose up -d --build
        cd ..
        
        # 等待数据库就绪
        echo -e "${YELLOW}⏳ 等待数据库初始化...${NC}"
        sleep 5
        
        # 2. 检查前端依赖
        if [ ! -d "huashu-app/node_modules" ]; then
            echo -e "${YELLOW}⏳ 安装用户端前端依赖...${NC}"
            cd huashu-app
            npm install
            cd ..
        fi
        
        if [ ! -d "huashu-admin/node_modules" ]; then
            echo -e "${YELLOW}⏳ 安装管理后台依赖...${NC}"
            cd huashu-admin
            npm install
            cd ..
        fi
        
        # 3. 启动前端（后台运行）
        echo -e "${YELLOW}⏳ 启动用户端前端（http://localhost:5173）...${NC}"
        cd huashu-app
        nohup npm run dev > ../logs/frontend.log 2>&1 &
        cd ..
        
        # 4. 启动管理后台（后台运行）
        echo -e "${YELLOW}⏳ 启动管理后台（http://localhost:3001）...${NC}"
        cd huashu-admin
        nohup npm run dev > ../logs/admin.log 2>&1 &
        cd ..
        
        echo ""
        echo -e "${GREEN}✅ 所有服务启动成功！${NC}"
        echo ""
        echo "=================================="
        echo "📱 用户端前端: http://localhost:5173"
        echo "🔧 管理后台:   http://localhost:3001"
        echo "🔌 API 地址:   http://localhost:3000"
        echo "🗄️  数据库:     localhost:5432"
        echo "=================================="
        echo ""
        echo "管理后台登录："
        echo "  用户名: admin"
        echo "  密码:   admin123"
        echo ""
        echo "查看日志："
        echo "  前端日志: tail -f logs/frontend.log"
        echo "  后台日志: tail -f logs/admin.log"
        ;;
        
    2)
        echo -e "${BLUE}🔧 启动后端服务...${NC}"
        cd huashu-backend
        docker-compose up -d --build
        cd ..
        echo ""
        echo -e "${GREEN}✅ 后端服务启动成功！${NC}"
        echo ""
        echo "=================================="
        echo "🔌 API 地址: http://localhost:3000"
        echo "🗄️  数据库:   localhost:5432"
        echo "=================================="
        ;;
        
    3)
        echo -e "${BLUE}🗄️  仅启动数据库...${NC}"
        cd huashu-backend
        docker-compose up -d postgres
        cd ..
        echo ""
        echo -e "${GREEN}✅ 数据库启动成功！${NC}"
        echo ""
        echo "=================================="
        echo "🗄️ 数据库: localhost:5432"
        echo "  用户名: huashu"
        echo "  密码:   huashu_password"
        echo "  数据库: huashu_db"
        echo "=================================="
        ;;
        
    4)
        echo -e "${BLUE}🛑 停止所有服务...${NC}"
        
        # 停止 Docker 容器
        cd huashu-backend
        docker-compose down
        cd ..
        
        # 停止前端进程
        echo -e "${YELLOW}⏳ 停止前端进程...${NC}"
        pkill -f "huashu-app.*vite" || true
        pkill -f "huashu-admin.*vite" || true
        
        echo ""
        echo -e "${GREEN}✅ 所有服务已停止${NC}"
        ;;
        
    5)
        echo -e "${RED}🧹 停止并清理数据...${NC}"
        echo -e "${YELLOW}⚠️  警告：这将删除所有容器和数据！${NC}"
        read -p "确定要继续吗？[y/N]: " confirm
        
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            # 停止并删除容器和数据卷
            cd huashu-backend
            docker-compose down -v
            cd ..
            
            # 停止前端进程
            pkill -f "huashu-app.*vite" || true
            pkill -f "huashu-admin.*vite" || true
            
            # 删除日志
            rm -rf logs/*.log
            
            echo ""
            echo -e "${GREEN}✅ 清理完成${NC}"
        else
            echo "已取消"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo "脚本执行完成！"
