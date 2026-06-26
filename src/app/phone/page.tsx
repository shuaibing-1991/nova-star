/**
 * 工作手机主界面（PRD 6.4 + 02-7页设计稿#页面3）
 *
 * 布局：
 * - 顶部：状态栏（真实时间）
 * - 状态卡：粉丝数 + 当前心情
 * - Day 任务卡（带红点）
 * - 任务卡：微博 / 行程 / 数据 / 微信
 * - App Dock：微信/微博/抖音/Bubble/Instagram
 * - 底部 Home 键
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Newspaper,
  Music,
  Heart,
  Camera,
  Bell,
  Calendar,
  TrendingUp,
  Home,
  Award,
  Trophy,
  Settings,
} from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { KeyStat } from '@/components/business/key-stat'
import { useGameStore } from '@/stores/game'
import { useUIStore } from '@/stores/ui'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn, formatNumber } from '@/lib/utils'

const APPS = [
  {
    id: 'wechat',
    name: '微信',
    icon: MessageCircle,
    color: 'bg-green-100 text-green-600',
    href: '/phone/chat',
  },
  {
    id: 'weibo',
    name: '微博',
    icon: Newspaper,
    color: 'bg-orange-100 text-orange-600',
    href: '/phone/weibo',
    badge: 1,
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: Music,
    color: 'bg-black text-white',
    href: '/phone/douyin',
    disabled: true,
  },
  {
    id: 'bubble',
    name: 'Bubble',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    href: '/phone/bubble',
    disabled: true,
  },
  {
    id: 'instagram',
    name: 'Ins',
    icon: Camera,
    color: 'bg-purple-100 text-purple-600',
    href: '/phone/instagram',
    disabled: true,
  },
] as const

const TASKS = [
  {
    id: 'weibo',
    icon: '🚨',
    title: '微博',
    subtitle: '有待处理事件！',
    desc: '点击进入立即处理',
    href: '/phone/weibo',
    urgent: true,
  },
  {
    id: 'schedule',
    icon: '📅',
    title: '行程',
    subtitle: '安排训练/通告',
    desc: '体力 100，够的话安排一轮',
    href: '/phone/schedule',
  },
  {
    id: 'data',
    icon: '📊',
    title: '数据',
    subtitle: '查看数据建议',
    desc: '了解当前粉丝构成和策略',
    href: '/phone/data',
  },
  {
    id: 'wechat',
    icon: '💬',
    title: '微信',
    subtitle: '联系经纪人',
    desc: '有问题随时和思恩沟通',
    href: '/phone/chat',
    badge: 1,
  },
  {
    id: 'achievements',
    icon: '🏆',
    title: '成就墙',
    subtitle: '看看你解锁了什么',
    desc: '收集 39 个成就',
    href: '/phone/achievements',
  },
] as const

const DAY_NAMES = [
  '',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '二十一',
  '二十二',
  '二十三',
  '二十四',
  '二十五',
  '二十六',
  '二十七',
  '二十八',
  '二十九',
  '三十',
]

export default function PhoneHomePage() {
  const router = useRouter()
  const stats = useGameStore((s) => s.stats)
  const energy = useGameStore((s) => s.energy)
  const progress = useGameStore((s) => s.progress)
  const artist = useGameStore((s) => s.artist)
  const setScenePhase = useUIStore((s) => s.setScenePhase)

  // 路由守卫：未完成 onboarding 跳回
  React.useEffect(() => {
    if (!artist.name || artist.name.length < 2) {
      router.replace('/onboarding')
      return
    }
    setScenePhase('idle')
  }, [artist.name, router, setScenePhase])

  if (!artist.name || artist.name.length < 2) {
    return (
      <PhoneShell background="gradient">
        <div className="flex h-full items-center justify-center text-gray-500">
          正在跳转...
        </div>
      </PhoneShell>
    )
  }

  const dayLabel = `DAY ${progress.currentDay}`
  const daysToShowcase = Math.max(0, 30 - progress.currentDay)

  return (
    <PhoneShell background="gradient" className="flex flex-col">
      <StatusBar full />

      {/* 阶段 7 Round 5 修复：设置入口齿轮（右上角） */}
      <div className="flex justify-end px-4 pt-1">
        <Link
          href="/phone/settings"
          aria-label="设置"
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/40 dark:text-gray-200"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* 状态卡：粉丝数 + 心情 */}
        <section className="grid grid-cols-2 gap-3 px-4 pt-4">
          <StatCard
            label="总粉丝数"
            value={formatNumber(stats.followers)}
            sublabel="较昨日 +0"
            tone="pink"
          />
          <StatCard
            label="当前心情"
            value={`${stats.mood}/100`}
            sublabel={getMoodLabel(stats.mood)}
            tone="blue"
            progress={(stats.mood / 100) * 100}
          />
        </section>

        {/* Day 任务卡 */}
        <section className="px-4 pt-4">
          <div className="rounded-xl bg-gradient-to-r from-pink-100 to-blue-100 px-4 py-3 dark:from-pink-950/40 dark:to-blue-950/40">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {dayLabel} · 距出道 Showcase {daysToShowcase} 天
            </div>
            <div className="mt-1 text-lg font-bold text-gray-800 dark:text-gray-100">
              {DAY_NAMES[progress.currentDay] ?? ''} · 继续你的旅程
            </div>
          </div>
        </section>

        {/* 任务卡列表 */}
        <section className="px-4 pt-4">
          <div className="space-y-2">
            {TASKS.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        {/* 数值快照（阶段 4 新增） */}
        <section className="px-4 pt-4">
          <div className="rounded-xl bg-white/60 p-3 backdrop-blur-sm dark:bg-gray-900/40">
            <div className="mb-2 text-xs font-medium text-gray-500">今日状态</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <KeyStat
                inline
                label="体力"
                value={energy}
                color="text-yellow-500"
                progress={energy / 100}
              />
              <KeyStat
                inline
                label="心情"
                value={stats.mood}
                color="text-pink-500"
                progress={stats.mood / 100}
              />
              <KeyStat
                inline
                label="信任"
                value={stats.trust}
                color="text-orange-500"
                progress={stats.trust / 100}
              />
            </div>
          </div>
        </section>

        {/* 更多 */}
        <section className="px-4 pt-4">
          <button className="w-full rounded-xl bg-white/60 px-4 py-3 text-sm text-gray-500 backdrop-blur-sm dark:bg-gray-900/40">
            更多功能即将上线 ↓
          </button>
        </section>

        {/* App Dock */}
        <section className="px-4 pt-6 pb-4">
          <div className="grid grid-cols-5 gap-2">
            {APPS.map((app) => (
              <AppIcon key={app.id} app={app} />
            ))}
          </div>
        </section>
      </main>

      {/* Home 键 */}
      <button
        onClick={() => router.push('/play')}
        className="mx-auto mb-2 flex h-10 w-32 items-center justify-center rounded-full bg-gradient-to-b from-gray-200 to-gray-300 text-xs text-gray-600 shadow-inner dark:from-gray-700 dark:to-gray-800 dark:text-gray-300"
        aria-label="回到游戏"
      >
        <Home className="mr-1 h-3 w-3" />
        回到剧情
      </button>
    </PhoneShell>
  )
}

