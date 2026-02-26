import { PlatformClient } from './base'
import type { RepoInfo, RepoData, Contributor, Commit, Issue, PullRequest } from '../types'

/**
 * GitHub API 客户端
 */
export class GitHubClient extends PlatformClient {
  private baseUrl = 'https://api.github.com'
  private token?: string

  constructor(token?: string) {
    super('github')
    this.token = token
  }

  /**
   * 解析 GitHub 仓库 URL
   */
  parseRepoUrl(url: string): RepoInfo | null {
    const githubUrlRegex =
      /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/i
    const match = url.match(githubUrlRegex)

    if (match) {
      return {
        platform: 'github',
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
    const response = await this.request(`/repos/${repo.owner}/${repo.repo}`)
    const fullName = response.full_name ?? `${repo.owner}/${repo.repo}`
    return {
      id: response.id.toString(),
      name: fullName,
      description: response.description ?? '',
      stars: response.stargazers_count,
      forks: response.forks_count,
      watchers: response.watchers_count,
      language: response.language ?? 'Unknown',
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
      openIssues: 0,
      openPRs: 0,
      url: response.html_url ?? response.url ?? `https://github.com/${fullName}`,
    }
  }

  /**
   * 获取贡献者列表
   */
  async fetchContributors(repo: RepoInfo): Promise<Contributor[]> {
    const response = await this.request(
      `/repos/${repo.owner}/${repo.repo}/contributors?per_page=100`
    )
    return response.map((contributor: any) => ({
      id: contributor.id.toString(),
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions,
    }))
  }

  /**
   * 获取提交记录
   */
  async fetchCommits(repo: RepoInfo): Promise<Commit[]> {
    const response = await this.request(
      `/repos/${repo.owner}/${repo.repo}/commits?per_page=100`
    )
    return response.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message.split('\n')[0],
      author: commit.commit.author.name,
      date: new Date(commit.commit.author.date),
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
    }))
  }

  /**
   * 获取 Issue 列表
   */
  async fetchIssues(repo: RepoInfo): Promise<Issue[]> {
    const response = await this.request(
      `/repos/${repo.owner}/${repo.repo}/issues?state=all&per_page=100`
    )
    return response
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        id: issue.id.toString(),
        title: issue.title,
        number: issue.number,
        state: issue.state,
        createdAt: new Date(issue.created_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
        author: issue.user.login,
      }))
  }

  /**
   * 获取 Pull Request 列表
   */
  async fetchPRs(repo: RepoInfo): Promise<PullRequest[]> {
    const response = await this.request(
      `/repos/${repo.owner}/${repo.repo}/pulls?state=all&per_page=100`
    )
    return response.map((pr: any) => ({
      id: pr.id.toString(),
      title: pr.title,
      number: pr.number,
      state: pr.merged_at ? 'merged' : pr.state,
      createdAt: new Date(pr.created_at),
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
      author: pr.user.login,
      additions: pr.additions,
      deletions: pr.deletions,
    }))
  }

  /**
   * 发送 API 请求
   */
  private async request(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitDash',
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
  }
}