/**
 * 场景触发器系统
 * 详见 [[../../../01-产品PRD#6.3 剧本引擎#触发器]]
 */
import type { Scene, Condition } from '@/types'
import { evaluateCondition, type DecisionContext } from './decision'
import { ALL_SCENES } from '@/data/story/story'

/**
 * 匹配触发器
 */
export function matchTrigger(scene: Scene, ctx: DecisionContext): boolean {
  if (!scene.trigger) return false
  const t = scene.trigger

  if (t.day !== undefined && ctx.progress.currentDay !== t.day) return false

  if (t.flags && t.flags.length > 0) {
    const hasAll = t.flags.every((f) =>
      ctx.progress.storyFlags.includes(f)
    )
    if (!hasAll) return false
  }

  if (t.conditions && t.conditions.length > 0) {
    const allPass = t.conditions.every((c) =>
      evaluateCondition(c as Condition, ctx)
    )
    if (!allPass) return false
  }

  return true
}

/**
 * 在所有场景中查找当前可触发的
 */
export function findTriggeredScene(
  ctx: DecisionContext
): Scene | undefined {
  return Object.values(ALL_SCENES).find((s) => matchTrigger(s, ctx))
}

/**
 * 获取指定 day 的所有可触发场景
 */
export function findDayTriggers(
  day: number,
  ctx: DecisionContext
): Scene[] {
  return Object.values(ALL_SCENES).filter(
    (s) => s.trigger?.day === day && matchTrigger(s, ctx)
  )
}