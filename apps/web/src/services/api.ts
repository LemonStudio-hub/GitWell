import type { RepoData, Commit, Contributor, Issue, PullRequest, HealthMetrics, TrendData } from '@gitwell/api'

/**
 * API 响应接口
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * API 服务
 */
class ApiService {
  private baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

  /**
   * 发送请求
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /**
   * 获取仓库数据
   */
  async getRepoData(url: string): Promise<
    ApiResponse<{
      repoData: RepoData
      metrics: HealthMetrics
      healthScore: number
      trendData: TrendData[]
    }>
  > {
    return this.request('/repo', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }

  /**
   * 验证仓库 URL
   */
  async validateRepoUrl(url: string): Promise<ApiResponse<{ valid: boolean; platform: string }>> {
    return this.request('/validate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  }
}

export const apiService = new ApiService()