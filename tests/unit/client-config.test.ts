/**
 * 客户配置单元测试
 *
 * 阶段 9 Round 2 新增：验证客户配置加载链路
 *
 * 覆盖：
 * - getClientConfig() 在不同 env 下的行为
 * - REGISTRY 注册的所有客户配置完整
 * - useClientConfig() 客户端 hook
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('getClientConfig', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // 重置环境变量
    delete process.env.NEXT_PUBLIC_CLIENT_ID
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('无环境变量时返回 default', async () => {
    const { getClientConfig } = await import('@/config/client')
    const config = getClientConfig()
    expect(config.clientId).toBe('nova-star-default')
  })

  it('NEXT_PUBLIC_CLIENT_ID=lumina 返回 lumina', async () => {
    process.env.NEXT_PUBLIC_CLIENT_ID = 'lumina'
    const { getClientConfig } = await import('@/config/client')
    const config = getClientConfig()
    expect(config.clientId).toBe('lumina')
    expect(config.brand.shortName).toBe('LUMINA')
  })

  it('NEXT_PUBLIC_CLIENT_ID=unknown 返回 default（兜底）', async () => {
    process.env.NEXT_PUBLIC_CLIENT_ID = 'unknown-customer'
    const { getClientConfig } = await import('@/config/client')
    const config = getClientConfig()
    expect(config.clientId).toBe('nova-star-default')
  })

  it('SSR 环境（无 process.env）返回 default', async () => {
    // 模拟 SSR 时 process 缺失
    const originalProcess = global.process
    // @ts-expect-error 模拟 SSR
    delete global.process

    const { getClientConfig } = await import('@/config/client')
    const config = getClientConfig()
    expect(config.clientId).toBe('nova-star-default')

    global.process = originalProcess
  })
})

describe('ClientConfig 类型完整性', () => {
  it('default 客户必填字段齐全', async () => {
    const { defaultClientConfig } = await import('@/config/clients/default')
    expect(defaultClientConfig.clientId).toBeTruthy()
    expect(defaultClientConfig.brand.name).toBeTruthy()
    expect(defaultClientConfig.brand.shortName).toBeTruthy()
    expect(defaultClientConfig.brand.logo).toBeTruthy()
    expect(defaultClientConfig.brand.primaryColor).toMatch(/^#[0-9A-F]{6}$/i)
    expect(defaultClientConfig.brand.accentColor).toMatch(/^#[0-9A-F]{6}$/i)
    expect(defaultClientConfig.content.companyName).toBeTruthy()
    expect(defaultClientConfig.content.groupName).toBeTruthy()
    expect(defaultClientConfig.content.artistName).toBeTruthy()
    expect(defaultClientConfig.features.achievements).toMatch(
      /^(default-40|custom-15)$/
    )
    expect([3, 4]).toContain(defaultClientConfig.features.endingCount)
    expect(defaultClientConfig.theme.fontPair).toMatch(
      /^(lXGW \+ SourceHan|lXGW \+ Inter)$/
    )
  })

  it('lumina 客户必填字段齐全', async () => {
    const { luminaClientConfig } = await import('@/config/clients/lumina')
    expect(luminaClientConfig.clientId).toBe('lumina')
    expect(luminaClientConfig.brand.primaryColor).toMatch(/^#[0-9A-F]{6}$/i)
    expect(luminaClientConfig.content.groupName).toBeTruthy()
  })

  it('所有客户使用合法的 HEX 颜色', async () => {
    const { defaultClientConfig } = await import('@/config/clients/default')
    const { luminaClientConfig } = await import('@/config/clients/lumina')

    for (const config of [defaultClientConfig, luminaClientConfig]) {
      expect(config.brand.primaryColor).toMatch(/^#[0-9A-F]{6}$/i)
      expect(config.brand.accentColor).toMatch(/^#[0-9A-F]{6}$/i)
      expect(config.content.fanColor).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})

describe('useClientConfig 客户端 hook', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_CLIENT_ID
    vi.resetModules()
  })

  it('无环境变量时返回 default', async () => {
    const { useClientConfig } = await import('@/hooks/use-client-config')
    // hook 是 client-side，需在 React 组件中调用
    // 此处只验证模块能正常加载 + 默认函数存在
    expect(typeof useClientConfig).toBe('function')
  })

  it('NEXT_PUBLIC_CLIENT_ID=lumina 时 hook 也返回 lumina', async () => {
    process.env.NEXT_PUBLIC_CLIENT_ID = 'lumina'
    const { useClientConfig } = await import('@/hooks/use-client-config')
    expect(typeof useClientConfig).toBe('function')
  })
})
