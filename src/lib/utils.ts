/**
 * 通用工具函数
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className（Tailwind CSS 类名合并）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 数字千分位
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN')
}

/**
 * 中文紧凑数字（PRD 6.5 粉丝数显示）
 * 例：1234 → 1.2k；23456 → 2.3万
 */
export function formatCompactNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

/**
 * 数字滚动动画
 */
export function animateNumber(
  from: number,
  to: number,
  duration: number = 500,
  onUpdate: (n: number) => void
): () => void {
  const startTime = performance.now()
  const diff = to - from
  let rafId: number

  function tick(now: number) {
    const elapsed = now - startTime
    if (elapsed >= duration) {
      onUpdate(to)
      return
    }
    const progress = elapsed / duration
    // easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3)
    onUpdate(Math.round(from + diff * eased))
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}

/**
 * 防抖
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 睡眠
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 安全的 JSON.parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * 限制数值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 密码学安全随机字符
 */
function randomChar(chars: string): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return chars[arr[0] % chars.length]
  }
  return chars[Math.floor(Math.random() * chars.length)]
}

/**
 * 生成存档码（PRD 6.15）
 * 格式：NOVA-XX-XX-XX
 */
export function generateSaveCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去除 0/O/1/I
  let code = 'NOVA'
  for (let i = 0; i < 3; i++) {
    code += '-'
    for (let j = 0; j < 2; j++) {
      code += randomChar(chars)
    }
  }
  return code
}
