/**
 * 单 NPC 对话页（PRD 6.4 + 02-7页设计稿#页面4）
 *
 * Round 1 修复：
 * - 使用独立 chat-scripts.ts
 * - AvatarFallback 移除 src
 * - 参数验证
 * - 修改关系时同步好感度
 */
'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGameStore } from '@/stores/game'
import { getNpcById } from '@/data/npcs'
import { getChatScript, type ChatChoice } from '@/data/chat-scripts'
import { useTypewriter } from '@/hooks/use-typewriter'
import { haptic } from '@/hooks/use-haptic'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

export default function ChatPage() {
  const params = useParams<{ npcId: string }>()
  const router = useRouter()
  const npcId = params?.npcId ?? ''
  const npc = npcId ? getNpcById(npcId) : undefined

  const conversations = useGameStore((s) => s.conversations)
  const addMessage = useGameStore((s) => s.addMessage)
  const modifyStats = useGameStore((s) => s.modifyStats)
  const modifyRelationship = useGameStore((s) => s.modifyRelationship)
  const progress = useGameStore((s) => s.progress)
  const setProgress = useGameStore((s) => s.setProgress)
  const persistedChatIndex = useGameStore(
    (s) => s.chatScriptIndex[npcId] ?? 0
  )
  const setChatScriptIndex = useGameStore((s) => s.setChatScriptIndex)

  const messages = conversations[npcId] ?? []
  const script = React.useMemo(
    () => (npcId ? getChatScript(npcId) : []),
    [npcId]
  )

  const [chatIndex, setChatIndexLocal] = React.useState(persistedChatIndex)
  const [isTypingNpc, setIsTypingNpc] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // 包装：同时更新本地和 store
  const setChatIndex = React.useCallback(
    (updater: number | ((i: number) => number)) => {
      setChatIndexLocal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (npcId) setChatScriptIndex(npcId, next)
        return next
      })
    },
    [npcId, setChatScriptIndex]
  )

  // 首次进入：NPC 主动打招呼
  React.useEffect(() => {
    if (!npcId || !npc) return
    if (messages.length > 0) return
    if (!npc.greeting) return

    setIsTypingNpc(true)
    const t = setTimeout(() => {
      const greeting: Message = {
        id: `n_greet_${Date.now()}`,
        npcId,
        role: 'npc',
        text: npc.greeting!,
        timestamp: Date.now(),
        dayNumber: progress.currentDay,
      }
      addMessage(npcId, greeting)
      setIsTypingNpc(false)
    }, 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId])

  // 滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTypingNpc])

  const handleChoice = (choice: ChatChoice) => {
    if (!npcId) return
    if (isTypingNpc) return

    haptic.light()

    // 1. 添加用户消息
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: choice.text,
      timestamp: Date.now(),
      dayNumber: progress.currentDay,
    }
    addMessage(npcId, userMsg)

    // 2. 应用 effects（mood/trust）
    if (choice.effects) {
      const statDelta: Record<string, number> = {}
      if (choice.effects.mood !== undefined)
        statDelta.mood = choice.effects.mood
      if (choice.effects.trust !== undefined)
        statDelta.trust = choice.effects.trust
      if (Object.keys(statDelta).length > 0) {
        modifyStats(statDelta as any)
      }
      // 好感度
      if (choice.effects.affection !== undefined) {
        modifyRelationship(npcId, { affection: choice.effects.affection })
      }
    }

    // 3. 更新最后互动日
    setProgress({ currentDay: progress.currentDay })
    modifyRelationship(npcId, { lastInteractionDay: progress.currentDay })

    // 4. NPC 打字中
    setIsTypingNpc(true)

    // 5. 添加 NPC 回复（模拟延迟）
    setTimeout(() => {
      const npcMsg: Message = {
        id: `n_${Date.now()}`,
        npcId,
        role: 'npc',
        text: choice.response,
        timestamp: Date.now(),
        dayNumber: progress.currentDay,
      }
      addMessage(npcId, npcMsg)
      setIsTypingNpc(false)
      setChatIndex((i) => i + 1)
    }, 1200)
  }

  if (!npc) {
    return (
      <PhoneShell background="solid" bgClassName="bg-[#EDEDED]">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">NPC 不存在</p>
            <button
              onClick={() => router.push('/phone/chat')}
              className="mt-4 text-sm text-blue-500"
            >
              返回对话列表
            </button>
          </div>
        </div>
      </PhoneShell>
    )
  }

  const hasMoreChoices = chatIndex < script.length

  return (
    <PhoneShell background="solid" bgClassName="bg-[#EDEDED]">
      <StatusBar full />

      {/* 顶部导航 */}
      <header
        aria-label={`与 ${npc.name} 的对话`}
        className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
      >
        <Link
          href="/phone/chat"
          aria-label="返回对话列表"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-gray-600"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-base font-medium text-gray-800">{npc.name}</h1>
        <button
          type="button"
          aria-label="更多操作"
          className="-mr-2 flex h-10 w-10 items-center justify-center text-gray-600"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      {/* 消息流 */}
      <main
        aria-label={`与 ${npc.name} 的对话消息`}
        className="flex-1 overflow-y-auto px-3 py-3"
      >
        <div className="mb-3 flex justify-center">
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
            上午 10:00
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            npcAvatar={npc.avatar}
            npcName={npc.name}
          />
        ))}

        <AnimatePresence>
          {isTypingNpc && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 flex items-end gap-2"
            >
              <Avatar className="h-8 w-8">
                {npc.avatar ? <AvatarImage src={npc.avatar} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-pink-200 to-blue-200 text-xs dark:from-pink-800 dark:to-blue-800">
                  {npc.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                <div className="flex gap-1">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </main>

      {/* 选项区 */}
      <div className="border-t border-gray-200 bg-white px-3 py-3">
        {hasMoreChoices ? (
          <div className="space-y-2">
            {script.slice(chatIndex, chatIndex + 3).map((choice, idx) => (
              <motion.button
                key={choice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * motionTokens.stagger.loose }}
                disabled={isTypingNpc}
                onClick={() => handleChoice(choice)}
                className={cn(
                  'w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-left text-sm transition-all',
                  isTypingNpc
                    ? 'pointer-events-none cursor-not-allowed opacity-50'
                    : 'hover:border-pink-300 active:scale-[0.98]'
                )}
              >
                {choice.text}
              </motion.button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => router.push('/phone/chat')}
            className="w-full rounded-lg bg-blue-500 px-3 py-2 text-sm text-white active:scale-95"
          >
            返回对话列表
          </button>
        )}

        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="自由输入（即将开放）"
            disabled
            aria-label="消息输入（即将开放）"
            className="pointer-events-none flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400"
          />
        </div>
      </div>
    </PhoneShell>
  )
}

/* ============================================================
 * 消息气泡
 * ========================================================== */
function MessageBubble({
  msg,
  npcAvatar,
  npcName,
}: {
  msg: Message
  npcAvatar: string
  npcName: string
}) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-3 flex justify-end"
      >
        <div
          className="max-w-[70%] rounded-lg px-3 py-2 shadow-sm"
          style={{
            backgroundColor: '#95EC69',
            color: '#000',
            fontSize: '15px',
          }}
        >
          {msg.text}
        </div>
      </motion.div>
    )
  }

  return <NPCBubble msg={msg} npcAvatar={npcAvatar} npcName={npcName} />
}

function NPCBubble({
  msg,
  npcAvatar,
  npcName,
}: {
  msg: Message
  npcAvatar: string
  npcName: string
}) {
  const { displayed, isDone } = useTypewriter(msg.text, {
    speed: 25,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex items-end gap-2"
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {npcAvatar ? <AvatarImage src={npcAvatar} alt={npcName} /> : null}
        <AvatarFallback className="bg-gradient-to-br from-pink-200 to-blue-200 text-xs dark:from-pink-800 dark:to-blue-800">
          {npcName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div
        className="max-w-[70%] rounded-lg bg-white px-3 py-2 shadow-sm"
        style={{ fontSize: '15px' }}
      >
        {displayed}
        {!isDone && (
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-gray-500" />
        )}
      </div>
    </motion.div>
  )
}