/**
 * analytics.ts 单元测试
 *
 * 阶段 8 Round 6 新增：埋点工具测试
 *
 * 覆盖：
 * - track() 函数的环境变量分支
 * - trackPageView() 函数
 * - SSR 环境安全降级
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('analytics.track', () => {
  const originalEnv = { ...process.env }
  const originalFetch = global.fetch

  beforeEach(() => {
    // 清除所有 analytics 相关环境变量
    delete process.env.NEXT_PUBLIC_ANALYTICS_URL
    delete process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN
    // 重置 fetch mock
    global.fetch = vi.fn().mockResolvedValue({} as Response)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('缺失环境变量时静默（开发模式 console.info）', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    process.env.NODE_ENV = 'development'

    // 动态 import（确保拿到最新的环境变量）
    const { track } = await import('@/lib/analytics')
    track('test_event', { foo: 'bar' })

    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0][0]).toContain('[analytics]')
  })

  it('缺失环境变量时生产模式静默', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    process.env.NODE_ENV = 'production'

    const { track } = await import('@/lib/analytics')
    track('test_event')

    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('完整环境变量时调用 fetch', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://analytics.example.com'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.app'

    const { track } = await import('@/lib/analytics')
    track('choice_made', { sceneId: 'scene1', choice: 'A' })

    // 等待微任务
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(global.fetch).toHaveBeenCalledWith(
      'https://analytics.example.com/api/send',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('fetch 失败时降级 console.debug（仅开发模式）', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://analytics.example.com'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.app'
    process.env.NODE_ENV = 'development'

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

    const { track } = await import('@/lib/analytics')
    track('test_event')

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(consoleSpy).toHaveBeenCalledWith(
      '[analytics] send failed',
      'test_event',
      expect.any(Error)
    )
  })

  it('SSR 环境（无 window）应安全跳过', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://analytics.example.com'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.app'

    const originalWindow = global.window
    // @ts-expect-error - 模拟 SSR
    delete global.window

    const { track } = await import('@/lib/analytics')
    expect(() => track('test_event')).not.toThrow()

    global.window = originalWindow
  })

  it('应将 client_id 附加到 payload', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://analytics.example.com'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.app'
    process.env.NEXT_PUBLIC_CLIENT_ID = 'lumina'

    const { track } = await import('@/lib/analytics')
    track('day_start', { day: 5 })

    await new Promise((resolve) => setTimeout(resolve, 0))

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.payload.data.client_id).toBe('lumina')
    expect(body.payload.name).toBe('day_start')
    expect(body.payload.data.day).toBe(5)
  })
})

describe('analytics.trackPageView', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_URL
    delete process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN
    global.fetch = vi.fn().mockResolvedValue({} as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('缺失环境变量时不调用 fetch', async () => {
    const { trackPageView } = await import('@/lib/analytics')
    trackPageView()

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('传入 url 时使用传入值', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://analytics.example.com'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.app'

    const { trackPageView } = await import('@/lib/analytics')
    trackPageView('/play')

    await new Promise((resolve) => setTimeout(resolve, 0))

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.payload.url).toBe('/play')
    expect(body.type).toBe('pageview')
  })

  it('未传 url 时使用 window.location.pathname', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://analytics.example.com'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.app'

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/phone', href: 'http://localhost/phone' },
    })

    const { trackPageView } = await import('@/lib/analytics')
    trackPageView()

    await new Promise((resolve) => setTimeout(resolve, 0))

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.payload.url).toBe('/phone')
  })
})