/**
 * 反馈 Store（Zustand）
 *
 * 阶段 9 Round 3 新增：用户反馈本地管理
 *
 * 职责：
 * - 管理反馈草稿
 * - 记录反馈历史（最近 10 条，仅元数据，不含详情）
 * - 限流（60 秒/次）
 *
 * 注意：
 * - 内容（content）和联系方式（contact）仅本地保留，不上报
 * - 上报仅 type / length / has_contact（见 feedback-reporter）
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export type FeedbackType = 'bug' | 'suggestion' | 'content'

export interface FeedbackDraft {
  type: FeedbackType
  content: string
  contact: string
}

export interface FeedbackEntry {
  id: string
  timestamp: number
  type: FeedbackType
  contentLength: number
  hasContact: boolean
  status: 'pending' | 'sent' | 'failed'
  sentAt?: number
}

export interface FeedbackState {
  draft: FeedbackDraft
  history: FeedbackEntry[]
  lastSubmitAt: number

  // Actions
  setDraft: (partial: Partial<FeedbackDraft>) => void
  resetDraft: () => void
  submitFeedback: () => FeedbackEntry
  markSent: (id: string) => void
  markFailed: (id: string) => void
  clearHistory: () => void

  // Selectors
  canSubmit: () => boolean
  remainingCooldown: () => number
}

const RATE_LIMIT_MS = 60_000 // 60 秒/次
const MAX_HISTORY = 10 // 最多保留 10 条历史

const initialDraft: FeedbackDraft = {
  type: 'bug',
  content: '',
  contact: '',
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      draft: { ...initialDraft },
      history: [],
      lastSubmitAt: 0,

      setDraft: (partial) =>
        set((state) => ({ draft: { ...state.draft, ...partial } })),

      resetDraft: () => set({ draft: { ...initialDraft } }),

      submitFeedback: () => {
        const { draft, lastSubmitAt } = get()

        const entry: FeedbackEntry = {
          id: nanoid(8),
          timestamp: Date.now(),
          type: draft.type,
          contentLength: draft.content.trim().length,
          hasContact: draft.contact.trim().length > 0,
          status: 'pending',
        }

        set((state) => ({
          history: [entry, ...state.history].slice(0, MAX_HISTORY),
          lastSubmitAt: Date.now(),
          draft: { ...initialDraft },
        }))

        return entry
      },

      markSent: (id) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, status: 'sent' as const, sentAt: Date.now() } : h
          ),
        })),

      markFailed: (id) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, status: 'failed' as const } : h
          ),
        })),

      clearHistory: () => set({ history: [] }),

      canSubmit: () => {
        const { lastSubmitAt, draft } = get()
        if (Date.now() - lastSubmitAt < RATE_LIMIT_MS) return false
        if (draft.content.trim().length === 0) return false
        if (draft.content.length > 500) return false
        return true
      },

      remainingCooldown: () => {
        const { lastSubmitAt } = get()
        const elapsed = Date.now() - lastSubmitAt
        if (elapsed >= RATE_LIMIT_MS) return 0
        return Math.ceil((RATE_LIMIT_MS - elapsed) / 1000)
      },
    }),
    {
      name: 'nova-star-feedback',
      // 仅持久化必要字段
      partialize: (state) => ({
        history: state.history,
        lastSubmitAt: state.lastSubmitAt,
      }),
    }
  )
)
