/**
 * 音效桥接 Hook
 *
 * 阶段 9 Round 1 修复：
 * - 监听 settings.soundEnabled 变化，同步到 SoundEngine
 * - 全局 pointerdown 监听，懒初始化 AudioContext
 *
 * 使用：在 layout.tsx 顶层调用一次即可
 */
'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { getSoundEngine, setSoundEnabled } from '@/lib/sound'

export function useSoundBridge() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  // 同步 soundEnabled 到 SoundEngine
  useEffect(() => {
    setSoundEnabled(soundEnabled && !reducedMotion)
  }, [soundEnabled, reducedMotion])

  // 首次用户交互时初始化 AudioContext
  useEffect(() => {
    if (typeof window === 'undefined') return
    const engine = getSoundEngine()

    const handleFirstInteraction = () => {
      engine.init()
      // 首次 init 后可移除监听（节省开销）
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('pointerdown', handleFirstInteraction, {
      once: true,
      passive: true,
    })
    window.addEventListener('keydown', handleFirstInteraction, {
      once: true,
      passive: true,
    })

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])
}