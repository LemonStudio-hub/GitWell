/**
 * 格式化日期为相对时间
 */
export function formatRelativeTime(date: Date): string
export function formatRelativeTime(timestamp: number): string
export function formatRelativeTime(dateOrTimestamp: Date | number): string {
  const date = typeof dateOrTimestamp === 'number' ? new Date(dateOrTimestamp) : dateOrTimestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) {
    return '刚刚'
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`
  } else if (diffHour < 24) {
    return `${diffHour}小时前`
  } else if (diffDay < 30) {
    return `${diffDay}天前`
  } else if (diffMonth < 12) {
    return `${diffMonth}个月前`
  } else {
    return `${diffYear}年前`
  }
}

/**
 * 格式化日期为字符串
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const options: Intl.DateTimeFormatOptions = {
    short: { year: 'numeric' as const, month: 'numeric' as const, day: 'numeric' as const },
    long: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const },
    full: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const, hour: '2-digit' as const, minute: '2-digit' as const, second: '2-digit' as const },
  }[format]
  return date.toLocaleDateString('zh-CN', options)
}

/**
 * 获取日期范围
 */
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}