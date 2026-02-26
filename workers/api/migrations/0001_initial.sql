-- 创建订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_url TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_repo_url ON subscriptions(repo_url);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(active);

-- 创建历史数据表
CREATE TABLE IF NOT EXISTS repo_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_url TEXT NOT NULL,
  health_score REAL NOT NULL,
  commit_frequency REAL NOT NULL,
  contributor_count INTEGER NOT NULL,
  code_quality REAL NOT NULL,
  issue_resolution_rate REAL NOT NULL,
  pr_merge_rate REAL NOT NULL,
  response_time REAL NOT NULL,
  stars INTEGER NOT NULL,
  forks INTEGER NOT NULL,
  open_issues INTEGER NOT NULL,
  open_prs INTEGER NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_repo_history_repo_url ON repo_history(repo_url);
CREATE INDEX IF NOT EXISTS idx_repo_history_recorded_at ON repo_history(recorded_at);

-- 创建告警规则表
CREATE TABLE IF NOT EXISTS alert_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_url TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  threshold REAL NOT NULL,
  condition TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_alert_rules_repo_url ON alert_rules(repo_url);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);

-- 创建仪表盘配置表
CREATE TABLE IF NOT EXISTS dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  layout TEXT NOT NULL,
  widgets TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dashboards_created_at ON dashboards(created_at);