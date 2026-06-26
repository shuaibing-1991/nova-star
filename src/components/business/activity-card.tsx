/**
 * 活动卡片（用于 /phone/schedule）
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Lock, Zap } from 'lucide-react'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn } from '@/lib/utils'
import type { Activity } from '@/lib/activity-catalog'
import { STAT_LABEL } from '@/lib/activity-engine'

export interface ActivityCardProps {
  activity: Activity
  disabled?: boolean
  disabledReason?: string
  onClick?: () => void
  delay?: number
  /** L2: 用户偏好减少动画时，跳过 framer-motion */
  reducedMotion?: boolean
  /** M1: 刚被点击（短时高亮边框，让玩家视觉确认生效） */
  highlighted?: boolean
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  disabled,
  disabledReason,
  onClick,
  delay = 0,
  reducedMotion = false,
  highlighted = false,
}) => {
  const className = cn(
    'group relative w-full overflow-hidden rounded-xl border bg-white p-3 text-left transition-all',
    highlighted
      ? 'border-pink-400 shadow-md ring-2 ring-pink-200'
      : 'border-gray-200',
    disabled
      ? 'pointer-events-none cursor-not-allowed opacity-50'
      : 'active:scale-[0.98] hover:border-pink-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-1'
  )

  // 减少动画偏好：直接渲染 button，避免 framer-motion 入场动画
  if (reducedMotion) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label={
          disabled && disabledReason
            ? `${activity.name}（${disabledReason}）`
            : activity.name
        }
        className={className}
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">{activity.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{activity.name}</h3>
              {activity.energyDelta !== 0 && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    activity.energyDelta > 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}
                >
                  <Zap className="h-3 w-3" />
                  {activity.energyDelta > 0 ? '+' : ''}
                  {activity.energyDelta}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{activity.desc}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(activity.effects).map(([key, delta]) => {
                if (delta === undefined || delta === 0) return null
                const label =
                  STAT_LABEL[key as keyof typeof STAT_LABEL] ?? key
                const sign = delta > 0 ? '+' : ''
                return (
                  <span
                    key={key}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      delta > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    )}
                  >
                    {label} {sign}
                    {delta}
                  </span>
                )
              })}
            </div>

            {activity.hint && (
              <p className="mt-1.5 text-xs text-gray-400">💡 {activity.hint}</p>
            )}
          </div>

          {disabled && (
            <div className="flex flex-col items-end gap-1">
              <Lock className="h-4 w-4 text-gray-400" />
              {disabledReason && (
                <span className="text-xs text-red-500">{disabledReason}</span>
              )}
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={disabled && disabledReason ? `${activity.name}（${disabledReason}）` : activity.name}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: highlighted ? 1.02 : 1,
      }}
      transition={{ delay, duration: highlighted ? motionTokens.duration.normal : motionTokens.duration.fast }}
      className={className}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{activity.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">{activity.name}</h3>
            {activity.energyDelta !== 0 && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  activity.energyDelta > 0
                    ? 'text-green-500'
                    : 'text-red-500'
                )}
              >
                <Zap className="h-3 w-3" />
                {activity.energyDelta > 0 ? '+' : ''}
                {activity.energyDelta}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{activity.desc}</p>

          {/* 数值效果 chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(activity.effects).map(([key, delta]) => {
              if (delta === undefined || delta === 0) return null
              const label = STAT_LABEL[key as keyof typeof STAT_LABEL] ?? key
              const sign = delta > 0 ? '+' : ''
              return (
                <span
                  key={key}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    delta > 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  )}
                >
                  {label} {sign}
                  {delta}
                </span>
              )
            })}
          </div>

          {activity.hint && (
            <p className="mt-1.5 text-xs text-gray-400">💡 {activity.hint}</p>
          )}
        </div>

        {disabled && (
          <div className="flex flex-col items-end gap-1">
            <Lock className="h-4 w-4 text-gray-400" />
            {disabledReason && (
              <span className="text-xs text-red-500">{disabledReason}</span>
            )}
          </div>
        )}
      </div>
    </motion.button>
  )
}
