import { describe, it, expect } from 'vitest'
import { formatNumber, formatPercentage, formatDate, formatRelativeTime } from '../index'

describe('formatNumber', () => {
  it('应该正确格式化大数字', () => {
    expect(formatNumber(1500)).toBe('1.5K')
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(1500000000)).toBe('1.5B')
  })

  it('应该正确格式化小数字', () => {
    expect(formatNumber(500)).toBe('500')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(-500)).toBe('-500')
  })
})

describe('formatPercentage', () => {
  it('应该正确格式化百分比', () => {
    expect(formatPercentage(0.85)).toBe('85%')
    expect(formatPercentage(0.5)).toBe('50%')
    expect(formatPercentage(1)).toBe('100%')
  })

  it('应该处理小数', () => {
    expect(formatPercentage(0.8567)).toBe('85.67%')
  })
})

describe('formatDate', () => {
  it('应该正确格式化日期 - short', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date, 'short')
    expect(result).toBeDefined()
  })

  it('应该正确格式化日期 - long', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date, 'long')
    expect(result).toBeDefined()
  })

  it('应该正确格式化日期 - full', () => {
    const date = new Date('2024-01-15T10:30:00')
    const result = formatDate(date, 'full')
    expect(result).toBeDefined()
  })
})

describe('formatRelativeTime', () => {
  it('应该正确格式化相对时间', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('刚刚')
  })

  it('应该正确格式化分钟前的相对时间', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toBe('5分钟前')
  })

  it('应该正确格式化小时前的相对时间', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toBe('3小时前')
  })

  it('应该正确格式化天前的相对时间', () => {
    const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toBe('5天前')
  })

  it('应该正确格式化月前的相对时间', () => {
    const date = new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toBe('2个月前')
  })

  it('应该正确格式化年前的相对时间', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toBe('2年前')
  })
})