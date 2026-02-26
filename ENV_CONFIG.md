# 环境变量配置

本文档说明了 GitWell 项目所需的所有环境变量配置。

## 前端环境变量 (apps/web)

### VITE_API_URL
- **类型**: `string`
- **必需**: 否
- **默认值**: `http://localhost:8787`
- **说明**: API 服务器地址

### VITE_WS_URL
- **类型**: `string`
- **必需**: 否
- **默认值**: `ws://localhost:8787`
- **说明**: WebSocket 服务器地址

### 配置示例

创建 `apps/web/.env.local` 文件：

```bash
VITE_API_URL=http://localhost:8787
VITE_WS_URL=ws://localhost:8787
```

---

## API 服务器环境变量 (workers/api)

### GITHUB_TOKEN
- **类型**: `string`
- **必需**: 否
- **说明**: GitHub API 访问令牌，用于提高 API 请求限制
- **获取方式**: https://github.com/settings/tokens

### GITLAB_TOKEN
- **类型**: `string`
- **必需**: 否
- **说明**: GitLab API 访问令牌，用于访问私有仓库
- **获取方式**: https://gitlab.com/-/profile/personal_access_tokens

### KV_NAMESPACE_ID
- **类型**: `string`
- **必需**: 是（生产环境）
- **说明**: Cloudflare KV 命名空间 ID
- **获取方式**: Cloudflare Dashboard -> KV -> Create Namespace

### D1_DATABASE_ID
- **类型**: `string`
- **必需**: 是（生产环境）
- **说明**: Cloudflare D1 数据库 ID
- **获取方式**: Cloudflare Dashboard -> D1 -> Create Database

### 配置示例

#### 开发环境
创建 `workers/api/.env.local` 文件：

```bash
# GitHub API Token（可选，推荐配置）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitLab API Token（可选）
GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
```

#### 生产环境
在 Cloudflare Workers 控制台配置环境变量，或更新 `wrangler.toml`：

```toml
[vars]
# 这些变量应该在 Cloudflare Dashboard 中配置
# GITHUB_TOKEN = "your_production_token"
# GITLAB_TOKEN = "your_production_token"
```

---

## Cloudflare Workers 配置

### wrangler.toml

更新 `workers/api/wrangler.toml` 中的配置：

```toml
name = "gitwell-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# KV 命名空间
[[kv_namespaces]]
binding = "KV"
id = "your_kv_namespace_id"
preview_id = "your_preview_kv_namespace_id"

# D1 数据库
[[d1_databases]]
binding = "D1"
database_name = "gitwell_db"
database_id = "your_d1_database_id"

# Cron Triggers - 每 10 分钟执行一次定期更新
[triggers]
crons = ["*/10 * * * *"]

[env.production]
routes = [{ pattern = "api.gitwell.dev/*", zone_name = "gitwell.dev" }]
```

---

## 数据库初始化

首次部署时需要运行数据库迁移：

```bash
# 创建数据库
wrangler d1 create gitwell_db

# 获取数据库 ID 并更新 wrangler.toml

# 运行迁移
wrangler d1 execute gitwell_db --local --file=./migrations/0001_initial.sql

# 生产环境迁移
wrangler d1 execute gitwell_db --file=./migrations/0001_initial.sql
```

---

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp apps/web/.env.example apps/web/.env.local
cp workers/api/.env.example workers/api/.env.local

# 编辑环境变量文件
nano apps/web/.env.local
nano workers/api/.env.local
```

### 3. 启动开发环境

#### Linux/macOS
```bash
./scripts/dev.sh
```

#### Windows
```bash
.\scripts\dev.bat
```

### 4. 或手动启动

#### 前端
```bash
cd apps/web
pnpm dev
```

#### API 服务器（本地）
```bash
cd workers/api
pnpm dev
```

---

## 安全注意事项

1. **永远不要提交包含敏感信息的环境变量文件到 Git**
2. 使用 `.gitignore` 忽略 `.env.local` 文件
3. 为生产环境使用独立的 API Token
4. 定期轮换 API Token
5. 使用最小权限原则配置 Token 权限

---

## 故障排除

### API 请求限制错误
- 添加 GitHub/GitLab API Token
- 检查 Token 权限设置

### KV/D1 数据库错误
- 确保 `wrangler.toml` 中配置了正确的 ID
- 运行数据库迁移脚本

### WebSocket 连接失败
- 检查 `VITE_WS_URL` 配置
- 确保防火墙允许 WebSocket 连接
- 检查 API 服务器是否正常运行