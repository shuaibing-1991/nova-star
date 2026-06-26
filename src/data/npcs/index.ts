/**
 * NPC 列表（元数据）
 * 详见 [[../../../04-NPC角色设定]]
 *
 * 新增 NPC：在此数组添加一项即可，不需改类型/store 源码
 */
import type { NPCMeta } from './types'

export const NPCS: NPCMeta[] = [
  {
    id: 'han_zhi_en',
    name: '韩知恩',
    shortName: '知恩',
    avatar: '/npcs/han_zhi_en.webp',
    age: 27,
    role: 'mentor',
    initialAffection: 30,
    tagline: '经纪人 · 冷酷但专业',
    greeting: '我是韩知恩，你的经纪人。',
  },
  {
    id: 'xu_jia_shu',
    name: '许嘉树',
    shortName: '嘉树',
    avatar: '/npcs/xu_jia_shu.webp',
    age: 24,
    role: 'rival',
    initialAffection: 25,
    tagline: '对手 · 实力超群',
    greeting: '我是许嘉树，LUMINA 的队长。',
  },
  {
    id: 'zhou_yan',
    name: '周砚',
    shortName: '周砚',
    avatar: '/npcs/zhou_yan.webp',
    age: 26,
    role: 'friend',
    initialAffection: 40,
    tagline: '朋友 · 温暖体贴',
    greeting: '嘿，我是周砚，有什么不懂的可以问我。',
  },
  {
    id: 'shen_yao',
    name: '沈遥',
    shortName: '沈遥',
    avatar: '/npcs/shen_yao.webp',
    age: 25,
    role: 'love',
    initialAffection: 35,
    tagline: '暧昧 · 神秘气质',
    greeting: '我是沈遥。',
  },
  {
    id: 'lin_xia',
    name: '林夏',
    shortName: '林夏',
    avatar: '/npcs/lin_xia.webp',
    age: 22,
    role: 'staff',
    initialAffection: 30,
    tagline: '助理 · 细致周到',
    greeting: '你好，我是林夏，你的经纪人助理。',
  },
]

/** 启用的 NPC 列表（过滤 disabled） */
export const ENABLED_NPCS: NPCMeta[] = NPCS.filter((n) => n.enabled !== false)

/** 索引：id → NPCMeta */
export const NPC_MAP: Record<string, NPCMeta> = Object.fromEntries(
  NPCS.map((n) => [n.id, n])
)

/** 查询工具 */
export function getAllNpcIds(): string[] {
  return NPCS.map((n) => n.id)
}

export function getNpcById(id: string): NPCMeta | undefined {
  return NPC_MAP[id]
}

export function getNpcName(id: string): string {
  return NPC_MAP[id]?.name ?? id
}
