/**
 * EndingTransition - 跳结局前的过渡遮罩
 *
 * 阶段 7 Round 5 修复：原来 navigateToEnding 直接 setTimeout 3s 后跳转，
 * 用户看到屏幕卡 3 秒，以为卡死。
 * 现在显示一个全屏 overlay，明确告知"正在揭晓结局"，
 * 并展示解锁的结局成就 + 进度条，让等待有"仪式感"。
 *
 * 用法：
 *   showEndingTransition({ type: 'success', achievementName: '破茧' })
 *   // 显示 3 秒后自动跳 /ending/success
 *
 * 设计原则：
 * - 暗黑遮罩，避免用户继续点击
 * - 大字 + 慢速呼吸（如果 motionEnabled）
 * - 进度条 + "几秒后揭晓"
 * - ESC 取消（避免误触卡住）
 */
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings'
import { motion as motionTokens } from '@/lib/motion-tokens'

export interface EndingTransitionOptions {
  type: 'success' | 'neutral' | 'failure' | 'hidden'
  achievementName?: string
  /** 跳转 URL，默认 `/ending/${type}` */
  href?: string
  /** 持续时间（毫秒），默认 3000 */
  duration?: number
}

const TYPE_LABEL: Record<EndingTransitionOptions['type'], string> = {
  success: '圆满结局',
  neutral: '平淡结局',
  failure: '遗憾结局',
  hidden: '隐藏结局',
}

const TYPE_COLOR: Record<EndingTransitionOptions['type'], string> = {
  success: 'from-pink-500 to-rose-500',
  neutral: 'from-blue-500 to-indigo-500',
  failure: 'from-gray-500 to-slate-600',
  hidden: 'from-amber-500 to-yellow-500',
}

const TYPE_EMOJI: Record<EndingTransitionOptions['type'], string> = {
  success: '🌟',
  neutral: '🌙',
  failure: '🍂',
  hidden: '👑',
}

/** 单例状态：模块级 trigger 函数 */
let _externalTrigger: ((opts: EndingTransitionOptions) => void) | null = null

export function showEndingTransition(opts: EndingTransitionOptions) {
  if (typeof window === 'undefined') return
  _externalTrigger?.(opts)
}

export const EndingTransition: React.FC = () => {
  const [state, setState] = React.useState<{
    visible: boolean
    type: EndingTransitionOptions['type']
    achievementName?: string
    href: string
    startedAt: number
    duration: number
  } | null>(null)
  const [remaining, setRemaining] = React.useState(0)
  const motionEnabled = useSettingsStore((s) => s.motionEnabled)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  // 模块级 trigger：把外部调用桥到本地 state
  React.useEffect(() => {
    _externalTrigger = (opts) => {
      setState({
        visible: true,
        type: opts.type,
        achievementName: opts.achievementName,
        href: opts.href ?? `/ending/${opts.type}`,
        startedAt: Date.now(),
        duration: opts.duration ?? 3000,
      })
    }
    return () => {
      _externalTrigger = null
    }
  }, [])

  // 倒计时 + 自动跳转
  React.useEffect(() => {
    if (!state?.visible) return

    const tick = () => {
      const elapsed = Date.now() - state.startedAt
      const remain = Math.max(0, state.duration - elapsed)
      setRemaining(remain)
      if (remain <= 0) {
        window.location.href = state.href
      }
    }
    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [state])

  // ESC 取消（提前跳转）
  React.useEffect(() => {
    if (!state?.visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.location.href = state.href
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state])

  const handleSkip = React.useCallback(() => {
    if (state) window.location.href = state.href
  }, [state])

  if (!state) return null

  const progress = 100 - (remaining / state.duration) * 100
  const showMotion = motionEnabled && !reducedMotion

  return (
    <AnimatePresence>
      <motion.div
        key="ending-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: showMotion ? 0.5 : 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ending-transition-title"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 px-6 text-center text-white backdrop-blur-sm"
      >
        {/* 顶部 emoji + 大字 */}
        <motion.div
          initial={showMotion ? { scale: 0.9, opacity: 0 } : false}
          animate={
            showMotion
              ? {
                  scale: [0.9, 1.05, 1],
                  opacity: 1,
                }
              : { opacity: 1 }
          }
          transition={
            showMotion
              ? { duration: motionTokens.duration.slower, ease: motionTokens.easing.easeOut }
              : { duration: 0 }
          }
          className="flex flex-col items-center"
        >
          <div className="text-7xl">{TYPE_EMOJI[state.type]}</div>
          <h2
            id="ending-transition-title"
            className="mt-4 text-3xl font-black tracking-wide"
          >
            {TYPE_LABEL[state.type]}
          </h2>
          {state.achievementName && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-pink-300">
              <Sparkles className="h-4 w-4" />
              <span>解锁成就：{state.achievementName}</span>
            </div>
          )}
        </motion.div>

        {/* 提示文字 */}
        <p className="mt-6 text-sm text-gray-300">
          你的 30 天旅程即将揭晓……
        </p>

        {/* 进度条 */}
        <div
          className="mt-4 h-1 w-64 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className={`h-full bg-gradient-to-r ${TYPE_COLOR[state.type]}`}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          约 {Math.ceil(remaining / 1000)} 秒后跳转（按 ESC 跳过）
        </p>

        {/* 手动跳转按钮 */}
        <Button
          variant="outline"
          onClick={handleSkip}
          className="mt-6 border-white/30 bg-white/10 text-white hover:bg-white/20"
          aria-label="立即查看结局"
        >
          立即查看结局
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}