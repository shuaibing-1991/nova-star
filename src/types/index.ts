/**
 * 核心类型定义
 * 详见 [[../../../01-产品PRD#6.5 模块 5：数值系统]]
 */

/** 7 个核心数值 */
export interface Stats {
  followers: number // 粉丝数 0-100,000
  mood: number // 心情 0-100
  vocal: number // 声乐 0-100
  dance: number // 舞蹈 0-100
  stage: number // 舞台 0-100
  trust: number // 公司信任 0-100
  // 上镜感：高/中/低
  screenPresence: 'high' | 'medium' | 'low'
}

/** NPC 关系 */
export interface NPCRelationship {
  npcId: string
  affection: number // 好感度 0-100
  affinity: number // 亲密度 0-100
  flags: string[] // 该 NPC 的羁绊 flag
  lastInteractionDay: number
}

/** 艺人档案 */
export interface ArtistProfile {
  name: string // 艺名
  vibe: 'cool' | 'fresh' | 'mature' // 气质
  height: number // 身高 cm
  position: 'vocal' | 'dance' | 'creative' | 'variety' | 'acting' | 'visual'
  persona:
    | 'gentle'
    | 'cool-power'
    | 'sunny'
    | 'contrast'
    | 'ambitious'
    | 'artistic'
  romance: 'hetero' | 'homo' | 'both' | 'none'
  fanName: string
  fanColor: string
  route: 'girl-group' | 'solo' | 'boy-group'
  avatar?: string
}

/** 剧情进度 */
export interface Progress {
  currentDay: number
  currentScene: string
  storyFlags: string[]
}

/** 每日活动日志（每条 = 一次活动） */
export interface DayActivityLog {
  id: string
  activityId: string
  category: 'training' | 'appearance' | 'rest'
  dayNumber: number
  timestamp: number
  changes: Array<{ key: keyof Stats; delta: number }>
}

/** 用户偏好 */
export interface PlaybackPreferences {
  skipOpening: boolean
  defaultDecisionStyle: 'gentle' | 'neutral' | 'aggressive'
  autoSkipReadConversations: boolean
  decisionDelay: number
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
}

/** 完整存档 */
export interface SaveData {
  version: string
  artist: ArtistProfile
  stats: Stats
  progress: Progress
  relationships: Record<string, NPCRelationship>
  conversations: Record<string, Message[]>
  achievements: string[]
  // 业务持久 UI 状态（v1.1+）
  notificationLastReadAt?: number
  weiboLiked?: boolean
  chatScriptIndex?: Record<string, number>
  // 阶段 4 新增（v1.2+）
  energy?: number
  dayActivities?: DayActivityLog[]
  preferences: PlaybackPreferences
}

/** 对话消息 */
export interface Message {
  id: string
  npcId?: string
  role: 'npc' | 'user' | 'system'
  text: string
  timestamp: number
  dayNumber: number
  flags?: string[]
}

/** 场景 */
export interface Scene {
  id: string
  type: 'narration' | 'dialogue' | 'choice' | 'event' | 'transition' | 'ending'
  trigger?: {
    day?: number
    flags?: string[]
    conditions?: StatCondition[]
  }
  content: ContentBlock[]
  options?: SceneOption[]
  autoNext?: string
  onEnter?: SceneEffect
}

export interface ContentBlock {
  type: 'narration' | 'npc_speak' | 'user_speak' | 'pause' | 'media'
  text?: string
  npcId?: string
  duration?: number // 毫秒
}

export interface SceneOption {
  id: string
  text: string
  /**
   * 选项效果
   * - 数值字段直接累加（如 mood/dance/followers 等）
   * - modifyRelationship 是 Record<NPC ID, NPCRelationship 增量>
   */
  effect?: Partial<Stats> & {
    modifyRelationship?: Record<string, Partial<NPCRelationship>>
  }
  setFlag?: string
  /** 单个成就 ID（阶段 6 扩展：选项可解锁成就） */
  unlockAchievement?: string
  /** 多个成就 ID（阶段 6 扩展） */
  unlockAchievements?: string[]
  nextScene: string
  condition?: Condition
  visibleText?: string
}

export type StatCondition =
  | { type: 'gte'; stat: keyof Stats; value: number }
  | { type: 'lte'; stat: keyof Stats; value: number }
  | { type: 'eq'; stat: keyof Stats; value: number }
  | { type: 'between'; stat: keyof Stats; min: number; max: number }
  | { type: 'flag'; flag: string; has: boolean }

export type Condition =
  | StatCondition
  | { type: 'and'; conditions: Condition[] }
  | { type: 'or'; conditions: Condition[] }

export interface SceneEffect {
  setFlags?: string[]
  modifyStats?: Partial<Stats>
  /**
   * 关系变化：key 是目标 NPC ID，value 是 NPCRelationship 的增量
   * 例如：{ xu_jia_shu: { affection: 5 } }
   */
  modifyRelationship?: Record<string, Partial<NPCRelationship>>
  /** 单个成就 ID（向后兼容） */
  unlockAchievement?: string
  /** 多个成就 ID（阶段 5 扩展） */
  unlockAchievements?: string[]
}
