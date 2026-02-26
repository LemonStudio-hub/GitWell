import { GitHubClient } from '../clients/github'
import { GitLabClient } from '../clients/gitlab'
import type { RepoInfo } from '../types'

/**
 * 平台客户端工厂
 */
export class PlatformFactory {
  /**
   * 根据平台名称创建客户端
   */
  static createClient(platform: 'github' | 'gitlab', token?: string) {
    switch (platform) {
      case 'github':
        return new GitHubClient(token)
      case 'gitlab':
        return new GitLabClient(token)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * 自动检测平台并创建客户端
   */
  static createFromUrl(url: string, token?: string) {
    const githubClient = new GitHubClient(token)
    const gitlabClient = new GitLabClient(token)

    const githubRepo = githubClient.parseRepoUrl(url)
    if (githubRepo) {
      return githubClient
    }

    const gitlabRepo = gitlabClient.parseRepoUrl(url)
    if (gitlabRepo) {
      return gitlabClient
    }

    throw new Error('Unsupported repository URL')
  }
}