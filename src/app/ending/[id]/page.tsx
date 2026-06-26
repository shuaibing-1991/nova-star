/**
 * 结局页（PRD 6.10 + 02-7页设计稿#页面7）
 *
 * 4 种结局：
 * - success：成功出道
 * - failure：失败
 * - hidden：隐藏彩蛋（特定剧情分支触发）
 * - neutral：中立结局
 *
 * 视觉：黑底白字、霞鹜文楷、逐行淡入
 */
'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneShell } from '@/components/business/phone-shell'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/stores/game'
import { cn } from '@/lib/utils'
import { getArticleSchema } from '@/lib/structured-data'

type EndingType = 'success' | 'failure' | 'hidden' | 'neutral'

interface Ending {
  type: EndingType
  title: string
  paragraphs: string[]
  emphasisLines?: number[] // 全局第几行加大
  npcLines?: Array<{ name: string; text: string }>
  epilogue: string
  buttons: Array<{ label: string; action: 'restart' | 'share' | 'menu' }>
}

const ENDINGS: Record<string, Ending> = {
  success: {
    type: 'success',
    title: '成功出道',
    paragraphs: [
      '三十天',
      '比你想象的更长，也比你想象的更短。',
      '',
      '灯光亮起的那一刻，我站在舞台中央。',
      '我听见自己的心跳声，',
      '也听见了五千人的欢呼。',
      '',
      '那一刻我知道，',
      '我不再是我。',
      '我是 123。',
      '是 LUMINA 的 123。',
    ],
    emphasisLines: [8, 10],
    npcLines: [
      { name: '韩知恩', text: '还行。' },
      { name: '许嘉树', text: '我们做到了，123。' },
      { name: '周砚', text: '别得意，这才刚开始。' },
      { name: '沈遥', text: '谢谢你……一直陪着我。' },
      { name: '林夏', text: '恭喜，欢迎来到真正的娱乐圈。' },
    ],
    epilogue:
      '你成为了 NOVA STUDIO 出道的练习生。\n30 天前，你还只是一个普通女孩。\n30 天后，你站在了五万人面前。\n\n这不是结束。\n这只是开始。',
    buttons: [
      { label: '再来一次', action: 'restart' },
      { label: '分享', action: 'share' },
    ],
  },
  failure: {
    type: 'failure',
    title: '未能出道',
    paragraphs: [
      '三十天',
      '比你想象的更长，',
      '也比你想象的更难。',
      '',
      'Showcase 结束的那一刻，',
      '灯光暗下来。',
      '经纪人的脸上没有表情。',
      '',
      '「机会还很多，」她说，「但不是给所有人。」',
    ],
    emphasisLines: [7],
    epilogue:
      '你错过了这次出道。\n但你没有错过这三十天。',
    buttons: [
      { label: '重来', action: 'restart' },
      { label: '分享', action: 'share' },
    ],
  },
  hidden: {
    type: 'hidden',
    title: '隐藏结局 · 真正的胜利',
    paragraphs: [
      '我从来没有想过，',
      '在这条路上会遇见他们。',
      '',
      '不是因为舞台，',
      '不是因为出道，',
      '而是因为——',
      '在我最需要的时候，',
      '有人愿意相信我。',
      '',
      '这比任何奖项都更值得。',
    ],
    emphasisLines: [7],
    epilogue:
      '你解锁了隐藏结局：真正的胜利不是站在舞台中央，而是有人愿意陪你走过所有难走的路。',
    buttons: [
      { label: '再次体验', action: 'restart' },
      { label: '返回主菜单', action: 'menu' },
    ],
  },
  neutral: {
    type: 'neutral',
    title: '中庸结局',
    paragraphs: [
      '三十天过去了。',
      '我没有站在最耀眼的灯光下，',
      '也没有跌落到无人问津。',
      '',
      '我成为了 LUMINA 的普通一员。',
      '够好，但还不够亮。',
    ],
    emphasisLines: [4],
    epilogue:
      '你成为了 LUMINA 的一员，虽然不是最耀眼的那位，但你的旅程还在继续。',
    buttons: [
      { label: '再来一次', action: 'restart' },
      { label: '返回主菜单', action: 'menu' },
    ],
  },
}

const LINE_FADE_MS = 1000
const LINE_GAP_MS = 1500

