/**
 * Service Worker 源文件
 * 详见 [[../../../01-产品PRD#6.10 模块 10：PWA 与离线策略]]
 *
 * 阶段 8 Round 2 修复：
 * - 清理死代码（删除 /scenes/ 和 /api/ matcher）
 * - 加 cacheName 版本号（便于升级清理）
 * - 离线 fallback 从 / 改为 /offline
 * - skipWaiting 改为 false（配合 UI 提示）
 * - 加 navigationpreload 监听
 */
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

// 阶段 8 Round 2：缓存版本号
// 升级时 bump v1 → v2，activate 阶段会清理旧版本
const CACHE_VERSION = 'v1'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // 阶段 8 Round 2：不再 skipWaiting，改由 UI 提示用户刷新
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // 自定义缓存策略
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: `nova-star-images-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
        },
      },
    },
    {
      matcher: ({ request }) => request.destination === 'font',
      handler: 'CacheFirst',
      options: {
        cacheName: `nova-star-fonts-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
        },
      },
    },
    // 阶段 8 Round 2：删除 /scenes/ 和 /api/ 死代码
    // 故事数据是 JS bundle（由 precache 处理），无 /api/ 后端
  ],
  fallbacks: {
    entries: [
      {
        // 阶段 8 Round 2：fallback 到 /offline 友好页
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()

// 阶段 8 Round 2：监听 navigationpreload
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 清理旧版本缓存
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => name.includes('nova-star-') && !name.includes(CACHE_VERSION))
          .map((name) => caches.delete(name))
      )
    })()
  )
})

// 阶段 8 Round 2：监听客户端消息（用于 UpdatePrompt）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})