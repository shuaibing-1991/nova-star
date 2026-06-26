/**
 * 设置状态（Zustand）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PlaybackPreferences } from '@/types'

export interface SettingsState extends PlaybackPreferences {
  // 额外系统设置
  soundEnabled: boolean
  vibrationEnabled: boolean
  reducedMotion: boolean
  language: 'zh-CN' | 'en-US'
  // 性能
  motionEnabled: boolean
  // 教程
  hasSeenOnboarding: boolean
  hasSeenTutorial: boolean
  // 行动点
  setPreference: <K extends keyof PlaybackPreferences>(
    key: K,
    value: PlaybackPreferences[K]
  ) => void
  setSystem: <K extends 'soundEnabled' | 'vibrationEnabled' | 'reducedMotion' | 'language' | 'motionEnabled'>(
    key: K,
    value: SettingsState[K]
  ) => void
  setAutoSkipReadConversations: (value: boolean) => void
  markOnboardingSeen: () => void
  markTutorialSeen: () => void
  reset: () => void
}

const defaultSettings: Omit<SettingsState, 'setPreference' | 'setSystem' | 'setAutoSkipReadConversations' | 'markOnboardingSeen' | 'markTutorialSeen' | 'reset'> = {
  skipOpening: false,
  defaultDecisionStyle: 'neutral',
  autoSkipReadConversations: false,
  decisionDelay: 3000,
  theme: 'auto',
  fontSize: 'medium',
  soundEnabled: true,
  vibrationEnabled: true,
  reducedMotion: false,
  language: 'zh-CN',
  motionEnabled: true,
  hasSeenOnboarding: false,
  hasSeenTutorial: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setPreference: (key, value) => set({ [key]: value }),
      setSystem: (key, value) => set({ [key]: value }),
      setAutoSkipReadConversations: (value) =>
        set({ autoSkipReadConversations: value }),
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      markTutorialSeen: () => set({ hasSeenTutorial: true }),
      reset: () => set(defaultSettings),
    }),
    {
      name: 'nova-star-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)