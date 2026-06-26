/**
 * ScenePlayer - 场景播放器（叙事容器）
 * 详见 [[../../../01-产品PRD#6.3 剧本引擎]]
 */
'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Pause, Play } from 'lucide-react'
import { useEngineStore } from '@/stores/engine'
import { useSettingsStore } from '@/stores/settings'
import { ChatBubble } from './chat-bubble'
import { ChoiceCard } from './choice-card'
import { filterVisibleOptions } from '@/lib/decision'
import { useGameStore } from '@/stores/game'
import { useTypewriter } from '@/hooks'
import { useMotionEnabled } from '@/hooks/use-preferences'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { getNpcById } from '@/data/npcs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { SceneLoadError } from './scene-load-error'

export interface ScenePlayerProps {
  className?: string
}

export const ScenePlayer: React.FC<ScenePlayerProps> = ({ className }) => {
  const router = useRouter()
  // 阶段 6 修复：用 selector 订阅，避免整 store 解构导致全量重渲染
  const currentScene = useEngineStore((s) => s.currentScene)
  const currentBlockIndex = useEngineStore((s) => s.currentBlockIndex)
  const advanceBlock = useEngineStore((s) => s.advanceBlock)
  const makeChoice = useEngineStore((s) => s.makeChoice)
  const skipCurrent = useEngineStore((s) => s.skipCurrent)
  // 阶段 6 修复：监听 loadError，跨版本/跨日回档时显示错误页
  const loadError = useEngineStore((s) => s.loadError)

  // 阶段 7 Round 1 修复：合并 OS 偏好 + 应用内 motionEnabled / reducedMotion
  const motionEnabled = useMotionEnabled()

  if (loadError) {
    return (
      <SceneLoadError
        sceneId={loadError.sceneId}
        onRestart={() => {
          useEngineStore.getState().clearLoadError()
          useGameStore.getState().reset()
          router.push('/onboarding')
        }}
        onMenu={() => {
          useEngineStore.getState().clearLoadError()
          router.push('/phone')
        }}
      />
    )
  }

  if (!currentScene) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-gray-500">剧情加载中…</p>
      </div>
    )
  }

  const block = currentScene.content[currentBlockIndex]
  if (!block) {
    return null
  }

  const isLastBlock =
    currentBlockIndex >= currentScene.content.length - 1
  const isChoice = currentScene.type === 'choice' && isLastBlock

  const content = (
    <div
      key={`${currentScene.id}-${currentBlockIndex}`}
      className="flex flex-col gap-4"
    >
      {block.type === 'narration' && <NarrationBlock text={block.text ?? ''} />}
      {block.type === 'npc_speak' && (
        <NPCSpeakBlock npcId={block.npcId} text={block.text ?? ''} />
      )}
      {block.type === 'user_speak' && (
        <ChatBubble role="user" text={block.text ?? ''} />
      )}
    </div>
  )

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {motionEnabled ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentScene.id}-${currentBlockIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.easeInOut }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        ) : (
          content
        )}
      </div>

      {/* 底部操作区 */}
      <div className="border-t border-gray-200/30 bg-white/40 px-6 py-4 backdrop-blur-md dark:border-gray-800/30 dark:bg-gray-950/40">
        {isChoice ? (
          <ChoicesArea sceneId={currentScene.id} />
        ) : (
          <BlockActionBar
            onSkip={skipCurrent}
            onContinue={advanceBlock}
          />
        )}
      </div>
    </div>
  )
}

