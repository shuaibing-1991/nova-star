/**
 * ThemeProvider - 主题效果容器（在 layout 顶层使用）
 */
'use client'

import { useThemeEffect } from '@/hooks'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useThemeEffect()
  return <>{children}</>
}
