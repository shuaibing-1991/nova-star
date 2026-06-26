/**
 * Day 8-30 剧情懒加载模块
 *
 * 阶段 7 Round 4 修复：
 * - 之前 30 天剧情全部打入首屏 bundle
 * - 拆分为 core（day 1-7）+ late（day 8-30）双 chunk
 * - day 1-7 是用户首日立即需要的，必须静态导入
 * - day 8-30 在用户进入 day 7 当晚或主动触发时按需加载
 */
import type { Scene } from '@/types'

export type SceneRegistry = Record<string, Scene>

/** 懒加载后的 late scenes（首次访问后缓存） */
let lateScenesCache: SceneRegistry | null = null
let lateLoadingPromise: Promise<SceneRegistry> | null = null

/**
 * 动态 import day 8-30 的所有场景
 * - 首次调用触发 import，后续调用复用 promise
 * - webpack 会把每个 day 文件打成独立 chunk
 */
async function loadLateScenes(): Promise<SceneRegistry> {
  if (lateScenesCache) return lateScenesCache
  if (lateLoadingPromise) return lateLoadingPromise

  lateLoadingPromise = (async () => {
    const [day8, day9, day10, day11, day12, day13, day14, day15, day16, day17, day18, day19, day20, day21, day22, day23, day24, day25, day26, day27, day28, day29, day30] =
      await Promise.all([
        import('./day8').then((m) => m.day8Scenes),
        import('./day9').then((m) => m.day9Scenes),
        import('./day10').then((m) => m.day10Scenes),
        import('./day11').then((m) => m.day11Scenes),
        import('./day12').then((m) => m.day12Scenes),
        import('./day13').then((m) => m.day13Scenes),
        import('./day14').then((m) => m.day14Scenes),
        import('./day15').then((m) => m.day15Scenes),
        import('./day16').then((m) => m.day16Scenes),
        import('./day17').then((m) => m.day17Scenes),
        import('./day18').then((m) => m.day18Scenes),
        import('./day19').then((m) => m.day19Scenes),
        import('./day20').then((m) => m.day20Scenes),
        import('./day21').then((m) => m.day21Scenes),
        import('./day22').then((m) => m.day22Scenes),
        import('./day23').then((m) => m.day23Scenes),
        import('./day24').then((m) => m.day24Scenes),
        import('./day25').then((m) => m.day25Scenes),
        import('./day26').then((m) => m.day26Scenes),
        import('./day27').then((m) => m.day27Scenes),
        import('./day28').then((m) => m.day28Scenes),
        import('./day29').then((m) => m.day29Scenes),
        import('./day30').then((m) => m.day30Scenes),
      ])
    const merged: SceneRegistry = {
      ...day8, ...day9, ...day10, ...day11, ...day12, ...day13, ...day14,
      ...day15, ...day16, ...day17, ...day18, ...day19, ...day20, ...day21,
      ...day22, ...day23, ...day24, ...day25, ...day26, ...day27, ...day28,
      ...day29, ...day30,
    }
    lateScenesCache = merged
    return merged
  })()

  return lateLoadingPromise
}

/**
 * 同步查找 late scenes 中的场景（仅在已加载后可用）
 * 返回 undefined 表示未找到或未加载
 */
export function getLateSceneSync(id: string): Scene | undefined {
  return lateScenesCache?.[id]
}

/**
 * 异步查找 late scenes
 * - 用户进入 day 7 晚上或 day 8+ 时调用
 * - 等待 late scenes 加载完成
 */
export async function getLateScene(id: string): Promise<Scene | undefined> {
  const scenes = await loadLateScenes()
  return scenes[id]
}

/**
 * 预加载 late scenes（不阻塞主流程）
 * - 可以在 day 5 或 day 6 时预热，让用户在 day 7 晚上/8 早上无感切换
 */
export function preloadLateScenes(): void {
  if (!lateScenesCache && !lateLoadingPromise) {
    loadLateScenes().catch(() => {
      // 预加载失败静默
    })
  }
}

/** 检查 late scenes 是否已加载 */
export function isLateScenesLoaded(): boolean {
  return lateScenesCache !== null
}