/** 旁白块（带打字机效果） */
const NarrationBlock: React.FC<{ text: string }> = ({ text }) => {
  const notifyBlockShown = useEngineStore((s) => s.notifyBlockShown)
  const { displayed, isDone, skip } = useTypewriter(text, {
    speed: 25,
    onComplete: notifyBlockShown,
  })

  // 阶段 7 Round 3 修复：键盘可达（Enter/Space 跳过打字机）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDone) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      skip()
    }
  }

  return (
    <div
      onClick={!isDone ? skip : undefined}
      onKeyDown={handleKeyDown}
      role={!isDone ? 'button' : undefined}
      tabIndex={!isDone ? 0 : -1}
      aria-label={!isDone ? '点击或按 Enter 跳过打字机效果' : undefined}
      className={cn(
        'text-center',
        !isDone && 'cursor-pointer select-none'
      )}
    >
      <p className="font-serif text-lg leading-loose text-gray-700 dark:text-gray-300">
        {displayed}
        {!isDone && (
          <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-gray-500" />
        )}
      </p>
    </div>
  )
}

/** NPC 说话块 */
const NPCSpeakBlock: React.FC<{ npcId?: string; text: string }> = ({
  npcId,
  text,
}) => {
  const npcMeta = useMemo(
    () => (npcId ? getNpcById(npcId) : undefined),
    [npcId]
  )
  const notifyBlockShown = useEngineStore((s) => s.notifyBlockShown)
  const { displayed, isDone, skip } = useTypewriter(text, {
    speed: 25,
    onComplete: notifyBlockShown,
  })

  // 阶段 7 Round 3 修复：键盘可达
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDone) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      skip()
    }
  }

  return (
    <div
      onClick={!isDone ? skip : undefined}
      onKeyDown={handleKeyDown}
      role={!isDone ? 'button' : undefined}
      tabIndex={!isDone ? 0 : -1}
      aria-label={!isDone ? '点击或按 Enter 跳过打字机效果' : undefined}
    >
      <ChatBubble
        role="npc"
        speakerName={npcMeta?.name}
        avatar={npcMeta?.avatar}
        text={displayed}
      />
    </div>
  )
}

/** 选项区 */
const ChoicesArea: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  // 阶段 7 Round 1 修复：用 selector 订阅，避免整 store 解构
  const currentScene = useEngineStore((s) => s.currentScene)
  const makeChoice = useEngineStore((s) => s.makeChoice)
  const stats = useGameStore((s) => s.stats)
  const progress = useGameStore((s) => s.progress)
  const relationships = useGameStore((s) => s.relationships)

  const visibleOptions = React.useMemo(() => {
    if (!currentScene || !currentScene.options) return []
    return filterVisibleOptions(currentScene.options, {
      stats,
      progress,
      relationships,
    })
  }, [currentScene, stats, progress, relationships])

  if (!currentScene || !currentScene.options) return null

  if (visibleOptions.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        （当前状态没有可用的选项）
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {visibleOptions.map((option, index) => (
        <ChoiceCard
          key={option.id}
          option={option}
          index={index}
          onSelect={makeChoice}
        />
      ))}
    </div>
  )
}

/** 底部操作栏（含暂停/继续按钮） */
const BlockActionBar: React.FC<{
  onSkip: () => void
  onContinue: () => void
}> = ({ onSkip, onContinue }) => {
  const autoPlay = useSettingsStore((s) => s.autoSkipReadConversations)
  const setAutoPlay = useSettingsStore(
    (s) => s.setAutoSkipReadConversations
  )
  const blockReady = useEngineStore((s) => s.blockReady)

  const toggleAutoPlay = () => setAutoPlay(!autoPlay)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAutoPlay}
          className="min-h-[44px] text-gray-500"
          aria-label={autoPlay ? '暂停自动播放' : '开启自动播放'}
        >
          {autoPlay ? (
            <>
              <Pause className="mr-1 h-4 w-4" />
              暂停
            </>
          ) : (
            <>
              <Play className="mr-1 h-4 w-4" />
              自动
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="min-h-[44px] text-gray-500"
        >
          跳过 ›
        </Button>
      </div>
      <Button
        size="default"
        onClick={onContinue}
        disabled={!blockReady}
        className="min-h-[44px] min-w-[120px]"
      >
        继续
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}