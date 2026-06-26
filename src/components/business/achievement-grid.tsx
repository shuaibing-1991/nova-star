/**
 * 成就网格 + 筛选器
 *
 * - 顶部：完成度进度条
 * - 筛选 Tab：状态（全部/已解锁/未解锁/隐藏）+ 稀有度（全部/普通/稀有/史诗/传说）
 * - 网格：3 列展示
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AchievementCard } from './achievement-card'
import {
  ACHIEVEMENTS,
  type Achievement,
  type AchievementRarity,
} from '@/data/achievements'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn } from '@/lib/utils'

type FilterKey = 'all' | 'unlocked' | 'locked' | 'hidden'
type RarityFilter = 'all' | AchievementRarity

const STATUS_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unlocked', label: '已解锁' },
  { key: 'locked', label: '未解锁' },
  { key: 'hidden', label: '隐藏' },
]

const RARITY_TABS: { key: RarityFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'common', label: '普通' },
  { key: 'rare', label: '稀有' },
  { key: 'epic', label: '史诗' },
  { key: 'legendary', label: '传说' },
]

interface AchievementGridProps {
  unlockedIds: string[]
  onCardClick?: (ach: Achievement) => void
}

export function AchievementGrid({ unlockedIds, onCardClick }: AchievementGridProps) {
  const [filter, setFilter] = React.useState<FilterKey>('all')
  const [rarityFilter, setRarityFilter] = React.useState<RarityFilter>('all')

  const unlockedSet = React.useMemo(() => new Set(unlockedIds), [unlockedIds])

  const filtered = React.useMemo(() => {
    return ACHIEVEMENTS.filter((a) => {
      const isUnlocked = unlockedSet.has(a.id)
      // 状态筛选
      let passStatus = true
      switch (filter) {
        case 'all':
          passStatus = true
          break
        case 'unlocked':
          passStatus = isUnlocked
          break
        case 'locked':
          passStatus = !isUnlocked
          break
        case 'hidden':
          // 阶段 6 修复：隐藏 Tab 只显示"未解锁的隐藏成就"，
          // 已解锁的隐藏成就归入"已解锁" Tab，避免 Tab 内容重叠
          passStatus = a.hidden && !isUnlocked
          break
      }
      if (!passStatus) return false
      // 稀有度筛选
      if (rarityFilter !== 'all' && a.rarity !== rarityFilter) return false
      return true
    })
  }, [filter, rarityFilter, unlockedSet])

  const totalUnlocked = unlockedIds.length
  const total = ACHIEVEMENTS.length
  const percentage = total > 0 ? (totalUnlocked / total) * 100 : 0

  return (
    <div className="flex flex-col gap-3">
      {/* 顶部：完成度进度条 */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-pink-100 p-3 dark:from-amber-950/40 dark:to-pink-950/40">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-200">
            成就完成度
          </span>
          <span className="font-mono text-gray-600 dark:text-gray-300">
            {totalUnlocked} / {total}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-gray-800/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.easeOut }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500"
          />
        </div>
        {percentage >= 100 ? (
          <div className="mt-2 text-center text-xs font-medium text-amber-700 dark:text-amber-300">
            🌟 全部成就达成！🌟
          </div>
        ) : totalUnlocked === 0 ? (
          // 阶段 6 修复：0% 状态加引导文案，避免新玩家挫败
          <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            继续游戏，解锁更多成就 ✨
          </div>
        ) : null}
      </div>

      {/* 状态筛选 Tab */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              filter === tab.key
                ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 稀有度筛选 Tab */}
      <div className="flex gap-1 rounded-xl bg-gray-50 p-1 dark:bg-gray-900">
        {RARITY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRarityFilter(tab.key)}
            className={cn(
              'flex-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-all',
              rarityFilter === tab.key
                ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 网格 */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((ach, i) => (
          <AchievementCard
            key={ach.id}
            achievement={ach}
            unlocked={unlockedSet.has(ach.id)}
            index={i}
            onClick={() => onCardClick?.(ach)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          这个分类下还没有成就
        </div>
      )}
    </div>
  )
}
