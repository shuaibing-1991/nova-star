/**
 * 反馈页（/phone/feedback）
 *
 * 阶段 9 Round 3 新增：用户反馈收集
 *
 * 设计：
 * - 三种类型：Bug 报告 / 产品建议 / 内容反馈
 * - 500 字限制
 * - 60 秒限流
 * - 在线 sendBeacon 上报 / 离线 localStorage 暂存
 * - 仅上报结构化字段，不上报 content / contact
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bug,
  Lightbulb,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'
import {
  useFeedbackStore,
  type FeedbackType,
  type FeedbackEntry,
} from '@/stores/feedback'
import { reportFeedback, retryPendingFeedbacks } from '@/lib/feedback-reporter'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS: Array<{
  value: FeedbackType
  Icon: typeof Bug
  getKey: (t: (k: string) => string) => string
}> = [
  { value: 'bug', Icon: Bug, getKey: (t) => t('feedback.typeBug') },
  { value: 'suggestion', Icon: Lightbulb, getKey: (t) => t('feedback.typeSuggestion') },
  { value: 'content', Icon: MessageCircle, getKey: (t) => t('feedback.typeContent') },
]

const MAX_LENGTH = 500

export default function FeedbackPage() {
  const t = useTranslation()
  const draft = useFeedbackStore((s) => s.draft)
  const history = useFeedbackStore((s) => s.history)
  const setDraft = useFeedbackStore((s) => s.setDraft)
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback)
  const markSent = useFeedbackStore((s) => s.markSent)
  const markFailed = useFeedbackStore((s) => s.markFailed)
  const canSubmit = useFeedbackStore((s) => s.canSubmit())
  const remainingCooldown = useFeedbackStore((s) => s.remainingCooldown())

  const [cooldownTick, setCooldownTick] = React.useState(0)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [showOfflineHint, setShowOfflineHint] = React.useState(false)

  // 倒计时刷新（每秒）
  React.useEffect(() => {
    if (remainingCooldown === 0) return
    const timer = setInterval(() => setCooldownTick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [remainingCooldown])

  // online 事件触发自动重试
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = async () => {
      const pending = history.filter(
        (h) => h.status === 'pending' || h.status === 'failed'
      )
      if (pending.length === 0) return
      await retryPendingFeedbacks(pending, (id, ok) => {
        if (ok) markSent(id)
        else markFailed(id)
      })
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [history, markSent, markFailed])

  // 启动时尝试重试 pending 项
  React.useEffect(() => {
    const pending = history.filter(
      (h) => h.status === 'pending' || h.status === 'failed'
    )
    if (pending.length === 0) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    retryPendingFeedbacks(pending, (id, ok) => {
      if (ok) markSent(id)
      else markFailed(id)
    })
    // 只在 mount 时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async () => {
    if (!canSubmit) return

    const entry = submitFeedback()

    // 立即尝试上报
    const result = await reportFeedback(entry)

    if (result.ok) {
      markSent(entry.id)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      markFailed(entry.id)
      if (result.reason === 'network-error' && typeof navigator !== 'undefined' && !navigator.onLine) {
        setShowOfflineHint(true)
        setTimeout(() => setShowOfflineHint(false), 4000)
      }
    }
  }

  const cooldownSeconds = remainingCooldown
  const contentLength = draft.content.length
  const isOverLimit = contentLength > MAX_LENGTH

  return (
    <PhoneShell background="solid" bgClassName="bg-gray-50 dark:bg-gray-950">
      <StatusBar full />

      {/* 顶部返回栏 */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Link
          href="/phone/settings"
          aria-label="返回设置"
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/40 dark:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {t('feedback.title')}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-8">
        {/* 类型选择 */}
        <section className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('feedback.type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((opt) => {
              const active = draft.type === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraft({ type: opt.value })}
                  aria-pressed={active}
                  className={cn(
                    'flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2 text-xs font-medium transition-all active:scale-95',
                    active
                      ? 'border-primary bg-primary/10 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                  )}
                >
                  <opt.Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{opt.getKey(t)}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 描述 */}
        <section className="mb-4">
          <label
            htmlFor="feedback-content"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('feedback.content')}
          </label>
          <textarea
            id="feedback-content"
            value={draft.content}
            onChange={(e) => setDraft({ content: e.target.value })}
            placeholder={t('feedback.contentPlaceholder')}
            maxLength={MAX_LENGTH + 50 /* allow over for visual feedback */}
            rows={6}
            aria-describedby="feedback-counter"
            className={cn(
              'w-full resize-none rounded-xl border-2 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-900 dark:text-gray-100',
              isOverLimit
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-200 focus:border-primary dark:border-gray-700'
            )}
          />
          <div
            id="feedback-counter"
            className={cn(
              'mt-1 text-right text-xs',
              isOverLimit
                ? 'text-red-500'
                : contentLength > MAX_LENGTH * 0.8
                ? 'text-amber-500'
                : 'text-gray-400'
            )}
          >
            {contentLength} / {MAX_LENGTH}
          </div>
        </section>

        {/* 联系方式 */}
        <section className="mb-4">
          <label
            htmlFor="feedback-contact"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('feedback.contact')}
          </label>
          <input
            id="feedback-contact"
            type="text"
            value={draft.contact}
            onChange={(e) => setDraft({ contact: e.target.value })}
            placeholder={t('feedback.contactPlaceholder')}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <p className="mt-1 text-xs text-gray-400">
            仅保存在你的设备本地，不会上传
          </p>
        </section>

        {/* 提交按钮 */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full"
          size="lg"
          aria-label={t('feedback.submit')}
        >
          {cooldownSeconds > 0 ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              {cooldownSeconds} 秒后可再次提交
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t('feedback.submit')}
            </>
          )}
        </Button>

        {/* 成功提示 */}
        {showSuccess && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{t('feedback.successMessage')}</span>
          </div>
        )}

        {/* 离线提示 */}
        {showOfflineHint && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          >
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <span>{t('feedback.offlineMessage')}</span>
          </div>
        )}

        {/* 历史 */}
        {history.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              最近提交（仅本机）
            </h2>
            <div className="space-y-2">
              {history.map((entry) => (
                <HistoryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}
      </main>
    </PhoneShell>
  )
}

function HistoryItem({ entry }: { entry: FeedbackEntry }) {
  const typeLabel: Record<FeedbackType, string> = {
    bug: 'Bug',
    suggestion: '建议',
    content: '内容',
  }

  const timeAgo = getTimeAgo(entry.timestamp)

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-3 text-sm dark:bg-gray-900">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {typeLabel[entry.type]}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <div className="mt-0.5 text-xs text-gray-500">
          {entry.contentLength} 字{entry.hasContact && ' · 含联系方式'}
        </div>
      </div>
      <StatusBadge status={entry.status} />
    </div>
  )
}

function StatusBadge({ status }: { status: FeedbackEntry['status'] }) {
  if (status === 'sent') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300">
        <CheckCircle2 className="h-3 w-3" />
        已发送
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <XCircle className="h-3 w-3" />
        待重试
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      <Clock className="h-3 w-3" />
      发送中
    </span>
  )
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`
  return `${Math.floor(diff / 86400_000)} 天前`
}
