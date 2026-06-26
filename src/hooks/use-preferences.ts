/**
 * usePreferences - 统一的应用偏好 hook
 * 阶段 7 Round 1 修复：
 * - 合并 OS 偏好 + 应用内设置
 * - 提供 useReducedMotion / useMotionEnabled / useVibrationEnabled / useFontSize
 * - 修复「设置了但不生效」的 0-1 bug
 */
'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { usePrefersReducedMotion } from './use-media-query'

/**
 * 是否启用减少动效
 * 优先级：应用设置 reducedMotion OR OS 偏好 prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  const appReduced = useSettingsStore((s) => s.reducedMotion)
  const osReduced = usePrefersReducedMotion()
  return appReduced || osReduced
}

/**
 * 是否启用动效（与 reducedMotion 反向）
 * - motionEnabled = false → 全部关闭
 * - reducedMotion = true → 全部关闭
 * - OS 偏好减少动效 → 全部关闭
 */
export function useMotionEnabled(): boolean {
  const appEnabled = useSettingsStore((s) => s.motionEnabled)
  const reducedMotion = useReducedMotion()
  return appEnabled && !reducedMotion
}

/**
 * 是否启用振动
 * 当前仅应用内开关（OS 没有 navigator.vibrate 的偏好查询）
 */
export function useVibrationEnabled(): boolean {
  return useSettingsStore((s) => s.vibrationEnabled)
}

/**
 * 字号档位（受 settings.fontSize 控制）
 * 通过 useFontSizeRoot hook 实际应用到 html 根字号
 */
export type FontSizeLevel = 'small' | 'medium' | 'large'

const FONT_SIZE_MAP: Record<FontSizeLevel, number> = {
  // 根 html 字号（px），body 用 rem 派生
  small: 14,
  medium: 16,
  large: 18,
}

export const FONT_SIZE_ROOT_PX = FONT_SIZE_MAP

/**
 * 获取当前字号档位
 */
export function useFontSize(): FontSizeLevel {
  return useSettingsStore((s) => s.fontSize)
}

/**
 * 将 settings.fontSize 实际写到 html 根字号
 * 必须在根布局（layout.tsx）调用一次
 */
export function useFontSizeRoot(): void {
  const fontSize = useFontSize()
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('font-size', `${FONT_SIZE_MAP[fontSize]}px`)
  }, [fontSize])
}
