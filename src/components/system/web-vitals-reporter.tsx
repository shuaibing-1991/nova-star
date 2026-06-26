/**
 * Web Vitals Reporter
 *
 * 阶段 9 Round 4 新增：使用 Next.js useReportWebVitals 收集 Core Web Vitals
 * 通过 navigator.sendBeacon 上报到 Umami
 *
 * 上报字段：
 * - name（LCP / FID / CLS / FCP / TTFB / INP）
 * - value（毫秒或分数）
 * - rating（good / needs-improvement / poor）
 * - id（唯一标识）
 * - navigationType（navigate / reload / back-forward）
 * - page（当前路径）
 *
 * 注意：
 * - 仅在生产环境生效（开发期 PerfBadge 已足够）
 * - navigator.sendBeacon 不阻塞主线程
 * - 失败时静默（不影响用户体验）
 */
'use client'

import { useReportWebVitals } from 'next/web-vitals'

const RATING_THRESHOLDS: Record<
  string,
  { good: number; poor: number; unit: 'ms' | 'score' }
> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  FID: { good: 100, poor: 300, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: 'score' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
}

/**
 * 根据 Web Vitals 标准阈值给当前指标打分
 * @see https://web.dev/articles/vitals
 */
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = RATING_THRESHOLDS[name]
  if (!threshold) return 'good'
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * 上报到 Umami（与 feedback / 通用 analytics 共用 endpoint）
 */
function sendToUmami(metric: {
  name: string
  value: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
}) {
  if (typeof navigator === 'undefined') return
  if (typeof navigator.sendBeacon !== 'function') return

  const url = process.env.NEXT_PUBLIC_ANALYTICS_URL
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN
  if (!url || !domain) return

  // 离线时跳过
  if (!navigator.onLine) return

  // client_id
  let clientId = ''
  try {
    clientId = localStorage.getItem('nova-star-client-id') || ''
    if (!clientId) {
      clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem('nova-star-client-id', clientId)
    }
  } catch {
    // localStorage 不可用
  }

  const payload = JSON.stringify({
    type: 'event',
    payload: {
      client_id: clientId,
      events: [
        {
          event: 'web_vital',
          url:
            typeof window !== 'undefined' ? window.location.pathname : '/',
          website: domain,
          title: 'Web Vital',
          meta: {
            name: metric.name,
            value: Math.round(metric.value * 1000) / 1000, // 保留 3 位小数
            rating: metric.rating,
            id: metric.id,
            navigation_type: metric.navigationType || 'navigate',
          },
        },
      ],
    },
  })

  try {
    const blob = new Blob([payload], { type: 'application/json' })
    navigator.sendBeacon(url, blob)
  } catch {
    // 静默失败（不影响用户体验）
  }
}

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // 计算 rating（Next.js 不自动提供）
    const rating = getRating(metric.name, metric.value)

    // 仅在生产环境上报（开发期数据噪音大）
    if (process.env.NODE_ENV === 'production') {
      sendToUmami({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating,
        navigationType: metric.navigationType,
      })
    }
  })

  return null
}
