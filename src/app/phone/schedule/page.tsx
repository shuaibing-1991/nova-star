/**
 * 日程安排页（PRD 6.5 + 02-7页设计稿 扩展）
 *
 * 用户每天可选择 1-2 个活动（半天制）：
 * - 训练：声乐 / 舞蹈 / 舞台 / 体能
 * - 通告：拍摄 / 采访 / 见面
 * - 休息：早睡 / 娱乐
 *
 * 流程：
 * 1. 用户点击活动卡
 * 2. 检查前置条件（体力 / 心情 / 信任）
 * 3. 通过 → 应用效果 + 写日志
 * 4. 失败 → toast 提示
 * 5. 「完成今天」 → 每日结算弹层
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Check, AlertCircle, Home } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { PhoneHeader } from '@/components/business/phone-header'
import { SectionCard } from '@/components/business/section-card'
import { StatusBar } from '@/components/business/status-bar'
import { ActivityCard } from '@/components/business/activity-card'
import { DaySummaryDialog } from '@/components/business/day-summary-dialog'
import { useGameStore, MAX_ENERGY } from '@/stores/game'
import {
  CATEGORY_META,
  getActivitiesByCategory,
} from '@/lib/activity-catalog'
import {
  canPerformActivity,
  performActivity,
  STAT_LABEL,
} from '@/lib/activity-engine'
import { checkActivityTriggers } from '@/lib/story-engine'
import { useSettingsStore } from '@/stores/settings'
import { toast } from '@/components/ui/toast'
import { haptic } from '@/hooks/use-haptic'
import { cn } from '@/lib/utils'

const ACTIVITY_COOLDOWN_MS = 500

export default function SchedulePage() {
  const router = useRouter()
  const stats = useGameStore((s) => s.stats)
  const energy = useGameStore((s) => s.energy)
  const setEnergy = useGameStore((s) => s.setEnergy)
  const modifyStats = useGameStore((s) => s.modifyStats)
  const addFlag = useGameStore((s) => s.addFlag)
  const logActivity = useGameStore((s) => s.logActivity)
  const dayActivities = useGameStore((s) => s.dayActivities)
  const progress = useGameStore((s) => s.progress)

  const [showSummary, setShowSummary] = React.useState(false)
  const [cooldownId, setCooldownId] = React.useState<string | null>(null)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  // 冷却结束后清理（避免长期占用）
  React.useEffect(() => {
    if (!cooldownId) return
    const t = setTimeout(() => setCooldownId(null), ACTIVITY_COOLDOWN_MS)
    return () => clearTimeout(t)
  }, [cooldownId])

  const grouped = React.useMemo(() => getActivitiesByCategory(), [])
  const todayLogs = React.useMemo(
    () => dayActivities.filter((a) => a.dayNumber === progress.currentDay),
    [dayActivities, progress.currentDay]
  )

  const handleActivityClick = React.useCallback(
    (activityId: string) => {
      // M1: 短时冷却，防止快速重复点击（避免体力瞬间归零）
      if (cooldownId) return
      const result = performActivity(activityId, { stats, energy })
      if (!result) {
        toast.error('活动不存在')
        return
      }
      if (!result.success) {
        // M2: 失败反馈用 medium 触觉 + warning toast
        haptic.medium()
        toast.warning(result.reason ?? '无法执行该活动')
        return
      }

      // M2: 按活动类别区分触觉强度
      //   appearance/rest → medium（关键选择）
      //   training → light（日常操作）
      if (result.activity.category === 'training') {
        haptic.light()
      } else {
        haptic.medium()
      }

      // 合并一次 modifyStats（包含 followers 等所有 effects）
      modifyStats(result.activity.effects as any)

      // 体力变化（clamp 在 setEnergy 内部）
      setEnergy(energy + result.activity.energyDelta)

      // 写风险 flag
      if (result.activity.riskFlag) {
        addFlag(result.activity.riskFlag)
      }

      // 写日志
      logActivity({
        activityId: result.activity.id,
        category: result.activity.category,
        changes: result.changes.map((c) => ({
          key: c.key,
          delta: c.delta,
        })),
      })

      // 反馈：使用中文标签（H2 修复）
      const changeDesc = result.changes
        .map((c) => {
          const sign = c.delta > 0 ? '+' : ''
          const label = STAT_LABEL[c.key] ?? c.key
          return `${label} ${sign}${c.delta}`
        })
        .join(' · ')
      toast.success(changeDesc, result.activity.name)

      // 启动短时冷却（仅记录最后一次点击的 id，避免任何活动重复触发）
      setCooldownId(activityId)

      // 阶段 5：检查剧情触发（活动 → 剧情分支）
      const unlockedScenes = checkActivityTriggers(activityId)
      if (unlockedScenes.length > 0) {
        toast.info(
          `解锁了 ${unlockedScenes.length} 段新剧情`,
          '回到主界面查看'
        )
      }
    },
    [stats, energy, modifyStats, setEnergy, addFlag, logActivity, cooldownId]
  )

  return (
    <PhoneShell background="solid" bgClassName="bg-[#F5F5F5]">
      <StatusBar full />

      <PhoneHeader
        title="安排日程"
        titleId="schedule-heading"
        rightSlot={
          <button
            type="button"
            onClick={() => router.push('/play')}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
            aria-label="回到剧情"
          >
            <Home className="h-5 w-5" />
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto" aria-labelledby="schedule-heading">
        {/* 体力状态卡 */}
        <section className="px-4 pt-4">
          <h2 className="sr-only">Day {progress.currentDay} 体力与状态</h2>
          <SectionCard className="p-0">
            <EnergyBar energy={energy} todayCount={todayLogs.length} />
          </SectionCard>
        </section>

        {/* 活动分组 */}
        <div className="space-y-6 px-4 py-4">
          {(Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) => {
            const meta = CATEGORY_META[cat]
            const items = grouped[cat]
            return (
              <section key={cat} aria-label={meta.label}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">{meta.icon}</span>
                  <h2 className={cn('text-base font-semibold', meta.color)}>
                    {meta.label}
                  </h2>
                  <span className="text-xs text-gray-500">· {meta.desc}</span>
                </div>
                <div className="space-y-2">
                  {items.map((activity) => {
                    const check = canPerformActivity(activity, { stats, energy })
                    const inCooldown = cooldownId !== null
                    return (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        disabled={!check.ok || inCooldown}
                        disabledReason={
                          !check.ok
                            ? check.reason
                            : inCooldown
                              ? '冷却中…'
                              : undefined
                        }
                        onClick={() => handleActivityClick(activity.id)}
                        reducedMotion={reducedMotion}
                        highlighted={cooldownId === activity.id}
                      />
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      {/* 底部：完成今天 */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => {
            haptic.medium()
            setShowSummary(true)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-medium text-white transition-transform active:scale-95"
        >
          <Check className="h-4 w-4" />
          完成今天
          {todayLogs.length > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              今日 {todayLogs.length} 项
            </span>
          )}
        </button>
      </div>

      {/* 每日结算弹层 */}
      <DaySummaryDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        dayNumber={progress.currentDay}
        logs={todayLogs}
        onEnterNextDay={() => {
          setShowSummary(false)
          router.push('/phone')
        }}
        onStayToday={() => {
          setShowSummary(false)
        }}
      />
    </PhoneShell>
  )
}

/* ============================================================
 * 体力状态卡
 * ========================================================== */
function EnergyBar({
  energy,
  todayCount,
}: {
  energy: number
  todayCount: number
}) {
  const percent = (energy / MAX_ENERGY) * 100
  const color =
    percent < 30
      ? 'from-red-400 to-red-500'
      : percent < 60
        ? 'from-yellow-400 to-orange-400'
        : 'from-green-400 to-green-500'

  // M4: 估算还可安排的活动数（按平均 20 体力/活动）
  const ENERGY_PER_ACTIVITY = 20
  const remainingActivities = Math.floor(energy / ENERGY_PER_ACTIVITY)

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">体力</span>
        </div>
        <span className="text-2xl font-black text-gray-800">
          {energy}
          <span className="text-sm text-gray-400">/{MAX_ENERGY}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6 }}
          className={cn('h-full bg-gradient-to-r', color)}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>今日已完成 {todayCount} 项 · 还可安排约 {remainingActivities} 项</span>
        {percent < 30 && (
          <span className="flex items-center gap-1 text-red-500">
            <AlertCircle className="h-3 w-3" />
            体力过低，建议休息
          </span>
        )}
      </div>
    </div>
  )
}
