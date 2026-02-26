/**
 * 仓库信息接口
 */
export interface RepoInfo {
  platform: 'github' | 'gitlab'
  owner: string
  repo: string
  url: string
}

/**
 * 仓库数据接口
 */
export interface RepoData {
  id: string
  name: string
  description: string
  stars: number
  forks: number
  watchers: number
  language: string
  createdAt: Date
  updatedAt: Date
  openIssues: number
  openPRs: number
  url: string
}

/**
 * 贡献者接口
 */
export interface Contributor {
  id: string
  login: string
  avatarUrl: string
  contributions: number
}

/**
 * 提交接口
 */
export interface Commit {
  sha: string
  message: string
  author: string
  date: Date
  additions: number
  deletions: number
}

/**
 * Issue 接口
 */
export interface Issue {
  id: string
  title: string
  number: number
  state: 'open' | 'closed'
  createdAt: Date
  closedAt?: Date
  author: string
}

/**
 * Pull Request 接口
 */
export interface PullRequest {
  id: string
  title: string
  number: number
  state: 'open' | 'closed' | 'merged'
  createdAt: Date
  mergedAt?: Date
  author: string
  additions: number
  deletions: number
}

/**
 * 健康指标接口
 */
export interface HealthMetrics {
  commitFrequency: number
  contributorCount: number
  codeQuality: number
  issueResolutionRate: number
  prMergeRate: number
  responseTime: number
}

/**
 * 趋势数据接口
 */
export interface TrendData {
  date: Date
  value: number
}