/**
 * PageTransition - 路由级页面切换过渡
 *
 * 阶段 7 Round 2 修复：
 * - 之前所有 <Link> 切换页面都是硬切
 * - 用 AnimatePresence + pathname 作为 key 实现 fade 过渡
 * - 受 useMotionEnabled 控制
 *
 * 用法（在 layout.tsx 包裹 children）：
 *   <PageTransition>{children}</PageTransition>
 */
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { useMotionEnabled } from '@/hooks/use-preferences'

export interface PageTransitionProps {
  children: React.ReactNode
  /** 自定义过渡类名 */
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const pathname = usePathname()
  const motionEnabled = useMotionEnabled()

  if (!motionEnabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={motionTokens.transition.page}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
