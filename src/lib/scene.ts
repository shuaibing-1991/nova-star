/**
 * 场景辅助工具
 */
import type { Scene, SceneOption } from '@/types'

/**
 * 判断场景是否需要用户操作
 */
export function isInteractive(scene: Scene): boolean {
  return scene.type === 'choice' && !!scene.options?.length
}

/**
 * 判断场景是否会终止流程（ending）
 */
export function isTerminal(scene: Scene): boolean {
  return scene.type === 'ending'
}

/**
 * 获取场景的预计时长（毫秒，用于自动播放估算）
 */
export function estimateSceneDuration(scene: Scene): number {
  if (scene.type === 'narration') {
    return scene.content.reduce(
      (sum, b) => sum + (b.duration ?? 2000),
      0
    )
  }
  if (scene.type === 'dialogue') {
    // 中文 50 字/秒（200ms/字）+ 1s 停顿
    return scene.content.reduce((sum, b) => {
      if (b.type === 'narration') return sum + (b.duration ?? 2000)
      const text = b.text ?? ''
      const readingTime = text.length * 200
      return sum + readingTime + 1000
    }, 0)
  }
  if (scene.type === 'choice') {
    return Infinity // 等待用户
  }
  return 3000
}

/**
 * 计算场景总内容块数（用于进度条）
 */
export function countContentBlocks(scene: Scene): number {
  return scene.content.length
}

/**
 * 获取场景的展示文本（用于无障碍）
 */
export function getSceneSummary(scene: Scene): string {
  const texts = scene.content
    .map((b) => b.text ?? '')
    .filter(Boolean)
    .join(' ')
  return texts.slice(0, 50) + (texts.length > 50 ? '...' : '')
}

/**
 * 类型守卫：choice 场景
 */
export function isChoiceScene(
  scene: Scene
): scene is Scene & { type: 'choice'; options: SceneOption[] } {
  return scene.type === 'choice' && !!scene.options?.length
}

/**
 * 类型守卫：narration/dialogue 场景
 */
export function isDialogueScene(scene: Scene): boolean {
  return scene.type === 'dialogue' || scene.type === 'narration'
}

/**
 * 类型守卫：ending 场景
 */
export function isTerminalScene(scene: Scene): boolean {
  return scene.type === 'ending'
}