import { GraphQLClient } from 'graphql-request'
import type { KVNamespace } from './types'

/**
 * GitHub GraphQL 查询：获取仓库基本信息
 */
const GET_REPO_INFO = `
  query GetRepoInfo($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      owner {
        login
        avatarUrl
      }
      description
      url
      stargazerCount
      forkCount
      watchers {
        totalCount
      }
      primaryLanguage {
        name
      }
      createdAt
      updatedAt
      pushedAt
      defaultBranchRef {
        name
      }
      issues(states: [OPEN]) {
        totalCount
      }
      pullRequests(states: [OPEN]) {
        totalCount
      }
    }
  }
`

/**
 * GitHub GraphQL 查询：获取贡献者列表
 */
const GET_CONTRIBUTORS = `
  query GetContributors($owner: String!, $name: String!, $first: Int!) {
    repository(owner: $owner, name: $name) {
      contributors(first: $first) {
        nodes {
          id
          login
          avatarUrl
          contributions {
            totalCount
          }
        }
      }
    }
  }
`

/**
 * GitHub GraphQL 查询：获取提交历史
 */
const GET_COMMITS = `
  query GetCommits($owner: String!, $name: String!, $first: Int!, $since: GitTimestamp!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: $first, since: $since) {
              nodes {
                id
                oid
                message
                author {
                  name
                  email
                  date
                }
                additions
                deletions
                changedFiles
              }
            }
          }
        }
      }
    }
  }
`

/**
 * GitHub GraphQL 查询：获取 Issues 列表
 */
const GET_ISSUES = `
  query GetIssues($owner: String!, $name: String!, $first: Int!, $states: [IssueState!]!) {
    repository(owner: $owner, name: $name) {
      issues(first: $first, states: $states, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          id
          number
          title
          state
          createdAt
          closedAt
          author {
            login
          }
        }
      }
    }
  }
`

/**
 * GitHub GraphQL 查询：获取 Pull Requests 列表
 */
const GET_PULL_REQUESTS = `
  query GetPullRequests($owner: String!, $name: String!, $first: Int!, $states: [PullRequestState!]!) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: $first, states: $states, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          id
          number
          title
          state
          createdAt
          mergedAt
          author {
            login
          }
          additions
          deletions
          changedFiles
        }
      }
    }
  }
`

/**
 * GraphQL 响应类型
 */
interface RepoInfoResponse {
  repository: {
    id: string
    name: string
    owner: {
      login: string
      avatarUrl: string
    }
    description: string
    url: string
    stargazerCount: number
    forkCount: number
    watchers: {
      totalCount: number
    }
    primaryLanguage: {
      name: string
    } | null
    createdAt: string
    updatedAt: string
    pushedAt: string
    defaultBranchRef: {
      name: string
    } | null
    issues: {
      totalCount: number
    }
    pullRequests: {
      totalCount: number
    }
  }
}

interface ContributorsResponse {
  repository: {
    contributors: {
      nodes: Array<{
        id: string
        login: string
        avatarUrl: string
        contributions: {
          totalCount: number
        }
      }>
    }
  }
}

interface CommitsResponse {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          nodes: Array<{
            id: string
            oid: string
            message: string
            author: {
              name: string
              email: string
              date: string
            }
            additions: number
            deletions: number
            changedFiles: number
          }>
        }
      }
    } | null
  } | null
}

interface IssuesResponse {
  repository: {
    issues: {
      nodes: Array<{
        id: string
        number: number
        title: string
        state: string
        createdAt: string
        closedAt: string | null
        author: {
          login: string
        }
      }>
    }
  }
}

interface PullRequestsResponse {
  repository: {
    pullRequests: {
      nodes: Array<{
        id: string
        number: number
        title: string
        state: string
        createdAt: string
        mergedAt: string | null
        author: {
          login: string
        }
        additions: number
        deletions: number
        changedFiles: number
      }>
    }
  }
}

/**
 * GitHub GraphQL 客户端类
 */
export class GitHubGraphQLClient {
  private client: GraphQLClient
  private kv?: KVNamespace
  private cacheEnabled: boolean

  constructor(token: string, kv?: KVNamespace, cacheEnabled: boolean = true) {
    this.client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    this.kv = kv
    this.cacheEnabled = cacheEnabled
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(query: string, variables: Record<string, any>): string {
    const key = `${query}:${JSON.stringify(variables)}`
    // 使用简单的哈希来缩短键名
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return `github:${hash}`
  }

  /**
   * 从缓存获取
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.cacheEnabled || !this.kv) {
      return null
    }

    try {
      const cached = await this.kv.get(key, 'json')
      return cached as T | null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * 设置缓存
   */
  private async setCache<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    if (!this.cacheEnabled || !this.kv) {
      return
    }

    try {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl })
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * 执行 GraphQL 查询（带缓存）
   */
  private async query<T>(query: string, variables: Record<string, any>, cacheTtl?: number): Promise<T> {
    const cacheKey = this.getCacheKey(query, variables)

    // 尝试从缓存获取
    const cached = await this.getFromCache<T>(cacheKey)
    if (cached) {
      return cached
    }

    // 执行查询
    const result = await this.client.request<T>(query, variables)

    // 设置缓存
    if (cacheTtl) {
      await this.setCache(cacheKey, result, cacheTtl)
    }

    return result
  }

  /**
   * 获取仓库信息
   */
  async getRepoInfo(owner: string, name: string): Promise<RepoInfoResponse['repository']> {
    const response = await this.query<RepoInfoResponse>(
      GET_REPO_INFO,
      { owner, name },
      600 // 10分钟缓存
    )
    return response.repository
  }

  /**
   * 获取贡献者列表
   */
  async getContributors(owner: string, name: string, first: number = 100) {
    const response = await this.query<ContributorsResponse>(
      GET_CONTRIBUTORS,
      { owner, name, first },
      600
    )
    return response.repository.contributors.nodes
  }

  /**
   * 获取提交历史
   */
  async getCommits(owner: string, name: string, first: number = 100, since?: Date) {
    const sinceDate = since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 默认90天
    const response = await this.query<CommitsResponse>(
      GET_COMMITS,
      { owner, name, first, since: sinceDate.toISOString() },
      300 // 5分钟缓存
    )

    if (!response.repository?.defaultBranchRef) {
      return []
    }

    return response.repository.defaultBranchRef.target.history.nodes
  }

  /**
   * 获取 Issues 列表
   */
  async getIssues(owner: string, name: string, first: number = 100, states: string[] = ['OPEN', 'CLOSED']) {
    const response = await this.query<IssuesResponse>(
      GET_ISSUES,
      { owner, name, first, states },
      300
    )
    return response.repository.issues.nodes
  }

  /**
   * 获取 Pull Requests 列表
   */
  async getPullRequests(owner: string, name: string, first: number = 100, states: string[] = ['OPEN', 'CLOSED', 'MERGED']) {
    const response = await this.query<PullRequestsResponse>(
      GET_PULL_REQUESTS,
      { owner, name, first, states },
      300
    )
    return response.repository.pullRequests.nodes
  }
}