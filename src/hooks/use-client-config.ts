/**
 * 客户配置 Hook
 *
 * 阶段 9 Round 2 修复：暴露给客户端组件使用
 *
 * 用法：
 * ```tsx
 * const config = useClientConfig()
 * <h1>{config.brand.name}</h1>
 * ```
 *
 * 注意：
 * - SSR 与 CSR 一致（Next.js 构建时注入 NEXT_PUBLIC_CLIENT_ID）
 * - 切换客户必须通过 NEXT_PUBLIC_CLIENT_ID 构建时环境变量
 * - 运行时切换需要刷新页面
 */
'use client'

import { defaultClientConfig } from '@/config/clients/default'
import { luminaClientConfig } from '@/config/clients/lumina'
import type { ClientConfig } from '@/config/clients/types'

/**
 * 客户端读取客户配置
 *
 * 原理：
 * - build-time 环境变量 NEXT_PUBLIC_CLIENT_ID 被 Next.js inline 注入到 bundle
 * - 客户端 process.env.NEXT_PUBLIC_CLIENT_ID 在运行时已被替换为字符串字面量
 * - SSR / CSR 读取同一构建产物，不会出现 hydration mismatch
 */
export function useClientConfig(): ClientConfig {
  const id =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_CLIENT_ID
      : undefined

  if (id === 'lumina') {
    return luminaClientConfig
  }

  return defaultClientConfig
}
