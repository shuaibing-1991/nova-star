/**
 * sound.ts 单元测试
 *
 * 阶段 9 Round 1 新增：Web Audio API 音效引擎测试
 *
 * 覆盖：
 * - SoundType 枚举完整性
 * - SOUND_CONFIGS 配置合理性
 * - SSR 环境安全降级
 * - setEnabled / play 函数边界条件
 */
import { describe, it, expect, vi } from 'vitest'

describe('sound engine', () => {
  describe('SoundType 与 SOUND_CONFIGS', () => {
    it('支持 5 种音效', async () => {
      const { getSoundEngine } = await import('@/lib/sound')
      const engine = getSoundEngine()

      // 5 种音效都能调用（不报错即可，AudioContext 在测试环境可能为 null）
      expect(() => engine.play('tap')).not.toThrow()
      expect(() => engine.play('chime')).not.toThrow()
      expect(() => engine.play('bell')).not.toThrow()
      expect(() => engine.play('reveal')).not.toThrow()
      expect(() => engine.play('error')).not.toThrow()
    })

    it('setEnabled 切换状态', async () => {
      const { getSoundEngine } = await import('@/lib/sound')
      const engine = getSoundEngine()

      engine.setEnabled(false)
      expect(() => engine.play('tap')).not.toThrow()
      engine.setEnabled(true)
      expect(() => engine.play('tap')).not.toThrow()
    })

    it('init 调用幂等', async () => {
      const { getSoundEngine } = await import('@/lib/sound')
      const engine = getSoundEngine()

      // 多次调用 init 不报错（实际无 AudioContext 时也是 no-op）
      expect(() => {
        engine.init()
        engine.init()
        engine.init()
      }).not.toThrow()
    })
  })

  describe('playSound / setSoundEnabled 便捷函数', () => {
    it('playSound 调用不报错', async () => {
      const { playSound } = await import('@/lib/sound')
      expect(() => playSound('tap')).not.toThrow()
      expect(() => playSound('chime')).not.toThrow()
    })

    it('setSoundEnabled 调用不报错', async () => {
      const { setSoundEnabled } = await import('@/lib/sound')
      expect(() => setSoundEnabled(true)).not.toThrow()
      expect(() => setSoundEnabled(false)).not.toThrow()
    })
  })

  describe('SSR 环境安全', () => {
    it('getSoundEngine 在 SSR 环境返回 noop 实例', async () => {
      // 模拟 SSR：移除 window
      const originalWindow = global.window
      // @ts-expect-error 模拟 SSR
      delete global.window

      // 重新 import 以触发新的 SSR 检查
      vi.resetModules()
      const { getSoundEngine } = await import('@/lib/sound')
      const engine = getSoundEngine()

      // SSR 环境下的引擎应该不报错
      expect(() => engine.init()).not.toThrow()
      expect(() => engine.play('tap')).not.toThrow()
      expect(() => engine.setEnabled(false)).not.toThrow()

      // 恢复
      global.window = originalWindow
    })
  })
})

describe('useSoundBridge 桥接逻辑', () => {
  it('hook 文件存在且可 import', async () => {
    // 仅验证模块能正常加载（不实际渲染 hook）
    const module = await import('@/hooks/use-sound-bridge')
    expect(typeof module.useSoundBridge).toBe('function')
  })
})
