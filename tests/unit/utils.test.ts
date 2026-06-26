/**
 * utils.ts smoke test
 */
import { describe, it, expect } from 'vitest'
import {
  cn,
  formatNumber,
  formatCompactNumber,
  clamp,
  safeJsonParse,
  sleep,
} from '@/lib/utils'

describe('utils.cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('dedupes tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})

describe('utils.formatNumber', () => {
  it('formats with zh-CN locale', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('utils.formatCompactNumber', () => {
  it('formats 10k+ as 万', () => {
    expect(formatCompactNumber(23456)).toBe('2.3万')
  })

  it('formats 1k+ as k', () => {
    expect(formatCompactNumber(1234)).toBe('1.2k')
  })

  it('returns small numbers as is', () => {
    expect(formatCompactNumber(42)).toBe('42')
  })

  it('handles 100k correctly', () => {
    expect(formatCompactNumber(123456)).toBe('12.3万')
  })
})

describe('utils.clamp', () => {
  it('clamps to min', () => {
    expect(clamp(-5, 0, 100)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it('returns value within range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})

describe('utils.safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 })
  })

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('not json', { fallback: true })).toEqual({
      fallback: true,
    })
  })
})

describe('utils.sleep', () => {
  it('resolves after specified ms', async () => {
    const start = Date.now()
    await sleep(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(45)
  })
})