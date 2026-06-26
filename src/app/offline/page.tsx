/**
 * 离线 fallback 页（Service Worker 兜底）
 *
 * 阶段 8 Round 2 修复：
 * - 之前：sw.ts fallback 直接到 /（开场页）
 * - 现状：sw.ts fallback 到 /offline（友好提示）
 * - 用户已访问过的页面（如 /play /phone）仍能从 cache 返回
 *
 * 注意：此页是 client component，但不需要数据
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'

export default function OfflinePage() {
  // 阶段 9 Round 1：接入 i18n
  const t = useTranslation()
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-blue-50 px-6 text-center dark:from-gray-900 dark:to-gray-800">
      {/* 大图标 */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
        <WifiOff className="h-12 w-12 text-primary" aria-hidden="true" />
      </div>

      {/* 标题 */}
      <h1 className="mb-2 text-3xl font-black text-gray-900 dark:text-gray-100">
        {t('pwa.offline')}
      </h1>

      {/* 描述 */}
      <p className="mb-2 max-w-md text-base text-gray-700 dark:text-gray-300">
        看起来网络暂时无法连接。
      </p>
      <p className="mb-8 max-w-md text-sm text-gray-500">
        你之前访问过的页面仍然可用。检查网络后刷新页面，或回到主页继续。
      </p>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={handleRetry}
          aria-label="重新加载页面"
          className="min-h-[44px]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('pwa.offlineRetry')}
        </Button>
        <Link href="/" aria-label="回到主页">
          <Button className="min-h-[44px]">
            <Home className="mr-2 h-4 w-4" />
            回到主页
          </Button>
        </Link>
      </div>

      {/* 提示文字 */}
      <div className="mt-12 max-w-md rounded-xl bg-white/60 p-4 text-xs text-gray-500 backdrop-blur-sm dark:bg-gray-900/40">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          💡 提示
        </p>
        <p className="mt-1">
          NOVA STAR 是 PWA 应用，你的进度和设置都保存在本地。离线状态下，已读过的剧情仍可继续浏览。
        </p>
      </div>
    </div>
  )
}