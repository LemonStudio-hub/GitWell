import { PlatformFactory, RepoAnalyzer } from '@gitwell/api'
import type { RepoData, Commit, Contributor, Issue, PullRequest, HealthMetrics, TrendData } from '@gitwell/api'
import { cache } from '@gitwell/utils'

/**
 * 仓库服务
 */
export class RepoService {
  private analyzer = new RepoAnalyzer()

  /**
   * 获取仓库完整数据（包含分析）
   */
  async getRepoData(url: string, useCache: boolean = true): Promise<{
    repoData: RepoData
    metrics: HealthMetrics
    healthScore: number
    trendData: TrendData[]
  }> {
    // 检查缓存
    const cacheKey = `repo:${url}`
    if (useCache) {
      const cached = cache.get<{
        repoData: RepoData
        metrics: HealthMetrics
        healthScore: number
        trendData: TrendData[]
      }>(cacheKey)
      if (cached) {
        return cached
      }
    }

    // 获取平台客户端
    const client = PlatformFactory.createFromUrl(url)

    // 解析仓库信息
    const repoInfo = client.parseRepoUrl(url)
    if (!repoInfo) {
      throw new Error('Invalid repository URL')
    }

    // 并行获取数据
    const [repoData, contributors, commits, issues, prs] = await Promise.all([
      client.fetchRepoInfo(repoInfo),
      client.fetchContributors(repoInfo),
      client.fetchCommits(repoInfo),
      client.fetchIssues(repoInfo),
      client.fetchPRs(repoInfo),
    ])

    // 更新 openIssues 和 openPRs 的数量
    repoData.openIssues = issues.filter((issue) => issue.state === 'open').length
    repoData.openPRs = prs.filter((pr) => pr.state === 'open').length

    // 分析数据
    const { metrics, healthScore, trendData } = this.analyzer.analyzeRepo({
      commits,
      contributors,
      issues,
      prs,
    })

    const result = {
      repoData,
      metrics,
      healthScore,
      trendData,
    }

    // 缓存结果（5分钟）
    cache.set(cacheKey, result, 5 * 60 * 1000)

    return result
  }

  /**
   * 对比多个仓库
   */
  async compareRepos(urls: string[]): Promise<
    Array<{
      url: string
      repoData: RepoData
      healthScore: number
      metrics: HealthMetrics
    }>
  > {
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const data = await this.getRepoData(url)
          return {
            url,
            repoData: data.repoData,
            healthScore: data.healthScore,
            metrics: data.metrics,
          }
        } catch (error) {
          console.error(`Failed to analyze ${url}:`, error)
          return null
        }
      })
    )

    return results.filter((r) => r !== null) as Array<{
      url: string
      repoData: RepoData
      healthScore: number
      metrics: HealthMetrics
    }>
  }
}

// 单例实例
export const repoService = new RepoService()