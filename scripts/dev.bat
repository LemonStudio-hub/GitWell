@echo off
REM GitWell 开发环境启动脚本 (Windows)

echo 🚀 启动 GitWell 开发环境...

REM 检查 Node.js 版本
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo 📦 Node.js 版本: %NODE_VERSION%

REM 检查 pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 pnpm，请先安装 pnpm
    echo    npm install -g pnpm
    exit /b 1
)

REM 安装依赖
echo 📥 安装依赖...
call pnpm install

REM 启动前端开发服务器
echo 🌐 启动前端开发服务器...
cd apps/web
start "GitWell Frontend" pnpm dev

REM 等待前端启动
timeout /t 3 /nobreak >nul

echo ✅ 前端服务器已启动
echo 📱 前端地址: http://localhost:5173

REM 检查是否需要启动 API 服务器
cd ..\..
if exist "workers\api\.env.local" (
    echo 🔧 启动 API 服务器...
    cd workers\api
    start "GitWell API" pnpm dev

    REM 等待 API 启动
    timeout /t 3 /nobreak >nul

    echo ✅ API 服务器已启动
    echo 🔌 API 地址: http://localhost:8787
) else (
    echo ⚠️  未找到 workers\api\.env.local，跳过 API 服务器启动
    echo    如需启动 API 服务器，请创建 workers\api\.env.local 文件并配置环境变量
)

echo.
echo 🎉 开发环境启动完成！
echo.
echo 📌 服务地址:
echo    前端: http://localhost:5173
if exist "workers\api\.env.local" (
    echo    API: http://localhost:8787
)
echo.
echo 按 Ctrl+C 停止所有服务

REM 等待用户按下 Ctrl+C
pause