/**
 * 微信对话列表（PRD 6.4）
 * 显示所有 NPC 的最新消息预览
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGameStore } from '@/stores/game'
import { NPCS, getNpcById } from '@/data/npcs'
import { cn } from '@/lib/utils'

export default function ChatListPage() {
  const relationships = useGameStore((s) => s.relationships)
  const conversations = useGameStore((s) => s.conversations)

  const sortedNpcs = React.useMemo(() => {
    return [...NPCS].sort((a, b) => {
      const aLast = relationships[a.id]?.lastInteractionDay ?? 0
      const bLast = relationships[b.id]?.lastInteractionDay ?? 0
      return bLast - aLast
    })
  }, [relationships])

  return (
    <PhoneShell background="solid" bgClassName="bg-[#EDEDED]">
      <StatusBar full />

      {/* 顶部导航 */}
      <header
        aria-label="微信对话列表"
        className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
      >
        <Link
          href="/phone"
          aria-label="返回工作手机"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-gray-600"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 id="chat-list-heading" className="text-base font-medium text-gray-800">微信</h1>
        <div className="w-10" />
      </header>

      <main
        aria-labelledby="chat-list-heading"
        className="flex-1 overflow-y-auto bg-[#EDEDED]"
      >
        {sortedNpcs.map((npc) => {
          const rel = relationships[npc.id]
          const lastMsg = conversations[npc.id]?.[conversations[npc.id].length - 1]
          return (
            <Link
              key={npc.id}
              href={`/phone/chat/${npc.id}`}
              className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 transition-colors active:bg-gray-50"
            >
              <Avatar className="h-12 w-12 flex-shrink-0">
                {npc.avatar ? (
                  <AvatarImage src={npc.avatar} alt={npc.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-pink-200 to-blue-200 text-sm text-gray-700 dark:from-pink-800 dark:to-blue-800 dark:text-gray-200">
                  {npc.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-gray-800">{npc.name}</span>
                  <span className="text-xs text-gray-400">
                    {lastMsg
                      ? formatTime(lastMsg.timestamp)
                      : rel
                        ? `Day ${rel.lastInteractionDay}`
                        : ''}
                  </span>
                </div>
                <p
                  className={cn(
                    'mt-0.5 truncate text-sm',
                    lastMsg ? 'text-gray-600' : 'text-gray-400 italic'
                  )}
                >
                  {lastMsg ? lastMsg.text : npc.tagline ?? '点击开始对话...'}
                </p>
              </div>
            </Link>
          )
        })}
      </main>
    </PhoneShell>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMin = (now.getTime() - d.getTime()) / 60000
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${Math.floor(diffMin)}分钟前`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}小时前`
  return `${Math.floor(diffMin / 1440)}天前`
}