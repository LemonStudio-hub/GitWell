import type { Env } from '../types'

/**
 * 处理订阅请求
 */
export async function handleSubscribeRequest(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const body = await request.json()
  const { repoUrl } = body

  if (!repoUrl) {
    return new Response(
      JSON.stringify({ error: 'repoUrl is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!env.D1) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // 验证仓库 URL
    const githubRegex = /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)\/?$/i
    const gitlabRegex = /^https?:\/\/(?:www\.)?gitlab\.com\/([^\/]+)\/([^\/]+)\/?$/i

    let platform = 'unknown'
    let owner = ''
    let repo = ''

    const githubMatch = repoUrl.match(githubRegex)
    const gitlabMatch = repoUrl.match(gitlabRegex)

    if (githubMatch) {
      platform = 'github'
      owner = githubMatch[1]
      repo = githubMatch[2]
    } else if (gitlabMatch) {
      platform = 'gitlab'
      owner = gitlabMatch[1]
      repo = gitlabMatch[2]
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid repository URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 检查是否已存在
    const existing = await env.D1.prepare(
      'SELECT id FROM subscriptions WHERE repo_url = ?'
    ).bind(repoUrl).first()

    if (existing) {
      // 更新活跃状态
      await env.D1.prepare(
        'UPDATE subscriptions SET active = 1, updated_at = CURRENT_TIMESTAMP WHERE repo_url = ?'
      ).bind(repoUrl).run()
    } else {
      // 创建新订阅
      await env.D1.prepare(
        'INSERT INTO subscriptions (repo_url, platform, owner, repo, active) VALUES (?, ?, ?, ?, 1)'
      ).bind(repoUrl, platform, owner, repo).run()
    }

    return new Response(
      JSON.stringify({
        data: {
          subscribed: true,
          repoUrl,
          platform,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to subscribe' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 处理取消订阅请求
 */
export async function handleUnsubscribeRequest(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const body = await request.json()
  const { repoUrl } = body

  if (!repoUrl) {
    return new Response(
      JSON.stringify({ error: 'repoUrl is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!env.D1) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    await env.D1.prepare(
      'UPDATE subscriptions SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE repo_url = ?'
    ).bind(repoUrl).run()

    return new Response(
      JSON.stringify({
        data: {
          unsubscribed: true,
          repoUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to unsubscribe' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 获取订阅列表
 */
export async function handleGetSubscriptionsRequest(
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  if (!env.D1) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const result = await env.D1.prepare(
      'SELECT * FROM subscriptions WHERE active = 1 ORDER BY created_at DESC'
    ).all()

    return new Response(
      JSON.stringify({ data: result.results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch subscriptions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}