import type { Env } from '../types'

export interface DashboardConfig {
  id?: number
  name: string
  layout: 'grid' | 'list'
  widgets: Array<{
    type: 'metric' | 'chart' | 'trend' | 'comparison'
    title: string
    metric?: string
    chartType?: 'line' | 'pie' | 'bar'
    position: {
      x: number
      y: number
      w: number
      h: number
    }
  }>
  created_at?: string
  updated_at?: string
}

/**
 * 创建仪表盘配置
 */
export async function handleCreateDashboard(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const body = await request.json()
  const { name, layout, widgets } = body

  if (!name || !layout || !widgets) {
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
      'INSERT INTO dashboards (name, layout, widgets) VALUES (?, ?, ?)'
    ).bind(name, layout, JSON.stringify(widgets)).run()

    return new Response(
      JSON.stringify({
        data: {
          id: result.meta.last_row_id,
          name,
          layout,
          widgets,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create dashboard' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 获取所有仪表盘配置
 */
export async function handleGetDashboards(
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
      'SELECT * FROM dashboards ORDER BY created_at DESC'
    ).all()

    const dashboards = result.results.map((row: any) => ({
      ...row,
      widgets: JSON.parse(row.widgets),
    }))

    return new Response(
      JSON.stringify({ data: dashboards }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch dashboards' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 更新仪表盘配置
 */
export async function handleUpdateDashboard(
  request: Request,
  env: Env,
  corsHeaders: HeadersInit
): Promise<Response> {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const body = await request.json()
  const { name, layout, widgets } = body

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
      'UPDATE dashboards SET name = ?, layout = ?, widgets = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, layout, JSON.stringify(widgets), id).run()

    return new Response(
      JSON.stringify({
        data: {
          id: parseInt(id),
          name,
          layout,
          widgets,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to update dashboard' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * 删除仪表盘配置
 */
export async function handleDeleteDashboard(
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
      'DELETE FROM dashboards WHERE id = ?'
    ).bind(id).run()

    return new Response(
      JSON.stringify({ data: { deleted: true } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to delete dashboard' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}