/**
 * StatusBar - 数值状态栏（粉丝数、心情、信任）
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, Sparkles, Star } from 'lucide-react'
import { useGameStore } from '@/stores'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn, formatCompactNumber } from '@/lib/utils'

export interface StatusBarProps {
  className?: string
  /** 是否显示完整版（包含所有数值） */
  full?: boolean
}

const StatusBar: React.FC<StatusBarProps> = ({ className, full = true }) => {
  const { stats, progress } = useGameStore()

  const items = [
    {
      key: 'followers',
      label: '粉丝',
      value: formatCompactNumber(stats.followers),
      icon: Users,
      color: 'text-primary',
    },
    {
      key: 'mood',
      label: '心情',
      value: `${stats.mood}`,
      icon: Heart,
      color: 'text-semantic-danger',
    },
    {
      key: 'trust',
      label: '信任',
      value: `${stats.trust}`,
      icon: Star,
      color: 'text-semantic-warning',
    },
  ] as const

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: motionTokens.duration.medium, ease: motionTokens.easing.easeOut }}
      className={cn(
        'flex w-full items-center justify-between gap-2 border-b border-gray-200/30 bg-white/40 px-4 py-2 backdrop-blur-md dark:border-gray-800/30 dark:bg-gray-950/40',
        className
      )}
    >
      {items.map(({ key, label, value, icon: Icon, color }) => (
        <div
          key={key}
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <Icon className={cn('h-3.5 w-3.5', color)} />
          <span className="text-gray-600 dark:text-gray-300">{label}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </span>
        </div>
      ))}
      {full && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Sparkles className="h-3 w-3" />
          <span>第 {progress.currentDay} 天</span>
        </div>
      )}
    </motion.div>
  )
}

export { StatusBar }
