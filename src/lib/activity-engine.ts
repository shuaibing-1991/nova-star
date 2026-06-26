/**
 * 活动执行引擎
 *
 * 负责：
 * - 检查前置条件
 * - 应用数值变化
 * - 写 flag
 * - 返回执行结果
 */
'use client'

import type { Stats } from '@/types'
import { getActivity, type Activity } from './activity-catalog'

/** 执行结果 */
export interface ActivityResult {
  success: boolean
  activity: Activity
  /** 修改前的状态（用于显示变化） */
  before: Partial<Stats>
  /** 修改后的状态 */
  after: Partial<Stats>
  /** 失败原因 */
  reason?: string
  /** 影响的数值字段（用于弹层显示） */
  changes: Array<{ key: keyof Stats; delta: number; before: number; after: number }>
}

/** 当前状态（用于检查前置条件） */
export interface CurrentState {
  stats: Stats
  energy: number
}

/**
 * 检查活动是否可执行
 */
export function canPerformActivity(
  activity: Activity,
  state: CurrentState
): { ok: boolean; reason?: string } {
  const req = activity.requirements
  if (!req) return { ok: true }

  if (req.minEnergy !== undefined && state.energy < req.minEnergy) {
    return {
      ok: false,
      reason: `体力不足（需要 ${req.minEnergy}，当前 ${state.energy}）`,
    }
  }
  if (req.minTrust !== undefined && state.stats.trust < req.minTrust) {
    return {
      ok: false,
      reason: `公司信任不足（需要 ${req.minTrust}，当前 ${state.stats.trust}）`,
    }
  }
  if (req.minMood !== undefined && state.stats.mood < req.minMood) {
    return {
      ok: false,
      reason: `心情太低（需要 ${req.minMood}，当前 ${state.stats.mood}）`,
    }
  }
  return { ok: true }
}

/**
 * 执行活动（纯函数，返回结果，不直接写入 store）
 *
 * 调用方负责：
 * - 拿到 result 后调用 store.modifyStats(...)
 * - 调用 store.addFlag(...)（如有 riskFlag）
 * - 更新 energy
 */
export function performActivity(
  activityId: string,
  state: CurrentState
): ActivityResult | null {
  const activity = getActivity(activityId)
  if (!activity) return null

  const check = canPerformActivity(activity, state)
  if (!check.ok) {
    return {
      success: false,
      activity,
      before: {},
      after: {},
      reason: check.reason,
      changes: [],
    }
  }

  // 计算变化
  const changes: ActivityResult['changes'] = []
  const before: Partial<Stats> = {}
  const after: Partial<Stats> = {}

  for (const [key, delta] of Object.entries(activity.effects)) {
    if (delta === undefined) continue
    const statKey = key as keyof Stats
    const beforeVal = state.stats[statKey] as number
    const afterVal = Math.max(0, beforeVal + delta)
    before[statKey] = beforeVal as any
    after[statKey] = afterVal as any
    changes.push({ key: statKey, delta, before: beforeVal, after: afterVal })
  }

  return {
    success: true,
    activity,
    before,
    after,
    changes,
  }
}

/**
 * 中文标签（用于弹层）
 */
export const STAT_LABEL: Record<keyof Stats, string> = {
  followers: '粉丝',
  mood: '心情',
  vocal: '声乐',
  dance: '舞蹈',
  stage: '舞台',
  trust: '信任',
  screenPresence: '上镜感',
}
