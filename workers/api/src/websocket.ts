import type { Env, WebSocket } from './types'
import { checkAndTriggerAlerts } from './routes/alerts'

// WebSocket 连接存储
export const websocketClients = new Map<string, WebSocket[]>()

/**
 * 处理 WebSocket 升级请求
 */
export async function handleWebSocketUpgrade(
  request: Request,
  corsHeaders: HeadersInit
): Promise<Response> {
  const pair: any = new (globalThis as any).WebSocketPair()
  const [client, server] = [pair[0] as WebSocket, pair[1] as WebSocket]

  if (!client || !server) {
    return new Response(
      JSON.stringify({ error: 'Failed to create WebSocket pair' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(request.url)
  const repoUrl = url.searchParams.get('repo')

  if (!repoUrl) {
    return new Response(
      JSON.stringify({ error: 'repo parameter is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 接受 WebSocket 连接
  server.accept()

  // 将客户端添加到订阅列表
  if (!websocketClients.has(repoUrl)) {
    websocketClients.set(repoUrl, [])
  }
  websocketClients.get(repoUrl)!.push(server)

  // 发送欢迎消息
  server.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to GitDash real-time updates',
    repo: repoUrl,
  }))

  // 监听消息
  server.addEventListener('message', async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string)

      if (data.type === 'subscribe') {
        // 处理订阅逻辑
        server.send(JSON.stringify({
          type: 'subscribed',
          repo: data.repo,
        }))
      } else if (data.type === 'unsubscribe') {
        // 处理取消订阅逻辑
        const clients = websocketClients.get(data.repo)
        if (clients) {
          const index = clients.indexOf(server)
          if (index > -1) {
            clients.splice(index, 1)
          }
        }
      }
    } catch (error) {
      server.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }))
    }
  })

  // 监听关闭事件
  server.addEventListener('close', () => {
    const clients = websocketClients.get(repoUrl)
    if (clients) {
      const index = clients.indexOf(server)
      if (index > -1) {
        clients.splice(index, 1)
      }
      if (clients.length === 0) {
        websocketClients.delete(repoUrl)
      }
    }
  })

  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: corsHeaders,
  } as any)
}

/**
 * 向订阅特定仓库的客户端广播更新
 */
export async function broadcastToClients(
  repoUrl: string,
  data: {
    type: 'update'
    repoData: any
    metrics: any
    healthScore: number
    timestamp: number
  }
): Promise<void> {
  const clients = websocketClients.get(repoUrl)
  if (!clients || clients.length === 0) {
    return
  }

  const message = JSON.stringify(data)

  for (const client of clients) {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    } catch (error) {
      // 移除损坏的连接
      const index = clients.indexOf(client)
      if (index > -1) {
        clients.splice(index, 1)
      }
    }
  }

  if (clients.length === 0) {
    websocketClients.delete(repoUrl)
  }
}

/**
 * 启动定期数据更新（通过定时任务触发）
 */
export async function startPeriodicUpdates(env: Env, repoUrl: string): Promise<void> {
  // 这个函数应该由 Cloudflare Workers Cron Trigger 调用
  const { PlatformFactory, RepoAnalyzer } = await import('@gitdash/api')

  try {
    // 获取平台客户端
    const token = repoUrl.includes('github.com') ? env.GITHUB_TOKEN : env.GITLAB_TOKEN
    const client = PlatformFactory.createFromUrl(repoUrl, token)

    if (!client) {
      return
    }

    // 获取仓库信息
    const repoInfo = client.parseRepoUrl(repoUrl)
    if (!repoInfo) {
      return
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
    const { metrics, healthScore } = analyzer.analyzeRepo({
      commits,
      contributors,
      issues,
      prs,
    })

    // 广播更新
    await broadcastToClients(repoUrl, {
      type: 'update',
      repoData,
      metrics,
      healthScore,
      timestamp: Date.now(),
    })

    // 检查告警
    await checkAndTriggerAlerts(repoUrl, {
      healthScore,
      commitFrequency: metrics.commitFrequency,
      issueResolutionRate: metrics.issueResolutionRate,
      prMergeRate: metrics.prMergeRate,
    }, env)

    // 更新缓存
    if (env.KV) {
      const cacheKey = `repo:${repoUrl}`
      await env.KV.put(cacheKey, JSON.stringify({
        repoData,
        metrics,
        healthScore,
      }), { expirationTtl: 300 })
    }
  } catch (error) {
    console.error(`Failed to update ${repoUrl}:`, error)
  }
}