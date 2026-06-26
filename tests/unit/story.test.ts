/**
 * 剧情数据单元测试
 */
import { describe, it, expect } from 'vitest'
import {
  ALL_SCENES,
  getScene,
  hasScene,
  getDayScenes,
  OPENING_SCENE_ID,
} from '@/data/story/story'

describe('剧情注册表', () => {
  it('起始场景存在', () => {
    expect(hasScene(OPENING_SCENE_ID)).toBe(true)
  })

  it('getScene 返回正确场景', () => {
    const scene = getScene(OPENING_SCENE_ID)
    expect(scene?.id).toBe(OPENING_SCENE_ID)
    expect(scene?.type).toBe('narration')
  })

  it('getScene 不存在时返回 undefined', () => {
    expect(getScene('nonexistent_scene')).toBeUndefined()
  })

  it('Day 1 场景数大于 5', () => {
    expect(getDayScenes(1).length).toBeGreaterThanOrEqual(5)
  })

  it('场景 ID 唯一', () => {
    const ids = Object.keys(ALL_SCENES)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('所有 scene.content 不为空', () => {
    for (const [id, scene] of Object.entries(ALL_SCENES)) {
      expect(scene.content.length, `Scene ${id} content 为空`).toBeGreaterThan(0)
    }
  })

  it('choice 场景必须有 options', () => {
    for (const [id, scene] of Object.entries(ALL_SCENES)) {
      if (scene.type === 'choice') {
        expect(scene.options, `Scene ${id} 缺少 options`).toBeDefined()
        expect(scene.options?.length, `Scene ${id} options 为空`).toBeGreaterThan(0)
      }
    }
  })

  it('所有 nextScene 引用必须存在', () => {
    for (const [id, scene] of Object.entries(ALL_SCENES)) {
      if (scene.autoNext) {
        expect(hasScene(scene.autoNext), `Scene ${id} 的 autoNext=${scene.autoNext} 不存在`).toBe(true)
      }
      scene.options?.forEach((opt) => {
        expect(
          hasScene(opt.nextScene),
          `Scene ${id} 的 option=${opt.id} 引用 ${opt.nextScene} 不存在`
        ).toBe(true)
      })
    }
  })
})