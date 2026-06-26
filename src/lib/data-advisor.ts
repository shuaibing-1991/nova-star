/**
 * 数据分析建议生成器
 *
 * 基于当前数值 + 关系 + 人设，生成建议和粉丝画像
 */
'use client'

import type { Stats, NPCRelationship, ArtistProfile } from '@/types'
import { NPCS } from '@/data/npcs'

export interface Advice {
  id: string
  icon: string
  title: string
  desc: string
  level: 'high' | 'medium' | 'low'
  actionLabel?: string
  actionHref?: string
}

export interface DataContext {
  stats: Stats
  relationships: Record<string, NPCRelationship>
  dayNumber: number
}

/**
 * 生成建议
 */
export function generateAdvice(ctx: DataContext): Advice[] {
  const advices: Advice[] = []
  const { stats, relationships, dayNumber } = ctx

  // 1. 数值短板建议
  const abilities = [
    { key: 'vocal' as const, label: '声乐' },
    { key: 'dance' as const, label: '舞蹈' },
    { key: 'stage' as const, label: '舞台' },
  ]
  const weakest = abilities.reduce((min, a) =>
    stats[a.key] < stats[min.key] ? a : min
  )
  if (stats[weakest.key] < 50) {
    advices.push({
      id: 'weak_ability',
      icon: '⚠️',
      title: `${weakest.label}较弱（${stats[weakest.key]}/100）`,
      desc: `建议在安排日程时优先安排${weakest.label}训练`,
      level: 'medium',
      actionLabel: '去安排',
      actionHref: '/phone/schedule',
    })
  }

  // 2. 关系建议：信任度最低的 NPC
  const npcList = Object.values(relationships)
  const lowestTrust = npcList
    .filter((r) => r.lastInteractionDay < dayNumber - 2)
    .sort((a, b) => a.affection - b.affection)[0]
  if (lowestTrust) {
    const npc = NPCS.find((n) => n.id === lowestTrust.npcId)
    if (npc) {
      advices.push({
        id: 'relationship',
        icon: '💔',
        title: `${npc.name}的关系疏远（${lowestTrust.affection}/100）`,
        desc: `已经 ${dayNumber - lowestTrust.lastInteractionDay} 天没互动了，建议在微信找他聊聊`,
        level: 'high',
        actionLabel: '去聊天',
        actionHref: `/phone/chat/${npc.id}`,
      })
    }
  }

  // 3. 心情建议
  if (stats.mood < 40) {
    advices.push({
      id: 'low_mood',
      icon: '😔',
      title: `心情较低（${stats.mood}/100）`,
      desc: '建议安排休息或娱乐活动恢复状态',
      level: 'high',
      actionLabel: '去安排',
      actionHref: '/phone/schedule',
    })
  } else if (stats.mood > 80) {
    advices.push({
      id: 'great_mood',
      icon: '✨',
      title: `状态绝佳（${stats.mood}/100）`,
      desc: '趁状态好，安排高强度训练效果更好',
      level: 'low',
      actionLabel: '去安排',
      actionHref: '/phone/schedule',
    })
  }

  // 4. 信任度建议
  if (stats.trust < 40) {
    advices.push({
      id: 'low_trust',
      icon: '🏢',
      title: `公司信任较低（${stats.trust}/100）`,
      desc: '建议多接通告、表现积极',
      level: 'high',
    })
  }

  // 5. 粉丝增长建议
  if (stats.followers < 5000) {
    advices.push({
      id: 'low_followers',
      icon: '👥',
      title: `粉丝数 ${stats.followers}`,
      desc: '建议发微博、参加粉丝见面',
      level: 'medium',
      actionLabel: '去微博',
      actionHref: '/phone/weibo',
    })
  }

  return advices.slice(0, 3)
}

/**
 * 粉丝画像（基于人设/路线 + 数值）
 *
 * 维度：
 * 1. 人设粉（persona 决定主导类型）
 * 2. 路线粉（route 决定 Solo/Group 比例）
 * 3. 位置粉（position 决定能力向）
 * 4. 唯粉 / 路人粉（基础分布）
 *
 * 调用方：data page
 */
export interface FanSegment {
  label: string
  count: number
  color: string
  /** 维度分类（用于 tooltip/排序） */
  category: 'persona' | 'route' | 'position' | 'base'
}

const PERSONA_LABEL: Record<ArtistProfile['persona'], string> = {
  gentle: '温柔粉',
  'cool-power': '实力粉',
  sunny: '阳光粉',
  contrast: '反差粉',
  ambitious: '野心粉',
  artistic: '文艺粉',
}

