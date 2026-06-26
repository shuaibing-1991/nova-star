/**
 * 成就墙独立页面
 * 路由：/phone/achievements
 *
 * PRD 6.13 模块 13：成就系统
 * 阶段 6 落地：
 * - 22+ 成就卡片网格
 * - 4 种稀有度徽章
 * - 隐藏成就"?"占位
 * - 稀有度筛选 Tab
 * - 完成度进度条
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { AchievementGrid } from '@/components/business/achievement-grid'
import { AchievementDetailModal } from '@/components/business/achievement-unlock-modal'
import { useGameStore } from '@/stores/game'
import type { Achievement } from '@/data/achievements'

export default function AchievementsPage() {
  const router = useRouter()
  const achievements = useGameStore((s) => s.achievements)
  const artist = useGameStore((s) => s.artist)

  const [selected, setSelected] = React.useState<Achievement | null>(null)

  // 路由守卫
  React.useEffect(() => {
    if (!artist.name || artist.name.length < 2) {
      router.replace('/onboarding')
    }
  }, [artist.name, router])

  if (!artist.name || artist.name.length < 2) {
    return (
      <PhoneShell background="gradient">
        <div className="flex h-full items-center justify-center text-gray-500">
          正在跳转...
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell background="gradient" className="flex flex-col">
      <StatusBar full />

      {/* 顶部：返回 + 标题 */}
      <header className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all active:scale-95 dark:bg-gray-900/70"
          aria-label="返回"
        >
          <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-gray-200" />
        </button>
        <div>
          <div className="text-base font-bold text-gray-800 dark:text-gray-100">
            成就墙
          </div>
          <div className="text-xs text-gray-500">Achievement Wall</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        <AchievementGrid
          unlockedIds={achievements}
          onCardClick={(ach) => setSelected(ach)}
        />
      </main>

      <AchievementDetailModal
        achievement={selected}
        unlocked={selected ? achievements.includes(selected.id) : false}
        onClose={() => setSelected(null)}
      />
    </PhoneShell>
  )
}
