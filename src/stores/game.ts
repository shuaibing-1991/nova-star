/**
 * 游戏全局状态（Zustand）
 * 详见 [[../../../01-产品PRD#6.5 模块 5：数值系统]]
 */
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  ArtistProfile,
  SaveData,
  Stats,
  NPCRelationship,
  Progress,
  Message,
  DayActivityLog,
} from '@/types'
import { defaultClientConfig } from '@/config/client'
import { SAVE_VERSION } from '@/config/version'
import { NPCS } from '@/data/npcs'
import { getAchievement } from '@/data/achievements'
import { useSettingsStore } from './settings'

/** 默认数值 */
export const defaultStats: Stats = {
  followers: 1000,
  mood: 75,
  vocal: 50,
  dance: 50,
  stage: 50,
  trust: 60,
  screenPresence: 'medium',
}

// 重新导出 DayActivityLog，方便使用方从 stores/game 导入
export type { DayActivityLog }

/** 最大体力 */
export const MAX_ENERGY = 100
/** 每日初始体力（每日重置） */
export const DAILY_INITIAL_ENERGY = 80

/** 默认艺人人设 */
const defaultArtist: ArtistProfile = {
  name: defaultClientConfig.content.artistName,
  vibe: 'fresh',
  height: 168,
  position: 'vocal',
  persona: 'gentle',
  romance: 'none',
  fanName: defaultClientConfig.content.fanName,
  fanColor: defaultClientConfig.content.fanColor,
  route: 'girl-group',
}

/** 默认进度 */
const defaultProgress: Progress = {
  currentDay: 1,
  currentScene: 'opening_intro',
  storyFlags: [],
}

/** 默认关系（从 NPC 元数据动态生成） */
const defaultRelationships: Record<string, NPCRelationship> = Object.fromEntries(
  NPCS.map((n) => [
    n.id,
    {
      npcId: n.id,
      affection: n.initialAffection,
      affinity: 0,
      flags: [],
      lastInteractionDay: 0,
    },
  ])
)

export interface GameState {
  // 数据
  artist: ArtistProfile
  stats: Stats
  progress: Progress
  relationships: Record<string, NPCRelationship>
  conversations: Record<string, Message[]>
  achievements: string[]

  // 阶段 4 新增：日程系统
  energy: number
  dayActivities: DayActivityLog[]

  // 业务持久 UI 状态（与本地 useState 区分；这些会写入存档）
  notificationLastReadAt: number
  weiboLiked: boolean
  chatScriptIndex: Record<string, number>

  // UI 状态
  isPlaying: boolean
  isPaused: boolean
  currentDialogueIndex: number

  // Actions
  setArtist: (artist: Partial<ArtistProfile>) => void
  setStat: (key: keyof Stats, value: number) => void
  modifyStats: (delta: Partial<Stats>) => void
  setProgress: (progress: Partial<Progress>) => void
  addFlag: (flag: string) => void
  removeFlag: (flag: string) => void
  hasFlag: (flag: string) => boolean
  modifyRelationship: (
    npcId: string,
    delta: Partial<NPCRelationship>
  ) => void
  addMessage: (npcId: string, message: Message) => void
  unlockAchievement: (id: string) => void
  setPlaying: (playing: boolean) => void
  setPaused: (paused: boolean) => void
  setCurrentDialogueIndex: (index: number) => void
  markNotificationsRead: () => void
  toggleWeiboLike: () => void
  setChatScriptIndex: (npcId: string, index: number) => void

  // 阶段 4 新增 action
  setEnergy: (energy: number) => void
  logActivity: (log: Omit<DayActivityLog, 'id' | 'timestamp' | 'dayNumber'>) => void
  clearTodayActivities: () => void
  advanceDay: () => void

  // 存档相关
  exportSave: () => SaveData
  importSave: (save: SaveData) => void
  reset: () => void
}

const initialState = {
  artist: defaultArtist,
  stats: defaultStats,
  progress: defaultProgress,
  relationships: defaultRelationships,
  conversations: {} as Record<string, Message[]>,
  achievements: [] as string[],
  energy: DAILY_INITIAL_ENERGY,
  dayActivities: [] as DayActivityLog[],
  notificationLastReadAt: 0,
  weiboLiked: false,
  chatScriptIndex: {} as Record<string, number>,
  isPlaying: false,
  isPaused: false,
  currentDialogueIndex: 0,
}

