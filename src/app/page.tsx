/**
 * 开场沉浸叙事页（PRD 6.1 + 02-7页设计稿#页面1）
 *
 * Round 1 修复：
 * - 用 Radix Dialog 替代 window.confirm（移动端兼容）
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneShell } from '@/components/business/phone-shell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGameStore } from '@/stores/game'
import { listSaveSlots } from '@/lib/save-manager'

interface Paragraph {
  lines: string[]
  emphasis?: number
}

const SCRIPT: Paragraph[] = [
  {
    lines: [
      '世界上有一种幻象',
      '叫做「那个闪着光的人」。',
      '可以是我？',
    ],
    emphasis: 2,
  },
  {
    lines: [
      '十六岁那年，我坐在老旧的电视机前，',
      '看着颁奖典礼上飘落的金雨，眼眶莫名发热。',
      '那时我以为，那只是一个普通女孩对遥远光芒的仰望。',
    ],
  },
  {
    lines: [
      '直到二十岁，我握住了 NOVA STUDIO 的签约通知书。',
      '白色的信封，烫金的字样。',
      '那质地极好的纸张握在手里，有着奇异的重量，',
      '像是在无声地宣告：',
      '你选择了什么，就要为它付出什么。',
    ],
    emphasis: 0,
  },
  {
    lines: [
      '经纪人韩知恩坐在宽大的办公桌后，无框眼镜泛着冷光。',
      '「欢迎来到 NOVA。」',
      '她的声音没有起伏，',
      '「在这个圈子，努力是最廉价的词。',
      '我要看的是结果。」',
    ],
  },
  {
    lines: [
      '凌晨五点半，天还没亮。',
      '我端着探班的冷饮，推开了排练室的门。',
      '那一刻，我被眼前的景象震住了。',
      '音乐震耳欲聋，LUMINA 五个人的走位快得让人眼花缭乱。',
      '每一次抬臂、每一次转身，都卡在最精准的节拍上。',
    ],
  },
  {
    lines: [
      '那天起，命运的齿轮开始转动。',
      '三十天后，我要站在出道的舞台上。',
      '我不知道自己会发光，还是会坠落。',
      '但我已经没有退路。',
      '',
      '你准备好了吗？',
    ],
    emphasis: 5,
  },
]

const LINE_FADE_DURATION_MS = 800
const LINE_GAP_MS = 600
const PARAGRAPH_GAP_MS = 1200
const FINAL_HOLD_MS = 3000

export default function HomePage() {
  const router = useRouter()
  const [paragraphIndex, setParagraphIndex] = React.useState(0)
  const [lineIndex, setLineIndex] = React.useState(0)
  const [showStartButton, setShowStartButton] = React.useState(false)
  const [hasSave, setHasSave] = React.useState(false)
  const [showContinueDialog, setShowContinueDialog] = React.useState(false)

  // 检测是否有存档
  React.useEffect(() => {
    const slots = listSaveSlots()
    setHasSave(slots.some((s) => s.exists))
  }, [])

  // 推进叙事
  React.useEffect(() => {
    if (paragraphIndex >= SCRIPT.length) {
      setShowStartButton(true)
      const t = setTimeout(() => {
        // 自动开始（仅在无存档时）
        if (!hasSave) {
          handleStartNew()
        }
      }, FINAL_HOLD_MS)
      return () => clearTimeout(t)
    }

    const current = SCRIPT[paragraphIndex]
    if (!current) return
    if (lineIndex < current.lines.length) {
      const t = setTimeout(() => {
        setLineIndex((i) => i + 1)
      }, LINE_GAP_MS)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setParagraphIndex((p) => p + 1)
      setLineIndex(0)
    }, PARAGRAPH_GAP_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphIndex, lineIndex, hasSave])

  const handleAccelerate = React.useCallback(() => {
    const current = SCRIPT[paragraphIndex]
    if (!current) return

    if (lineIndex < current.lines.length) {
      setLineIndex(current.lines.length)
    } else {
      setParagraphIndex((p) => p + 1)
      setLineIndex(0)
    }
  }, [paragraphIndex, lineIndex])

  const handleStart = () => {
    if (hasSave) {
      setShowContinueDialog(true)
    } else {
      handleStartNew()
    }
  }

  const handleStartNew = () => {
    useGameStore.getState().reset()
    router.push('/onboarding')
  }

  const handleContinue = () => {
    setShowContinueDialog(false)
    router.push('/play')
  }

  const handleRestart = () => {
    setShowContinueDialog(false)
    handleStartNew()
  }

  // 计算当前应显示的所有行（累积式）
  const visibleLines: Array<{
    text: string
    emphasis: boolean
    paragraphIdx: number
    lineIdx: number
  }> = []
  for (let p = 0; p <= paragraphIndex && p < SCRIPT.length; p++) {
    const para = SCRIPT[p]
    if (!para) continue
    const linesToShow = p === paragraphIndex ? lineIndex : para.lines.length
    for (let l = 0; l < linesToShow; l++) {
      visibleLines.push({
        text: para.lines[l],
        emphasis: para.emphasis === l,
        paragraphIdx: p,
        lineIdx: l,
      })
    }
  }

  return (
    <PhoneShell background="solid" bgClassName="bg-black">
      <div
        onClick={showStartButton ? undefined : handleAccelerate}
        className="relative h-full w-full cursor-pointer overflow-hidden"
      >
        {/* 叙事文字 */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="popLayout">
              {visibleLines.map((line) => (
                <motion.p
                  key={`${line.paragraphIdx}-${line.lineIdx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: LINE_FADE_DURATION_MS / 1000 }}
                  className={
                    line.emphasis
                      ? 'mb-2 text-center font-serif text-3xl font-bold leading-relaxed text-white sm:text-4xl'
                      : 'mb-2 text-center font-serif text-xl leading-loose text-white/90 sm:text-2xl'
                  }
                  style={{ letterSpacing: '0.05em' }}
                >
                  {line.text || ' '}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 底部提示 / 按钮 */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <AnimatePresence>
            {!showStartButton && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p
                  className="animate-pulse text-sm text-white/60"
                  style={{ animationDuration: '2s' }}
                >
                  · 点击继续 ·
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showStartButton && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="w-full bg-white text-black hover:bg-white/90"
                >
                  {hasSave ? '继续 / 重玩' : '开始体验'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 继续/重玩 Dialog */}
      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent
          onOpenAutoFocus={(e) => {
            // 显式聚焦到「继续上次」按钮（更安全的默认选择）
            e.preventDefault()
            const continueBtn = document.querySelector<HTMLButtonElement>(
              '[data-dialog-action="continue"]'
            )
            continueBtn?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>检测到已有存档</DialogTitle>
            <DialogDescription>
              你可以选择继续上次的旅程，或者重新开始一段新的故事。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleRestart}>
              重新开始
            </Button>
            <Button type="button" onClick={handleContinue} data-dialog-action="continue">
              继续上次
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PhoneShell>
  )
}