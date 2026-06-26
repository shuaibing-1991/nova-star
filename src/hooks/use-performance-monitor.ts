/**
 * usePerformanceMonitor - 性能监控（Web Vitals）
 *
 * 阶段 7 Round 4 修复：
 * - 之前只 console.info，开发期无法直观看到
 * - 改为调用 onMetric 回调（store 写入 / 性能徽章）
 * - 仍保留 console.info 用于本地调试
 */
'use client'

import { useEffect } from 'react'

export interface PerfMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

function getRating(name: string, value: number): PerfMetric['rating'] {
  const t = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!t) return 'good'
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

export function usePerformanceMonitor(onMetric?: (metric: PerfMetric) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // 阶段 7 Round 4 修复：开发期也启用（之前只 production）
    // 方便 dev 看到性能数据
    if (process.env.NODE_ENV === 'test') return

    // LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const value = entry.startTime
          const metric: PerfMetric = {
            name: 'LCP',
            value,
            rating: getRating('LCP', value),
          }
          onMetric?.(metric)
          // eslint-disable-next-line no-console
          console.info('[perf]', metric)
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime
            const metric: PerfMetric = {
              name: 'FCP',
              value,
              rating: getRating('FCP', value),
            }
            onMetric?.(metric)
            // eslint-disable-next-line no-console
            console.info('[perf]', metric)
          }
        }
      })
      fcpObserver.observe({ type: 'paint', buffered: true })

      return () => {
        lcpObserver.disconnect()
        fcpObserver.disconnect()
      }
    } catch {
      // 浏览器不支持，忽略
    }
  }, [onMetric])
}
