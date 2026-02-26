/**
 * 历史记录数据结构
 */
export interface HistoryRecord {
  id: string
  url: string
  platform: 'github' | 'gitlab'
  owner: string
  repo: string
  timestamp: number
  visited: number
}

const STORAGE_KEY = 'gitdash_history'
const MAX_HISTORY_SIZE = 50

/**
 * 获取所有历史记录
 */
export function getHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return []
    }
    const history: HistoryRecord[] = JSON.parse(data)
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to get history from localStorage:', error)
    return []
  }
}

/**
 * 添加历史记录
 */
export function addHistory(record: Omit<HistoryRecord, 'id' | 'timestamp' | 'visited'>): HistoryRecord {
  const history = getHistory()

  // 检查是否已存在相同的记录
  const existingIndex = history.findIndex(
    (item) => item.url === record.url
  )

  const newRecord: HistoryRecord = {
    id: existingIndex >= 0 ? (history[existingIndex] as HistoryRecord).id : generateId(),
    ...record,
    timestamp: Date.now(),
    visited: existingIndex >= 0 ? (history[existingIndex] as HistoryRecord).visited + 1 : 1,
  }

  if (existingIndex >= 0) {
    // 更新现有记录
    history[existingIndex] = newRecord
  } else {
    // 添加新记录
    history.unshift(newRecord)
  }

  // 限制历史记录数量
  const trimmedHistory = history.slice(0, MAX_HISTORY_SIZE)

  saveHistory(trimmedHistory)
  return newRecord
}

/**
 * 删除历史记录
 */
export function deleteHistory(id: string): void {
  const history = getHistory()
  const filtered = history.filter((item) => item.id !== id)
  saveHistory(filtered)
}

/**
 * 清空所有历史记录
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear history from localStorage:', error)
  }
}

/**
 * 更新历史记录
 */
export function updateHistory(id: string, updates: Partial<HistoryRecord>): void {
  const history = getHistory()
  const index = history.findIndex((item) => item.id === id)

  if (index >= 0) {
    history[index] = { ...history[index], ...updates } as HistoryRecord
    saveHistory(history)
  }
}

/**
 * 保存历史记录到 localStorage
 */
function saveHistory(history: HistoryRecord[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history to localStorage:', error)
  }
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 搜索历史记录
 */
export function searchHistory(query: string): HistoryRecord[] {
  const history = getHistory()
  const lowerQuery = query.toLowerCase()

  return history.filter(
    (item) =>
      item.url.toLowerCase().includes(lowerQuery) ||
      item.owner.toLowerCase().includes(lowerQuery) ||
      item.repo.toLowerCase().includes(lowerQuery)
  )
}

/**
 * 获取最近访问的记录
 */
export function getRecentHistory(limit: number = 10): HistoryRecord[] {
  const history = getHistory()
  return history.slice(0, limit)
}