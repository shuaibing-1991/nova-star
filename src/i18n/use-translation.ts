/**
 * 翻译 Hook
 *
 * 阶段 9 Round 1 新增：轻量级 i18n 实现
 *
 * 用法：
 * ```tsx
 * const t = useTranslation()
 * <button>{t('common.confirm')}</button>
 * <p>{t('onboarding.step', { current: 1, total: 6 })}</p>
 * ```
 */
'use client'

import { useMemo } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { locales, defaultLocale, type Locale } from './registry'
import type { Messages } from './messages/zh-CN'

// 类型：路径 → 值
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends string
          ? K
          : T[K] extends object
          ? `${K}.${DeepKeys<T[K]>}`
          : never
        : never
    }[keyof T]
  : never

export type TranslationKey = DeepKeys<Messages>

/**
 * 获取嵌套值
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

/**
 * 替换占位符 {key}
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match
  })
}

/**
 * 翻译 Hook
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language)

  return useMemo(() => {
    const messages = locales[language as Locale] || locales[defaultLocale]

    const t = (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const value = getNestedValue(messages, key)
      if (value === undefined) {
        // 缺翻译时返回 key（开发期可见）
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] Missing translation: ${key}`)
        }
        return key
      }
      return interpolate(value, params)
    }

    return t
  }, [language])
}