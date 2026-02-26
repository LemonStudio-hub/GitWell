import { describe, it, expect, beforeEach } from 'vitest'
import { PlatformFactory } from '@gitdash/api'

describe('Cloudflare Workers Integration', () => {
  describe('PlatformFactory', () => {
    it('应该从 GitHub URL 创建 GitHub 客户端', () => {
      const url = 'https://github.com/vuejs/core'
      const client = PlatformFactory.createFromUrl(url)
      expect(client.getPlatform()).toBe('github')
    })

    it('应该从 GitLab URL 创建 GitLab 客户端', () => {
      const url = 'https://gitlab.com/gitlab-org/gitlab'
      const client = PlatformFactory.createFromUrl(url)
      expect(client.getPlatform()).toBe('gitlab')
    })

    it('应该解析 GitHub URL', () => {
      const url = 'https://github.com/vuejs/core'
      const client = PlatformFactory.createFromUrl(url)
      const repoInfo = client.parseRepoUrl(url)
      expect(repoInfo).not.toBeNull()
      if (repoInfo) {
        expect(repoInfo.owner).toBe('vuejs')
        expect(repoInfo.repo).toBe('core')
        expect(repoInfo.platform).toBe('github')
      }
    })

    it('应该解析 GitLab URL', () => {
      const url = 'https://gitlab.com/gitlab-org/gitlab'
      const client = PlatformFactory.createFromUrl(url)
      const repoInfo = client.parseRepoUrl(url)
      expect(repoInfo).not.toBeNull()
      if (repoInfo) {
        expect(repoInfo.owner).toBe('gitlab-org')
        expect(repoInfo.repo).toBe('gitlab')
        expect(repoInfo.platform).toBe('gitlab')
      }
    })

    it('无效的 URL 应该返回 null', () => {
      const url = 'https://example.com/repo'
      const client = PlatformFactory.createFromUrl(url)
      const repoInfo = client.parseRepoUrl(url)
      expect(repoInfo).toBeNull()
    })
  })
})