/**
 * 动态通知生成器
 *
 * 基于 store 状态（剧情进度 + 成就 + 数值）生成通知
 *
 * 阶段 5 集成：
 * - 剧情事件（解锁的 scene）
 * - 成就解锁
 * - 风险预警（mood < 30）
 */
import type { Stats, NPCRelationship, Progress } from '@/types'
import { ACHIEVEMENTS, getAchievement } from '@/data/achievements'

export interface DynamicNotification {
  id: string
  type: 'story_event' | 'achievement' | 'risk' | 'milestone'
  icon: string
  title: string
  content: string
  timestamp: number
  /** 是否未读（基于 notificationLastReadAt） */
  unread: boolean
  /** 关联链接（可选） */
  href?: string
  /** 关联的 flag（用于"已完成"检查） */
  flag?: string
}

export interface NotificationContext {
  stats: Stats
  progress: Progress
  relationships: Record<string, NPCRelationship>
  achievements: string[]
  notificationLastReadAt: number
}

/**
 * 生成通知列表
 *
 * 优先级（按 timestamp 倒序）：
 * 1. 风险预警（mood 极低 / trust 危险）
 * 2. 成就解锁
 * 3. 剧情事件（解锁的 scene）
 * 4. 数值里程碑（粉丝/能力）
 */
export function generateNotifications(
  ctx: NotificationContext
): DynamicNotification[] {
  const notifications: DynamicNotification[] = []
  const now = Date.now()

  // 1. 风险预警（最高优先级，置顶）
  if (ctx.stats.mood < 25) {
    notifications.push({
      id: 'risk_low_mood',
      type: 'risk',
      icon: '😰',
      title: '心情过低',
      content: `你的心情只有 ${ctx.stats.mood}/100，建议立即休息或与信任的人聊聊。`,
      timestamp: now,
      unread: now > ctx.notificationLastReadAt,
      href: '/phone/schedule',
      flag: 'risk_warned_low_mood',
    })
  }
  if (ctx.stats.trust < 30) {
    notifications.push({
      id: 'risk_low_trust',
      type: 'risk',
      icon: '⚠️',
      title: '公司信任告急',
      content: `公司信任值 ${ctx.stats.trust}/30，可能影响通告分配。`,
      timestamp: now,
      unread: now > ctx.notificationLastReadAt,
      href: '/phone/schedule',
    })
  }

  // 2. 成就解锁（基于 achievements 数组）
  ctx.achievements
    .slice(-5) // 最近 5 个
    .forEach((id, idx) => {
      const achievement = getAchievement(id)
      if (!achievement) return
      notifications.push({
        id: `achievement_${id}`,
        type: 'achievement',
        icon: getRarityEmoji(achievement.rarity),
        title: `解锁成就：${achievement.name}`,
        content: achievement.description,
        timestamp: now - (5 - idx) * 60000,
        unread: now - (5 - idx) * 60000 > ctx.notificationLastReadAt,
        flag: `achievement:${id}`,
      })
    })

  // 3. 剧情事件（解锁但未完成的 scene）
  const flags = ctx.progress.storyFlags
  const unlockedScenes = flags
    .filter((f) => f.startsWith('unlocked:'))
    .map((f) => f.replace('unlocked:', ''))

  unlockedScenes.slice(-3).forEach((sceneId) => {
    if (flags.includes(`completed:${sceneId}`)) return
    notifications.push({
      id: `scene_${sceneId}`,
      type: 'story_event',
      icon: '🎬',
      title: '新剧情待解锁',
      content: '点击回到剧情页查看新解锁的剧情分支',
      timestamp: now - 300000,
      unread: now - 300000 > ctx.notificationLastReadAt,
      href: '/play',
      flag: `unlocked:${sceneId}`,
    })
  })

  // 4. 数值里程碑
  if (ctx.stats.followers >= 1000) {
    notifications.push({
      id: 'milestone_1k_fans',
      type: 'milestone',
      icon: '⭐',
      title: '粉丝突破 1,000',
      content: '你的努力开始被更多人看到',
      timestamp: now - 600000,
      unread: now - 600000 > ctx.notificationLastReadAt,
    })
  }
  if (ctx.stats.followers >= 10000) {
    notifications.push({
      id: 'milestone_10k_fans',
      type: 'milestone',
      icon: '🌟',
      title: '粉丝突破 10,000',
      content: '你已成为冉冉新星！',
      timestamp: now - 700000,
      unread: now - 700000 > ctx.notificationLastReadAt,
    })
  }

  return notifications.sort((a, b) => b.timestamp - a.timestamp)
}

function getRarityEmoji(rarity: string): string {
  switch (rarity) {
    case 'common':
      return '🥉'
    case 'rare':
      return '🥈'
    case 'epic':
      return '🥇'
    case 'legendary':
      return '👑'
    default:
      return '✨'
  }
}

/** 合并静态通知 + 动态通知 */
export function mergeNotifications(
  staticList: Array<{
    id: string
    type: string
    icon: string
    title: string
    time: string
    content: string
    unread?: boolean
    pinned?: boolean
    quickLinks?: Array<{ icon: string; label: string; href: string }>
  }>,
  dynamic: DynamicNotification[]
): Array<{
  id: string
  type: string
  icon: string
  title: string
  time: string
  content: string
  unread?: boolean
  pinned?: boolean
  quickLinks?: Array<{ icon: string; label: string; href: string }>
}> {
  const dynamicMapped = dynamic.map((d) => ({
    id: d.id,
    type: d.type,
    icon: d.icon,
    title: d.title,
    time: formatTime(d.timestamp),
    content: d.content,
    unread: d.unread,
    quickLinks: d.href
      ? [{ icon: '→', label: '查看', href: d.href }]
      : undefined,
  }))
  return [...staticList, ...dynamicMapped]
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

/** 隐藏成就不显示在未解锁列表中（用于成就墙） */
export function getVisibleAchievements(): typeof ACHIEVEMENTS {
  return ACHIEVEMENTS.filter((a) => !a.hidden)
}