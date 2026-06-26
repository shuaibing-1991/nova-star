/**
 * SafeMotion - 条件动效包装器
 *
 * 阶段 7 Round 1 修复：
 * - 当 settings.motionEnabled = false（或 OS prefers-reduced-motion）时，
 *   退化为静态 div，避免 Framer Motion 的 layout/animation 开销
 * - 提供 SafeMotionDiv / SafeMotionButton 两种
 */
'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { useMotionEnabled } from '@/hooks/use-preferences'

type DivProps = React.HTMLAttributes<HTMLDivElement>
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * SafeMotionDiv - 退化的 motion.div
 */
export const SafeMotionDiv: React.FC<DivProps & HTMLMotionProps<'div'>> = ({
  children,
  ...rest
}) => {
  const motionEnabled = useMotionEnabled()
  if (!motionEnabled) {
    // 提取动效相关的 props，丢弃后渲染普通 div
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initial: _i,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      animate: _a,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exit: _e,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transition: _t,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileHover: _wh,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileTap: _wt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      variants: _v,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      custom: _c,
      ...divProps
    } = rest as HTMLMotionProps<'div'>
    return <div {...(divProps as any)}>{children}</div>
  }
  return <motion.div {...(rest as any)}>{children}</motion.div>
}

/**
 * SafeMotionButton - 退化的 motion.button
 */
export const SafeMotionButton: React.FC<ButtonProps & HTMLMotionProps<'button'>> = ({
  children,
  ...rest
}) => {
  const motionEnabled = useMotionEnabled()
  if (!motionEnabled) {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initial: _i,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      animate: _a,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exit: _e,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transition: _t,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileHover: _wh,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileTap: _wt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      variants: _v,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      custom: _c,
      ...buttonProps
    } = rest as HTMLMotionProps<'button'>
    return <button {...(buttonProps as any)}>{children}</button>
  }
  return <motion.button {...(rest as any)}>{children}</motion.button>
}
