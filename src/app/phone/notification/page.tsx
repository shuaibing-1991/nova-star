/**
 * 通知中心（PRD 6.4 + 02-7页设计稿#页面6）
 *
 * 通知类型：
 * - 今日剧情（红点未读）
 * - 昨日回顾（已读）
 * - 待处理（置顶 + 快捷入口）
 * - 风险提醒（红色边条）
 * - 存档提醒（蓝色边条）
 * - 动态通知（剧情事件 / 成就解锁 / 风险预警）
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, ChevronDown } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { useGameStore, defaultStats } from '@/stores/game'
import {
  generateNotifications,
  mergeNotifications,
} from '@/lib/notification-generator'
import { toast } from '@/components/ui/toast'
import { haptic } from '@/hooks/use-haptic'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  type:
    | 'today'
    | 'history'
    | 'todo'
    | 'warning'
    | 'save'
    | 'story_event'
    | 'achievement'
    | 'risk'
    | 'milestone'
  icon: string
  title: string
  time: string
  content: string
  pinned?: boolean
  unread?: boolean
  quickLinks?: Array<{ icon: string; label: string; href: string }>
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'today',
    icon: '🔔',
    title: '今日剧情',
    time: '刚刚',
    content:
      'NOVA STUDIO 已经为你开通了艺人工作手机。今天先由经纪人韩知恩确认第一条对外动态。',
    unread: true,
  },
  {
    id: 'n2',
    type: 'history',
    icon: '📅',
    title: '昨日回顾',
    time: '1 天前',
    content: '你刚签约 NOVA STUDIO，已建立公开艺人档案。',
  },
  {
    id: 'n3',
    type: 'todo',
    icon: '📌',
    title: '待处理',
    time: '置顶',
    content:
      '查看微信经纪人消息；准备微博首条动态；开通 Bubble 群聊。',
    pinned: true,
    quickLinks: [
      { icon: '💬', label: '微信', href: '/phone/chat' },
      { icon: '📰', label: '微博', href: '/phone/weibo' },
    ],
  },
  {
    id: 'n4',
    type: 'warning',
    icon: '⚠️',
    title: '风险提醒',
    time: '系统警告',
    content:
      '公开资料会影响第一批粉丝画像，不要让人设、路线和营业方式互相打架。',
  },
  {
    id: 'n5',
    type: 'save',
    icon: '💾',
    title: '存档提醒',
    time: '每天',
    content: '稍后处理，建议每天固定时间存档。',
  },
]

export default function NotificationPage() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const progress = useGameStore((s) => s.progress)
  const stats = useGameStore((s) => s.stats)
  const relationships = useGameStore((s) => s.relationships)
  const achievements = useGameStore((s) => s.achievements)
  const lastReadAt = useGameStore((s) => s.notificationLastReadAt)
  const markRead = useGameStore((s) => s.markNotificationsRead)

  // 静态通知：只依赖 lastReadAt
  const staticItems = React.useMemo(() => {
    // 模拟每条静态通知的"创建时间"（越往下越旧）
    const itemTimes: Record<string, number> = {
      n1: Date.now() - 1000 * 60 * 5,
      n2: Date.now() - 1000 * 60 * 60 * 24,
      n3: Date.now() - 1000 * 60 * 60 * 23,
      n4: Date.now() - 1000 * 60 * 60 * 22,
      n5: Date.now() - 1000 * 60 * 60 * 21,
    }
    return NOTIFICATIONS.map((it) => ({
      ...it,
      unread: itemTimes[it.id] > lastReadAt,
    }))
  }, [lastReadAt])

  // 动态通知：分段计算，各自只依赖相关字段
  // 风险通知：仅依赖 mood 和 trust
  const riskItems = React.useMemo(
    () =>
      generateNotifications({
        stats: { ...stats, mood: stats.mood, trust: stats.trust } as typeof stats,
        progress: { currentDay: 0, currentScene: '', storyFlags: [] },
        relationships: {},
        achievements: [],
        notificationLastReadAt: lastReadAt,
      }).filter((n) => n.type === 'risk' || n.type === 'milestone'),
    [lastReadAt, stats.mood, stats.trust, stats.followers]
  )

  // 成就 + 剧情通知：依赖 achievements 和 storyFlags
  const eventItems = React.useMemo(
    () =>
      generateNotifications({
        stats: defaultStats,
        progress,
        relationships,
        achievements,
        notificationLastReadAt: lastReadAt,
      }).filter((n) => n.type === 'achievement' || n.type === 'story_event'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      lastReadAt,
      achievements.join('|'),
      progress.storyFlags.join('|'),
      progress.currentDay,
    ]
  )

  // 合并所有段
  const items = React.useMemo(
    () => mergeNotifications(staticItems, [...riskItems, ...eventItems]),
    [staticItems, riskItems, eventItems]
  )

  const hasUnread = items.some((it) => it.unread)

  const handleMarkAllRead = () => {
    if (!hasUnread) return
    const unreadCount = items.filter((it) => it.unread).length
    markRead()
    haptic.medium()
    toast.success(`已清空 ${unreadCount} 条未读`, '通知中心')
  }

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
    // 展开即视为已读，更新 lastReadAt
    const target = items.find((it) => it.id === id)
    if (target?.unread) {
      markRead()
      haptic.light()
    }
  }

  return (
    <PhoneShell background="solid" bgClassName="bg-[#F5F5F5]">
      <StatusBar full />

      {/* 顶部导航 */}
      <header
        aria-label="通知中心"
        className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
      >
        <Link
          href="/phone"
          aria-label="返回工作手机"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-gray-600"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 id="notification-heading" className="text-base font-medium text-gray-800">通知中心</h1>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={!hasUnread}
          aria-label={hasUnread ? '标记全部已读' : '没有未读通知'}
          className={cn(
            'text-xs transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:rounded',
            hasUnread ? 'text-blue-500' : 'cursor-not-allowed text-gray-400 opacity-50'
          )}
        >
          全部已读
        </button>
      </header>

      <main
        aria-labelledby="notification-heading"
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="space-y-2">
          {items.map((item, idx) => (
            <NotificationCard
              key={item.id}
              item={item as NotificationItem}
              expanded={expandedId === item.id}
              onToggle={() => handleToggle(item.id)}
              day={progress.currentDay}
              delay={Math.min(idx, 5) * 0.04}
            />
          ))}
        </div>
      </main>
    </PhoneShell>
  )
}

