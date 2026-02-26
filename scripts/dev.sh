#!/bin/bash

# GitWell 开发环境启动脚本

set -e

echo "🚀 启动 GitWell 开发环境..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
echo "📦 Node.js 版本: $NODE_VERSION"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: 未找到 pnpm，请先安装 pnpm"
    echo "   npm install -g pnpm"
    exit 1
fi

# 安装依赖
echo "📥 安装依赖..."
pnpm install

# 启动前端开发服务器
echo "🌐 启动前端开发服务器..."
cd apps/web
pnpm dev &
FRONTEND_PID=$!

# 等待前端启动
sleep 3

# 检查前端是否启动成功
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ 前端服务器启动失败"
    exit 1
fi

echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"
echo "📱 前端地址: http://localhost:5173"

# 检查是否需要启动 API 服务器
if [ -f "workers/api/.env.local" ]; then
    echo "🔧 启动 API 服务器..."
    cd ../../workers/api
    pnpm dev &
    API_PID=$!

    # 等待 API 启动
    sleep 3

    # 检查 API 是否启动成功
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "❌ API 服务器启动失败"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi

    echo "✅ API 服务器已启动 (PID: $API_PID)"
    echo "🔌 API 地址: http://localhost:8787"
else
    echo "⚠️  未找到 workers/api/.env.local，跳过 API 服务器启动"
    echo "   如需启动 API 服务器，请创建 workers/api/.env.local 文件并配置环境变量"
    API_PID=""
fi

echo ""
echo "🎉 开发环境启动完成！"
echo ""
echo "📌 服务地址:"
echo "   前端: http://localhost:5173"
if [ ! -z "$API_PID" ]; then
    echo "   API: http://localhost:8787"
fi
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获 Ctrl+C 信号
trap cleanup INT TERM

cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ ! -z "$API_PID" ] && kill -0 $API_PID 2>/dev/null; then
        echo "   停止 API 服务器 (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
    fi
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   停止前端服务器 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "✅ 所有服务已停止"
    exit 0
}

# 等待服务
wait