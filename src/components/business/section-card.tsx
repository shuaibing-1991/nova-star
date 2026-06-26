/**
 * 通用 SectionCard（手机内）
 *
 * 用法：
 *   <SectionCard title="能力雷达">{children}</SectionCard>
 *   <SectionCard title="粉丝画像" icon={<Lightbulb />}>...</SectionCard>
 */
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** 标题样式变体 */
  tone?: 'default' | 'subtle'
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  children,
  className,
  tone = 'default',
}) => {
  return (
    <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
      {title && (
        <div
          className={cn(
            'mb-2 flex items-center gap-2 text-sm font-medium',
            tone === 'default' ? 'text-gray-700' : 'text-gray-600'
          )}
        >
          {icon}
          <h3>{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}