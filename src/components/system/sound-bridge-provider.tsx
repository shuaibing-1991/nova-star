/**
 * 音效桥接 Provider
 *
 * 阶段 9 Round 1 新增：在 layout 顶层调用 useSoundBridge
 * 无 UI 渲染，纯逻辑
 */
'use client'

import { useSoundBridge } from '@/hooks/use-sound-bridge'

export function SoundBridgeProvider() {
  useSoundBridge()
  return null
}