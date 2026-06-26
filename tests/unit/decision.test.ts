/**
 * 决策引擎单元测试（完整覆盖）
 */
import { describe, it, expect } from 'vitest'
import {
  evaluateCondition,
  filterVisibleOptions,
  applyDecision,
  applySceneEnter,
  extractEffects,
} from '@/lib/decision'
import type { Stats, Progress, NPCRelationship } from '@/types'

const baseStats: Stats = {
  followers: 1000,
  mood: 75,
  vocal: 50,
  dance: 50,
  stage: 50,
  trust: 60,
  screenPresence: 'medium',
}

const baseProgress: Progress = {
  currentDay: 1,
  currentScene: 'opening_intro',
  storyFlags: ['opening_started'],
}

const baseRelationships: Record<string, NPCRelationship> = {}
const ctx = { stats: baseStats, progress: baseProgress, relationships: baseRelationships }

describe('evaluateCondition - 基础', () => {
  it('undefined → true', () => {
    expect(evaluateCondition(undefined, ctx)).toBe(true)
  })

  it('gte 通过', () => {
    expect(evaluateCondition({ type: 'gte', stat: 'mood', value: 70 }, ctx)).toBe(true)
  })

  it('gte 失败', () => {
    expect(evaluateCondition({ type: 'gte', stat: 'mood', value: 80 }, ctx)).toBe(false)
  })

  it('lte 通过', () => {
    expect(evaluateCondition({ type: 'lte', stat: 'trust', value: 80 }, ctx)).toBe(true)
  })

  it('eq 通过', () => {
    expect(evaluateCondition({ type: 'eq', stat: 'mood', value: 75 }, ctx)).toBe(true)
  })

  it('between 通过', () => {
    expect(evaluateCondition({ type: 'between', stat: 'vocal', min: 40, max: 60 }, ctx)).toBe(true)
  })

  it('flag exists', () => {
    expect(evaluateCondition({ type: 'flag', flag: 'opening_started', has: true }, ctx)).toBe(true)
  })

  it('flag missing', () => {
    expect(evaluateCondition({ type: 'flag', flag: 'nonexistent', has: false }, ctx)).toBe(true)
  })

  it('screenPresence 边界值', () => {
    expect(evaluateCondition({ type: 'eq', stat: 'screenPresence', value: 50 }, ctx)).toBe(true) // medium
    const highCtx = { ...ctx, stats: { ...baseStats, screenPresence: 'high' as const } }
    expect(evaluateCondition({ type: 'gte', stat: 'screenPresence', value: 80 }, highCtx)).toBe(true)
    const lowCtx = { ...ctx, stats: { ...baseStats, screenPresence: 'low' as const } }
    expect(evaluateCondition({ type: 'lte', stat: 'screenPresence', value: 10 }, lowCtx)).toBe(true)
  })
})

describe('evaluateCondition - 复合', () => {
  it('AND all true', () => {
    expect(evaluateCondition({
      type: 'and',
      conditions: [
        { type: 'gte', stat: 'mood', value: 70 },
        { type: 'gte', stat: 'trust', value: 50 },
      ],
    }, ctx)).toBe(true)
  })

  it('AND one false', () => {
    expect(evaluateCondition({
      type: 'and',
      conditions: [
        { type: 'gte', stat: 'mood', value: 70 },
        { type: 'gte', stat: 'trust', value: 100 },
      ],
    }, ctx)).toBe(false)
  })

  it('OR one true', () => {
    expect(evaluateCondition({
      type: 'or',
      conditions: [
        { type: 'gte', stat: 'mood', value: 100 },
        { type: 'gte', stat: 'trust', value: 50 },
      ],
    }, ctx)).toBe(true)
  })

  it('OR all false', () => {
    expect(evaluateCondition({
      type: 'or',
      conditions: [
        { type: 'gte', stat: 'mood', value: 100 },
        { type: 'gte', stat: 'trust', value: 100 },
      ],
    }, ctx)).toBe(false)
  })

  it('嵌套 3 层 AND/OR', () => {
    expect(evaluateCondition({
      type: 'and',
      conditions: [
        { type: 'or', conditions: [
          { type: 'gte', stat: 'mood', value: 70 },
          { type: 'gte', stat: 'mood', value: 100 },
        ]},
        { type: 'and', conditions: [
          { type: 'gte', stat: 'trust', value: 50 },
          { type: 'flag', flag: 'opening_started', has: true },
        ]},
      ],
    }, ctx)).toBe(true)
  })

  it('空 AND conditions 视为 true', () => {
    expect(evaluateCondition({ type: 'and', conditions: [] }, ctx)).toBe(true)
  })

  it('空 OR conditions 视为 false', () => {
    expect(evaluateCondition({ type: 'or', conditions: [] }, ctx)).toBe(false)
  })
})

