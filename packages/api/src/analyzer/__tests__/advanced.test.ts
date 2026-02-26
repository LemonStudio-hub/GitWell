import { describe, it, expect } from 'vitest'
import { AdvancedAnalyzer } from '../advanced'
import type { TrendData } from '../../types'

describe('AdvancedAnalyzer', () => {
  const analyzer = new AdvancedAnalyzer()

  describe('calculateLinearRegression', () => {
    it('应该正确计算线性回归', () => {
      const data = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 30 },
      ]
      const result = analyzer.calculateLinearRegression(data)
      expect(result.slope).toBeGreaterThan(0)
      expect(result.intercept).toBeDefined()
    })

    it('数据点少于 2 应该返回零斜率', () => {
      const data = [{ x: 1, y: 10 }]
      const result = analyzer.calculateLinearRegression(data)
      expect(result.slope).toBe(0)
      expect(result.intercept).toBe(0)
    })
  })

  describe('predictHealthTrend', () => {
    it('应该正确预测健康度趋势', () => {
      const historicalData: TrendData[] = [
        { date: new Date('2024-01-01'), value: 70 },
        { date: new Date('2024-01-02'), value: 75 },
        { date: new Date('2024-01-03'), value: 80 },
      ]
      const predictions = analyzer.predictHealthTrend(historicalData, 7)
      expect(predictions.length).toBe(7)
      predictions.forEach((p) => {
        expect(p.value).toBeGreaterThanOrEqual(0)
        expect(p.value).toBeLessThanOrEqual(100)
      })
    })

    it('历史数据不足应该返回空数组', () => {
      const historicalData: TrendData[] = [
        { date: new Date('2024-01-01'), value: 70 },
      ]
      const predictions = analyzer.predictHealthTrend(historicalData, 7)
      expect(predictions.length).toBe(0)
    })
  })

  describe('calculateMovingAverage', () => {
    it('应该正确计算移动平均', () => {
      const data = [10, 20, 30, 40, 50, 60, 70]
      const result = analyzer.calculateMovingAverage(data, 3)
      expect(result.length).toBe(data.length)
      expect(result[0]).toBe(10)
      expect(result[2]).toBeCloseTo(20, 0)
    })
  })

  describe('calculateStandardDeviation', () => {
    it('应该正确计算标准差', () => {
      const data = [10, 20, 30, 40, 50]
      const result = analyzer.calculateStandardDeviation(data)
      expect(result).toBeGreaterThan(0)
    })

    it('空数组应该返回 0', () => {
      const result = analyzer.calculateStandardDeviation([])
      expect(result).toBe(0)
    })
  })

  describe('analyzeCommitTrend', () => {
    it('应该正确识别提交趋势', () => {
      const commits = Array.from({ length: 30 }, (_, i) => ({
        sha: `commit${i}`,
        message: `Commit ${i}`,
        author: 'Test User',
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        additions: 10,
        deletions: 5,
      }))

      const result = analyzer.analyzeCommitTrend(commits)
      expect(['increasing', 'decreasing', 'stable']).toContain(result.trend)
      expect(result.changeRate).toBeDefined()
      expect(result.weeklyCommits).toBeDefined()
      expect(result.weeklyCommits.length).toBe(12)
    })
  })

  describe('compareHealthScores', () => {
    it('应该正确比较两个仓库', () => {
      const repo1 = {
        name: 'repo1',
        healthScore: 80,
        metrics: {
          commitFrequency: 20,
          contributorCount: 10,
          codeQuality: 85,
          issueResolutionRate: 0.9,
          prMergeRate: 0.85,
        },
      }

      const repo2 = {
        name: 'repo2',
        healthScore: 70,
        metrics: {
          commitFrequency: 15,
          contributorCount: 5,
          codeQuality: 75,
          issueResolutionRate: 0.8,
          prMergeRate: 0.75,
        },
      }

      const result = analyzer.compareHealthScores(repo1, repo2)
      expect(result.overall.winner).toBe('repo1')
      expect(result.overall.difference).toBe(10)
      expect(result.metrics.commitFrequency).toBeDefined()
      expect(result.metrics.contributorCount).toBeDefined()
    })
  })

  describe('generateHealthReport', () => {
    it('应该生成综合健康报告', () => {
      const data = {
        repoName: 'test-repo',
        healthScore: 85,
        metrics: {
          commitFrequency: 25,
          contributorCount: 15,
          codeQuality: 90,
          issueResolutionRate: 0.85,
          prMergeRate: 0.9,
          responseTime: 12,
        },
        commits: [],
        contributors: [],
        issues: [],
        prs: [],
      }

      const report = analyzer.generateHealthReport(data)
      expect(report.overall).toBeDefined()
      expect(Array.isArray(report.strengths)).toBe(true)
      expect(Array.isArray(report.weaknesses)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('低健康度应该生成弱点报告', () => {
      const data = {
        repoName: 'test-repo',
        healthScore: 30,
        metrics: {
          commitFrequency: 2,
          contributorCount: 1,
          codeQuality: 40,
          issueResolutionRate: 0.3,
          prMergeRate: 0.2,
          responseTime: 100,
        },
        commits: [],
        contributors: [],
        issues: [],
        prs: [],
      }

      const report = analyzer.generateHealthReport(data)
      expect(report.overall).toBe('needs_improvement')
      expect(report.weaknesses.length).toBeGreaterThan(0)
      expect(report.recommendations.length).toBeGreaterThan(0)
    })
  })
})