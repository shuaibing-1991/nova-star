/**
 * 成就详情弹层
 *
 * - 点击成就卡时弹出
 * - 显示：名称、描述、稀有度、奖励（如有）、解锁状态
 * - 隐藏成就未解锁时只显示"?" + 提示文字
 */
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Star, Crown, Trophy, Heart, Flag, Eye, Lock } from 'lucide-react'
import type { Achievement } from '@/data/achievements'
import { cn } from '@/lib/utils'

interface AchievementDetailModalProps {
  achievement: Achievement | null
  unlocked: boolean
  onClose: () => void
}

const RARITY_LABELS = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
} as const

export function AchievementDetailModal({
  achievement,
  unlocked,
  onClose,
}: AchievementDetailModalProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>

            {achievement.hidden && !unlocked ? (
              <HiddenView />
            ) : (
              <UnlockedView achievement={achievement} unlocked={unlocked} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function UnlockedView({
  achievement,
  unlocked,
}: {
  achievement: Achievement
  unlocked: boolean
}) {
  return (
    <div className="p-6">
      {/* 图标 */}
      <div
        className={cn(
          'mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg',
          unlocked
            ? 'bg-gradient-to-br from-amber-100 to-pink-100 dark:from-amber-900/40 dark:to-pink-900/40'
            : 'bg-gray-100 dark:bg-gray-800'
        )}
      >
        {achievement.icon === 'star' && <Star className="h-10 w-10" />}
        {achievement.icon === 'crown' && <Crown className="h-10 w-10" />}
        {achievement.icon === 'trophy' && <Trophy className="h-10 w-10" />}
        {achievement.icon === 'heart' && <Heart className="h-10 w-10" />}
        {achievement.icon === 'flag' && <Flag className="h-10 w-10" />}
        {achievement.icon === 'eye' && <Eye className="h-10 w-10" />}
        {!['star', 'crown', 'trophy', 'heart', 'flag', 'eye'].includes(achievement.icon) && (
          <Sparkles className="h-10 w-10" />
        )}
      </div>

      {/* 名称 + 稀有度 */}
      <div className="mt-4 text-center">
        <div
          className={cn(
            'text-xl font-bold',
            unlocked
              ? 'text-gray-800 dark:text-gray-100'
              : 'text-gray-500'
          )}
        >
          {achievement.name}
        </div>
        <div
          className={cn(
            'mt-1 inline-block rounded-full px-2 py-0.5 text-xs',
            achievement.rarity === 'legendary' &&
              'bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-900',
            achievement.rarity === 'epic' &&
              'bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-100',
            achievement.rarity === 'rare' &&
              'bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-100',
            achievement.rarity === 'common' &&
              'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          )}
        >
          {RARITY_LABELS[achievement.rarity]}
        </div>
      </div>

      {/* 描述 */}
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
        {achievement.description}
      </div>

      {/* 奖励 */}
      {achievement.reward && unlocked && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-pink-50 p-3 text-center text-xs dark:from-amber-950/30 dark:to-pink-950/30">
          <div className="font-medium text-amber-700 dark:text-amber-300">
            🎁 奖励：{achievement.reward.stat} +{achievement.reward.value}
          </div>
        </div>
      )}

      {/* 状态 */}
      <div
        className={cn(
          'mt-4 text-center text-xs',
          unlocked
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-400'
        )}
      >
        {unlocked ? '✓ 已解锁' : '○ 未解锁'}
      </div>
    </div>
  )
}

function HiddenView() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <Lock className="h-10 w-10 text-gray-400" />
      </div>
      <div className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
        隐藏成就
      </div>
      <div className="mt-2 text-sm text-gray-500">
        继续探索，解锁后才会显示详情
      </div>
    </div>
  )
}
