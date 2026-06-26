/**
 * FontSizeRoot - 把 settings.fontSize 应用到 html 根字号
 *
 * 阶段 7 Round 1 修复：
 * - 之前 settings.fontSize 字段无任何消费方
 * - 渲染一个不可见组件，副作用写入 document.documentElement.style.fontSize
 * - 必须挂在 RootLayout 顶层（ThemeProvider 内）
 */
'use client'

import { useFontSizeRoot } from '@/hooks/use-preferences'

export function FontSizeRoot() {
  useFontSizeRoot()
  return null
}
