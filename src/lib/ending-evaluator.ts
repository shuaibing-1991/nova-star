/**
 * 结局评估器
 *
 * Day 30 收尾时调用，根据数值 + 关系 + flag 决定 4 个结局之一
 * 详见 [[../../../01-产品PRD#6.20 模块 9：结局系统]]
 */
import type { Stats } from '@/types'

export type EndingType = 'success' | 'neutral' | 'failure' | 'hidden'

/** 评分公式（PRD 6.20） */
export function computeShowcaseScore(stats: Stats): number {
  return (
    stats.vocal * 0.3 +
    stats.dance * 0.3 +
    stats.stage * 0.4
  )
}

/** 红线 flag（前缀匹配） */
const RED_LINE_PREFIXES = ['public_misconduct', 'breach_contract', 'betray_team']

/** 隐藏结局所需羁绊 flag（4 个） */
const HIDDEN_BOND_FLAGS = [
  'nervous_first_meeting',
  'interested_in_zhou_yan',
  'praised_shen_yao',
  'deep_listen',
] as const

/** 5 个核心 NPC ID（隐藏结局需全部 affection ≥ 80） */
const FIVE_CORE_NPCS = [
  'han_zhi_en',
  'xu_jia_shu',
  'zhou_yan',
  'shen_yao',
  'lin_xia',
] as const

/**
 * 检查红线 flag
 */
export function hasRedLineFlag(state: any): boolean {
  return state.progress.storyFlags.some((f: string) =>
    RED_LINE_PREFIXES.some((p) => f === p || f.startsWith(p + ':'))
  )
}

/**
 * 检查隐藏结局条件
 *
 * 全部满足：
 * 1. 5 个核心 NPC 好感全部 ≥ 80
 * 2. 4 个羁绊 flag 全部解锁
 * 3. showcase_score ≥ 75
 * 4. 完成 Day 25（剧情推进标记 `day25_complete`）
 */
export function checkHiddenEndingConditions(state: any): boolean {
  // 1. 5 个 NPC 好感 ≥ 80
  const allAffectionOK = FIVE_CORE_NPCS.every((id) => {
    const r = state.relationships[id]
    return !!r && r.affection >= 80
  })
  if (!allAffectionOK) return false

  // 2. 4 个羁绊 flag
  const allFlagsOK = HIDDEN_BOND_FLAGS.every((flag) =>
    state.progress.storyFlags.includes(flag)
  )
  if (!allFlagsOK) return false

  // 3. showcase_score ≥ 75
  const score = computeShowcaseScore(state.stats)
  if (score < 75) return false

  // 4. Day 25 完成
  if (!state.progress.storyFlags.includes('day25_complete')) return false

  return true
}

/**
 * 检查成功结局条件
 *
 * 全部满足：
 * 1. showcase_score ≥ 80
 * 2. followers ≥ 30,000
 * 3. mood ≥ 70
 * 4. 无红线 flag
 */
export function checkSuccessEndingConditions(state: any): boolean {
  const score = computeShowcaseScore(state.stats)
  if (score < 80) return false
  if (state.stats.followers < 30_000) return false
  if (state.stats.mood < 70) return false
  if (hasRedLineFlag(state)) return false
  return true
}

/**
 * 检查失败结局条件（任一满足）
 *
 * 1. showcase_score < 60
 * 2. followers < 5,000
 * 3. mood < 20
 * 4. 红线 flag
 */
export function checkFailureEndingConditions(state: any): boolean {
  const score = computeShowcaseScore(state.stats)
  if (score < 60) return true
  if (state.stats.followers < 5_000) return true
  if (state.stats.mood < 20) return true
  if (hasRedLineFlag(state)) return true
  return false
}

/**
 * 主入口：评估结局类型
 *
 * 优先级：
 * 1. 隐藏结局（条件最严）
 * 2. 失败结局（任一红线）
 * 3. 成功结局（全部达标）
 * 4. 中等结局（兜底）
 */
export function evaluateEnding(state: any): EndingType {
  // 1. 隐藏结局
  if (checkHiddenEndingConditions(state)) return 'hidden'

  // 2. 失败结局
  if (checkFailureEndingConditions(state)) return 'failure'

  // 3. 成功结局
  if (checkSuccessEndingConditions(state)) return 'success'

  // 4. 中等结局（兜底）
  return 'neutral'
}

/**
 * 取得结局对应的路由路径
 */
export function getEndingRoute(ending: EndingType): string {
  return `/ending/${ending}`
}

/**
 * 取得结局的标题（用于结局页）
 */
export function getEndingTitle(ending: EndingType): string {
  switch (ending) {
    case 'success':
      return 'LUMINA 正式出道'
    case 'neutral':
      return '成为预备艺人'
    case 'failure':
      return '错过来临的机会'
    case 'hidden':
      return '另一个开始'
  }
}

/**
 * 取得结局的副标题
 */
export function getEndingSubtitle(ending: EndingType): string {
  switch (ending) {
    case 'success':
      return '30 天的努力，在这一刻被看见。'
    case 'neutral':
      return '舞台暂时关闭，但故事没有结束。'
    case 'failure':
      return '你错过了这次机会，但下一次会不同。'
    case 'hidden':
      return '在光环之外，你找到了真正的自己。'
  }
}

/**
 * 取得结局对应解锁的成就 ID（用于结局页"分享"）
 */
export function getEndingAchievementId(ending: EndingType): string {
  switch (ending) {
    case 'success':
      return 'ending_success'
    case 'neutral':
      return 'ending_neutral'
    case 'failure':
      return 'ending_failure'
    case 'hidden':
      return 'ending_hidden'
  }
}