/** 数值范围限制 */
function clampStat(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setArtist: (artist) =>
      set((state) => ({ artist: { ...state.artist, ...artist } })),

    setStat: (key, value) =>
      set((state) => {
        if (key === 'screenPresence') {
          return {
            stats: { ...state.stats, screenPresence: value as 'high' | 'medium' | 'low' },
          }
        }
        // 不同数值有不同范围
        const range = getStatRange(key)
        return {
          stats: {
            ...state.stats,
            [key]: clampStat(value, range.min, range.max),
          },
        }
      }),

    modifyStats: (delta) =>
      set((state) => {
        const newStats = { ...state.stats }
        for (const key in delta) {
          if (key === 'screenPresence') continue
          const k = key as Exclude<keyof Stats, 'screenPresence'>
          const range = getStatRange(k)
          newStats[k] = clampStat(
            (newStats[k] as number) + (delta[k] as number),
            range.min,
            range.max
          )
        }
        return { stats: newStats }
      }),

    setProgress: (progress) =>
      set((state) => ({ progress: { ...state.progress, ...progress } })),

    addFlag: (flag) =>
      set((state) => {
        if (state.progress.storyFlags.includes(flag)) return state
        return {
          progress: {
            ...state.progress,
            storyFlags: [...state.progress.storyFlags, flag],
          },
        }
      }),

    removeFlag: (flag) =>
      set((state) => ({
        progress: {
          ...state.progress,
          storyFlags: state.progress.storyFlags.filter((f) => f !== flag),
        },
      })),

    hasFlag: (flag) => get().progress.storyFlags.includes(flag),

    modifyRelationship: (npcId, delta) =>
      set((state) => {
        const current = state.relationships[npcId]
        if (!current) return state
        const updated: NPCRelationship = {
          ...current,
          ...delta,
          affection: delta.affection !== undefined
            ? clampStat(current.affection + delta.affection, 0, 100)
            : current.affection,
          affinity: delta.affinity !== undefined
            ? clampStat(current.affinity + delta.affinity, 0, 100)
            : current.affinity,
        }
        return {
          relationships: { ...state.relationships, [npcId]: updated },
        }
      }),

    addMessage: (npcId, message) =>
      set((state) => {
        const list = state.conversations[npcId] || []
        return {
          conversations: {
            ...state.conversations,
            [npcId]: [...list, message],
          },
        }
      }),

    unlockAchievement: (id) =>
      set((state) => {
        if (state.achievements.includes(id)) return state

        // 应用 reward（如果存在）
        const achievement = getAchievement(id)
        let newStats = state.stats
        if (achievement?.reward) {
          const k = achievement.reward.stat as Exclude<
            keyof Stats,
            'screenPresence'
          >
          const range = getStatRange(k)
          newStats = {
            ...state.stats,
            [k]: clampStat(
              (state.stats[k] as number) + achievement.reward.value,
              range.min,
              range.max
            ),
          }
        }

        // 阶段 9 Round 1：成就解锁音效
        if (typeof window !== 'undefined') {
          import('@/lib/sound').then(({ playSound }) => {
            playSound('chime')
          })
        }

        return {
          stats: newStats,
          achievements: [...state.achievements, id],
        }
      }),

    setPlaying: (playing) => set({ isPlaying: playing }),
    setPaused: (paused) => set({ isPaused: paused }),
    setCurrentDialogueIndex: (index) => set({ currentDialogueIndex: index }),

    markNotificationsRead: () => set({ notificationLastReadAt: Date.now() }),
    toggleWeiboLike: () => set((s) => ({ weiboLiked: !s.weiboLiked })),
    setChatScriptIndex: (npcId, index) =>
      set((state) => ({
        chatScriptIndex: { ...state.chatScriptIndex, [npcId]: index },
      })),

    // 阶段 4 新增
    setEnergy: (energy) => set({ energy: Math.max(0, Math.min(MAX_ENERGY, energy)) }),
    logActivity: (log) =>
      set((state) => {
        const entry: DayActivityLog = {
          ...log,
          id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          dayNumber: state.progress.currentDay,
        }
        return { dayActivities: [...state.dayActivities, entry] }
      }),
    clearTodayActivities: () =>
      set((state) => ({
        dayActivities: state.dayActivities.filter(
          (a) => a.dayNumber !== state.progress.currentDay
        ),
      })),
    advanceDay: () =>
      set((state) => ({
        progress: {
          ...state.progress,
          currentDay: state.progress.currentDay + 1,
        },
        energy: DAILY_INITIAL_ENERGY,
      })),

    exportSave: () => {
      const {
        artist,
        stats,
        progress,
        relationships,
        conversations,
        achievements,
        energy,
        dayActivities,
        notificationLastReadAt,
        weiboLiked,
        chatScriptIndex,
      } = get()
      const preferences = useSettingsStore.getState()
      return {
        version: SAVE_VERSION,
        artist,
        stats,
        progress,
        relationships,
        conversations,
        achievements,
        energy,
        dayActivities,
        notificationLastReadAt,
        weiboLiked,
        chatScriptIndex,
        preferences: {
          skipOpening: preferences.skipOpening,
          defaultDecisionStyle: preferences.defaultDecisionStyle,
          autoSkipReadConversations: preferences.autoSkipReadConversations,
          decisionDelay: preferences.decisionDelay,
          theme: preferences.theme,
          fontSize: preferences.fontSize,
        },
      }
    },

    importSave: (save) =>
      set({
        artist: save.artist,
        stats: save.stats,
        progress: save.progress,
        relationships: save.relationships,
        conversations: save.conversations,
        achievements: save.achievements,
        energy: save.energy ?? DAILY_INITIAL_ENERGY,
        dayActivities: save.dayActivities ?? [],
        notificationLastReadAt: save.notificationLastReadAt ?? 0,
        weiboLiked: save.weiboLiked ?? false,
        chatScriptIndex: save.chatScriptIndex ?? {},
      }),

    reset: () => set({ ...initialState }),
  }))
)

// 阶段 6：客户端启动成就自动检测
if (typeof window !== 'undefined') {
  // 动态 import 避免 SSR 时拉入依赖
  import('@/lib/achievement-checker').then(({ createAchievementDetector }) => {
    const detector = createAchievementDetector(
      useGameStore as any,
      (id) => {
        useGameStore.getState().unlockAchievement(id)
      }
    )
    detector.start()
    // 暴露到 window 方便调试
    if (process.env.NODE_ENV === 'development') {
      ;(window as any).__achievementDetector = detector
    }
  })
}

/** 各数值的合理范围 */
function getStatRange(key: Exclude<keyof Stats, 'screenPresence'>): {
  min: number
  max: number
} {
  switch (key) {
    case 'followers':
      return { min: 0, max: 100000 }
    case 'mood':
    case 'vocal':
    case 'dance':
    case 'stage':
    case 'trust':
      return { min: 0, max: 100 }
    default:
      return { min: 0, max: 100 }
  }
}
