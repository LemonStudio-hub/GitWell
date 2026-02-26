import { PlatformFactory } from '@gitwell/api'

export interface Env {
  GITHUB_TOKEN?: string
  GITLAB_TOKEN?: string
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
    // Create platform client
    const token = url.includes('github.com') ? env.GITHUB_TOKEN : env.GITLAB_TOKEN
    const client = PlatformFactory.createFromUrl(url, token)

    // Fetch repo info
    const repoInfo = client.parseRepoUrl(url)
    if (!repoInfo) {
      throw new Error('Invalid repository URL')
    }

    const repoData = await client.fetchRepoInfo(repoInfo)

    return new Response(JSON.stringify({ data: repoData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch repo data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}