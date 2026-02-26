# GitWell

开源项目健康仪表盘 - 实时监控和分析 GitHub/GitLab 仓库的健康状态。

## 📋 项目简介

GitWell 是一个功能强大的开源项目健康仪表盘，帮助开发者和项目管理者：

- 📊 实时监控项目健康指标
- 📈 可视化项目数据趋势
- 🔍 多仓库对比分析
- 🌍 支持 GitHub 和 GitLab 平台
- ⚡ 快速响应，无需等待

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 🏗️ 项目结构

```
gitwell/
├── apps/                    # 前端应用
│   └── web/                # Web 应用
├── packages/               # 共享包
│   ├── api/               # API 客户端
│   ├── ui/                # UI 组件库
│   └── utils/             # 工具函数
├── workers/               # Cloudflare Workers
│   ├── api/               # API Worker
│   └── cron/              # Cron Worker
└── docs/                  # 文档
```

## 🛠️ 开发

### 代码规范

- TypeScript 严格模式
- ESLint + Prettier
- EditorConfig 统一配置

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具链

### 分支命名

```
<type>/<ticket-id>-<description>
```

## 📦 依赖管理

使用 pnpm workspace 管理依赖：

```bash
# 添加依赖到 web 应用
pnpm --filter @gitwell/web add <package>

# 添加依赖到 ui 包
pnpm --filter @gitwell/ui add <package>

# 添加共享依赖
pnpm add <package> -w
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @gitwell/api test
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Pull Request！

## 📮 联系方式

- GitHub: [GitWell](https://github.com/yourusername/gitwell)
- Email: your.email@example.com