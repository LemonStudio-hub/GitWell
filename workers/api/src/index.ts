import { PlatformFactory, RepoAnalyzer } from '@gitwell/api'
import type { Env } from './types'

export interface Env {
  GITHUB_TOKEN?: string
  GITLAB_TOKEN?: string
  KV?: KVNamespace
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
      // API routes
      if (path === '/api/repo' && request.method === 'POST') {
        return handleRepoRequest(request, env, corsHeaders)
      }

      if (path === '/api/validate' && request.method === 'POST') {
        return handleValidateRequest(request, corsHeaders)
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