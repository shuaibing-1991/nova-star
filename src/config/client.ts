/**
 * 客户配置入口（按环境变量动态加载）
 * 新增客户：在 clients/ 下新建目录并在此注册
 */
import type { ClientConfig } from './clients/types'
import { defaultClientConfig } from './clients/default'
import { luminaClientConfig } from './clients/lumina'

/** 客户注册表 */
const REGISTRY: Record<string, ClientConfig> = {
  default: defaultClientConfig,
  lumina: luminaClientConfig,
}

/**
 * 加载客户配置
 */
export function getClientConfig(): ClientConfig {
  // SSR 时直接返回 default（环境变量可能未注入）
  if (typeof process === 'undefined' || !process.env) {
    return defaultClientConfig
  }
  const id = process.env.NEXT_PUBLIC_CLIENT_ID
  if (id && REGISTRY[id]) return REGISTRY[id]
  return defaultClientConfig
}

export type { ClientConfig } from './clients/types'
