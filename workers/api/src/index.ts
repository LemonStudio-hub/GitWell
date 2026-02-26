import { PlatformFactory, RepoAnalyzer } from '@gitdash/api'
import { handleWebSocketUpgrade } from './websocket'
import {
  handleSubscribeRequest,
  handleUnsubscribeRequest,
  handleGetSubscriptionsRequest,
} from './routes/subscriptions'
import {
  handleCreateAlertRule,
  handleGetAlertRules,
  handleDeleteAlertRule,
} from './routes/alerts'
import {
  handleCreateDashboard,
  handleGetDashboards,
  handleUpdateDashboard,
  handleDeleteDashboard,
} from './routes/dashboard'
import type { Env } from './types'

// Cloudflare Workers ScheduledEvent 接口
interface ScheduledEvent {
  scheduledTime: number
  cron: string
  waitUntil(promise: Promise<any>): void
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // WebSocket 升级请求
      if (path === '/api/ws' && request.headers.get('Upgrade') === 'websocket') {
        return handleWebSocketUpgrade(request, corsHeaders)
      }

      // API routes
      if (path === '/api/repo' && request.method === 'POST') {
        return handleRepoRequest(request, env, corsHeaders)
      }

      if (path === '/api/validate' && request.method === 'POST') {
        return handleValidateRequest(request, corsHeaders)
      }

      // Subscription routes
      if (path === '/api/subscribe' && request.method === 'POST') {
        return handleSubscribeRequest(request, env, corsHeaders)
      }

      if (path === '/api/unsubscribe' && request.method === 'POST') {
        return handleUnsubscribeRequest(request, env, corsHeaders)
      }

      if (path === '/api/subscriptions' && request.method === 'GET') {
        return handleGetSubscriptionsRequest(env, corsHeaders)
      }

      // Alert routes
      if (path === '/api/alerts' && request.method === 'POST') {
        return handleCreateAlertRule(request, env, corsHeaders)
      }

      if (path === '/api/alerts' && request.method === 'GET') {
        return handleGetAlertRules(request, env, corsHeaders)
      }

      if (path.startsWith('/api/alerts/') && request.method === 'DELETE') {
        return handleDeleteAlertRule(request, env, corsHeaders)
      }

      // Dashboard routes
      if (path === '/api/dashboards' && request.method === 'POST') {
        return handleCreateDashboard(request, env, corsHeaders)
      }

      if (path === '/api/dashboards' && request.method === 'GET') {
        return handleGetDashboards(env, corsHeaders)
      }

      if (path.startsWith('/api/dashboards/') && request.method === 'PUT') {
        return handleUpdateDashboard(request, env, corsHeaders)
      }

      if (path.startsWith('/api/dashboards/') && request.method === 'DELETE') {
        return handleDeleteDashboard(request, env, corsHeaders)
      }

      // 404
      return new Response('Not Found', { status: 404, headers: corsHeaders })
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  },

  // 处理定时任务（Cron Triggers）
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const { startPeriodicUpdates } = await import('./websocket')

    // 从数据库获取需要定期更新的仓库列表
    if (env.D1) {
      try {
        const result = await env.D1.prepare(
          'SELECT repo_url FROM subscriptions WHERE active = 1'
        ).all()

        for (const row of result.results as any[]) {
          await startPeriodicUpdates(env, row.repo_url)
        }
      } catch (error) {
        console.error('Failed to process scheduled updates:', error)
      }
    }
  },
}

async function handleRepoRequest(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const body = await request.json()
  const { url } = body

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'URL is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // 检查缓存
    const cacheKey = `repo:${url}`
    if (env.KV) {
      const cached = await env.KV.get(cacheKey, 'json')
      if (cached) {
        return new Response(JSON.stringify({ data: cached }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Create platform client
    const token = url.includes('github.com') ? env.GITHUB_TOKEN : env.GITLAB_TOKEN
    const client = PlatformFactory.createFromUrl(url, token)

    if (!client) {
      throw new Error('Unsupported platform or invalid URL')
    }

    // Fetch repo info
    const repoInfo = client.parseRepoUrl(url)
    if (!repoInfo) {
      throw new Error('Invalid repository URL')
    }

    // 并行获取所有数据
    const [repoData, contributors, commits, issues, prs] = await Promise.all([
      client.fetchRepoInfo(repoInfo),
      client.fetchContributors(repoInfo),
      client.fetchCommits(repoInfo),
      client.fetchIssues(repoInfo),
      client.fetchPRs(repoInfo),
    ])

    // 更新 openIssues 和 openPRs 的数量
    repoData.openIssues = issues.filter((issue) => issue.state === 'open').length
    repoData.openPRs = prs.filter((pr) => pr.state === 'open').length

    // 分析数据
    const analyzer = new RepoAnalyzer()
    const { metrics, healthScore, trendData } = analyzer.analyzeRepo({
      commits,
      contributors,
      issues,
      prs,
    })

    const result = {
      repoData,
      metrics,
      healthScore,
      trendData,
    }

    // 缓存结果（5分钟）
    if (env.KV) {
      await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 })
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch repo data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleValidateRequest(request: Request, corsHeaders: HeadersInit): Promise<Response> {
  const body = await request.json()
  const { url } = body

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'URL is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const githubRegex = /^https?:\/\/(?:www\.)?github\.com\/[^\/]+\/[^\/]+\/?$/i
    const gitlabRegex = /^https?:\/\/(?:www\.)?gitlab\.com\/[^\/]+\/[^\/]+\/?$/i

    let platform = 'unknown'
    let valid = false

    if (githubRegex.test(url)) {
      platform = 'github'
      valid = true
    } else if (gitlabRegex.test(url)) {
      platform = 'gitlab'
      valid = true
    }

    return new Response(
      JSON.stringify({
        data: {
          valid,
          platform,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}