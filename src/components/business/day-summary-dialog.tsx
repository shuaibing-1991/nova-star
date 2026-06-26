/**
 * 每日结算弹窗
 *
 * 显示：
 * - 今日活动列表
 * - 数值变化（↑↓ 视觉）
 * - 「进入下一天」按钮
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Moon, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getActivity, CATEGORY_META } from '@/lib/activity-catalog'
import { STAT_LABEL } from '@/lib/activity-engine'
import { useGameStore, type DayActivityLog } from '@/stores/game'
import { cn } from '@/lib/utils'

export interface DaySummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayNumber: number
  logs: DayActivityLog[]
  /** 进入下一天：父组件应当关闭 dialog 并跳走 */
  onEnterNextDay?: () => void
  /** 留在今天：父组件应当只关闭 dialog，不跳走 */
  onStayToday?: () => void
}

export const DaySummaryDialog: React.FC<DaySummaryDialogProps> = ({
  open,
  onOpenChange,
  dayNumber,
  logs,
  onEnterNextDay,
  onStayToday,
}) => {
  const advanceDay = useGameStore((s) => s.advanceDay)
  const clearTodayActivities = useGameStore((s) => s.clearTodayActivities)

  // 聚合数值变化
  const aggregateChanges = React.useMemo(() => {
    const map = new Map<keyof typeof STAT_LABEL, number>()
    for (const log of logs) {
      for (const c of log.changes) {
        map.set(c.key, (map.get(c.key) ?? 0) + c.delta)
      }
    }
    return Array.from(map.entries())
  }, [logs])

  const handleStay = () => {
    // 只关闭弹层，不推进 day
    onStayToday?.()
  }

  const handleSleep = () => {
    // 阶段 9 Round 1：进入下一天时播放 bell（柔和过渡音）
    if (typeof window !== 'undefined') {
      import('@/lib/sound').then(({ playSound }) => {
        playSound('bell')
      })
    }
    advanceDay()
    clearTodayActivities()
    onEnterNextDay?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            Day {dayNumber} 结束
          </DialogTitle>
          <DialogDescription>
            今日的安排已结算。看看发生了哪些变化：
          </DialogDescription>
        </DialogHeader>

        {/* 活动列表 */}
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
              <p>今天没有安排活动 · 休息一天</p>
              <p className="text-xs text-gray-400">
                明天体力会自动重置回 {80}，可以继续安排训练或通告
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const activity = getActivity(log.activityId)
              if (!activity) return null
              const meta = CATEGORY_META[log.category]
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {activity.name}
                      </span>
                      <span className={cn('text-xs', meta.color)}>
                        · {meta.label}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {log.changes.map((c, i) => (
                        <span
                          key={i}
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs',
                            c.delta > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {STAT_LABEL[c.key]} {c.delta > 0 ? '+' : ''}
                          {c.delta}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* 数值总变化 */}
        {aggregateChanges.length > 0 && (
          <div className="rounded-lg border border-pink-100 bg-pink-50/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sparkles className="h-4 w-4 text-pink-500" />
              今日数值变化
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {aggregateChanges.map(([key, delta]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded bg-white px-2 py-1"
                >
                  <span className="text-gray-600">
                    {STAT_LABEL[key] ?? key}
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-0.5 font-bold',
                      delta > 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {delta > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            onClick={handleSleep}
            className="w-full"
            size="lg"
          >
            进入 Day {dayNumber + 1}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleStay}
            className="w-full"
          >
            再调整今天
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
