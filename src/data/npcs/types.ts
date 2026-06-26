/**
 * NPC 元数据类型
 */
export interface NPCMeta {
  id: string
  name: string
  shortName: string
  avatar: string
  age: number
  role: 'mentor' | 'rival' | 'friend' | 'love' | 'staff'
  initialAffection: number
  /** 客户可隐藏某些 NPC（用不到的角色） */
  enabled?: boolean
  /** 一句话描述（对话列表显示） */
  tagline?: string
  /** 玩家与该 NPC 的默认问候语 */
  greeting?: string
}
