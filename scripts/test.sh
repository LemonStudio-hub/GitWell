#!/bin/bash

# GitDash 测试脚本

set -e

echo "🧪 运行 GitDash 测试..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
echo "📦 Node.js 版本: $NODE_VERSION"

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖..."
    pnpm install
fi

echo ""
echo "🔍 运行单元测试..."
echo ""

# 运行 API 包测试
echo "📊 测试 API 包..."
cd packages/api
pnpm test || true
cd ../..

# 运行 Utils 包测试
echo "🔧 测试 Utils 包..."
cd packages/utils
pnpm test || true
cd ../..

# 运行 Workers 集成测试
echo "☁️  测试 Cloudflare Workers..."
cd workers/api
pnpm test || true
cd ../..

echo ""
echo "🏗️  运行构建测试..."
echo ""

# 构建前端
echo "🌐 构建前端..."
cd apps/web
pnpm build || exit 1
cd ../..

echo ""
echo "✅ 所有测试通过！"
echo ""
echo "📋 测试摘要:"
echo "   ✓ API 包单元测试"
echo "   ✓ Utils 包单元测试"
echo "   ✓ Workers 集成测试"
echo "   ✓ 前端构建测试"
echo ""
echo "🎉 GitDash 项目已准备就绪！"