const PERSONA_COLOR: Record<ArtistProfile['persona'], string> = {
  gentle: 'bg-pink-300',
  'cool-power': 'bg-purple-500',
  sunny: 'bg-yellow-400',
  contrast: 'bg-indigo-400',
  ambitious: 'bg-red-500',
  artistic: 'bg-teal-400',
}

const POSITION_LABEL: Record<ArtistProfile['position'], string> = {
  vocal: '主唱粉',
  dance: '舞担粉',
  creative: '创作粉',
  variety: '综艺粉',
  acting: '演技粉',
  visual: '门面粉',
}

const POSITION_COLOR: Record<ArtistProfile['position'], string> = {
  vocal: 'bg-pink-400',
  dance: 'bg-purple-400',
  creative: 'bg-emerald-400',
  variety: 'bg-orange-400',
  acting: 'bg-blue-400',
  visual: 'bg-rose-400',
}

export function computeFanDemographics(
  stats: Stats,
  artist?: Pick<ArtistProfile, 'persona' | 'position' | 'route'>
): FanSegment[] {
  const total = stats.followers
  if (total === 0) return []

  const segments: FanSegment[] = []

  // 1. 人设粉：30%（基于 persona）
  if (artist?.persona) {
    segments.push({
      label: PERSONA_LABEL[artist.persona],
      count: Math.floor(total * 0.3),
      color: PERSONA_COLOR[artist.persona],
      category: 'persona',
    })
  }

  // 2. 位置粉：20%（基于 position，对应最强能力）
  // 数值 ≥ 60 时升级为「能力向」深色
  const positionToAbility = {
    vocal: { stat: 'vocal' as const, label: '声乐粉', light: 'bg-pink-300', deep: 'bg-pink-500' },
    dance: { stat: 'dance' as const, label: '舞蹈粉', light: 'bg-purple-300', deep: 'bg-purple-500' },
    creative: { stat: 'vocal' as const, label: '创作粉', light: 'bg-emerald-300', deep: 'bg-emerald-500' },
    variety: { stat: 'stage' as const, label: '综艺粉', light: 'bg-orange-300', deep: 'bg-orange-500' },
    acting: { stat: 'stage' as const, label: '演技粉', light: 'bg-blue-300', deep: 'bg-blue-500' },
    visual: { stat: 'stage' as const, label: '门面粉', light: 'bg-rose-300', deep: 'bg-rose-500' },
  }

  if (artist?.position) {
    const map = positionToAbility[artist.position]
    if (map) {
      const isMaster = stats[map.stat] >= 60
      segments.push({
        label: isMaster ? `${map.label}·精` : POSITION_LABEL[artist.position],
        count: Math.floor(total * 0.2),
        color: isMaster ? map.deep : POSITION_COLOR[artist.position],
        category: 'position',
      })
    }
  }

  // 3. 能力向粉：position 之外的强项（数值 ≥ 60 时显示）
  if (artist?.position !== 'vocal' && stats.vocal >= 60) {
    segments.push({
      label: '声乐粉',
      count: Math.floor(total * 0.15),
      color: 'bg-pink-400',
      category: 'position',
    })
  }
  if (artist?.position !== 'dance' && stats.dance >= 60) {
    segments.push({
      label: '舞蹈粉',
      count: Math.floor(total * 0.15),
      color: 'bg-purple-400',
      category: 'position',
    })
  }
  if (artist?.position !== 'creative' && artist?.position !== 'variety' && artist?.position !== 'acting' && artist?.position !== 'visual' && stats.stage >= 60) {
    segments.push({
      label: '舞台粉',
      count: Math.floor(total * 0.1),
      color: 'bg-orange-400',
      category: 'position',
    })
  }

  // 4. 路线粉：基于 route
  if (artist?.route === 'solo') {
    segments.push({
      label: 'Solo 粉',
      count: Math.floor(total * 0.15),
      color: 'bg-amber-500',
      category: 'route',
    })
  } else if (artist?.route === 'girl-group' || artist?.route === 'boy-group') {
    segments.push({
      label: '团粉',
      count: Math.floor(total * 0.15),
      color: 'bg-cyan-400',
      category: 'route',
    })
  }

  // 5. 唯粉：15%（核心粉丝）
  segments.push({
    label: '唯粉',
    count: Math.floor(total * 0.15),
    color: 'bg-blue-400',
    category: 'base',
  })

  // 6. 路人粉：剩余部分（保证总和 = total）
  const allocated = segments.reduce((s, x) => s + x.count, 0)
  segments.push({
    label: '路人粉',
    count: Math.max(0, total - allocated),
    color: 'bg-gray-400',
    category: 'base',
  })

  return segments.filter((s) => s.count > 0)
}

/**
 * screenPresence 转 0-100
 */
export function screenPresenceToNumber(sp: Stats['screenPresence']): number {
  return sp === 'high' ? 90 : sp === 'medium' ? 60 : 30
}
