/**
 * 微博热搜页（PRD 6.4 + 02-7页设计稿#页面5）
 *
 * 布局：
 * - 顶部：返回 + 微博 + 搜索
 * - Tab：热搜榜 / 个人动态
 * - 热搜榜列表（带 🔥 图标 + 阅读数 + 阶段）
 * - 玩家动态卡（带互动数）
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Search, Flame, MessageCircle, Heart, Share2 } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WeiboDetailDialog } from '@/components/business/weibo-detail-dialog'
import { useGameStore } from '@/stores/game'
import { haptic } from '@/hooks/use-haptic'
import { cn } from '@/lib/utils'

type TrendingPhase = '爆发期' | '发酵期' | '上升期' | '平稳期'

export interface TrendingItem {
  rank: number
  title: string
  reads: string
  phase: TrendingPhase
  isPlayer?: boolean
  hot?: boolean
}

const TRENDING: TrendingItem[] = [
  {
    rank: 1,
    title: 'NOUVE新人发布首条动态',
    reads: '800w',
    phase: '发酵期',
    isPlayer: true,
    hot: true,
  },
  {
    rank: 2,
    title: '当红小花隐婚生子',
    reads: '515w',
    phase: '爆发期',
    hot: true,
  },
  {
    rank: 3,
    title: '某选秀节目争议黑幕',
    reads: '341w',
    phase: '爆发期',
    hot: true,
  },
  {
    rank: 4,
    title: '某男团成员疑似恋爱',
    reads: '304w',
    phase: '发酵期',
  },
  {
    rank: 5,
    title: '影后回归作预告',
    reads: '268w',
    phase: '上升期',
  },
  {
    rank: 6,
    title: 'LUMINA出道倒计时30天',
    reads: '215w',
    phase: '上升期',
  },
  {
    rank: 7,
    title: '粉丝应援色文化引热议',
    reads: '189w',
    phase: '平稳期',
  },
  {
    rank: 8,
    title: '练习生生存现状调查',
    reads: '142w',
    phase: '平稳期',
  },
]

const PHASE_COLORS: Record<TrendingPhase, string> = {
  爆发期: 'text-red-500',
  发酵期: 'text-orange-500',
  上升期: 'text-blue-500',
  平稳期: 'text-gray-400',
}

export default function WeiboPage() {
  const [tab, setTab] = React.useState<'trending' | 'me'>('trending')
  const [selectedItem, setSelectedItem] = React.useState<TrendingItem | null>(null)
  const [showDetail, setShowDetail] = React.useState(false)
  const artist = useGameStore((s) => s.artist)
  const stats = useGameStore((s) => s.stats)

  const handleItemClick = (item: TrendingItem) => {
    haptic.light()
    setSelectedItem(item)
    setShowDetail(true)
  }

  return (
    <PhoneShell background="solid" bgClassName="bg-white">
      <StatusBar full />

      {/* 顶部导航 */}
      <header
        aria-label="微博"
        className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
      >
        <Link
          href="/phone"
          aria-label="返回工作手机"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-gray-600"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 id="weibo-heading" className="text-base font-medium text-gray-800">微博</h1>
        <button
          type="button"
          aria-label="搜索"
          className="-mr-2 flex h-10 w-10 items-center justify-center text-gray-600"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      {/* Tab 切换 */}
      <div className="relative flex border-b border-gray-200 bg-white">
        {(['trending', 'me'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative flex-1 py-3 text-sm font-medium transition-colors',
              tab === t ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            {t === 'trending' ? '微博热搜' : '个人动态'}
            {tab === t && (
              <motion.div
                layoutId="weibo-tab-indicator"
                className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-orange-500"
              />
            )}
          </button>
        ))}
      </div>

      <main
        aria-labelledby="weibo-heading"
        className="flex-1 overflow-y-auto bg-gray-50"
      >
        {tab === 'trending' ? (
          <TrendingList onItemClick={handleItemClick} />
        ) : (
          <PersonalFeed artist={artist} followers={stats.followers} />
        )}
      </main>

      {/* 热搜详情弹层 */}
      <WeiboDetailDialog
        item={selectedItem}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </PhoneShell>
  )
}

/* ============================================================
 * 热搜榜
 * ========================================================== */
function TrendingList({ onItemClick }: { onItemClick: (item: TrendingItem) => void }) {
  return (
    <div className="px-4 py-3">
      <h2 className="mb-3 text-sm font-medium text-gray-500">热搜榜</h2>
      <div className="space-y-3">
        {TRENDING.map((item, idx) => (
          <motion.button
            type="button"
            key={item.rank}
            onClick={() => onItemClick(item)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            aria-label={`查看 ${item.title} 详情`}
            className={cn(
              'flex w-full items-start gap-3 rounded-lg bg-white p-3 text-left shadow-sm transition-transform active:scale-[0.98]',
              item.isPlayer && 'border border-orange-300 bg-orange-50/50'
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-sm font-bold',
                item.rank <= 3 ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {item.rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {item.hot && (
                  <Flame className="h-4 w-4 flex-shrink-0 text-red-500" />
                )}
                <span
                  className={cn(
                    'truncate font-medium text-gray-800',
                    item.isPlayer && 'text-orange-700'
                  )}
                >
                  {item.title}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="text-gray-400">{item.reads}</span>
                <span className={PHASE_COLORS[item.phase]}>
                  {item.phase}
                </span>
                {item.isPlayer && (
                  <span className="rounded bg-orange-500 px-1.5 py-0.5 text-xs text-white">
                    待处理
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
 * 个人动态
 * ========================================================== */
function PersonalFeed({
  artist,
  followers,
}: {
  artist: { name: string; avatar?: string }
  followers: number
}) {
  const liked = useGameStore((s) => s.weiboLiked)
  const toggleLike = useGameStore((s) => s.toggleWeiboLike)
  const likeCount = liked ? '5.9w' : '5.8w'

  const handleToggleLike = () => {
    toggleLike()
    haptic.medium()
  }

  return (
    <div className="space-y-3 p-4">
      <h2 className="text-sm font-medium text-gray-500">个人动态</h2>

      {/* 玩家动态卡（来自热搜 #1） */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {artist.avatar ? (
              <AvatarImage src={artist.avatar} alt={artist.name} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-pink-200 to-blue-200 text-sm dark:from-pink-800 dark:to-blue-800">
              {artist.name.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-800">
              {artist.name || '新人偶像'}
            </div>
            <div className="text-xs text-gray-500">30 分钟前</div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-800">
          第一次发文，有点紧张。希望大家多多关照。
          {'\n\n'}
          <span className="text-blue-500">#新星计划</span>
          <span className="text-blue-500"> #LUMINA</span>
        </p>

        <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
          <button
            onClick={handleToggleLike}
            className={cn(
              'flex items-center gap-1 transition-colors',
              liked && 'text-red-500'
            )}
            aria-label={liked ? '取消点赞' : '点赞'}
            aria-pressed={liked}
          >
            <Heart
              className={cn('h-4 w-4', liked && 'fill-current')}
            />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>1.2w</span>
          </button>
          <button className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span>8923</span>
          </button>
        </div>
      </motion.div>

      <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-400">
        — 没有更多动态了 —
      </div>
    </div>
  )
}