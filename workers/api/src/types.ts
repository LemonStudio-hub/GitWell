// WebSocket 接口
export interface WebSocket {
  readonly readyState: number
  readonly OPEN: number
  readonly CLOSED: number
  accept(): void
  send(data: string): void
  close(code?: number, reason?: string): void
  addEventListener(type: string, listener: (event: any) => void): void
  removeEventListener(type: string, listener: (event: any) => void): void
}

// WebSocketPair 接口
export interface WebSocketPair {
  0: WebSocket
  1: WebSocket
}

// Cloudflare Workers KV 命名空间接口
export interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any>
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: {
      expirationTtl?: number
      expiration?: number
      metadata?: Record<string, any>
    }
  ): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { cursor?: string; limit?: number; prefix?: string }): Promise<any>
}

// Cloudflare Workers D1 数据库接口
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement
  first<T = any>(): Promise<T | null>
  all<T = any>(): Promise<{ results: T[]; success: boolean }>
  run(): Promise<D1Result>
}

export interface D1Result {
  results: any[]
  success: boolean
  meta: any
}

export interface D1ExecResult {
  success: boolean
  meta: any
}

export interface Env {
  GITHUB_TOKEN?: string
  GITLAB_TOKEN?: string
  KV?: KVNamespace
  D1?: D1Database
}