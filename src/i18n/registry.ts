/**
 * i18n 注册表
 *
 * 阶段 9 Round 1 新增：支持的语言包注册
 */
import { zhCN } from './messages/zh-CN'
import { enUS } from './messages/en-US'

export type Locale = 'zh-CN' | 'en-US'

export const locales: Record<Locale, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const defaultLocale: Locale = 'zh-CN'

export const localeLabels: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
}

/**
 * 浏览器自动检测
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale

  const lang = navigator.language?.toLowerCase() || ''
  if (lang.startsWith('zh')) return 'zh-CN'
  if (lang.startsWith('en')) return 'en-US'
  return defaultLocale
}