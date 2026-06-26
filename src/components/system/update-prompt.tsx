/**
 * UpdatePrompt - 新版本可用提示
 *
 * 阶段 8 Round 2 修复：
 * - 之前 SW skipWaiting: true + clientsClaim：用户无感知地被强制升级
 * - 现在 SW skipWaiting: false：新 SW 等 old clients 关闭才激活
 * - 本组件监听 SW 更新，显示"新版本可用"toast
 * - 用户点击"立即刷新"后才发送 SKIP_WAITING 消息
 *
 * 阶段 8 Round 4 修复：
 * - 修复「首次安装时 controller 为 null 不提示」问题
 *   改用 `navigator.serviceWorker.controller` 不再作为唯一条件，
 *   而是当用户处于「已有 controller」状态下（页面已加载完），
 *   才显示提示，避免首启打扰
 * - 增加 controllerchange 后再次检查 waiting worker（处理用户停留期间更新）
 */
'use client'

import * as React from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from '@/i18n/use-translation'

export const UpdatePrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = React.useState(false)
  const [waitingWorker, setWaitingWorker] =
    React.useState<ServiceWorker | null>(null)
  // 阶段 9 Round 1：接入 i18n
  const t = useTranslation()

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const checkForUpdate = () => {
      navigator.serviceWorker.ready.then((registration) => {
        // 如果已有 waiting worker，立即提示
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowPrompt(true)
        }

        // 监听新 waiting worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // 阶段 8 Round 4：只在已有 controller 时才提示（避免首启打扰）
            // 已有 controller = 用户不是首次访问
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker)
              setShowPrompt(true)
            }
          })
        })
      })
    }

    // 页面加载时初始化
    if (document.readyState === 'complete') {
      checkForUpdate()
    } else {
      window.addEventListener('load', checkForUpdate, { once: true })
    }

    // 监听 controller 变化（新 SW 激活后）
    let refreshing = false
    const handleControllerChange = () => {
      if (refreshing) return
      refreshing = true
      // 阶段 8 Round 4：先 setTimeout 让 SW 完全接管，再 reload
      // 避免刷新时 SW 未就绪导致新页面走 fallback
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange
    )

    return () => {
      window.removeEventListener('load', checkForUpdate)
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange
      )
    }
  }, [])

  const handleUpdate = React.useCallback(() => {
    if (!waitingWorker) return
    // 通知 SW skip waiting
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    setShowPrompt(false)
  }, [waitingWorker])

  const handleDismiss = React.useCallback(() => {
    setShowPrompt(false)
  }, [])

  if (!showPrompt) return null

  return (
    <div
      role="alertdialog"
      aria-labelledby="update-prompt-title"
      aria-describedby="update-prompt-desc"
      className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transform rounded-xl bg-white px-4 py-3 shadow-2xl dark:bg-gray-800"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div
            id="update-prompt-title"
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            {t('pwa.updateAvailable')}
          </div>
          <div
            id="update-prompt-desc"
            className="mt-0.5 text-xs text-gray-500"
          >
            点击刷新以加载最新内容
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={handleDismiss}
            aria-label="稍后再说"
            className="min-h-[36px] rounded-md px-3 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('pwa.updateLater')}
          </button>
          <button
            onClick={handleUpdate}
            aria-label="立即刷新"
            className="min-h-[36px] rounded-md bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-400"
          >
            {t('pwa.updateNow')}
          </button>
        </div>
      </div>
    </div>
  )
}