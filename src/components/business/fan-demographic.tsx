/**
 * 粉丝画像条
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useMotionEnabled } from '@/hooks/use-preferences'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface FanDemographicProps {
  segments: Array<{
    label: string
    count: number
    color: string
  }>
}

export const FanDemographic: React.FC<FanDemographicProps> = ({ segments }) => {
  const total = segments.reduce((s, x) => s + x.count, 0)
  if (total === 0) return null
  // 阶段 7 Round 1 修复：用户关闭动效时直接用静态宽度
  const motionEnabled = useMotionEnabled()

  return (
    <div className="space-y-3" aria-label="粉丝画像分布">
      {/* 水平堆叠条 */}
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
        role="img"
        aria-label={`粉丝分布：${segments
          .map((s) => `${s.label} ${((s.count / total) * 100).toFixed(1)}%`)
          .join('，')}`}
      >
        {segments.map((seg, i) => {
          const percent = (seg.count / total) * 100
          if (percent === 0) return null
          return (
            <motion.div
              key={seg.label}
              initial={motionEnabled ? { width: 0 } : false}
              animate={{ width: `${percent}%` }}
              transition={{ delay: i * motionTokens.stagger.normal, duration: motionTokens.duration.slow }}
              className={cn('h-full', seg.color)}
              style={{ width: `${percent}%` }}
              title={`${seg.label}: ${formatNumber(seg.count)}`}
              aria-hidden
            />
          )
        })}
      </div>

      {/* 图例 */}
      <dl className="grid grid-cols-2 gap-2 text-xs">
        {segments.map((seg) => {
          const percent = ((seg.count / total) * 100).toFixed(1)
          return (
            <div
              key={seg.label}
              className="flex items-center gap-2"
              aria-label={`${seg.label} ${formatNumber(seg.count)} 人 · 占 ${percent}%`}
            >
              <dt className="flex flex-1 items-center gap-2">
                <span
                  className={cn('h-2 w-2 rounded-full', seg.color)}
                  aria-hidden
                />
                <span className="text-gray-600">{seg.label}</span>
              </dt>
              <dd className="text-gray-400">
                {formatNumber(seg.count)} ({percent}%)
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
