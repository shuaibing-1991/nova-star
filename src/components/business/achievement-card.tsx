/**
 * 成就卡组件
 *
 * 显示单个成就：
 * - 已解锁：彩色图标 + 真实名称 + 描述
 * - 未解锁（非隐藏）：灰度图标 + 真实名称 + 描述
 * - 未解锁（隐藏）：纯黑"?"占位（防剧透）
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Star, Crown, Trophy, Heart, Flag, Eye, Lock } from 'lucide-react'
import type { Achievement, AchievementRarity } from '@/data/achievements'
import { useMotionEnabled } from '@/hooks/use-preferences'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn } from '@/lib/utils'

/** 稀有度视觉映射 */
const RARITY_STYLES: Record<AchievementRarity, {
  ring: string
  bg: string
  badge: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  common: {
    ring: 'ring-gray-300 dark:ring-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-900/40',
    badge: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    label: '普通',
    icon: Flag,
  },
  rare: {
    ring: 'ring-blue-300 dark:ring-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    badge: 'bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-100',
    label: '稀有',
    icon: Star,
  },
  epic: {
    ring: 'ring-purple-300 dark:ring-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    badge: 'bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-100',
    label: '史诗',
    icon: Trophy,
  },
  legendary: {
    ring: 'ring-amber-300 dark:ring-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-900',
    label: '传说',
    icon: Crown,
  },
}

/** 解锁动画 */
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * motionTokens.stagger.tight, duration: motionTokens.duration.normal },
  }),
}

interface AchievementCardProps {
  achievement: Achievement
  unlocked: boolean
  index?: number
  onClick?: () => void
}

export function AchievementCard({
  achievement,
  unlocked,
  index = 0,
  onClick,
}: AchievementCardProps) {
  const style = RARITY_STYLES[achievement.rarity]
  const isHidden = achievement.hidden && !unlocked
  // 阶段 7 Round 1 修复：用户关闭动效时跳过入场动画
  const motionEnabled = useMotionEnabled()

  // 隐藏成就未解锁：只显示"?"
  if (isHidden) {
    return (
      <motion.button
        custom={index}
        initial={motionEnabled ? 'hidden' : false}
        animate="visible"
        variants={cardVariants}
        onClick={onClick}
        className={cn(
          'group relative aspect-square w-full overflow-hidden rounded-2xl ring-2 ring-gray-200 dark:ring-gray-700',
          'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
          'flex items-center justify-center'
        )}
        aria-label="隐藏成就"
      >
        <Lock className="h-12 w-12 text-gray-400" />
        <div className="absolute bottom-1 left-1 right-1 text-center text-xs text-gray-500">
          隐藏
        </div>
      </motion.button>
    )
  }

  return (
    <motion.button
      custom={index}
      initial={motionEnabled ? 'hidden' : false}
      animate="visible"
      variants={cardVariants}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl p-3 text-left ring-2 transition-all',
        style.ring,
        style.bg,
        unlocked
          ? 'shadow-sm hover:shadow-md'
          : 'opacity-60 grayscale',
        'active:scale-[0.97]'
      )}
    >
      {/* 顶部：图标 + 稀有度 */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
            unlocked ? 'bg-white/80 dark:bg-black/30' : 'bg-white/40'
          )}
        >
          {achievement.icon === 'star' && <Star className="h-6 w-6" />}
          {achievement.icon === 'crown' && <Crown className="h-6 w-6" />}
          {achievement.icon === 'trophy' && <Trophy className="h-6 w-6" />}
          {achievement.icon === 'heart' && <Heart className="h-6 w-6" />}
          {achievement.icon === 'flag' && <Flag className="h-6 w-6" />}
          {achievement.icon === 'eye' && <Eye className="h-6 w-6" />}
          {!['star', 'crown', 'trophy', 'heart', 'flag', 'eye'].includes(achievement.icon) && (
            <Sparkles className="h-6 w-6" />
          )}
        </div>
        <div
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
            style.badge
          )}
        >
          {style.label}
        </div>
      </div>

      {/* 中部：标题 + 描述 */}
      <div className="mt-2">
        <div
          className={cn(
            'truncate text-sm font-semibold',
            unlocked
              ? 'text-gray-800 dark:text-gray-100'
              : 'text-gray-500'
          )}
        >
          {achievement.name}
        </div>
        <div
          className={cn(
            'mt-0.5 line-clamp-2 text-xs leading-tight',
            unlocked
              ? 'text-gray-600 dark:text-gray-300'
              : 'text-gray-400'
          )}
        >
          {achievement.description}
        </div>
      </div>

      {/* 已解锁标识（角落小光点） */}
      {unlocked && (
        <div className="absolute right-2 top-2 flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </div>
      )}
    </motion.button>
  )
}