/* ============================================================
 * 通知卡
 * ========================================================== */
function NotificationCard({
  item,
  expanded,
  onToggle,
  day,
  delay,
}: {
  item: NotificationItem
  expanded: boolean
  onToggle: () => void
  day: number
  delay: number
}) {
  const typeStyles = getTypeStyles(item.type)
  const isDynamic = ['story_event', 'achievement', 'risk', 'milestone'].includes(item.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'overflow-hidden rounded-xl border-l-4 shadow-sm transition-all',
        typeStyles.bg,
        typeStyles.border,
        item.unread && getUnreadRing(item.type),
        item.pinned && 'ring-1 ring-yellow-300'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <span className={cn('font-medium', typeStyles.text)}>
              {item.title}
            </span>
            {item.pinned && (
              <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-xs text-yellow-900">
                置顶
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{item.time}</span>
            {item.unread && (
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { height: 'auto', opacity: 1 },
                collapsed: { height: 0, opacity: 0 },
              }}
              transition={{
                height: { duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] },
                opacity: { duration: 0.2, ease: 'easeOut' },
              }}
              className="overflow-hidden"
            >
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {item.content}
              </p>

              {item.quickLinks && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.quickLinks.map((link) => (
                    <Link
                      key={`${item.id}_${link.href}`}
                      href={link.href}
                      aria-label={isDynamic ? `查看通知详情：${item.title}` : `快速进入：${link.label}`}
                      className={cn(
                        'flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
                        isDynamic
                          ? 'border border-blue-500 bg-white text-blue-600'
                          : 'bg-blue-500 text-white'
                      )}
                    >
                      <span aria-hidden>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

function getTypeStyles(type: NotificationItem['type']) {
  switch (type) {
    case 'today':
      return { bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-800' }
    case 'history':
      return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600' }
    case 'todo':
      return { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-gray-800' }
    case 'warning':
      return { bg: 'bg-white', border: 'border-red-400', text: 'text-gray-800' }
    case 'save':
      return { bg: 'bg-white', border: 'border-blue-400', text: 'text-gray-800' }
    case 'story_event':
      return { bg: 'bg-blue-50/30', border: 'border-blue-300', text: 'text-blue-700' }
    case 'achievement':
      return { bg: 'bg-yellow-50/30', border: 'border-yellow-500', text: 'text-yellow-700' }
    case 'milestone':
      return { bg: 'bg-green-50/30', border: 'border-green-400', text: 'text-green-700' }
    case 'risk':
      return { bg: 'bg-red-50/30', border: 'border-red-500', text: 'text-red-700' }
  }
}

function getUnreadRing(type: NotificationItem['type']) {
  switch (type) {
    case 'risk':
      return 'ring-2 ring-red-200'
    case 'achievement':
      return 'ring-2 ring-yellow-200'
    case 'story_event':
      return 'ring-2 ring-blue-200'
    case 'milestone':
      return 'ring-2 ring-green-200'
    case 'warning':
      return 'ring-2 ring-red-100'
    default:
      return 'ring-2 ring-red-100'
  }
}