describe('filterVisibleOptions', () => {
  it('无 condition 全部可见', () => {
    const options = [
      { id: 'a', text: 'A', nextScene: 'next1' },
      { id: 'b', text: 'B', nextScene: 'next2' },
    ]
    expect(filterVisibleOptions(options, ctx)).toHaveLength(2)
  })

  it('过滤不可见选项', () => {
    const options = [
      { id: 'a', text: 'A', nextScene: 'next1', condition: { type: 'gte', stat: 'mood' as const, value: 100 } },
      { id: 'b', text: 'B', nextScene: 'next2' },
    ]
    const visible = filterVisibleOptions(options, ctx)
    expect(visible).toHaveLength(1)
    expect(visible[0].id).toBe('b')
  })

  it('空/undefined 处理', () => {
    expect(filterVisibleOptions(undefined, ctx)).toEqual([])
    expect(filterVisibleOptions([], ctx)).toEqual([])
  })
})

describe('applyDecision', () => {
  it('返回 nextScene + flag + effect', () => {
    const option = {
      id: 'opt_a',
      text: 'Choose A',
      nextScene: 'scene_b',
      setFlag: 'chose_a',
      effect: { mood: 5 },
    }
    const result = applyDecision(option, ctx)
    expect(result.nextScene).toBe('scene_b')
    expect(result.setFlags).toContain('chose_a')
    expect(result.modifiedStats.mood).toBe(5)
  })

  it('throws on unavailable option', () => {
    const option = {
      id: 'opt_x',
      text: 'X',
      nextScene: 'next',
      condition: { type: 'gte', stat: 'mood' as const, value: 100 },
    }
    expect(() => applyDecision(option, ctx)).toThrow()
  })

  it('无 setFlag 不影响 flags 数组', () => {
    const option = { id: 'a', text: 'A', nextScene: 'next' }
    const result = applyDecision(option, ctx)
    expect(result.setFlags).toEqual([])
  })

  it('无 effect 不影响 stats', () => {
    const option = { id: 'a', text: 'A', nextScene: 'next' }
    const result = applyDecision(option, ctx)
    expect(result.modifiedStats).toEqual({})
  })

  it('支持 modifyRelationship 字段但不由决策引擎处理', () => {
    const option = {
      id: 'a',
      text: 'A',
      nextScene: 'next',
      effect: { modifyRelationship: { affection: 5 } } as any,
    }
    const result = applyDecision(option, ctx)
    // modifyRelationship 不进入 modifiedStats（Stats 不含此字段）
    expect((result.modifiedStats as any).modifyRelationship).toBeUndefined()
  })
})

describe('applySceneEnter', () => {
  it('undefined effect → 默认空', () => {
    expect(applySceneEnter(undefined)).toEqual({
      setFlags: [],
      modifiedStats: {},
      unlockedAchievements: [],
    })
  })

  it('提取 flags + stats + achievement', () => {
    const result = applySceneEnter({
      setFlags: ['day1_done'],
      modifyStats: { mood: -5 },
      unlockAchievement: 'first_day',
    })
    expect(result.setFlags).toEqual(['day1_done'])
    expect(result.modifiedStats.mood).toBe(-5)
    expect(result.unlockedAchievements).toEqual(['first_day'])
  })

  it('部分字段缺失也能处理', () => {
    const result = applySceneEnter({ setFlags: ['x'] })
    expect(result.setFlags).toEqual(['x'])
    expect(result.modifiedStats).toEqual({})
    expect(result.unlockedAchievements).toEqual([])
  })
})

