/**
 * 剧情引擎
 *
 * 管理：
 * - 已解锁场景队列（unlockedScenes）
 * - 已完成场景记录（completedScenes）
 * - 活动 → 剧情分支的触发器
 *
 * 持久化：通过 gameStore.progress.storyFlags + 独立字段完成
 */
import type { Scene } from '@/types'
import { useGameStore } from '@/stores/game'
import { ALL_SCENES, getDayOpeningScene } from '@/data/story/story'
import { matchTrigger } from './scene-trigger'
import { evaluateCondition, type DecisionContext } from './decision'

/**
 * 活动触发的剧情场景（按活动 ID 索引）
 *
 * 阶段 5：3 个活动映射
 * - train_vocal → day5_back_dorm（沈遥为你写歌的引子）
 * - event_meetfan → day6_zhou_yan_talk（粉丝见面让你更自信，触发和解）
 * - rest_fun → day3_night_shen_yao（放松时偶遇沈遥）
 */
export const ACTIVITY_TRIGGERS: Record<string, string[]> = {
  train_vocal: ['day5_back_dorm'],
  event_meetfan: ['day6_zhou_yan_talk'],
  rest_fun: ['day3_night_shen_yao'],
}

/** 决策上下文（用于条件求值） */
function getDecisionContext(): DecisionContext {
  const state = useGameStore.getState()
  return {
    stats: state.stats,
    progress: state.progress,
    relationships: state.relationships,
  }
}

/**
 * 检查场景触发条件（day + flags + conditions）
 */
function isScenePlayable(scene: Scene, ctx: DecisionContext): boolean {
  return matchTrigger(scene, ctx)
}

/**
 * 检查并解锁活动触发的剧情场景
 *
 * 调用时机：performActivity 后
 *
 * 行为：
 * - 根据当前 day 的 storyFlags 检查 trigger
 * - 满足条件 → 解锁 scene 到 unlockedScenes
 * - 已解锁过的不重复解锁
 */
export function checkActivityTriggers(activityId: string): string[] {
  const sceneIds = ACTIVITY_TRIGGERS[activityId]
  if (!sceneIds) return []

  const state = useGameStore.getState()
  const unlocked: string[] = []

  for (const sceneId of sceneIds) {
    // 跳过已解锁的
    if (state.progress.storyFlags.includes(`unlocked:${sceneId}`)) continue

    const scene = ALL_SCENES[sceneId]
    if (!scene) continue

    // 检查触发条件
    if (!isScenePlayable(scene, getDecisionContext())) continue

    // 解锁：写入特殊 flag（unlocked:sceneId）
    useGameStore.getState().addFlag(`unlocked:${sceneId}`)
    unlocked.push(sceneId)
  }

  return unlocked
}

/**
 * 获取下一个待播放的场景（从已解锁队列中按时间顺序取最早）
 *
 * 玩家进入 /play 时调用
 */
export function getNextUnlockedScene(): Scene | undefined {
  const state = useGameStore.getState()
  const flags = state.progress.storyFlags
  const unlocked = flags
    .filter((f) => f.startsWith('unlocked:'))
    .map((f) => f.replace('unlocked:', ''))

  for (const sceneId of unlocked) {
    if (flags.includes(`completed:${sceneId}`)) continue
    const scene = ALL_SCENES[sceneId]
    if (scene) return scene
  }
  return undefined
}

/**
 * 标记场景已完成
 */
export function markSceneCompleted(sceneId: string): void {
  useGameStore.getState().addFlag(`completed:${sceneId}`)
}

/**
 * 检查场景是否已解锁（但可能未完成）
 */
export function isSceneUnlocked(sceneId: string): boolean {
  const flags = useGameStore.getState().progress.storyFlags
  return flags.includes(`unlocked:${sceneId}`)
}

/**
 * 检查场景是否已完成
 */
export function isSceneCompleted(sceneId: string): boolean {
  const flags = useGameStore.getState().progress.storyFlags
  return flags.includes(`completed:${sceneId}`)
}

/**
 * 获取当前 day 的开场场景
 *
 * 优先级：
 * 1. 活动触发的解锁场景
 * 2. 当前 day 的开场场景
 */
export function getCurrentDayOpeningScene(currentDay: number): Scene | undefined {
  // 1. 优先返回未完成的解锁场景
  const unlocked = getNextUnlockedScene()
  if (unlocked) return unlocked

  // 2. 当前 day 的开场（取 SCENES_BY_DAY[day][0]）
  return getDayOpeningScene(currentDay)
}

/**
 * 计算一个 day 内所有可触发场景（用于调试/通知）
 */
export function getDayTriggerableScenes(currentDay: number): Scene[] {
  const ctx = getDecisionContext()
  return Object.values(ALL_SCENES).filter((s) => {
    if (s.trigger?.day !== currentDay) return false
    return matchTrigger(s, ctx)
  })
}

/**
 * 调试用：清除所有剧情 flag
 */
export function _debugResetStoryFlags(): void {
  const state = useGameStore.getState()
  const newFlags = state.progress.storyFlags.filter(
    (f) => !f.startsWith('unlocked:') && !f.startsWith('completed:')
  )
  useGameStore.setState((s) => ({
    progress: { ...s.progress, storyFlags: newFlags },
  }))
}

// Re-export evaluateCondition for downstream use
export { evaluateCondition }