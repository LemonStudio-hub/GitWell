/**
 * 格式化数字
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals?: number): string {
  const percentage = value * 100
  
  // 如果没有指定小数位数，自动决定
  if (decimals === undefined) {
    // 如果是整数，不显示小数
    if (Number.isInteger(percentage)) {
      return `${percentage}%`
    }
    // 否则显示2位小数
    return `${percentage.toFixed(2)}%`
  }
  
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - 3) + '...'
}