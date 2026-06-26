/**
 * 设置页（/phone/settings）
 *
 * 阶段 7 Round 5 修复：用户终于能改设置
 * - 字号（small/medium/large）
 * - 动效开关
 * - 减少动效开关
 * - 触觉反馈开关
 * - 音效开关（占位）
 * - 主题（auto/light/dark）
 * - 跳过快读对话
 * - 自动播放决策延迟
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Volume2, Vibrate, Eye, Zap, Type, Moon, Sun, Monitor, FastForward, Clock, Settings as SettingsIcon, MessageSquare } from 'lucide-react'
import { PhoneShell } from '@/components/business/phone-shell'
import { StatusBar } from '@/components/business/status-bar'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSettingsStore, type SettingsState } from '@/stores/settings'
import { useReducedMotion } from '@/hooks/use-preferences'
import { useTranslation } from '@/i18n/use-translation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const settings = useSettingsStore()
  const osReducedMotion = useReducedMotion()
  // 阶段 9 Round 1：接入 i18n
  const t = useTranslation()

  const fontSizeOptions: { value: SettingsState['fontSize']; label: string; preview: string }[] = [
    { value: 'small', label: '小', preview: '字号小' },
    { value: 'medium', label: '中', preview: '字号中（默认）' },
    { value: 'large', label: '大', preview: '字号大' },
  ]

  const themeOptions: { value: 'light' | 'dark' | 'auto'; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'auto', label: '跟随系统', icon: Monitor },
  ]

  return (
    <PhoneShell background="gradient" className="flex flex-col">
      <StatusBar full />

      {/* 顶部返回栏 */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Link
          href="/phone"
          aria-label="返回手机主页"
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/40 dark:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-8">
        {/* 显示 */}
        <Section title={t('settings.display')} icon={Eye}>
          {/* 字号 */}
          <Row label={t('settings.fontSize')} description="全局字号大小，部分组件可能不变">
            <div className="flex gap-1.5">
              {fontSizeOptions.map((opt) => {
                const active = settings.fontSize === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => settings.setPreference('fontSize', opt.value)}
                    aria-pressed={active}
                    aria-label={`${t('settings.fontSize')} ${opt.label}`}
                    className={cn(
                      'min-h-[44px] min-w-[44px] rounded-lg border-2 px-3 text-sm font-medium transition-all active:scale-95',
                      active
                        ? 'border-primary bg-primary/20 text-primary-700'
                        : 'border-gray-200 bg-white/40 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300'
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Row>

          {/* 主题 */}
          <Row label={t('settings.theme')} description="auto 会跟随系统">
            <div className="flex gap-1.5">
              {themeOptions.map((opt) => {
                const Icon = opt.icon
                const active = settings.theme === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => settings.setSystem('theme', opt.value)}
                    aria-pressed={active}
                    aria-label={`${t('settings.theme')} ${opt.label}`}
                    className={cn(
                      'flex min-h-[44px] items-center gap-1.5 rounded-lg border-2 px-3 text-sm font-medium transition-all active:scale-95',
                      active
                        ? 'border-primary bg-primary/20 text-primary-700'
                        : 'border-gray-200 bg-white/40 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Row>
        </Section>

        <Separator className="my-4 bg-gray-200/40 dark:bg-gray-800/40" />

        {/* 动效 */}
        <Section title={t('settings.interaction')} icon={Zap}>
          {/* 动效总开关 */}
          <Row label={t('settings.motionEnabled')} description="关闭后所有动画瞬时完成">
            <Switch
              checked={settings.motionEnabled}
              onCheckedChange={(checked) => settings.setSystem('motionEnabled', checked)}
              aria-label={t('settings.motionEnabled')}
            />
          </Row>

          {/* 减少动效 */}
          <Row
            label={t('settings.reducedMotion')}
            description={
              osReducedMotion
                ? '系统已开启减少动效，建议同步开启'
                : '减弱大幅动画，更柔和'
            }
          >
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => settings.setSystem('reducedMotion', checked)}
              aria-label={t('settings.reducedMotion')}
            />
          </Row>

          {/* 触觉 */}
          <Row label={t('settings.vibrationEnabled')} description="关键选择时震动">
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => settings.setSystem('vibrationEnabled', checked)}
              aria-label={t('settings.vibrationEnabled')}
            />
          </Row>
        </Section>

        <Separator className="my-4 bg-gray-200/40 dark:bg-gray-800/40" />

        {/* 声音 */}
        <Section title={t('settings.soundEnabled')} icon={Volume2}>
          <Row
            label={t('settings.soundEnabled')}
            description="通过 Web Audio API 合成，开启后即生效"
          >
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => settings.setSystem('soundEnabled', checked)}
              aria-label={t('settings.soundEnabled')}
            />
          </Row>
        </Section>

        <Separator className="my-4 bg-gray-200/40 dark:bg-gray-800/40" />

        {/* 剧情播放 */}
        <Section title="剧情播放" icon={FastForward}>
          {/* 跳过快读 */}
          <Row
            label="自动跳过快读对话"
            description="对话已被读过的部分会自动跳过"
          >
            <Switch
              checked={settings.autoSkipReadConversations}
              onCheckedChange={settings.setAutoSkipReadConversations}
              aria-label="自动跳过快读对话"
            />
          </Row>

          {/* 决策延迟 */}
          <Row label="决策展示时长" description={`${(settings.decisionDelay / 1000).toFixed(1)} 秒`}>
            <div className="w-32">
              <Slider
                value={[settings.decisionDelay]}
                min={1000}
                max={6000}
                step={500}
                onValueChange={(value) => settings.setPreference('decisionDelay', value[0])}
                aria-label="决策展示时长"
              />
            </div>
          </Row>
        </Section>

        <Separator className="my-4 bg-gray-200/40 dark:bg-gray-800/40" />

        {/* 反馈 */}
        <Section title={t('settings.feedback')} icon={MessageSquare}>
          <Link
            href="/phone/feedback"
            aria-label={t('settings.feedback')}
            className="flex min-h-[44px] items-center justify-between rounded-lg bg-white/40 p-3 transition-colors hover:bg-white/60 dark:bg-gray-900/40 dark:hover:bg-gray-900/60"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('feedback.title')}
            </span>
            <span className="text-xs text-gray-400">→</span>
          </Link>
        </Section>

        <Separator className="my-4 bg-gray-200/40 dark:bg-gray-800/40" />

        {/* 关于 */}
        <Section title={t('settings.about')} icon={Type}>
          <div className="rounded-xl bg-white/60 p-3 text-sm dark:bg-gray-900/40">
            <div className="font-medium text-gray-900 dark:text-gray-100">NOVA STAR · 新星计划</div>
            <div className="mt-1 text-xs text-gray-500">版本 0.1.0 · 30 天出道前沉浸式人生体验</div>
            <div className="mt-3 text-xs text-gray-500">
              所有存档与设置仅保存在你的设备本地。
            </div>
          </div>
        </Section>

        {/* 重置设置 */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('确定要恢复默认设置吗？这不会影响游戏存档。')) {
                settings.reset()
              }
            }}
            className="w-full"
            aria-label={t('settings.resetDefaults')}
          >
            {t('settings.resetDefaults')}
          </Button>
        </div>

        {/* 字号预览 */}
        <div className="mt-6 rounded-xl bg-primary/10 p-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="text-xs text-gray-500">当前字号预览：</div>
          <p className="mt-1" style={{ fontSize: `${settings.fontSize === 'small' ? 14 : settings.fontSize === 'large' ? 18 : 16}px` }}>
            追星是一场漫长的旅程。{fontSizeOptions.find((o) => o.value === settings.fontSize)?.preview}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            注：仅影响使用 rem 派生的组件，部分样式可能不受影响。
          </p>
        </div>
      </main>
    </PhoneShell>
  )
}

/* ============================================================
 * 区块
 * ========================================================== */
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white/40 p-4 backdrop-blur-sm dark:bg-gray-900/40"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.section>
  )
}

/* ============================================================
 * 单行设置
 * ========================================================== */
function Row({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-gray-500">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}