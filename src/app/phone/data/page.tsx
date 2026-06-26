/**
 * 数据分析页（PRD 6.5 + 02-7页 扩展）
 *
 * 模块：
 * - 数值雷达图
 * - 粉丝画像
 * - 决策建议
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Home, Lightbulb } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { PhoneHeader } from '@/components/business/phone-header'
import { SectionCard } from '@/components/business/section-card'
import { KeyStat } from '@/components/business/key-stat'
import { StatusBar } from '@/components/business/status-bar'
import { StatRadar } from '@/components/business/stat-radar'
import { FanDemographic } from '@/components/business/fan-demographic'
import { useGameStore } from '@/stores/game'
import {
  generateAdvice,
  computeFanDemographics,
  screenPresenceToNumber,
} from '@/lib/data-advisor'
import { cn } from '@/lib/utils'

export default function DataPage() {
  const router = useRouter()
  const stats = useGameStore((s) => s.stats)
  const relationships = useGameStore((s) => s.relationships)
  const progress = useGameStore((s) => s.progress)
  const artist = useGameStore((s) => s.artist)

  const advice = React.useMemo(
    () =>
      generateAdvice({
        stats,
        relationships,
        dayNumber: progress.currentDay,
      }),
    [stats, relationships, progress.currentDay]
  )

  const fans = React.useMemo(
    () => computeFanDemographics(stats, artist),
    [stats, artist]
  )

  const radarData = React.useMemo(
    () => [
      { label: '声乐', value: stats.vocal, max: 100 },
      { label: '舞蹈', value: stats.dance, max: 100 },
      { label: '舞台', value: stats.stage, max: 100 },
      { label: '心情', value: stats.mood, max: 100 },
      { label: '信任', value: stats.trust, max: 100 },
      {
        label: '上镜',
        value: screenPresenceToNumber(stats.screenPresence),
        max: 100,
      },
    ],
    [stats]
  )

  return (
    <PhoneShell background="solid" bgClassName="bg-[#F5F5F5]">
      <StatusBar full />

      <PhoneHeader title="数据分析" titleId="data-heading" />

      <main className="flex-1 overflow-y-auto" aria-labelledby="data-heading">
        <h2 className="sr-only">当前养成数据</h2>

        {/* 数值雷达图 */}
        <section className="px-4 pt-4" aria-label="能力雷达图">
          <SectionCard title="能力雷达">
            <StatRadar data={radarData} />
          </SectionCard>
        </section>

        {/* 关键数值 */}
        <section className="px-4 pt-4" aria-label="关键数值">
          <div className="grid grid-cols-3 gap-2">
            <KeyStat
              label="总粉丝"
              value={stats.followers.toLocaleString()}
              color="text-pink-500"
            />
            <KeyStat
              label="心情"
              value={`${stats.mood}/100`}
              color="text-blue-500"
              progress={stats.mood / 100}
            />
            <KeyStat
              label="信任"
              value={`${stats.trust}/100`}
              color="text-orange-500"
              progress={stats.trust / 100}
            />
          </div>
        </section>

        {/* 粉丝画像 */}
        <section className="px-4 pt-4" aria-label="粉丝画像">
          <SectionCard title="粉丝画像">
            {fans.length === 0 ? (
              stats.followers === 0 ? (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-gray-400">你还没有粉丝</p>
                  <Link
                    href="/phone/weibo"
                    className="inline-block text-xs text-blue-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:rounded"
                  >
                    去微博发帖吸引关注 →
                  </Link>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400">
                  暂无粉丝数据
                </p>
              )
            ) : (
              <FanDemographic segments={fans} />
            )}
          </SectionCard>
        </section>

        {/* 决策建议 */}
        <section className="px-4 pt-4" aria-label="决策建议">
          <SectionCard title="今日建议" icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}>
            {advice.length === 0 ? (
              <p className="text-sm text-gray-400">
                当前状态良好 · 继续努力
              </p>
            ) : (
              <ul
                className="space-y-2"
                aria-label="建议列表"
                aria-live="polite"
              >
                {advice.map((a) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'rounded-lg border-l-4 p-3',
                      a.level === 'high' && 'border-red-400 bg-red-50/50',
                      a.level === 'medium' &&
                        'border-yellow-400 bg-yellow-50/50',
                      a.level === 'low' && 'border-green-400 bg-green-50/50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span aria-hidden className="text-xl">
                        {a.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {a.title}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {a.desc}
                        </p>
                        {a.actionLabel && a.actionHref && (
                          <Link
                            href={a.actionHref}
                            className="mt-2 inline-block text-xs text-blue-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:rounded"
                          >
                            {a.actionLabel} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </SectionCard>
        </section>

        <div className="h-4" />
      </main>

      {/* Home 键（L3 修复：与其他 phone/* 子页一致） */}
      <button
        onClick={() => router.push('/play')}
        className="mx-auto mb-2 flex h-10 w-32 items-center justify-center rounded-full bg-gradient-to-b from-gray-200 to-gray-300 text-xs text-gray-600 shadow-inner dark:from-gray-700 dark:to-gray-800 dark:text-gray-300"
        aria-label="回到剧情"
      >
        <Home className="mr-1 h-3 w-3" />
        回到剧情
      </button>
    </PhoneShell>
  )
}