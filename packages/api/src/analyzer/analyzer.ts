import type { Commit, Contributor, Issue, PullRequest, HealthMetrics, TrendData } from '../types'

/**
 * 数据分析引擎
 */
export class RepoAnalyzer {
  /**
   * 计算提交频率（每周提交数）
   */
  calculateCommitFrequency(commits: Commit[]): number {
    if (commits.length === 0) return 0

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentCommits = commits.filter((commit) => commit.date >= oneWeekAgo)
    return recentCommits.length
  }

  /**
   * 计算贡献者活跃度（基于贡献分布）
   */
  calculateContributorActivity(contributors: Contributor[]): number {
    if (contributors.length === 0) return 0

    const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0)
    const avgContributions = totalContributions / contributors.length

    // 活跃贡献者占比（贡献超过平均值的）
    const activeContributors = contributors.filter((c) => c.contributions >= avgContributions)
    const activeRatio = activeContributors.length / contributors.length

    return activeRatio * 100
  }

  /**
   * 计算代码质量（基于 Issue 和 PR 的关闭率）
   */
  calculateCodeQuality(issues: Issue[], prs: PullRequest[]): number {
    if (issues.length === 0 && prs.length === 0) return 50

    let score = 0
    let count = 0

    // Issue 解决率
    if (issues.length > 0) {
      const closedIssues = issues.filter((issue) => issue.state === 'closed')
      const issueResolutionRate = closedIssues.length / issues.length
      score += issueResolutionRate * 50
      count += 50
    }

    // PR 合并率
    if (prs.length > 0) {
      const mergedPRs = prs.filter((pr) => pr.state === 'merged')
      const prMergeRate = mergedPRs.length / prs.length
      score += prMergeRate * 50
      count += 50
    }

    return count > 0 ? score : 50
  }

  /**
   * 计算 Issue 解决率
   */
  calculateIssueResolutionRate(issues: Issue[]): number {
    if (issues.length === 0) return 1

    const closedIssues = issues.filter((issue) => issue.state === 'closed')
    return closedIssues.length / issues.length
  }

  /**
   * 计算 PR 合并率
   */
  calculatePRMergeRate(prs: PullRequest[]): number {
    if (prs.length === 0) return 1

    const mergedPRs = prs.filter((pr) => pr.state === 'merged')
    return mergedPRs.length / prs.length
  }

  /**
   * 计算响应时间（平均 Issue 关闭时间，单位：小时）
   */
  calculateResponseTime(issues: Issue[]): number {
    const closedIssues = issues.filter((issue) => issue.state === 'closed' && issue.closedAt)

    if (closedIssues.length === 0) return 0

    const totalHours = closedIssues.reduce((sum, issue) => {
      if (!issue.closedAt) return sum
      const hours = (issue.closedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60)
      return sum + hours
    }, 0)

    return totalHours / closedIssues.length
  }

  /**
   * 计算综合健康分数（0-100）
   */
  calculateHealthScore(metrics: HealthMetrics): number {
    // 归一化各项指标
    const normalizedCommitFreq = Math.min(metrics.commitFrequency / 50, 1) * 100
    const normalizedContributorCount = Math.min(metrics.contributorCount / 50, 1) * 100
    const normalizedCodeQuality = metrics.codeQuality
    const normalizedIssueResolution = metrics.issueResolutionRate * 100
    const normalizedPRMergeRate = metrics.prMergeRate * 100

    // 加权计算
    return (
      normalizedCommitFreq * 0.25 +
      normalizedContributorCount * 0.20 +
      normalizedCodeQuality * 0.20 +
      normalizedIssueResolution * 0.20 +
      normalizedPRMergeRate * 0.15
    )
  }

  /**
   * 生成提交趋势数据
   */
  generateTrendData(commits: Commit[], days: number = 30): TrendData[] {
    const trendData: TrendData[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayCommits = commits.filter((commit) => commit.date >= dayStart && commit.date <= dayEnd)
      trendData.push({
        date: dayStart,
        value: dayCommits.length,
      })
    }

    return trendData
  }

  /**
   * 分析仓库健康度
   */
  analyzeRepo(params: {
    commits: Commit[]
    contributors: Contributor[]
    issues: Issue[]
    prs: PullRequest[]
  }): {
    metrics: HealthMetrics
    healthScore: number
    trendData: TrendData[]
  } {
    const metrics: HealthMetrics = {
      commitFrequency: this.calculateCommitFrequency(params.commits),
      contributorCount: this.calculateContributorActivity(params.contributors),
      codeQuality: this.calculateCodeQuality(params.issues, params.prs),
      issueResolutionRate: this.calculateIssueResolutionRate(params.issues),
      prMergeRate: this.calculatePRMergeRate(params.prs),
      responseTime: this.calculateResponseTime(params.issues),
    }

    const healthScore = this.calculateHealthScore(metrics)
    const trendData = this.generateTrendData(params.commits)

    return {
      metrics,
      healthScore,
      trendData,
    }
  }
}