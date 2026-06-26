/**
 * PerfBadge - 性能徽章（开发期右下角显示 Web Vitals）
 *
 * 阶段 7 Round 4 修复：
 * - 之前 usePerformanceMonitor 只 console.info，无法直观看到
 * - 现在徽章直接显示 FCP/LCP 数值和评级
 * - 仅在 NODE_ENV !== production 时显示
 * - 可通过 settings.perfBadge 关闭
 */
'use client'

import * as React from 'react'
import { usePerformanceMonitor, type PerfMetric } from '@/hooks/use-performance-monitor'
import { cn } from '@/lib/utils'

const RATING_COLOR = {
  good: 'bg-green-500',
  'needs-improvement': 'bg-yellow-500',
  poor: 'bg-red-500',
} as const

const RATING_LABEL = {
  good: '优',
  'needs-improvement': '良',
  poor: '差',
} as const

export const PerfBadge: React.FC = () => {
  const [metrics, setMetrics] = React.useState<Record<string, PerfMetric>>({})
  const [collapsed, setCollapsed] = React.useState(false)

  // 仅在 development 显示
  const isDev = process.env.NODE_ENV !== 'production'
  const handleMetric = React.useCallback((m: PerfMetric) => {
    setMetrics((prev) => ({ ...prev, [m.name]: m }))
  }, [])

  usePerformanceMonitor(isDev ? handleMetric : undefined)

  if (!isDev) return null

  const lcp = metrics.LCP
  const fcp = metrics.FCP

  if (!lcp && !fcp) return null

  return (
    <button
      type="button"
      onClick={() => setCollapsed((c) => !c)}
      className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-1 rounded-lg bg-black/80 px-2 py-1.5 text-[10px] text-white shadow-lg backdrop-blur"
      aria-label="性能徽章，点击展开/收起"
    >
      {collapsed ? (
        <span className="font-mono">📊</span>
      ) : (
        <>
          {fcp && (
            <MetricRow
              label="FCP"
              value={fcp.value}
              rating={fcp.rating}
            />
          )}
          {lcp && (
            <MetricRow
              label="LCP"
              value={lcp.value}
              rating={lcp.rating}
            />
          )}
        </>
      )}
    </button>
  )
}

const MetricRow: React.FC<{
  label: string
  value: number
  rating: PerfMetric['rating']
}> = ({ label, value, rating }) => (
  <div className="flex items-center gap-1.5 font-mono">
    <span className={cn('inline-block h-1.5 w-1.5 rounded-full', RATING_COLOR[rating])} />
    <span className="text-gray-300">{label}</span>
    <span className="font-semibold">{Math.round(value)}ms</span>
    <span className="text-gray-400">{RATING_LABEL[rating]}</span>
  </div>
)
