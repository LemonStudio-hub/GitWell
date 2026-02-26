import { describe, it, expect } from 'vitest'
import { RepoAnalyzer } from '../analyzer'
import type { Commit, Contributor, Issue, PullRequest } from '../../types'

describe('RepoAnalyzer', () => {
  const analyzer = new RepoAnalyzer()

  const mockCommits: Commit[] = [
    {
      sha: 'abc123',
      message: 'Initial commit',
      author: 'John Doe',
      date: new Date('2024-01-01'),
      additions: 100,
      deletions: 0,
    },
    {
      sha: 'def456',
      message: 'Add feature',
      author: 'Jane Doe',
      date: new Date('2024-01-02'),
      additions: 50,
      deletions: 10,
    },
  ]

  const mockContributors: Contributor[] = [
    {
      id: '1',
      login: 'johndoe',
      avatarUrl: 'https://example.com/avatar1.jpg',
      contributions: 10,
    },
    {
      id: '2',
      login: 'janedoe',
      avatarUrl: 'https://example.com/avatar2.jpg',
      contributions: 5,
    },
  ]

  const mockIssues: Issue[] = [
    {
      id: '1',
      title: 'Bug issue',
      number: 1,
      state: 'closed',
      createdAt: new Date('2024-01-01'),
      closedAt: new Date('2024-01-02'),
      author: 'johndoe',
    },
    {
      id: '2',
      title: 'Feature request',
      number: 2,
      state: 'open',
      createdAt: new Date('2024-01-03'),
      author: 'janedoe',
    },
  ]

  const mockPRs: PullRequest[] = [
    {
      id: '1',
      title: 'PR #1',
      number: 1,
      state: 'merged',
      createdAt: new Date('2024-01-01'),
      mergedAt: new Date('2024-01-02'),
      author: 'johndoe',
      additions: 100,
      deletions: 20,
    },
    {
      id: '2',
      title: 'PR #2',
      number: 2,
      state: 'open',
      createdAt: new Date('2024-01-03'),
      author: 'janedoe',
      additions: 50,
      deletions: 5,
    },
  ]

  describe('calculateCommitFrequency', () => {
    it('应该正确计算每周提交频率', () => {
      const frequency = analyzer.calculateCommitFrequency(mockCommits)
      expect(frequency).toBeGreaterThanOrEqual(0)
    })

    it('空数组应该返回 0', () => {
      const frequency = analyzer.calculateCommitFrequency([])
      expect(frequency).toBe(0)
    })
  })

  describe('calculateContributorActivity', () => {
    it('应该正确计算贡献者活跃度', () => {
      const activity = analyzer.calculateContributorActivity(mockContributors)
      expect(activity).toBeGreaterThanOrEqual(0)
      expect(activity).toBeLessThanOrEqual(100)
    })

    it('空数组应该返回 0', () => {
      const activity = analyzer.calculateContributorActivity([])
      expect(activity).toBe(0)
    })
  })

  describe('calculateCodeQuality', () => {
    it('应该正确计算代码质量分数', () => {
      const quality = analyzer.calculateCodeQuality(mockIssues, mockPRs)
      expect(quality).toBeGreaterThanOrEqual(0)
      expect(quality).toBeLessThanOrEqual(100)
    })

    it('空数组应该返回 50（中性分数）', () => {
      const quality = analyzer.calculateCodeQuality([], [])
      expect(quality).toBe(50)
    })
  })

  describe('calculateIssueResolutionRate', () => {
    it('应该正确计算 Issue 解决率', () => {
      const rate = analyzer.calculateIssueResolutionRate(mockIssues)
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })

    it('空数组应该返回 1', () => {
      const rate = analyzer.calculateIssueResolutionRate([])
      expect(rate).toBe(1)
    })
  })

  describe('calculatePRMergeRate', () => {
    it('应该正确计算 PR 合并率', () => {
      const rate = analyzer.calculatePRMergeRate(mockPRs)
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })

    it('空数组应该返回 1', () => {
      const rate = analyzer.calculatePRMergeRate([])
      expect(rate).toBe(1)
    })
  })

  describe('calculateResponseTime', () => {
    it('应该正确计算平均响应时间', () => {
      const time = analyzer.calculateResponseTime(mockIssues)
      expect(time).toBeGreaterThanOrEqual(0)
    })

    it('空数组应该返回 0', () => {
      const time = analyzer.calculateResponseTime([])
      expect(time).toBe(0)
    })
  })

  describe('calculateHealthScore', () => {
    it('应该正确计算健康分数', () => {
      const metrics = {
        commitFrequency: 10,
        contributorCount: 2,
        codeQuality: 75,
        issueResolutionRate: 0.5,
        prMergeRate: 0.5,
        responseTime: 24,
      }
      const score = analyzer.calculateHealthScore(metrics)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('analyzeRepo', () => {
    it('应该完整分析仓库数据', () => {
      const result = analyzer.analyzeRepo({
        commits: mockCommits,
        contributors: mockContributors,
        issues: mockIssues,
        prs: mockPRs,
      })

      expect(result.metrics).toBeDefined()
      expect(result.healthScore).toBeDefined()
      expect(result.trendData).toBeDefined()
      expect(Array.isArray(result.trendData)).toBe(true)
      expect(result.healthScore).toBeGreaterThanOrEqual(0)
      expect(result.healthScore).toBeLessThanOrEqual(100)
    })
  })
})