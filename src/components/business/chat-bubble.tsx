/**
 * ChatBubble - 对话气泡（支持 NPC 头像、姓名、文本）
 *
 * 阶段 7 Round 1 修复：用 SafeMotionDiv 替代 motion.div，
 * 让 settings.motionEnabled / OS prefers-reduced-motion 真正生效
 */
'use client'

import * as React from 'react'
import { SafeMotionDiv } from './safe-motion'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn } from '@/lib/utils'

export interface ChatBubbleProps {
  /** 对话方角色：npc / user / system / narration */
  role: 'npc' | 'user' | 'system' | 'narration'
  /** 说话人姓名（可选） */
  speakerName?: string
  /** 头像 URL（可选） */
  avatar?: string
  /** 对话文本 */
  text: string
  /** 自定义类名 */
  className?: string
  /** 点击回调 */
  onClick?: () => void
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  speakerName,
  avatar,
  text,
  className,
  onClick,
}) => {
  if (role === 'narration') {
    return (
      <SafeMotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionTokens.duration.medium, ease: motionTokens.easing.easeOut }}
        className={cn(
          'my-4 text-center text-sm leading-relaxed text-gray-500 italic',
          className
        )}
      >
        {text}
      </SafeMotionDiv>
    )
  }

  if (role === 'system') {
    return (
      <SafeMotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'my-3 rounded-md bg-gray-100 px-3 py-2 text-center text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400',
          className
        )}
      >
        {text}
      </SafeMotionDiv>
    )
  }

  const isUser = role === 'user'

  return (
    <SafeMotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.easeOut }}
      onClick={onClick}
      className={cn(
        'flex w-full items-end gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* 头像 */}
      {avatar && (
        <div
          className={cn(
            'h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-1 ring-white/50',
            isUser && 'order-2'
          )}
        >
          <img
            src={avatar}
            alt={speakerName || (isUser ? '我' : 'NPC')}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {speakerName && !isUser && (
          <span className="px-2 text-xs font-medium text-gray-600">
            {speakerName}
          </span>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-br-sm bg-primary text-gray-900'
              : 'rounded-bl-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100',
            'break-words'
          )}
        >
          {text}
        </div>
      </div>
    </SafeMotionDiv>
  )
}

export { ChatBubble }