/* ============================================================
 * 状态卡
 * ========================================================== */
function StatCard({
  label,
  value,
  sublabel,
  tone,
  progress,
}: {
  label: string
  value: string
  sublabel: string
  tone: 'pink' | 'blue'
  progress?: number
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-3 shadow-sm backdrop-blur-sm',
        tone === 'pink'
          ? 'bg-pink-50/90 dark:bg-pink-950/30'
          : 'bg-blue-50/90 dark:bg-blue-950/30'
      )}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 font-serif text-2xl font-black text-gray-800 dark:text-gray-100">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-gray-500">{sublabel}</div>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-gray-800/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: motionTokens.duration.slower, ease: motionTokens.easing.easeOut }}
            className={cn(
              'h-full rounded-full',
              tone === 'pink'
                ? 'bg-gradient-to-r from-pink-400 to-pink-500'
                : 'bg-gradient-to-r from-green-400 via-yellow-400 to-red-400'
            )}
          />
        </div>
      )}
    </div>
  )
}

/* ============================================================
 * 任务卡
 * ========================================================== */
function TaskCard({
  task,
}: {
  task: {
    id: string
    icon: string
    title: string
    subtitle: string
    desc: string
    href: string
    urgent?: boolean
    badge?: number
  }
}) {
  return (
    <Link
      href={task.href}
      className={cn(
        'flex items-center gap-3 rounded-xl border-l-4 bg-white/80 p-3 backdrop-blur-sm transition-all active:scale-[0.98] dark:bg-gray-900/70',
        task.urgent
          ? 'border-red-400'
          : task.id === 'wechat'
            ? 'border-green-400'
            : 'border-blue-400'
      )}
    >
      <div className="text-2xl">{task.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 dark:text-gray-100">
            {task.title}
          </span>
          {task.urgent && (
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
          {task.badge && !task.urgent && (
            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {task.badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-sm text-gray-700 dark:text-gray-300">
          {task.subtitle}
        </div>
        <div className="mt-0.5 truncate text-xs text-gray-500">{task.desc}</div>
      </div>
    </Link>
  )
}

/* ============================================================
 * App 图标
 * ========================================================== */
function AppIcon({
  app,
}: {
  app: {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    href: string
    badge?: number
    disabled?: boolean
  }
}) {
  const Icon = app.icon

  // 阶段 7 Round 5 修复：disabled 的 app 改为"敬请期待"提示而非哑按钮
  // - 之前是 opacity-40 + cursor-not-allowed：用户以为能点
  // - 现在显示一个 tooltip 风格的"敬请期待"，更清晰
  if (app.disabled) {
    return (
      <div
        role="img"
        aria-label={`${app.name} 即将上线`}
        title={`${app.name}：敬请期待`}
        className="flex flex-col items-center gap-1"
      >
        <div
          className={cn(
            'relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl shadow-sm opacity-50 grayscale',
            app.color
          )}
        >
          <Icon className="h-7 w-7" />
          {/* "敬请期待" 角标 */}
          <span className="absolute -right-1 -top-1 inline-flex h-4 items-center justify-center rounded-full bg-gray-600 px-1.5 text-[9px] font-bold text-white">
            Soon
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{app.name}</span>
      </div>
    )
  }

  return (
    <Link
      href={app.href}
      aria-label={app.name}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={cn(
          'relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl shadow-sm',
          app.color
        )}
      >
        <Icon className="h-7 w-7" />
        {app.badge && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {app.badge}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-700 dark:text-gray-300">{app.name}</span>
    </Link>
  )
}

/* ============================================================
 * 工具
 * ========================================================== */
function getMoodLabel(mood: number): string {
  if (mood >= 80) return '心情大好'
  if (mood >= 60) return '状态不错'
  if (mood >= 40) return '有点疲惫'
  if (mood >= 20) return '状态低迷'
  return '需要休息'
}

/* ============================================================
 * 数值快照 - 已抽取到 components/business/key-stat.tsx
 * ========================================================== */