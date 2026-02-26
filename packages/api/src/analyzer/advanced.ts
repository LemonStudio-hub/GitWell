import type { Commit, Contributor, Issue, PullRequest, TrendData } from '../types'

/**
 * 高级分析器
 */
export class AdvancedAnalyzer {
  /**
   * 计算线性回归预测
   */
  public calculateLinearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
    const n = data.length
    if (n < 2) {
      return { slope: 0, intercept: 0 }
    }

    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    for (const point of data) {
      sumX += point.x
      sumY += point.y
      sumXY += point.x * point.y
      sumX2 += point.x * point.x
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  /**
   * 预测未来的健康度趋势
   */
  predictHealthTrend(
    historicalData: TrendData[],
    daysToPredict: number = 30
  ): TrendData[] {
    if (historicalData.length < 2) {
      return []
    }

    const now = new Date()
    const dataPoints = historicalData.map((d, index) => ({
      x: index,
      y: d.value,
    }))

    const { slope, intercept } = this.calculateLinearRegression(dataPoints)
    const predictions: TrendData[] = []

    for (let i = 1; i <= daysToPredict; i++) {
      const predictedValue = slope * (historicalData.length + i - 1) + intercept
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      predictions.push({
        date: futureDate,
        value: Math.max(0, Math.min(100, predictedValue)),
      })
    }

    return predictions
  }

  /**
   * 计算移动平均值
   */
  calculateMovingAverage(data: number[], windowSize: number = 7): number[] {
    const result: number[] = []

    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(data[i]!)
      } else {
        const window = data.slice(i - windowSize + 1, i + 1)
        const avg = window.reduce((sum, val) => sum + val, 0) / windowSize
        result.push(avg)
      }
    }

    return result
  }

  /**
   * 计算标准差
   */
  calculateStandardDeviation(data: number[]): number {
    if (data.length === 0) return 0

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const squaredDifferences = data.map((val) => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDifferences.reduce((sum, val) => sum + val, 0) / data.length

    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * 分析提交频率趋势
   */
  analyzeCommitTrend(commits: Commit[]): {
    trend: 'increasing' | 'decreasing' | 'stable'
    changeRate: number
    weeklyCommits: number[]
  } {
    const now = new Date()
    const weeks = 12
    const weeklyCommits: number[] = []

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const count = commits.filter(
        (c) => c.date >= weekStart && c.date < weekEnd
      ).length

      weeklyCommits.push(count)
    }

    if (weeklyCommits.length < 2) {
      return { trend: 'stable', changeRate: 0, weeklyCommits }
    }

    const firstHalf = weeklyCommits.slice(0, Math.floor(weeklyCommits.length / 2))
    const secondHalf = weeklyCommits.slice(Math.floor(weeklyCommits.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const changeRate = ((secondAvg - firstAvg) / firstAvg) * 100

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (changeRate > 10) {
      trend = 'increasing'
    } else if (changeRate < -10) {
      trend = 'decreasing'
    }

    return { trend, changeRate, weeklyCommits }
  }

  /**
   * 比较两个仓库的健康度
   */
  compareHealthScores(
    repo1: {
      name: string
      healthScore: number
      metrics: {
        commitFrequency: number
        contributorCount: number
        codeQuality: number
        issueResolutionRate: number
        prMergeRate: number
      }
    },
    repo2: {
      name: string
      healthScore: number
      metrics: {
        commitFrequency: number
        contributorCount: number
        codeQuality: number
        issueResolutionRate: number
        prMergeRate: number
      }
    }
  ): {
    overall: {
      winner: string
      difference: number
    }
    metrics: {
      commitFrequency: { winner: string; difference: number }
      contributorCount: { winner: string; difference: number }
      codeQuality: { winner: string; difference: number }
      issueResolutionRate: { winner: string; difference: number }
      prMergeRate: { winner: string; difference: number }
    }
  } {
    const calculateDiff = (val1: number, val2: number) => {
      return val1 > val2
        ? { winner: repo1.name, difference: val1 - val2 }
        : { winner: repo2.name, difference: val2 - val1 }
    }

    return {
      overall: calculateDiff(repo1.healthScore, repo2.healthScore),
      metrics: {
        commitFrequency: calculateDiff(repo1.metrics.commitFrequency, repo2.metrics.commitFrequency),
        contributorCount: calculateDiff(repo1.metrics.contributorCount, repo2.metrics.contributorCount),
        codeQuality: calculateDiff(repo1.metrics.codeQuality, repo2.metrics.codeQuality),
        issueResolutionRate: calculateDiff(
          repo1.metrics.issueResolutionRate,
          repo2.metrics.issueResolutionRate
        ),
        prMergeRate: calculateDiff(repo1.metrics.prMergeRate, repo2.metrics.prMergeRate),
      },
    }
  }

  /**
   * 生成综合健康报告
   */
  generateHealthReport(data: {
    repoName: string
    healthScore: number
    metrics: {
      commitFrequency: number
      contributorCount: number
      codeQuality: number
      issueResolutionRate: number
      prMergeRate: number
      responseTime: number
    }
    commits: Commit[]
    contributors: Contributor[]
    issues: Issue[]
    prs: PullRequest[]
  }): {
    overall: string
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  } {
    const { healthScore, metrics, commits, issues, prs } = data

    let overall = 'unknown'
    if (healthScore >= 80) {
      overall = 'excellent'
    } else if (healthScore >= 60) {
      overall = 'good'
    } else if (healthScore >= 40) {
      overall = 'moderate'
    } else {
      overall = 'needs_improvement'
    }

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    // 分析提交频率
    if (metrics.commitFrequency > 20) {
      strengths.push('High commit frequency indicating active development')
    } else if (metrics.commitFrequency < 5) {
      weaknesses.push('Low commit frequency may indicate project stagnation')
      recommendations.push('Increase development activity to maintain momentum')
    }

    // 分析贡献者
    if (metrics.contributorCount > 10) {
      strengths.push('Diverse contributor base promotes project health')
    } else if (metrics.contributorCount < 3) {
      weaknesses.push('Limited contributor diversity creates dependency risk')
      recommendations.push('Encourage community contributions to diversify development')
    }

    // 分析代码质量
    if (metrics.codeQuality > 80) {
      strengths.push('Excellent code quality standards')
    } else if (metrics.codeQuality < 60) {
      weaknesses.push('Code quality issues need attention')
      recommendations.push('Implement stricter code review and quality gates')
    }

    // 分析 Issue 解决率
    if (metrics.issueResolutionRate > 0.8) {
      strengths.push('High issue resolution rate shows good maintenance')
    } else if (metrics.issueResolutionRate < 0.5) {
      weaknesses.push('Low issue resolution rate indicates maintenance gaps')
      recommendations.push('Prioritize resolving open issues to improve community trust')
    }

    // 分析 PR 合并率
    if (metrics.prMergeRate > 0.7) {
      strengths.push('Good PR merge rate shows efficient contribution workflow')
    } else if (metrics.prMergeRate < 0.4) {
      weaknesses.push('Low PR merge rate may discourage contributors')
      recommendations.push('Review and improve PR review process')
    }

    return {
      overall,
      strengths,
      weaknesses,
      recommendations,
    }
  }
}