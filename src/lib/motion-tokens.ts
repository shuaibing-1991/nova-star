/**
 * motion-tokens - 动效设计 tokens
 *
 * 阶段 7 Round 2 修复：
 * - 统一全应用动效参数
 * - 修改一处全应用生效
 * - 配合 useMotionEnabled() 自动降低动效
 *
 * 用法：
 *   import { motion } from '@/lib/motion-tokens'
 *   <motion.div transition={{ duration: motion.duration.normal, ease: motion.easing.standard }} />
 */
import type { Transition, Easing } from 'framer-motion'

/** 时长（秒） */
export const duration = {
  /** 极快（hover、focus、tap 反馈） */
  fast: 0.15,
  /** 普通（按钮 transition、toast、modal、card 切换） */
  normal: 0.3,
  /** 中等（页面切换、面板展开） */
  medium: 0.4,
  /** 慢（进度条、雷达图） */
  slow: 0.5,
  /** 慢+（开场叙事、Splash） */
  slower: 0.6,
  /** 极慢（重头戏、首次加载） */
  slowest: 0.8,
} as const

/** 缓动函数 */
export const easing = {
  /** 标准（大多数 UI 元素） */
  standard: [0.4, 0, 0.2, 1] as Easing,
  /** 进入（元素从屏幕外进入） */
  enter: [0, 0, 0.2, 1] as Easing,
  /** 离开（元素离开屏幕） */
  exit: [0.4, 0, 1, 1] as Easing,
  /** 强调（重要时刻：成就解锁、剧情高潮） */
  emphasized: [0.2, 0, 0, 1] as Easing,
  /** 简单 ease-out（状态变化） */
  easeOut: 'easeOut' as const,
  /** 简单 ease-in-out（对称动画） */
  easeInOut: 'easeInOut' as const,
} as const

/** 列表 stagger 节奏（秒） */
export const stagger = {
  /** 紧凑（成就卡 35+ 项） */
  tight: 0.02,
  /** 普通（5-10 项列表） */
  normal: 0.05,
  /** 宽松（选项卡、Tab） */
  loose: 0.1,
  /** 节奏感（剧情选项） */
  rhythm: 0.15,
  /** 戏剧感（结局页、特殊时刻） */
  dramatic: 0.2,
} as const

/** 弹簧预设（用于模态框/弹层） */
export const spring = {
  /** 默认（卡片、按钮） */
  default: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  /** 弹跳（成就解锁、提示气泡） */
  bouncy: { type: 'spring', stiffness: 400, damping: 20 } as Transition,
  /** 平稳（页面级） */
  smooth: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
} as const

/** 预设 transition 组合（最常用） */
export const transition = {
  /** 按钮 / 卡片 hover 反馈 */
  interactive: { duration: duration.fast, ease: easing.easeOut } as Transition,
  /** 模态框 / Sheet */
  modal: { duration: duration.medium, ease: easing.standard } as Transition,
  /** 页面切换 */
  page: { duration: duration.medium, ease: easing.easeInOut } as Transition,
  /** Toast / 提示 */
  toast: { duration: duration.normal, ease: easing.easeOut } as Transition,
  /** 进度条 / 数据可视化 */
  data: { duration: duration.slow, ease: easing.easeOut } as Transition,
} as const

/** 一站式导出 */
export const motion = {
  duration,
  easing,
  stagger,
  spring,
  transition,
} as const
