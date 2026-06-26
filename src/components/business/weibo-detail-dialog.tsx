/**
 * 微博热搜详情弹层
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Flame, MessageCircle, Share2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatNumber } from '@/lib/utils'
import type { TrendingItem } from '@/app/phone/weibo/page'

export interface WeiboDetailDialogProps {
  item: TrendingItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PHASE_COLORS = {
  爆发期: 'text-red-500',
  发酵期: 'text-orange-500',
  上升期: 'text-blue-500',
  平稳期: 'text-gray-400',
}

/** 模拟数据：基于 rank 衍生 */
function generateDetail(item: TrendingItem) {
  const baseReads =
    parseFloat(item.reads.replace('w', '')) * 10000 || 100000
  const comments = Math.floor(baseReads * 0.02)
  const reposts = Math.floor(baseReads * 0.008)
  const risk = item.rank <= 3 ? 'high' : item.rank <= 6 ? 'medium' : 'low'

  const tags = item.isPlayer
    ? ['#NOVA STUDIO', '#新人', '#出道']
    : item.title.includes('选秀')
      ? ['#选秀', '#黑幕']
      : item.title.includes('应援')
        ? ['#粉丝文化', '#应援']
        : ['#娱乐', '#热搜']

  return { comments, reposts, risk, tags }
}

export const WeiboDetailDialog: React.FC<WeiboDetailDialogProps> = ({
  item,
  open,
  onOpenChange,
}) => {
  if (!item) return null

  const detail = generateDetail(item)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 text-left">
            <span
              className={cn(
                'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-sm font-bold',
                item.rank <= 3 ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {item.rank}
            </span>
            <span className="flex-1">{item.title}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-left">
            {item.hot && <Flame className="h-3 w-3 text-red-500" />}
            <span>{item.reads} 阅读</span>
            <span className={cn(PHASE_COLORS[item.phase])}>· {item.phase}</span>
          </DialogDescription>
        </DialogHeader>

        {/* 风险提示（玩家相关） */}
        {item.isPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-yellow-300 bg-yellow-50 p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
              <div className="text-sm">
                <div className="font-medium text-yellow-900">
                  与你相关 · 建议处理
                </div>
                <p className="mt-1 text-xs text-yellow-700">
                  你的首条动态正在发酵。是否要回复评论或发表新内容？
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 互动数 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <MessageCircle className="mx-auto h-4 w-4 text-gray-500" />
            <div className="mt-1 text-sm font-bold text-gray-800">
              {formatNumber(detail.comments)}
            </div>
            <div className="text-xs text-gray-500">评论</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <Share2 className="mx-auto h-4 w-4 text-gray-500" />
            <div className="mt-1 text-sm font-bold text-gray-800">
              {formatNumber(detail.reposts)}
            </div>
            <div className="text-xs text-gray-500">转发</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div
              className={cn(
                'mx-auto text-sm font-bold',
                detail.risk === 'high'
                  ? 'text-red-500'
                  : detail.risk === 'medium'
                    ? 'text-yellow-500'
                    : 'text-green-500'
              )}
            >
              {detail.risk === 'high'
                ? '高'
                : detail.risk === 'medium'
                  ? '中'
                  : '低'}
            </div>
            <div className="text-xs text-gray-500">风险</div>
          </div>
        </div>

        {/* 话题标签 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">话题标签</h4>
          <div className="flex flex-wrap gap-2">
            {detail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 相关评论（占位） */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">热门评论</h4>
          <div className="space-y-2 text-xs">
            {[
              '这是真的吗？吃瓜中……',
              '关注后续发展',
              'NOVA STUDIO 出新人了吗？',
            ].map((c, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-2 text-gray-700">
                {c}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">评论功能将在阶段 7 完整实现</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
