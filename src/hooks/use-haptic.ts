/**
 * 触觉反馈 Hook（移动 WebView 友好）
 *
 * 用 navigator.vibrate API，封装为 3 个级别：
 * - light：10ms 轻触（选项点击、Tab 切换）
 * - medium：20ms 中触（点赞、收藏、关键选择）
 * - heavy：40ms 重触（长按、关键确认）
 *
 * 浏览器不支持 vibrate 时静默 fail（不影响业务）。
 *
 * 阶段 7 Round 1 修复：所有触发都受 settings.vibrationEnabled 控制。
 * - hook 触发：通过 useSettingsStore 订阅
 * - 全局 haptic 对象：每次调用时动态读取最新设置
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settings'

type HapticLevel = 'light' | 'medium' | 'heavy'

const VIBRATION_PATTERNS: Record<HapticLevel, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
}

/** 当前 settings.vibrationEnabled + 浏览器支持 综合判断 */
function canVibrate(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return false
  }
  // 每次读取最新设置（zustand store 的 getState 不会触发订阅）
  return useSettingsStore.getState().vibrationEnabled
}

function safeVibrate(pattern: number | number[]) {
  try {
    navigator.vibrate(pattern)
  } catch {
    // 静默 fail
  }
}

export function useHaptic() {
  const [supported, setSupported] = useState(false)
  // 订阅设置变化，保持 hook 内 supported 同步
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled)

  useEffect(() => {
    const apiOk =
      typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
    setSupported(apiOk && vibrationEnabled)
  }, [vibrationEnabled])

  const trigger = useCallback(
    (level: HapticLevel = 'light') => {
      if (!vibrationEnabled) return
      if (typeof navigator === 'undefined' || !navigator.vibrate) return
      safeVibrate(VIBRATION_PATTERNS[level])
    },
    [vibrationEnabled]
  )

  return { trigger, supported }
}

/**
 * 全局便捷调用（无需 hook 上下文）
 * 阶段 7 Round 1 修复：动态读取 settings.vibrationEnabled
 */
export const haptic = {
  light: () => {
    if (!canVibrate()) return
    safeVibrate(VIBRATION_PATTERNS.light)
  },
  medium: () => {
    if (!canVibrate()) return
    safeVibrate(VIBRATION_PATTERNS.medium)
  },
  heavy: () => {
    if (!canVibrate()) return
    safeVibrate(VIBRATION_PATTERNS.heavy)
  },
}