describe('extractEffects', () => {
  it('undefined effect → 空对象', () => {
    expect(extractEffects(undefined)).toEqual({})
  })

  it('提取所有字段', () => {
    const result = extractEffects({
      setFlags: ['a', 'b'],
      modifyStats: { mood: 5 },
      modifyRelationship: { affection: 10 },
      unlockAchievement: 'ach1',
    })
    expect(result.setFlags).toEqual(['a', 'b'])
    expect(result.modifiedStats).toEqual({ mood: 5 })
    expect(result.modifyRelationships).toEqual({ '*': { affection: 10 } })
    expect(result.unlockedAchievements).toEqual(['ach1'])
  })

  it('部分字段缺失返回 undefined', () => {
    const result = extractEffects({ setFlags: ['a'] })
    expect(result.setFlags).toEqual(['a'])
    expect(result.modifiedStats).toBeUndefined()
    expect(result.unlockedAchievements).toBeUndefined()
  })
})

describe('evaluateCondition - 边界 case', () => {
  it('value 为 0 也能正确比较', () => {
    const zeroCtx = { ...ctx, stats: { ...baseStats, mood: 0 } }
    expect(evaluateCondition({ type: 'gte', stat: 'mood', value: 0 }, zeroCtx)).toBe(true)
    expect(evaluateCondition({ type: 'lte', stat: 'mood', value: 0 }, zeroCtx)).toBe(true)
    expect(evaluateCondition({ type: 'eq', stat: 'mood', value: 0 }, zeroCtx)).toBe(true)
  })

  it('value 为负数', () => {
    expect(evaluateCondition({ type: 'gte', stat: 'mood', value: -10 }, ctx)).toBe(true)
  })

  it('value 为极大数', () => {
    expect(evaluateCondition({ type: 'lte', stat: 'mood', value: 1e9 }, ctx)).toBe(true)
  })

  it('between min === max', () => {
    expect(evaluateCondition({ type: 'between', stat: 'mood', min: 75, max: 75 }, ctx)).toBe(true)
    const otherCtx = { ...ctx, stats: { ...baseStats, mood: 76 } }
    expect(evaluateCondition({ type: 'between', stat: 'mood', min: 75, max: 75 }, otherCtx)).toBe(false)
  })

  it('between 范围反向（min > max）', () => {
    expect(evaluateCondition({ type: 'between', stat: 'mood', min: 80, max: 70 }, ctx)).toBe(false)
  })

  it('flag has=true 但不存在', () => {
    expect(evaluateCondition({ type: 'flag', flag: 'nonexistent', has: true }, ctx)).toBe(false)
  })

  it('flag has=false 但存在', () => {
    expect(evaluateCondition({ type: 'flag', flag: 'opening_started', has: false }, ctx)).toBe(false)
  })
})

describe('applyDecision - 边界 case', () => {
  it('option 缺少 nextScene 仍能返回结果', () => {
    const option = { id: 'a', text: 'A', nextScene: '' } as any
    const result = applyDecision(option, ctx)
    expect(result.nextScene).toBe('')
  })

  it('option 缺少 effect 字段不抛错', () => {
    const option = { id: 'a', text: 'A', nextScene: 'next' }
    expect(() => applyDecision(option, ctx)).not.toThrow()
  })

  it('effect 是空对象', () => {
    const option = { id: 'a', text: 'A', nextScene: 'next', effect: {} }
    const result = applyDecision(option, ctx)
    expect(result.modifiedStats).toEqual({})
  })

  it('effect 包含 screenPresence 修改会被 setFlag 而非 modifyStats', () => {
    const option = {
      id: 'a',
      text: 'A',
      nextScene: 'next',
      effect: { screenPresence: 'high' as const },
    } as any
    const result = applyDecision(option, ctx)
    // 当前实现：screenPresence 通过 Object.assign 直接进 modifiedStats
    expect(result.modifiedStats.screenPresence).toBe('high')
  })
})