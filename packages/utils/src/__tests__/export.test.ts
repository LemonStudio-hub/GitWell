import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAsJSON, exportAsCSV, exportAsMarkdown } from '../index'

describe('export functions', () => {
  let mockLink: HTMLAnchorElement
  let mockBody: HTMLElement

  beforeEach(() => {
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    mockBody = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as unknown as HTMLElement

    global.document = {
      createElement: vi.fn(() => mockLink),
      body: mockBody,
    } as unknown as Document

    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('exportAsJSON', () => {
    it('应该正确导出 JSON', () => {
      const data = { test: 'data' }
      exportAsJSON(data, 'test')

      expect(global.document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.json')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('exportAsCSV', () => {
    it('应该正确导出 CSV', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]
      exportAsCSV(data, 'test')

      expect(global.document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.csv')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('空数组应该不导出', () => {
      exportAsCSV([], 'test')
      expect(global.document.createElement).not.toHaveBeenCalled()
    })
  })

  describe('exportAsMarkdown', () => {
    it('应该正确导出 Markdown', () => {
      const data = {
        repoData: {
          name: 'test-repo',
          description: 'Test repository',
          stars: 100,
          forks: 50,
          watchers: 25,
          language: 'TypeScript',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          openIssues: 10,
          openPRs: 5,
          url: 'https://github.com/test/repo',
        },
        metrics: {
          commitFrequency: 20,
          contributorCount: 10,
          codeQuality: 85,
          issueResolutionRate: 0.9,
          prMergeRate: 0.85,
          responseTime: 12,
        },
        healthScore: 85,
      }

      exportAsMarkdown(data, 'test')

      expect(global.document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.md')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })
})