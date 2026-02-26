import type { Env } from '../types'

export interface AlertRule {
  id?: number
  repo_url: string
  metric_type: 'health_score' | 'commit_frequency' | 'issue_resolution_rate' | 'pr_merge_rate'
  threshold: number
  condition: 'above' | 'below'
  enabled: boolean
}

/**
 * 创建告警规则
 */
export async function handleCreateAlertRule(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const body = await request.json()
  const { repoUrl, metricType, threshold, condition } = body

  if (!repoUrl || !metricType || threshold === undefined || !condition) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
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
    const result = await env.D1.prepare(
      'INSERT INTO alert_rules (repo_url, metric_type, threshold, condition, enabled) VALUES (?, ?, ?, ?, 1)'
    ).bind(repoUrl, metricType, threshold, condition).run()

    return new Response(
      JSON.stringify({
        data: {
          id: result.meta.last_row_id,
          repoUrl,
          metricType,
          threshold,
          condition,
          enabled: true,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create alert rule' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 获取仓库的告警规则
 */
export async function handleGetAlertRules(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const url = new URL(request.url)
  const repoUrl = url.searchParams.get('repoUrl')

  if (!repoUrl) {
    return new Response(
      JSON.stringify({ error: 'repoUrl parameter is required' }),
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
    const result = await env.D1.prepare(
      'SELECT * FROM alert_rules WHERE repo_url = ? AND enabled = 1'
    ).bind(repoUrl).all()

    return new Response(
      JSON.stringify({ data: result.results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch alert rules' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 删除告警规则
 */
export async function handleDeleteAlertRule(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'id parameter is required' }),
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
      'DELETE FROM alert_rules WHERE id = ?'
    ).bind(id).run()

    return new Response(
      JSON.stringify({ data: { deleted: true } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to delete alert rule' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 检查告警并发送通知
 */
export async function checkAndTriggerAlerts(
  repoUrl: string,
  metrics: {
    healthScore: number
    commitFrequency: number
    issueResolutionRate: number
    prMergeRate: number
  },
  env: Env
): Promise<void> {
  if (!env.D1) {
    return
  }

  try {
    const rules = await env.D1.prepare(
      'SELECT * FROM alert_rules WHERE repo_url = ? AND enabled = 1'
    ).bind(repoUrl).all()

    for (const rule of rules.results as AlertRule[]) {
      let triggered = false
      let currentValue = 0

      switch (rule.metric_type) {
        case 'health_score':
          currentValue = metrics.healthScore
          break
        case 'commit_frequency':
          currentValue = metrics.commitFrequency
          break
        case 'issue_resolution_rate':
          currentValue = metrics.issueResolutionRate * 100
          break
        case 'pr_merge_rate':
          currentValue = metrics.prMergeRate * 100
          break
      }

      if (rule.condition === 'above' && currentValue > rule.threshold) {
        triggered = true
      } else if (rule.condition === 'below' && currentValue < rule.threshold) {
        triggered = true
      }

      if (triggered) {
        // 这里可以添加通知逻辑，如发送邮件、Webhook 等
        console.log(`Alert triggered for ${repoUrl}: ${rule.metric_type} is ${currentValue}, threshold is ${rule.threshold}`)
      }
    }
  } catch (error) {
    console.error('Failed to check alerts:', error)
  }
}