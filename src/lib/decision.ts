/**
 * 决策引擎：条件判断与效果触发
 * 详见 [[../../../01-产品PRD#6.6 模块 6：决策系统]]
 */
import type {
  Condition,
  StatCondition,
  SceneOption,
  SceneEffect,
  Stats,
  NPCRelationship,
  Progress,
} from '@/types'

/**
 * 决策上下文
 */
export interface DecisionContext {
  stats: Stats
  progress: Progress
  relationships: Record<string, NPCRelationship>
}

/**
 * 评估条件
 */
export function evaluateCondition(
  condition: Condition | undefined,
  ctx: DecisionContext
): boolean {
  if (!condition) return true
  return evaluateConditionInner(condition, ctx)
}

function evaluateConditionInner(
  condition: Condition,
  ctx: DecisionContext
): boolean {
  // 复合条件
  if (condition.type === 'and') {
    return condition.conditions.every((c) => evaluateConditionInner(c, ctx))
  }
  if (condition.type === 'or') {
    return condition.conditions.some((c) => evaluateConditionInner(c, ctx))
  }

  // 简单条件
  return evaluateStatCondition(condition, ctx)
}

function evaluateStatCondition(
  condition: StatCondition,
  ctx: DecisionContext
): boolean {
  switch (condition.type) {
    case 'gte':
      return getStatValue(ctx.stats, condition.stat) >= condition.value
    case 'lte':
      return getStatValue(ctx.stats, condition.stat) <= condition.value
    case 'eq':
      return getStatValue(ctx.stats, condition.stat) === condition.value
    case 'between':
      return (
        getStatValue(ctx.stats, condition.stat) >= condition.min &&
        getStatValue(ctx.stats, condition.stat) <= condition.max
      )
    case 'flag':
      return condition.has
        ? ctx.progress.storyFlags.includes(condition.flag)
        : !ctx.progress.storyFlags.includes(condition.flag)
    default:
      return false
  }
}

/** 读取数值（screenPresence 是枚举，单独处理） */
function getStatValue(stats: Stats, key: keyof Stats): number {
  if (key === 'screenPresence') {
    const map = { high: 100, medium: 50, low: 0 }
    return map[stats.screenPresence]
  }
  return stats[key] as number
}

/**
 * 过滤可见选项
 */
export function filterVisibleOptions(
  options: SceneOption[] | undefined,
  ctx: DecisionContext
): SceneOption[] {
  if (!options) return []
  return options.filter((opt) =>
    evaluateCondition(opt.condition, ctx)
  )
}

/**
 * 应用场景效果（不含 unlockAchievement 的副作用——由 store 处理）
 *
 * 阶段 6 修复：移除 extractEffects 死代码
 * - 它把 modifyRelationship 包装在 '*' key 上，与 SceneEffect.modifyRelationship
 *   的真实语义（Record<NPC ID, ...>）不符
 * - 经 grep 验证，0 个调用点
 * - 后续如需要纯函数抽取，请基于 applySceneEnter / applyDecision 复用
 */

/**
 * 选择决策（pure）
 * 返回下一步要执行的动作
 */
export interface DecisionResult {
  nextScene: string
  setFlags: string[]
  modifiedStats: Partial<Stats>
  unlockedAchievements: string[]
}

export function applyDecision(
  option: SceneOption,
  ctx: DecisionContext
): DecisionResult {
  // 校验选项是否可见（防止非法选择）
  if (!evaluateCondition(option.condition, ctx)) {
    throw new Error(
      `Decision option "${option.id}" is not available in current context`
    )
  }

  const result: DecisionResult = {
    nextScene: option.nextScene,
    setFlags: [],
    modifiedStats: {},
    unlockedAchievements: [],
  }

  // 1. 选项自带 setFlag
  if (option.setFlag) result.setFlags.push(option.setFlag)

  // 2. 选项自带 effect（Stats 字段直接进入 modifiedStats）
  //    注意：modifyRelationship 由 engine 在 dispatch 时单独处理
  //    阶段 6 修复：解构去掉 modifyRelationship，避免污染 modifiedStats
  //    （之前 Object.assign 会把 modifyRelationship 当作 Stats key 注入，造成 NaN 污染）
  if (option.effect) {
    const { modifyRelationship: _rel, ...statEffect } = option.effect
    Object.assign(result.modifiedStats, statEffect)
  }

  // 3. 阶段 6：选项可解锁成就
  if (option.unlockAchievement) result.unlockedAchievements.push(option.unlockAchievement)
  if (option.unlockAchievements) result.unlockedAchievements.push(...option.unlockAchievements)

  return result
}

/**
 * 应用场景进入效果
 *
 * 阶段 6 扩展：
 * - modifyRelationship 改为 Record<NPC ID, Partial<NPCRelationship>> 语义
 * - 提取 unlockAchievements（数组）而不仅是单数 unlockAchievement
 */
export function applySceneEnter(effect: SceneEffect | undefined): {
  setFlags: string[]
  modifiedStats: Partial<Stats>
  modifyRelationships: Record<string, Partial<NPCRelationship>>
  unlockedAchievements: string[]
} {
  if (!effect)
    return {
      setFlags: [],
      modifiedStats: {},
      modifyRelationships: {},
      unlockedAchievements: [],
    }
  const achievements: string[] = []
  if (effect.unlockAchievement) achievements.push(effect.unlockAchievement)
  if (effect.unlockAchievements) achievements.push(...effect.unlockAchievements)
  return {
    setFlags: effect.setFlags || [],
    modifiedStats: effect.modifyStats || {},
    modifyRelationships: effect.modifyRelationship || {},
    unlockedAchievements: achievements,
  }
}