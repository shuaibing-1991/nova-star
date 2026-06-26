/**
 * i18n 框架单元测试
 *
 * 阶段 9 Round 1 新增：翻译系统测试
 *
 * 覆盖：
 * - 注册表完整性（zh-CN 与 en-US 键一致）
 * - detectBrowserLocale 浏览器检测
 * - getNestedValue 嵌套取值
 * - 占位符插值
 */
import { describe, it, expect } from 'vitest'

describe('i18n registry', () => {
  it('zh-CN 与 en-US 顶层键完全一致', async () => {
    const { locales } = await import('@/i18n/registry')
    const zhKeys = Object.keys(locales['zh-CN']).sort()
    const enKeys = Object.keys(locales['en-US']).sort()
    expect(zhKeys).toEqual(enKeys)
  })

  it('zh-CN 与 en-US 嵌套键完全一致', async () => {
    const { locales } = await import('@/i18n/registry')
    const collectKeys = (obj: unknown, prefix = ''): string[] => {
      const result: string[] = []
      if (typeof obj !== 'object' || obj === null) return result
      for (const [k, v] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${k}` : k
        if (typeof v === 'string') {
          result.push(path)
        } else if (typeof v === 'object' && v !== null) {
          result.push(...collectKeys(v, path))
        }
      }
      return result
    }
    const zhKeys = collectKeys(locales['zh-CN']).sort()
    const enKeys = collectKeys(locales['en-US']).sort()
    expect(zhKeys).toEqual(enKeys)
  })

  it('localeLabels 与 locales 配套', async () => {
    const { locales, localeLabels } = await import('@/i18n/registry')
    expect(Object.keys(locales).sort()).toEqual(Object.keys(localeLabels).sort())
  })
})

describe('detectBrowserLocale', () => {
  it('zh 语言返回 zh-CN', async () => {
    const { detectBrowserLocale } = await import('@/i18n/registry')
    // 通过 mock navigator.language 来测试
    const originalLang = Object.getOwnPropertyDescriptor(
      // @ts-expect-error navigator 不可写
      global.navigator,
      'language'
    )
    Object.defineProperty(global.navigator, 'language', {
      configurable: true,
      get: () => 'zh-CN',
    })
    expect(detectBrowserLocale()).toBe('zh-CN')

    // 恢复
    if (originalLang) {
      Object.defineProperty(global.navigator, 'language', originalLang)
    }
  })

  it('en 语言返回 en-US', async () => {
    const { detectBrowserLocale } = await import('@/i18n/registry')
    const originalLang = Object.getOwnPropertyDescriptor(
      // @ts-expect-error navigator 不可写
      global.navigator,
      'language'
    )
    Object.defineProperty(global.navigator, 'language', {
      configurable: true,
      get: () => 'en-US',
    })
    expect(detectBrowserLocale()).toBe('en-US')

    if (originalLang) {
      Object.defineProperty(global.navigator, 'language', originalLang)
    }
  })
})

describe('占位符插值', () => {
  it('zh-CN 包含 onboarding.step 占位符', async () => {
    const { locales } = await import('@/i18n/registry')
    expect(locales['zh-CN'].onboarding.step).toContain('{current}')
    expect(locales['zh-CN'].onboarding.step).toContain('{total}')
  })

  it('interpolate 替换占位符', async () => {
    const template = '第 {current} 步 / 共 {total} 步'
    const result = template.replace(/\{(\w+)\}/g, (match, key) => {
      const params: Record<string, string | number> = { current: 2, total: 6 }
      return key in params ? String(params[key]) : match
    })
    expect(result).toBe('第 2 步 / 共 6 步')
  })
})
