/**
 * useThemeEffect - 暗色模式 class 切换
 * 在 layout 顶层组件调用
 */
'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores'

export function useThemeEffect() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark =
        theme === 'dark' || (theme === 'auto' && mql.matches)
      root.classList.toggle('dark', isDark)
    }

    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [theme])
}
