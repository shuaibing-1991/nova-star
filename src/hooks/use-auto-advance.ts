/**
 * useAutoAdvance - 自动播放 Hook
 *
 * 当 autoPlay 开启 + 当前块已展示完整（blockReady=true）时，
 * 经过 decisionDelay 毫秒后自动调用 advanceBlock。
 *
 * 关键修复（H3）：取 Math.max(totalDelay, decisionDelay)，
 * 即用户期望的 decisionDelay 是下限而非上限。
 */
'use client'

import { useEffect, useRef } from 'react'
import { useEngineStore } from '@/stores/engine'
import { useSettingsStore } from '@/stores/settings'

/** 最小缓冲时间（毫秒） */
const MIN_BUFFER_MS = 500

export function useAutoAdvance() {
  const autoPlay = useSettingsStore((s) => s.autoSkipReadConversations)
  const decisionDelay = useSettingsStore((s) => s.decisionDelay)
  const currentScene = useEngineStore((s) => s.currentScene)
  const blockReady = useEngineStore((s) => s.blockReady)

  // 用 ref 缓存 advanceBlock，避免 useEffect 依赖变化触发重置
  const advanceBlockRef = useRef(useEngineStore.getState().advanceBlock)
  useEffect(() => {
    advanceBlockRef.current = useEngineStore.getState().advanceBlock
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genRef = useRef(0)

  useEffect(() => {
    // 清理上一轮 timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // 自动播放未开启：不启动 timer
    if (!autoPlay) return

    // 没有场景：不启动
    if (!currentScene) return

    // 块还未完整展示（打字机还在跑）：不启动
    if (!blockReady) return

    // 选项场景：等待用户点击
    if (currentScene.type === 'choice') return

    // 记录 generation（防竞态）
    genRef.current = useEngineStore.getState().generation

    // 计算延迟：以用户期望的 decisionDelay 为下限
    const totalDelay = Math.max(MIN_BUFFER_MS, decisionDelay)

    timerRef.current = setTimeout(() => {
      // 防竞态：检查 generation 是否变化
      if (useEngineStore.getState().generation !== genRef.current) return
      advanceBlockRef.current()
    }, totalDelay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [autoPlay, decisionDelay, currentScene, blockReady])
}