export default function EndingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? 'success'

  // 阶段 6 修复：非法 id 显式提示，避免静默 fallback 到 success 掩盖路由 bug
  if (!ENDINGS[id]) {
    return (
      <PhoneShell background="solid" bgClassName="bg-black">
        <div className="flex h-full w-full flex-col items-center justify-center text-white">
          <p className="mb-2 text-2xl font-semibold">结局不存在</p>
          <p className="mb-6 text-sm text-white/60">
            你访问的结局 ID 无效（{id}）
          </p>
          <Button variant="outline" onClick={() => router.push('/phone')}>
            返回主菜单
          </Button>
        </div>
      </PhoneShell>
    )
  }

  const ending = ENDINGS[id]

  const reset = useGameStore((s) => s.reset)

  const [visibleLineCount, setVisibleLineCount] = React.useState(0)
  const [showNpcLines, setShowNpcLines] = React.useState(false)
  const [showEpilogue, setShowEpilogue] = React.useState(false)
  const [showButtons, setShowButtons] = React.useState(false)

  // 主文案逐行显示
  React.useEffect(() => {
    if (visibleLineCount < ending.paragraphs.length) {
      const t = setTimeout(() => {
        setVisibleLineCount((c) => c + 1)
      }, LINE_GAP_MS)
      return () => clearTimeout(t)
    }
    // 主文案播完
    if (ending.npcLines && ending.npcLines.length > 0) {
      const t = setTimeout(() => setShowNpcLines(true), LINE_GAP_MS)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setShowEpilogue(true), LINE_GAP_MS)
      return () => clearTimeout(t)
    }
  }, [visibleLineCount, ending.paragraphs.length, ending.npcLines])

  // NPC lines 显示完后进入 epilogue
  React.useEffect(() => {
    if (!showNpcLines || !ending.npcLines) return
    const t = setTimeout(() => setShowEpilogue(true), LINE_GAP_MS * 2)
    return () => clearTimeout(t)
  }, [showNpcLines, ending.npcLines])

  // epilogue 显示完后显示按钮
  React.useEffect(() => {
    if (!showEpilogue) return
    const t = setTimeout(() => setShowButtons(true), LINE_GAP_MS * 2)
    return () => clearTimeout(t)
  }, [showEpilogue])

  const handleAccelerate = () => {
    setVisibleLineCount(ending.paragraphs.length)
    setShowNpcLines(true)
    setShowEpilogue(true)
    setShowButtons(true)
  }

  const handleAction = (action: 'restart' | 'share' | 'menu') => {
    if (action === 'restart') {
      reset()
      router.push('/onboarding')
    } else if (action === 'menu') {
      reset()
      router.push('/')
    } else if (action === 'share') {
      handleShare()
    }
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const text = `我在《NOVA STAR》中解锁了【${ending.title}】结局。`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'NOVA STAR', text })
      } catch {
        // 用户取消分享
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        alert('结局已复制到剪贴板')
      } catch {
        // 浏览器不支持
      }
    }
  }

  return (
    <PhoneShell background="solid" bgClassName="bg-black">
      {/* 阶段 8 Round 3：注入 Article JSON-LD（SSR 时生成） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getArticleSchema({
              title: `${ending.title} · NOVA STAR`,
              description:
                ending.epilogue?.slice(0, 100) ?? 'NOVA STAR 结局页',
              endingType: id,
            })
          ),
        }}
      />
      <div
        onClick={!showButtons ? handleAccelerate : undefined}
        className="relative flex h-full w-full cursor-pointer flex-col overflow-y-auto bg-black text-white"
      >
        {/* 顶部留白 */}
        <div className="h-12 flex-shrink-0" />

        {/* 结局主文案 */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-2xl space-y-1 text-center">
            <AnimatePresence mode="popLayout">
              {ending.paragraphs.slice(0, visibleLineCount).map((line, idx) => {
                const isEmphasis = ending.emphasisLines?.includes(idx)
                return (
                  <motion.p
                    key={`${id}-${idx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isEmphasis ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: LINE_FADE_MS / 1000,
                      scale: { duration: 0.6 },
                    }}
                    className={cn(
                      'font-serif leading-loose',
                      isEmphasis
                        ? 'text-3xl font-bold sm:text-4xl'
                        : 'text-xl sm:text-2xl',
                      line === '' && 'h-4'
                    )}
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {line || ' '}
                  </motion.p>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* NPC 的话 */}
        <AnimatePresence>
          {showNpcLines && ending.npcLines && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-full max-w-2xl space-y-2 px-8 pb-8"
            >
              <div className="my-4 h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <h3 className="mb-3 text-center text-sm text-white/60">NPC 的话</h3>
              {ending.npcLines.map((npc, idx) => (
                <motion.div
                  key={npc.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.3 }}
                  className="text-sm"
                >
                  <span className="font-medium text-white/80">{npc.name}：</span>
                  <span className="text-white/90">「{npc.text}」</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 尾声 */}
        <AnimatePresence>
          {showEpilogue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full max-w-2xl px-8 pb-8"
            >
              <div className="my-6 h-px w-32 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <p className="whitespace-pre-line text-center font-serif text-base leading-loose text-white/85">
                {ending.epilogue}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 按钮 */}
        <AnimatePresence>
          {showButtons && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-full max-w-2xl px-8 pb-8"
            >
              <div className="space-y-3">
                {ending.buttons.map((btn, idx) => (
                  <motion.div
                    key={btn.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <button
                      onClick={() => handleAction(btn.action)}
                      className={cn(
                        'w-full rounded-full px-8 py-3 text-base font-medium transition-transform active:scale-95',
                        idx === 0
                          ? 'bg-white text-black'
                          : 'border border-white/40 text-white'
                      )}
                    >
                      {btn.label}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 加速提示 */}
        {!showButtons && (
          <div className="flex-shrink-0 px-8 pb-8 text-center">
            <p className="animate-pulse text-xs text-white/40">
              · 点击屏幕加速 ·
            </p>
          </div>
        )}
      </div>
    </PhoneShell>
  )
}