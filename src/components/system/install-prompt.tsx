/**
 * InstallPrompt - PWA 安装提示
 *
 * 阶段 8 Round 6 新增：捕获 beforeinstallprompt 事件，主动引导用户安装
 *
 * 触发时机：
 * - 浏览器触发 beforeinstallprompt 事件（Chrome / Edge 90+）
 * - 用户首次访问且满足 PWA 安装条件（HTTPS + manifest + SW）
 *
 * 设计：
 * - 默认隐藏（避免首启打扰）
 * - 用户主动点击「安装到主屏」按钮才显示
 * - 监听 beforeinstallprompt 缓存事件，调用 prompt() 显示原生安装弹窗
 * - 安装成功后隐藏按钮
 */
'use client'

import * as React from 'react'
import { Download, X } from 'lucide-react'
import { useTranslation } from '@/i18n/use-translation'

// 类型扩展（部分浏览器未声明 BeforeInstallPromptEvent）
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 天

export const InstallPrompt: React.FC = () => {
  const [showButton, setShowButton] = React.useState(false)
  const [installEvent, setInstallEvent] =
    React.useState<BeforeInstallPromptEvent | null>(null)
  const [showHint, setShowHint] = React.useState(false)
  // 阶段 9 Round 1：接入 i18n
  const t = useTranslation()

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    // 检查是否已被 dismiss（7 天内不再显示）
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (dismissed) {
        const ts = parseInt(dismissed, 10)
        if (Date.now() - ts < DISMISS_DURATION_MS) {
          return
        }
      }
    } catch {
      // localStorage 不可用（隐私模式），继续
    }

    // 监听 beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault() // 阻止浏览器默认迷你栏
      const promptEvent = e as BeforeInstallPromptEvent
      setInstallEvent(promptEvent)
      // 延迟 3 秒显示按钮（避免首屏干扰）
      setTimeout(() => setShowButton(true), 3000)
    }

    // 监听 appinstalled
    const handleInstalled = () => {
      setShowButton(false)
      setInstallEvent(null)
      setShowHint(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    // 检测是否已安装（standalone 模式 = 已安装）
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari 通过 navigator.standalone 判断
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)

    if (isStandalone) {
      setShowButton(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = React.useCallback(async () => {
    if (!installEvent) return
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      if (choice.outcome === 'accepted') {
        setShowButton(false)
        setShowHint(false)
      }
    } catch {
      // 用户取消或异常
    }
    setInstallEvent(null)
  }, [installEvent])

  const handleDismiss = React.useCallback(() => {
    setShowButton(false)
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    } catch {
      // ignore
    }
  }, [])

  if (!showButton) return null

  return (
    <div
      className="fixed bottom-32 left-1/2 z-40 -translate-x-1/2 transform rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:bg-gray-800/95"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
          aria-label="安装 NOVA STAR 到主屏幕"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>{t('pwa.install')}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            disabled={!installEvent}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-400 disabled:opacity-50"
          >
            {t('pwa.installNow')}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="关闭安装提示"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}