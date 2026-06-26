/**
 * PhoneShell - 移动端外壳容器
 * 负责 iOS 安全区、状态栏适配、沉浸模式控制
 */
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PhoneShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否启用沉浸模式（隐藏状态栏） */
  immersive?: boolean
  /** 背景色 */
  background?: 'gradient' | 'solid' | 'transparent'
  /** 背景色（自定义） */
  bgClassName?: string
}

const PhoneShell = React.forwardRef<HTMLDivElement, PhoneShellProps>(
  (
    {
      className,
      children,
      immersive = false,
      background = 'gradient',
      bgClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'phone-frame relative mx-auto h-screen w-full max-w-[480px] overflow-hidden',
          !bgClassName && background === 'gradient' && 'bg-gradient-nova',
          !bgClassName && background === 'solid' && 'bg-bg-soft',
          !bgClassName && background === 'transparent' && 'bg-transparent',
          bgClassName,
          className
        )}
        {...props}
      >
        {/* 顶部安全区占位（避免内容顶到刘海） */}
        <div
          className={cn(
            'h-[env(safe-area-inset-top)] w-full',
            immersive && 'hidden'
          )}
          aria-hidden
        />
        <div className="relative h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full overflow-hidden">
          {children}
        </div>
        {/* 底部安全区占位（Home Indicator） */}
        <div
          className="h-[env(safe-area-inset-bottom)] w-full"
          aria-hidden
        />
      </div>
    )
  }
)
PhoneShell.displayName = 'PhoneShell'

export { PhoneShell }
