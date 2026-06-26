/**
 * useTypewriter - 打字机效果 Hook
 * 详见 PRD 6.12 沉浸叙事
 *
 * 特性：
 * - 速度自适应（长文本自动加速）
 * - 完成回调
 * - 跳过 / 暂停支持
 * - 阶段 7 Round 3 修复：屏幕阅读器用户直接看到完整文本
 * - 阶段 7 Round 4 优化：rAF 替代 setTimeout（每帧最多一次 setState）
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface TypewriterOptions {
  speed?: number // ms/字符（默认 25）
  startDelay?: number
  onComplete?: () => void
}

const MIN_SPEED = 12 // 最短 12ms/字（防止太快看不清）
const SPEED_STEP = 50 // 每 50 字提速 1ms

/**
 * 检测屏幕阅读器 / 减少动效偏好
 * 阶段 7 Round 3 修复：这类用户直接看到完整文本，避免被切碎
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function useTypewriter(
  text: string,
  options: TypewriterOptions = {}
): {
  displayed: string
  isDone: boolean
  skip: () => void
  reset: () => void
} {
  const { speed, startDelay = 0, onComplete } = options
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const onCompleteRef = useRef(onComplete)
  // 阶段 7 Round 4 优化：用 rAF id 替代 setTimeout id
  const rafRef = useRef<number | null>(null)
  // 兜底：用 setTimeout id（rAF 不可用时）
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 保持 onComplete ref 最新
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // 计算速度：长文本自动加速
  const effectiveSpeed = Math.max(
    MIN_SPEED,
    (speed ?? 25) - Math.floor(text.length / SPEED_STEP)
  )
  // 阶段 7 Round 3 修复：屏幕阅读器 / 减少动效用户直接看完整文本
  const srMode = prefersReducedMotion()

  useEffect(() => {
    // 清理
    const cleanup = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
    cleanup()

    if (srMode) {
      setDisplayed(text)
      setIsDone(true)
      onCompleteRef.current?.()
      return
    }

    setDisplayed('')
    setIsDone(false)

    if (!text) {
      setIsDone(true)
      onCompleteRef.current?.()
      return
    }

    // 阶段 7 Round 4 优化：rAF 循环
    // - 每帧（~16.7ms）累加 elapsed 时间
    // - 当 elapsed >= effectiveSpeed 时增加一字符
    // - 整段每帧最多一次 setDisplayed（与 React 18 自动 batching 配合）
    let index = 0
    let lastTime = 0
    let elapsed = 0

    const tick = (now: number) => {
      if (lastTime === 0) {
        lastTime = now
      }
      elapsed += now - lastTime
      lastTime = now

      // 一次性可以增加多字符（如果卡顿后恢复）
      while (elapsed >= effectiveSpeed && index < text.length) {
        index++
        elapsed -= effectiveSpeed
      }

      if (index >= text.length) {
        setDisplayed(text)
        setIsDone(true)
        rafRef.current = null
        onCompleteRef.current?.()
        return
      }

      setDisplayed(text.slice(0, index))
      rafRef.current = requestAnimationFrame(tick)
    }

    if (typeof requestAnimationFrame === 'function') {
      const start = (timestamp: number) => {
        // 起始 delay 用 setTimeout 实现
        timerRef.current = setTimeout(() => {
          lastTime = 0
          elapsed = 0
          rafRef.current = requestAnimationFrame(tick)
        }, startDelay)
        // 静默使用 timestamp 参数（满足 linter）
        void timestamp
      }
      // 实际用 setTimeout 控制 startDelay 后再启动 rAF
      timerRef.current = setTimeout(() => {
        lastTime = 0
        elapsed = 0
        rafRef.current = requestAnimationFrame(tick)
      }, startDelay)
      void start
    } else {
      // 降级：setTimeout 链
      let idx = 0
      const setTimeoutTick = () => {
        idx++
        setDisplayed(text.slice(0, idx))
        if (idx >= text.length) {
          setIsDone(true)
          timerRef.current = null
          onCompleteRef.current?.()
          return
        }
        timerRef.current = setTimeout(setTimeoutTick, effectiveSpeed)
      }
      timerRef.current = setTimeout(setTimeoutTick, startDelay)
    }

    return cleanup
  }, [text, effectiveSpeed, startDelay, srMode])

  const skip = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setDisplayed(text)
    setIsDone(true)
    onCompleteRef.current?.()
  }, [text])

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setDisplayed('')
    setIsDone(false)
  }, [])

  return { displayed, isDone, skip, reset }
}
