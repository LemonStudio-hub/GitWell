import type { RepoInfo, RepoData, Contributor, Commit, Issue, PullRequest } from '../types'

/**
 * 平台客户端基类
 */
export abstract class PlatformClient {
  protected platform: 'github' | 'gitlab'

  constructor(platform: 'github' | 'gitlab') {
    this.platform = platform
  }

  /**
   * 获取平台类型
   */
  getPlatform(): 'github' | 'gitlab' {
    return this.platform
  }

  /**
   * 解析仓库 URL
   */
  abstract parseRepoUrl(url: string): RepoInfo | null

  /**
   * 获取仓库信息
   */
  abstract fetchRepoInfo(repo: RepoInfo): Promise<RepoData>

  /**
   * 获取贡献者列表
   */
  abstract fetchContributors(repo: RepoInfo): Promise<Contributor[]>

  /**
   * 获取提交记录
   */
  abstract fetchCommits(repo: RepoInfo): Promise<Commit[]>

  /**
   * 获取 Issue 列表
   */
  abstract fetchIssues(repo: RepoInfo): Promise<Issue[]>

  /**
   * 获取 Pull Request 列表
   */
  abstract fetchPRs(repo: RepoInfo): Promise<PullRequest[]>
}