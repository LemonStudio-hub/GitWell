import { ref, onUnmounted } from 'vue'
import type { RepoData, HealthMetrics } from '@gitwell/api'

export interface WebSocketMessage {
  type: 'connected' | 'subscribed' | 'update' | 'error'
  message?: string
  repo?: string
  repoData?: RepoData
  metrics?: HealthMetrics
  healthScore?: number
  timestamp?: number
}

export function useWebSocket(repoUrl: string) {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<Date | null>(null)

  const connect = () => {
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8787'}/api/ws?repo=${encodeURIComponent(repoUrl)}`
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      connected.value = true
      error.value = null
      console.log('WebSocket connected')
    }

    ws.value.onclose = () => {
      connected.value = false
      console.log('WebSocket disconnected')
      // 自动重连
      setTimeout(() => {
        if (!connected.value) {
          connect()
        }
      }, 5000)
    }

    ws.value.onerror = (event) => {
      error.value = 'WebSocket connection error'
      console.error('WebSocket error:', event)
    }

    ws.value.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data)

        if (data.type === 'connected') {
          console.log(data.message)
        } else if (data.type === 'update') {
          lastUpdate.value = new Date(data.timestamp!)
          // 触发自定义事件，让组件可以监听更新
          window.dispatchEvent(new CustomEvent('repo-update', {
            detail: {
              repoData: data.repoData,
              metrics: data.metrics,
              healthScore: data.healthScore,
            }
          }))
        } else if (data.type === 'error') {
          error.value = data.message || 'Unknown error'
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      connected.value = false
    }
  }

  const subscribe = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'subscribe',
        repo: repoUrl,
      }))
    }
  }

  const unsubscribe = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'unsubscribe',
        repo: repoUrl,
      }))
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    error,
    lastUpdate,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  }
}