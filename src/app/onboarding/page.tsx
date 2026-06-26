/**
 * 6 步艺人档案（PRD 6.2 + 02-7页设计稿#页面2）
 *
 * 6 步流程：
 * 1. 艺名（2-6 字）
 * 2. 气质（清冷/清爽/轻熟）
 * 3. 身高（150-190 cm 滑块）
 * 4. 头像（首字母默认 / 上传）
 * 5. 定位与人设（position + persona + romance + screenPresence）
 * 6. 粉丝名 + 应援色 + 路线
 *
 * 实时同步到 useGameStore 的 artist 字段。
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneShell } from '@/components/business/phone-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/stores/game'
import { defaultClientConfig } from '@/config/client'
import { cn } from '@/lib/utils'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ArtistProfile } from '@/types'

const TOTAL_STEPS = 6
const VIBE_OPTIONS = [
  { value: 'cool' as const, label: '清冷', desc: '18-22 岁 · 高冷疏离' },
  { value: 'fresh' as const, label: '清爽', desc: '19-25 岁 · 阳光自然' },
  { value: 'mature' as const, label: '轻熟', desc: '24-30 岁 · 优雅知性' },
]

const POSITION_OPTIONS = [
  { value: 'vocal' as const, label: '主唱' },
  { value: 'dance' as const, label: '舞担' },
  { value: 'creative' as const, label: '创作型' },
  { value: 'variety' as const, label: '综艺' },
  { value: 'acting' as const, label: '演员' },
  { value: 'visual' as const, label: '颜值' },
]

const PERSONA_OPTIONS = [
  { value: 'gentle' as const, label: '温柔真诚' },
  { value: 'cool-power' as const, label: '冷感实力' },
  { value: 'sunny' as const, label: '阳光元气' },
  { value: 'contrast' as const, label: '反差魅力' },
  { value: 'ambitious' as const, label: '野心勃勃' },
  { value: 'artistic' as const, label: '艺术敏感' },
]

const ROMANCE_OPTIONS = [
  { value: 'hetero' as const, label: '异性向' },
  { value: 'homo' as const, label: '同性向' },
  { value: 'both' as const, label: '双线' },
  { value: 'none' as const, label: '无感情线' },
]

const SCREEN_OPTIONS = [
  { value: 'high' as const, label: '高', desc: '镜头感强' },
  { value: 'medium' as const, label: '中', desc: '稳定发挥' },
  { value: 'low' as const, label: '低', desc: '私下更生动' },
]

const FAN_COLORS = [
  '#FFB6C1', // 粉
  '#B8C5D6', // 雾蓝
  '#C4B5FD', // 紫罗兰
  '#FBBF24', // 琥珀
  '#86EFAC', // 嫩绿
  '#FCA5A5', // 珊瑚
  '#A5B4FC', // 蓝紫
  '#FDE68A', // 奶黄
]

const ROUTE_OPTIONS = [
  {
    value: 'girl-group' as const,
    label: '女团出道',
    desc: defaultClientConfig.content.groupName,
    detail: '5 人女团，强调协作与化学反应',
  },
  {
    value: 'solo' as const,
    label: '个人 Solo',
    desc: 'Solo',
    detail: '独自发展，挑战更大但也更自由',
  },
  {
    value: 'boy-group' as const,
    label: '男团出道',
    desc: '男团',
    detail: '与一群男生共同进退',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const artist = useGameStore((s) => s.artist)
  const setArtist = useGameStore((s) => s.setArtist)
  const stats = useGameStore((s) => s.stats)
  const setStat = useGameStore((s) => s.setStat)
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1) // 1 forward, -1 backward
  const [error, setError] = React.useState<string | null>(null)

  // 键盘导航：Enter 下一步，方向左/右切换
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 在输入框中时 Enter 不触发切换（避免打断）
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (e.key === 'Enter' && !isInput) {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' && !isInput && step > 0) {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const validateCurrent = (): boolean => {
    if (step === 0) {
      const len = artist.name.length
      if (len < 2 || len > 6) {
        setError('艺名需为 2-6 个字')
        return false
      }
    }
    if (step === 5) {
      if (!artist.fanName || artist.fanName.length < 2) {
        setError('请填写粉丝名（至少 2 个字）')
        return false
      }
    }
    setError(null)
    return true
  }

  const goNext = () => {
    if (!validateCurrent()) return
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep(step + 1)
    } else {
      // 完成 onboarding，进入剧情
      router.push('/play')
    }
  }

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
      setError(null)
    }
  }

  const goToStep = (target: number) => {
    if (target < 0 || target >= TOTAL_STEPS) return
    if (target > step) return // 只能向前通过 goNext（带校验）
    setDirection(target < step ? -1 : 1)
    setStep(target)
    setError(null)
  }

  const handleQuickStart = () => {
    // 使用默认设定直接进入剧情
    // 仅校验艺名（必填）
    if (artist.name.length < 2) {
      setError('请先填写艺名（至少 2 个字）')
      setStep(0)
      return
    }
    // 其余字段保持 defaultArtist 默认值
    router.push('/play')
  }

  // 自动从 customer config 初始化未设置字段
  React.useEffect(() => {
    if (!artist.fanName || artist.fanName === defaultClientConfig.content.fanName) {
      // 仅在首次进入时初始化（如果用户还没改）
    }
  }, [artist.fanName])

  return (
    <PhoneShell background="gradient" className="flex flex-col">
      {/* 进度条 */}
      <div className="flex items-center justify-between px-6 pt-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
            step === 0
              ? 'cursor-not-allowed text-gray-400'
              : 'text-gray-700 hover:bg-white/50 dark:text-gray-200'
          )}
          aria-label="上一步"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const isCompleted = i < step
            const isCurrent = i === step
            const canJumpBack = isCompleted // 只允许跳回已完成步骤
            return (
              <button
                key={i}
                onClick={() => canJumpBack && goToStep(i)}
                disabled={!canJumpBack}
                aria-label={`第 ${i + 1} 步${isCurrent ? '（当前）' : isCompleted ? '' : '（未完成）'}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  isCurrent
                    ? 'w-8 bg-primary'
                    : isCompleted
                      ? 'w-2 cursor-pointer bg-primary/60 hover:bg-primary/80'
                      : 'pointer-events-none w-2 bg-gray-300 dark:bg-gray-700'
                )}
              />
            )
          })}
        </div>
        <div className="w-8 text-center text-xs text-gray-500">
          {step + 1}/{TOTAL_STEPS}
        </div>
      </div>

      {/* 步骤内容 */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 overflow-y-auto px-6 py-4"
          >
            {step === 0 && <StepName artist={artist} setArtist={setArtist} />}
            {step === 1 && <StepVibe artist={artist} setArtist={setArtist} />}
            {step === 2 && <StepHeight artist={artist} setArtist={setArtist} />}
            {step === 3 && <StepAvatar artist={artist} setArtist={setArtist} />}
            {step === 4 && (
              <StepPosition
                artist={artist}
                setArtist={setArtist}
                screenPresence={stats.screenPresence}
                setStat={setStat}
              />
            )}
            {step === 5 && (
              <StepFanConfig artist={artist} setArtist={setArtist} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 摘要卡 */}
      <SummaryCard artist={artist} />

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 快速开始入口（仅在 step 5/6 显示） */}
      {(step === 4 || step === 5) && (
        <div className="px-6 pb-1 text-center">
          <button
            type="button"
            onClick={handleQuickStart}
            className="text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
          >
            没想好？使用推荐设定直接开始 →
          </button>
        </div>
      )}

      {/* 主按钮 */}
      <div className="px-6 pb-4 pt-2">
        <Button onClick={goNext} size="lg" className="w-full">
          {step < TOTAL_STEPS - 1 ? (
            <>
              下一步
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              完成
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </PhoneShell>
  )
}

/* ============================================================
 * 步骤 1：艺名
 * ========================================================== */
function StepName({
  artist,
  setArtist,
}: {
  artist: ArtistProfile
  setArtist: (a: Partial<ArtistProfile>) => void
}) {
  return (
    <div className="space-y-6 pt-8">
      <h1 className="text-center font-serif text-2xl font-bold text-gray-800 dark:text-gray-100">
        给你的艺人起个名字
      </h1>
      <p className="text-center text-sm text-gray-500">
        这是你将以「{artist.name || '...'}」的身份踏上 30 天旅程
      </p>
      <div className="pt-4">
        <Input
          type="text"
          value={artist.name}
          onChange={(e) => setArtist({ name: e.target.value })}
          placeholder="输入你的艺名"
          maxLength={6}
          aria-label="艺名"
          className="text-center text-lg"
          autoFocus
        />
        <p className="mt-2 text-center text-xs text-gray-500">
          2-6 个字 · {artist.name.length}/6
        </p>
      </div>
    </div>
  )
}

/* ============================================================
 * 步骤 2：气质
 * ========================================================== */
function StepVibe({
  artist,
  setArtist,
}: {
  artist: ArtistProfile
  setArtist: (a: Partial<ArtistProfile>) => void
}) {
  return (
    <div className="space-y-4 pt-8">
      <h1 className="text-center font-serif text-2xl font-bold text-gray-800 dark:text-gray-100">
        选择你的气质
      </h1>
      <div className="grid grid-cols-2 gap-3 pt-6">
        {VIBE_OPTIONS.map((v) => (
          <button
            type="button"
            key={v.value}
            onClick={() => setArtist({ vibe: v.value })}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-all',
              artist.vibe === v.value
                ? 'border-primary bg-pink-50 shadow-md dark:bg-pink-950/30'
                : 'border-gray-200 hover:border-pink-200 dark:border-gray-700'
            )}
          >
            <div className="font-medium text-gray-800 dark:text-gray-100">
              {v.label}气质
            </div>
            <div className="mt-1 text-xs text-gray-500">{v.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
 * 步骤 3：身高
 * ========================================================== */
function StepHeight({
  artist,
  setArtist,
}: {
  artist: ArtistProfile
  setArtist: (a: Partial<ArtistProfile>) => void
}) {
  const feedback = getHeightFeedback(artist.height)
  return (
    <div className="space-y-8 pt-12">
      <h1 className="text-center font-serif text-2xl font-bold text-gray-800 dark:text-gray-100">
        你的身高
      </h1>
      <div className="text-center font-serif text-6xl font-bold text-primary">
        {artist.height}
        <span className="ml-1 text-2xl text-gray-500">cm</span>
      </div>
      <div className="px-4 pt-4">
        <Slider
          value={[artist.height]}
          min={150}
          max={190}
          step={1}
          onValueChange={([v]) => setArtist({ height: v })}
        />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>150</span>
          <span>175</span>
          <span>190</span>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {feedback}
      </p>
    </div>
  )
}

function getHeightFeedback(h: number): string {
  if (h < 158) return '你看起来娇小可爱'
  if (h < 165) return '你看起来清新小巧'
  if (h < 172) return '你看起来恰到好处'
  if (h < 178) return '你看起来比同龄人高挑'
  return '你看起来气场十足'
}

/* ============================================================
 * 步骤 4：头像
 * ========================================================== */
function StepAvatar({
  artist,
  setArtist,
}: {
  artist: ArtistProfile
  setArtist: (a: Partial<ArtistProfile>) => void
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const initial = artist.name.charAt(0) || '?'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setArtist({ avatar: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 pt-8">
      <h1 className="text-center font-serif text-2xl font-bold text-gray-800 dark:text-gray-100">
        选择你的头像
      </h1>
      <div className="flex justify-center pt-4">
        <Avatar className="h-48 w-48 border-4 border-white shadow-xl">
          {artist.avatar ? (
            <AvatarImage src={artist.avatar} alt={artist.name} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-pink-200 to-blue-200 text-5xl text-gray-700 dark:from-pink-800 dark:to-blue-800 dark:text-gray-200">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-2 border-gray-200 p-3 text-sm transition-all hover:border-pink-200 dark:border-gray-700"
        >
          📷 上传
        </button>
        <button
          type="button"
          onClick={() => setArtist({ avatar: undefined })}
          className="rounded-xl border-2 border-pink-300 bg-pink-50 p-3 text-sm dark:bg-pink-950/30"
        >
          ✨ 默认
        </button>
        <button
          type="button"
          disabled
          className="rounded-xl border-2 border-gray-200 p-3 text-sm opacity-50 dark:border-gray-700"
        >
          🎨 AI 生成
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-center text-xs text-gray-500">
        {artist.avatar ? '已上传自定义头像' : '未上传则使用名字首字母'}
      </p>
    </div>
  )
}

/* ============================================================
 * 步骤 5：定位与人设
 * ========================================================== */
function StepPosition({
  artist,
  setArtist,
  screenPresence,
  setStat,
}: {
  artist: ArtistProfile
  setArtist: (a: Partial<ArtistProfile>) => void
  screenPresence: 'high' | 'medium' | 'low'
  setStat: (key: keyof Stats, value: number) => void
}) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  return (
    <div className="space-y-6 pt-4">
      <h1 className="text-center font-serif text-2xl font-bold text-gray-800 dark:text-gray-100">
        你的定位与人设
      </h1>

      <Section title="你的定位">
        <div className="flex flex-wrap gap-2">
          {POSITION_OPTIONS.map((p) => (
            <Badge
              key={p.value}
              variant={artist.position === p.value ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-sm"
              onClick={() => setArtist({ position: p.value })}
            >
              {p.label}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="你的人设">
        <div className="flex flex-wrap gap-2">
          {PERSONA_OPTIONS.map((p) => (
            <Badge
              key={p.value}
              variant={artist.persona === p.value ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-sm"
              onClick={() => setArtist({ persona: p.value })}
            >
              {p.label}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="上镜感">
        <div className="grid grid-cols-3 gap-2">
          {SCREEN_OPTIONS.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => setStat('screenPresence', s.value as any)}
              className={cn(
                'rounded-xl border-2 p-3 text-center transition-all',
                screenPresence === s.value
                  ? 'border-primary bg-pink-50 dark:bg-pink-950/30'
                  : 'border-gray-200 hover:border-pink-200 dark:border-gray-700'
              )}
            >
              <div className="text-lg font-bold">{s.label}</div>
              <div className="mt-1 text-xs text-gray-500">{s.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* 高级选项：感情线（折叠） */}
      <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          className="flex w-full items-center justify-between text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <span>感情线偏好（可选）</span>
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              showAdvanced && 'rotate-90'
            )}
          />
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {ROMANCE_OPTIONS.map((p) => (
                <Badge
                  key={p.value}
                  variant={artist.romance === p.value ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 text-sm"
                  onClick={() => setArtist({ romance: p.value })}
                >
                  {p.label}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              默认是「无感情线」，选择其他会影响剧情走向
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </h2>
      {children}
    </div>
  )
}

/* ============================================================
 * 步骤 6：粉丝名 + 应援色 + 路线
 * ========================================================== */
function StepFanConfig({
  artist,
  setArtist,
}: {
  artist: ArtistProfile
  setArtist: (a: Partial<ArtistProfile>) => void
}) {
  return (
    <div className="space-y-6 pt-4">
      <h1 className="text-center font-serif text-2xl font-bold text-gray-800 dark:text-gray-100">
        粉丝与路线
      </h1>

      <Section title="你的粉丝叫什么">
        <Input
          type="text"
          value={artist.fanName}
          onChange={(e) => setArtist({ fanName: e.target.value })}
          placeholder="粉丝团名"
          maxLength={10}
          aria-label="粉丝名"
        />
      </Section>

      <Section title="你的应援色">
        <div className="flex flex-wrap gap-3 pt-2">
          {FAN_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setArtist({ fanColor: c })}
              className={cn(
                'h-10 w-10 rounded-full transition-all',
                artist.fanColor === c
                  ? 'ring-4 ring-primary ring-offset-2 scale-110'
                  : 'hover:scale-110'
              )}
              style={{ backgroundColor: c }}
              aria-label={`选择颜色 ${c}`}
            />
          ))}
        </div>
      </Section>

      <Section title="你的发展路线">
        <div className="space-y-2 pt-1">
          {ROUTE_OPTIONS.map((r) => (
            <button
              type="button"
              key={r.value}
              onClick={() => setArtist({ route: r.value })}
              className={cn(
                'w-full rounded-xl border-2 p-3 text-left transition-all',
                artist.route === r.value
                  ? 'border-primary bg-pink-50 dark:bg-pink-950/30'
                  : 'border-gray-200 hover:border-pink-200 dark:border-gray-700'
              )}
            >
              <div className="font-medium text-gray-800 dark:text-gray-100">
                {r.label} · {r.desc}
              </div>
              <div className="mt-1 text-xs text-gray-500">{r.detail}</div>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ============================================================
 * 摘要卡（实时显示）
 * ========================================================== */
function SummaryCard({ artist }: { artist: ArtistProfile }) {
  return (
    <div className="mx-6 mb-3 rounded-xl bg-white/70 p-3 font-sans shadow-sm backdrop-blur-sm dark:bg-gray-900/70">
      <div className="grid grid-cols-3 gap-2 text-xs">
        <SummaryItem label="艺名" value={artist.name || '...'} />
        <SummaryItem label="气质" value={getVibeLabel(artist.vibe)} />
        <SummaryItem label="身高" value={`${artist.height}cm`} />
        <SummaryItem label="定位" value={getPositionLabel(artist.position)} />
        <SummaryItem label="人设" value={getPersonaLabel(artist.persona)} />
        <SummaryItem label="路线" value={getRouteLabel(artist.route)} />
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="truncate font-sans font-medium text-gray-800 dark:text-gray-200">
        {value}
      </div>
    </div>
  )
}

function getVibeLabel(v: ArtistProfile['vibe']) {
  return VIBE_OPTIONS.find((o) => o.value === v)?.label ?? v
}
function getPositionLabel(p: ArtistProfile['position']) {
  return POSITION_OPTIONS.find((o) => o.value === p)?.label ?? p
}
function getPersonaLabel(p: ArtistProfile['persona']) {
  return PERSONA_OPTIONS.find((o) => o.value === p)?.label ?? p
}
function getRouteLabel(r: ArtistProfile['route']) {
  return ROUTE_OPTIONS.find((o) => o.value === r)?.label ?? r
}