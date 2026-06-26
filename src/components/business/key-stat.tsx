/**
 * 关键数值小卡（用于 /phone、/phone/data 的数值快照）
 *
 * 两种用法：
 * 1. 独立卡片：<KeyStat label="..." value="..." color="..." />
 * 2. 容器内紧凑：<KeyStat inline label="..." ... /> （不渲染外层圆角与 padding）
 */
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface KeyStatProps {
  label: string
  value: string | number
  color?: string
  /** 可选：0-1 的进度比 */
  progress?: number
  /** 可选：label/value 之外的辅助说明 */
  sublabel?: string
  /** 紧凑模式（外部已有容器时使用，跳过 padding/shadow/圆角） */
  inline?: boolean
  className?: string
}

export const KeyStat: React.FC<KeyStatProps> = ({
  label,
  value,
  color,
  progress,
  sublabel,
  inline = false,
  className,
}) => {
  return (
    <div
      className={cn(
        inline
          ? 'flex min-h-[64px] flex-col justify-center text-center'
          : 'flex min-h-[64px] flex-col justify-center rounded-lg bg-white p-3 text-center shadow-sm',
        className
      )}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className={cn('mt-0.5 font-serif text-lg font-bold', color)}>
        {value}
      </div>
      {progress !== undefined && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-200/60">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              (color ?? 'text-pink-500').replace('text-', 'bg-')
            )}
            style={{
              width: `${Math.max(0, Math.min(100, progress * 100))}%`,
            }}
            aria-hidden
          />
        </div>
      )}
      {sublabel && (
        <div className="mt-0.5 text-[10px] text-gray-400">{sublabel}</div>
      )}
    </div>
  )
}