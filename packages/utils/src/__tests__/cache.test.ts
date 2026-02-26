import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryCache } from '../cache'

describe('MemoryCache', () => {
  let cache: MemoryCache

  beforeEach(() => {
    cache = new MemoryCache()
    vi.useFakeTimers()
  })

  describe('set', () => {
    it('应该正确设置值', () => {
      cache.set('test-key', 'test-value')
      expect(cache.get('test-key')).toBe('test-value')
    })

    it('应该正确设置过期时间', () => {
      cache.set('test-key', 'test-value', 1000)
      expect(cache.get('test-key')).toBe('test-value')
      vi.advanceTimersByTime(1500)
      expect(cache.get('test-key')).toBeNull()
    })
  })

  describe('get', () => {
    it('应该正确获取值', () => {
      cache.set('test-key', 'test-value')
      expect(cache.get('test-key')).toBe('test-value')
    })

    it('不存在的键应该返回 null', () => {
      expect(cache.get('nonexistent-key')).toBeNull()
    })

    it('过期的键应该返回 null', () => {
      cache.set('test-key', 'test-value', 100)
      vi.advanceTimersByTime(150)
      expect(cache.get('test-key')).toBeNull()
    })

    it('应该支持泛型类型', () => {
      const obj = { name: 'test', value: 123 }
      cache.set('obj-key', obj)
      const result = cache.get<{ name: string; value: number }>('obj-key')
      expect(result).toEqual(obj)
    })
  })

  describe('has', () => {
    it('存在的键应该返回 true', () => {
      cache.set('test-key', 'test-value')
      expect(cache.has('test-key')).toBe(true)
    })

    it('不存在的键应该返回 false', () => {
      expect(cache.has('nonexistent-key')).toBe(false)
    })

    it('过期的键应该返回 false', () => {
      cache.set('test-key', 'test-value', 100)
      vi.advanceTimersByTime(150)
      expect(cache.has('test-key')).toBe(false)
    })
  })

  describe('delete', () => {
    it('应该正确删除值', () => {
      cache.set('test-key', 'test-value')
      cache.delete('test-key')
      expect(cache.get('test-key')).toBeNull()
    })

    it('删除不存在的键不应该报错', () => {
      expect(() => cache.delete('nonexistent-key')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('应该清空所有缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('size', () => {
    it('应该正确返回缓存大小', () => {
      expect(cache.size()).toBe(0)
      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
    })

    it('过期键不应该计入大小', () => {
      cache.set('key1', 'value1', 100)
      cache.set('key2', 'value2', 1000)
      vi.advanceTimersByTime(150)
      expect(cache.size()).toBe(1)
    })
  })

  describe('keys', () => {
    it('应该返回所有键', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      const keys = cache.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })
  })

  describe('cleanup', () => {
    it('应该清理过期条目', () => {
      cache.set('key1', 'value1', 100)
      cache.set('key2', 'value2', 1000)
      vi.advanceTimersByTime(150)
      cache.cleanup()
      expect(cache.size()).toBe(1)
    })
  })
})