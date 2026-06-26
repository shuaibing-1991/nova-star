/**
 * 成就自动检测引擎
 *
 * 基于 store 状态（stats/relationships/flags）自动检测并解锁成就
 * 与剧情 onEnter 显式触发并存：
 * - 数值成就（first_fan、all_rounder、high_mood 等）→ 自动检测
 * - 关系成就（team_bond、bestie）→ 自动检测
 * - 探索成就（flag_collector）→ 自动检测
 * - 剧情成就（first_day、first_showcase）→ 显式触发（onEnter）
 *
 * 调用时机：store 任何字段变化后（带去抖）
 * 详见 [[../../../01-产品PRD#6.13 模块 13：成就系统]]
 */
import type { GameState } from '@/stores/game'

/** 成就 ID 字面量类型（来自 ACHIEVEMENTS 列表） */
export type AutoCheckAchievementId =
  // 数值成就
  | 'first_fan'
  | 'rising_star'
  | 'all_rounder'
  | 'high_mood'
  | 'trust_partner'
  | 'legendary_performer'
  // 关系成就
  | 'first_friend'
  | 'team_bond'
  | 'bestie'
  | 'zhou_yan_thaw'
  | 'lin_xia_trust'
  // 探索成就
  | 'flag_collector'

/** 检测规则：每个成就对应一个判断函数 */
type AchievementRule = {
  id: AutoCheckAchievementId
  check: (state: GameState) => boolean
}

/** 数值成就规则 */
const STAT_RULES: AchievementRule[] = [
  {
    id: 'first_fan',
    check: (s) => s.stats.followers >= 1000,
  },
  {
    id: 'rising_star',
    check: (s) => s.stats.followers >= 10_000,
  },
  {
    id: 'all_rounder',
    check: (s) =>
      s.stats.vocal >= 80 && s.stats.dance >= 80 && s.stats.stage >= 80,
  },
  {
    id: 'high_mood',
    check: (s) => s.stats.mood >= 95,
  },
  {
    id: 'trust_partner',
    check: (s) => s.stats.trust >= 90,
  },
  {
    id: 'legendary_performer',
    check: (s) => s.stats.stage >= 95,
  },
]

/** 关系成就规则 */
const RELATIONSHIP_RULES: AchievementRule[] = [
  {
    id: 'first_friend',
    check: (s) =>
      Object.values(s.relationships).some((r) => r.affection >= 50),
  },
  {
    id: 'team_bond',
    check: (s) => {
      const rels = Object.values(s.relationships)
      if (rels.length < 5) return false
      return rels.every((r) => r.affection >= 50)
    },
  },
  {
    id: 'bestie',
    check: (s) =>
      Object.values(s.relationships).some((r) => r.affection >= 90),
  },
  {
    id: 'zhou_yan_thaw',
    check: (s) => {
      const zhou = s.relationships['zhou_yan']
      return !!zhou && zhou.affection >= 70
    },
  },
  {
    id: 'lin_xia_trust',
    check: (s) => {
      const lin = s.relationships['lin_xia']
      return !!lin && lin.affection >= 80
    },
  },
]

/** 探索成就规则 */
const EXPLORATION_RULES: AchievementRule[] = [
  {
    id: 'flag_collector',
    check: (s) => {
      // 过滤掉内部 flag（unlocked: / completed: / risk_）
      const realFlags = s.progress.storyFlags.filter(
        (f) =>
          !f.startsWith('unlocked:') &&
          !f.startsWith('completed:') &&
          !f.startsWith('risk_')
      )
      return realFlags.length >= 10
    },
  },
]

/** 所有自动检测规则（按优先级） */
const ALL_RULES: AchievementRule[] = [
  ...STAT_RULES,
  ...RELATIONSHIP_RULES,
  ...EXPLORATION_RULES,
]

/**
 * 检测并返回需要解锁的成就 ID 列表
 *
 * 注意：调用方需要对比"已解锁列表"过滤掉已解锁的
 */
export function detectAchievableAchievements(
  state: GameState
): AutoCheckAchievementId[] {
  const result: AutoCheckAchievementId[] = []
  for (const rule of ALL_RULES) {
    if (state.achievements.includes(rule.id)) continue
    try {
      if (rule.check(state)) {
        result.push(rule.id)
      }
    } catch (e) {
      // 单条规则出错不影响其他
      console.warn(`[achievement-checker] Rule ${rule.id} failed:`, e)
    }
  }
  return result
}

/** 去抖延迟（毫秒） */
const DEBOUNCE_MS = 600

/**
 * 创建一个订阅者，在 store 变化后去抖检测新成就
 *
 * 用法（在 game.ts 末尾）：
 * ```ts
 * if (typeof window !== 'undefined') {
 *   const detector = createAchievementDetector(useGameStore, (id) => {
 *     useGameStore.getState().unlockAchievement(id)
 *   })
 *   detector.start()
 * }
 * ```
 */
export function createAchievementDetector(
  store: {
    getState: () => GameState
    /** 兼容带 selector 的 subscribe 形式（subscribeWithSelector middleware） */
    subscribe: any
  },
  onUnlock: (id: AutoCheckAchievementId) => void
) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const runDetection = () => {
    const newOnes = detectAchievableAchievements(store.getState())
    newOnes.forEach((id) => onUnlock(id))
  }

  // 兼容两种 subscribe：带 selector 的和不带的
  let unsubscribe: () => void = () => {}
  if (typeof store.subscribe === 'function') {
    // subscribeWithSelector middleware 下 store.subscribe 接受 (selector, listener)
    try {
      const unsub1 = store.subscribe(() => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(runDetection, DEBOUNCE_MS)
      })
      if (typeof unsub1 === 'function') unsubscribe = unsub1
    } catch {
      // 退而求其次：轮询检测（5s 一次）
      const interval = setInterval(runDetection, 5000)
      unsubscribe = () => clearInterval(interval)
    }
  }

  return {
    start: () => {
      // 启动时立即检测一次（首次进入或刷新页面时）
      runDetection()
    },
    stop: () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    },
    /** 立即强制检测（绕过去抖，用于手动触发） */
    flush: runDetection,
  }
}
