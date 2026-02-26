import { PlatformClient } from './base'
import type { RepoInfo, RepoData, Contributor, Commit, Issue, PullRequest } from '../types'

/**
 * GitLab API 客户端
 */
export class GitLabClient extends PlatformClient {
  private baseUrl = 'https://gitlab.com/api/v4'
  private token?: string

  constructor(token?: string) {
    super('gitlab')
    this.token = token
  }

  /**
   * 解析 GitLab 仓库 URL
   */
  parseRepoUrl(url: string): RepoInfo | null {
    const gitlabUrlRegex = /^https?:\/\/(?:www\.)?gitlab\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/i
    const match = url.match(gitlabUrlRegex)

    if (match) {
      return {
        platform: 'gitlab',
        owner: match[1]!,
        repo: match[2]!.replace(/\.git$/, ''),
        url: url,
      }
    }

    return null
  }

  /**
   * 获取仓库信息
   */
  async fetchRepoInfo(repo: RepoInfo): Promise<RepoData> {
    const response = await this.request(`/projects/${encodeURIComponent(`${repo.owner}/${repo.repo}`)}`)
    const pathWithNamespace = response.path_with_namespace ?? `${repo.owner}/${repo.repo}`
    return {
      id: response.id.toString(),
      name: pathWithNamespace,
      description: response.description ?? '',
      stars: response.star_count,
      forks: response.forks_count,
      watchers: response.star_count, // GitLab uses star_count for watchers
      language: response.languages ? Object.keys(response.languages)[0] ?? 'Unknown' : 'Unknown',
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.last_activity_at),
      openIssues: response.open_issues_count,
      openPRs: 0, // GitLab counts MRs separately
      url: response.web_url ?? `https://gitlab.com/${pathWithNamespace}`,
    }
  }

  /**
   * 获取贡献者列表
   */
  async fetchContributors(repo: RepoInfo): Promise<Contributor[]> {
    const response = await this.request(
      `/projects/${encodeURIComponent(`${repo.owner}/${repo.repo}`)}/repository/contributors`
    )
    return response.map((contributor: any) => ({
      id: contributor.id.toString(),
      login: (contributor.name ?? contributor.email) ?? 'Unknown',
      avatarUrl: contributor.avatar_url ?? '',
      contributions: contributor.commits,
    }))
  }

  /**
   * 获取提交记录
   */
  async fetchCommits(repo: RepoInfo): Promise<Commit[]> {
    const response = await this.request(
      `/projects/${encodeURIComponent(`${repo.owner}/${repo.repo}`)}/repository/commits?per_page=100`
    )
    return response.map((commit: any) => ({
      sha: commit.id,
      message: commit.title,
      author: commit.author_name,
      date: new Date(commit.created_at),
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
    }))
  }

  /**
   * 获取 Issue 列表
   */
  async fetchIssues(repo: RepoInfo): Promise<Issue[]> {
    const response = await this.request(
      `/projects/${encodeURIComponent(`${repo.owner}/${repo.repo}`)}/issues?state=all&per_page=100`
    )
    return response.map((issue: any) => ({
      id: issue.id.toString(),
      title: issue.title,
      number: issue.iid,
      state: issue.state,
      createdAt: new Date(issue.created_at),
      closedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
      author: issue.author.username,
    }))
  }

  /**
   * 获取 Merge Request 列表
   */
  async fetchPRs(repo: RepoInfo): Promise<PullRequest[]> {
    const response = await this.request(
      `/projects/${encodeURIComponent(`${repo.owner}/${repo.repo}`)}/merge_requests?state=all&per_page=100`
    )
    return response.map((mr: any) => ({
      id: mr.id.toString(),
      title: mr.title,
      number: mr.iid,
      state: mr.merged_at ? 'merged' : mr.state,
      createdAt: new Date(mr.created_at),
      mergedAt: mr.merged_at ? new Date(mr.merged_at) : undefined,
      author: mr.author.username,
      additions: mr.additions,
      deletions: mr.deletions,
    }))
  }

  /**
   * 发送 API 请求
   */
  private async request(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers })

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.statusText}`)
    }

    return response.json()
  }
}