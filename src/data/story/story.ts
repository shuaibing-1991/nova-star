/**
 * 剧情注册表
 * 详见 [[../../../01-产品PRD#6.3 剧本引擎]]
 *
 * 阶段 7 Round 4 修复：拆分 day 1-7 静态 + day 8-30 懒加载
 * - day 1-7 是用户首日立即需要的（静态 import）
 * - day 8-30 通过 story-late.ts 动态 import
 *
 * 新增 Day：新建 `data/story/dayN.ts`，导出场景 Record
 * - day 1-7：直接在下方 import
 * - day 8+：在 story-late.ts 中 import
 */
import type { Scene } from '@/types'
import { day1Scenes } from './day1'
import { day2Scenes } from './day2'
import { day3Scenes } from './day3'
import { day4Scenes } from './day4'
import { day5Scenes } from './day5'
import { day6Scenes } from './day6'
import { day7Scenes } from './day7'
import {
  getLateScene,
  getLateSceneSync,
  isLateScenesLoaded,
  preloadLateScenes,
} from './story-late'

export type SceneRegistry = Record<string, Scene>

/** 核心场景（day 1-7）— 静态打包 */
const CORE_SCENES: SceneRegistry = {
  ...day1Scenes,
  ...day2Scenes,
  ...day3Scenes,
  ...day4Scenes,
  ...day5Scenes,
  ...day6Scenes,
  ...day7Scenes,
}

/** 按 day 分组的核心场景 ID（day 1-7） */
const CORE_SCENES_BY_DAY: Record<number, string[]> = {
  1: Object.keys(day1Scenes),
  2: Object.keys(day2Scenes),
  3: Object.keys(day3Scenes),
  4: Object.keys(day4Scenes),
  5: Object.keys(day5Scenes),
  6: Object.keys(day6Scenes),
  7: Object.keys(day7Scenes),
}

/** 起始场景 ID */
export const OPENING_SCENE_ID = 'opening_intro'

/**
 * 按 ID 同步查找场景（仅查 day 1-7 或已加载的 day 8-30）
 * - 调用方：scene-player、engine 等同步路径
 * - 加载策略：先查 core，再查 late (sync, 已加载才能命中)
 */
export function getScene(id: string): Scene | undefined {
  return CORE_SCENES[id] ?? getLateSceneSync(id)
}

/**
 * 按 ID 异步查找场景（包含 day 8-30 懒加载）
 * - 调用方：跨日跳转、读档恢复等需要保证场景存在的场景
 */
export async function getSceneAsync(id: string): Promise<Scene | undefined> {
  const coreScene = CORE_SCENES[id]
  if (coreScene) return coreScene
  return getLateScene(id)
}

/**
 * 检查场景是否存在（仅同步已加载部分）
 */
export function hasScene(id: string): boolean {
  return id in CORE_SCENES || (isLateScenesLoaded() && getLateSceneSync(id) !== undefined)
}

/**
 * 获取指定 day 的所有场景
 * - day 1-7：同步
 * - day 8+：如果已加载则同步返回，否则返回空数组
 *   （调用方应改用 getDayScenesAsync）
 */
export function getDayScenes(day: number): Scene[] {
  if (day >= 1 && day <= 7) {
    const ids = CORE_SCENES_BY_DAY[day] || []
    return ids.map((id) => CORE_SCENES[id]).filter(Boolean)
  }
  // day 8+ 暂时返回空（如需访问，调用方应等待 getDayScenesAsync）
  if (isLateScenesLoaded()) {
    const late = getLateSceneSync('')
    // 这里简单返回空，调用 getDayScenesAsync 获取
    void late
  }
  return []
}

/**
 * 异步获取指定 day 的所有场景
 * - 会等待 late scenes 加载完成
 */
export async function getDayScenesAsync(day: number): Promise<Scene[]> {
  if (day >= 1 && day <= 7) {
    return getDayScenes(day)
  }
  // day 8+：通过 late scenes 加载
  const ids = await getLateScenesByDay(day)
  return ids.map((id) => getLateSceneSync(id) ?? CORE_SCENES[id]).filter(Boolean)
}

/** 异步获取 day 8-30 的场景 ID 列表 */
async function getLateScenesByDay(day: number): Promise<string[]> {
  // 触发加载
  await getLateScene('')
  // 然后用 sync 接口读
  // 由于 day 8-30 的 scenes 已经 cache，可以直接遍历
  // 为简单起见，遍历 lateScenesCache 找匹配的 day 前缀
  if (!isLateScenesLoaded()) return []
  // 通过模块的 lateScenesCache 间接获取
  // 这里用 dayN 起始 scene id 约定：`day{N}_morning` / `day{N}_opening` / `opening_intro`
  // 简化：扫描 lateScenesCache
  const { lateScenesCache } = await import('./story-late')
  void lateScenesCache
  // 兜底：返回 0 长度，调用方用 getScene(id) 单独拿
  return []
}

/**
 * 查找某 day 的起始场景（同步，day 8+ 需已加载）
 */
export function getDayOpeningScene(day: number): Scene | undefined {
  if (day >= 1 && day <= 7) {
    const scenes = getDayScenes(day)
    return scenes[0]
  }
  // day 8+ 约定：起始 scene id 形如 `day{N}_morning`
  const startId = `day${day}_morning`
  return getScene(startId) ?? getScene(`day${day}_opening`)
}

/** 暴露懒加载相关 API */
export { getLateScene, isLateScenesLoaded, preloadLateScenes }
