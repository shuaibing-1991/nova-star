/**
 * ChoiceCard - 决策选项卡片
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { motion as motionTokens } from '@/lib/motion-tokens'
import { cn } from '@/lib/utils'
import type { SceneOption } from '@/types'

export interface ChoiceCardProps {
  option: SceneOption
  index: number
  disabled?: boolean
  onSelect: (option: SceneOption) => void
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({
  option,
  index,
  disabled,
  onSelect,
}) => {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: motionTokens.duration.normal, delay: index * motionTokens.stagger.loose }}
      whileHover={!disabled ? { scale: 1.02, x: 4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      onClick={() => onSelect(option)}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white/90 p-4 text-left shadow-sm backdrop-blur-sm transition-all',
        'hover:border-primary hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-gray-800 dark:bg-gray-900/90'
      )}
    >
      {/* 序号徽标 */}
      <div className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary-600">
        {String.fromCharCode(65 + index)}
      </div>

      {/* 主文案 */}
      <div className="ml-8">
        <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
          {option.text}
        </p>
        {option.visibleText && (
          <p className="mt-1.5 text-xs text-gray-500">
            {option.visibleText}
          </p>
        )}
      </div>

      {/* 装饰光效 */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.button>
  )
}

export { ChoiceCard }
