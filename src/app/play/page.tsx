/**
 * /play - 剧情游戏主入口
 * 详见 [[../../../01-产品PRD#6.3 剧本引擎]]
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { ScenePlayer } from '@/components/business/scene-player'
import { DebugPanel } from '@/components/dev/debug-panel'
import { useEngineStore } from '@/stores/engine'
import { useGameStore } from '@/stores/game'
import { OPENING_SCENE_ID } from '@/data/story/story'
import { listSaveSlots, restoreFromSlot, AUTO_SAVE_SLOT } from '@/lib/save-manager'
import { useAutoAdvance } from '@/hooks'
import { getGameSchema } from '@/lib/structured-data'

export default function PlayPage() {
  const router = useRouter()
  const { currentScene, loadScene } = useEngineStore()
  const { reset } = useGameStore()
  const artist = useGameStore((s) => s.artist)
  const [isReady, setIsReady] = useState(false)

  // 路由守卫：未完成 onboarding 跳回
  useEffect(() => {
    if (!artist.name || artist.name.length < 2) {
      router.replace('/onboarding')
      return
    }
    setIsReady(true)
  }, [artist.name, router])

  useAutoAdvance()

  // 首次进入：尝试恢复自动存档（自动存档槽位 0）
  useEffect(() => {
    if (!isReady) return
    if (currentScene) return
    const slots = listSaveSlots()
    const autoSave = slots.find((s) => s.slot === AUTO_SAVE_SLOT)
    if (autoSave?.exists) {
      // 阶段 6 修复：restoreFromSlot 返回 RestoreResult
      // 失败时不再静默 — 引擎层 loadError 会显示错误页
      restoreFromSlot(AUTO_SAVE_SLOT)
    } else {
      loadScene(OPENING_SCENE_ID)
    }
    // 仅在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  if (!isReady) {
    return (
      <PhoneShell background="gradient">
        <div className="flex h-full items-center justify-center text-gray-500">
          准备中...
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell background="gradient" className="flex flex-col">
      {/* 阶段 8 Round 3 修复：注入 VideoGame JSON-LD（SSR 时生成） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getGameSchema()),
        }}
      />
      <StatusBar full />
      <ScenePlayer />
      {/* 开发模式调试面板 */}
      <DebugPanel />
    </PhoneShell>
  )
}