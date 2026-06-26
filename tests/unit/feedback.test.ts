/**
 * 反馈系统单元测试
 *
 * 阶段 9 Round 3 新增：验证反馈 store + reporter 行为
 *
 * 覆盖：
 * - 草稿管理
 * - 提交限流
 * - 字数限制
 * - 状态标记
 * - 上报工具（sendBeacon）边界
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useFeedbackStore', () => {
  beforeEach(() => {
    // 每个测试前重置 store
    vi.resetModules()
    // 清理 localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('草稿管理', () => {
    it('初始草稿为空', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      const draft = useFeedbackStore.getState().draft
      expect(draft.type).toBe('bug')
      expect(draft.content).toBe('')
      expect(draft.contact).toBe('')
    })

    it('setDraft 更新字段', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({ content: '测试反馈' })
      expect(useFeedbackStore.getState().draft.content).toBe('测试反馈')
    })

    it('resetDraft 重置为初始', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({ content: '临时内容' })
      useFeedbackStore.getState().resetDraft()
      expect(useFeedbackStore.getState().draft.content).toBe('')
    })
  })

  describe('提交', () => {
    it('提交后生成 FeedbackEntry', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({
        type: 'suggestion',
        content: '希望加入更多剧情分支',
        contact: 'test@example.com',
      })
      const entry = useFeedbackStore.getState().submitFeedback()
      expect(entry.type).toBe('suggestion')
      expect(entry.contentLength).toBe(11)
      expect(entry.hasContact).toBe(true)
      expect(entry.status).toBe('pending')
    })

    it('提交后清空草稿', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({ content: '测试' })
      useFeedbackStore.getState().submitFeedback()
      expect(useFeedbackStore.getState().draft.content).toBe('')
    })

    it('limit history to 10 entries', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      for (let i = 0; i < 15; i++) {
        useFeedbackStore.getState().setDraft({ content: `feedback ${i}` })
        // 绕过限流直接调用
        useFeedbackStore.setState({ lastSubmitAt: 0 })
        useFeedbackStore.getState().submitFeedback()
      }
      expect(useFeedbackStore.getState().history.length).toBe(10)
    })
  })

  describe('限流', () => {
    it('canSubmit 在 60s 内返回 false', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({ content: '测试' })
      useFeedbackStore.getState().submitFeedback()
      expect(useFeedbackStore.getState().canSubmit()).toBe(false)
    })

    it('空内容时 canSubmit 返回 false', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.setState({ lastSubmitAt: 0 })
      expect(useFeedbackStore.getState().canSubmit()).toBe(false)
    })

    it('超过 500 字时 canSubmit 返回 false', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.setState({ lastSubmitAt: 0 })
      useFeedbackStore.getState().setDraft({ content: 'a'.repeat(501) })
      expect(useFeedbackStore.getState().canSubmit()).toBe(false)
    })

    it('remainingCooldown 返回剩余秒数', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.setState({ lastSubmitAt: Date.now() - 10_000 })
      const cooldown = useFeedbackStore.getState().remainingCooldown()
      // 60s 限流，10s 已过 → 剩约 50s
      expect(cooldown).toBeGreaterThanOrEqual(49)
      expect(cooldown).toBeLessThanOrEqual(51)
    })
  })

  describe('状态管理', () => {
    it('markSent 更新状态', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({ content: '测试' })
      const entry = useFeedbackStore.getState().submitFeedback()
      useFeedbackStore.getState().markSent(entry.id)
      const updated = useFeedbackStore
        .getState()
        .history.find((h) => h.id === entry.id)
      expect(updated?.status).toBe('sent')
      expect(updated?.sentAt).toBeTruthy()
    })

    it('markFailed 更新状态', async () => {
      const { useFeedbackStore } = await import('@/stores/feedback')
      useFeedbackStore.getState().setDraft({ content: '测试' })
      const entry = useFeedbackStore.getState().submitFeedback()
      useFeedbackStore.getState().markFailed(entry.id)
      const updated = useFeedbackStore
        .getState()
        .history.find((h) => h.id === entry.id)
      expect(updated?.status).toBe('failed')
    })
  })
})

describe('reportFeedback 上报工具', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_ANALYTICS_URL
    delete process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN
  })

  it('无 sendBeacon 支持时返回失败', async () => {
    // 删除 navigator.sendBeacon
    const originalSendBeacon = navigator.sendBeacon
    // @ts-expect-error 测试中模拟
    delete navigator.sendBeacon

    const { reportFeedback } = await import('@/lib/feedback-reporter')
    const result = await reportFeedback({
      id: 'test-id',
      timestamp: Date.now(),
      type: 'bug',
      contentLength: 10,
      hasContact: false,
      status: 'pending',
    })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('no-support')

    navigator.sendBeacon = originalSendBeacon
  })

  it('无 Umami 配置时返回失败', async () => {
    // @ts-expect-error 测试中模拟 sendBeacon
    navigator.sendBeacon = vi.fn().mockReturnValue(true)
    const { reportFeedback } = await import('@/lib/feedback-reporter')
    const result = await reportFeedback({
      id: 'test-id',
      timestamp: Date.now(),
      type: 'bug',
      contentLength: 10,
      hasContact: false,
      status: 'pending',
    })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('no-config')
  })

  it('有 Umami 配置 + sendBeacon 成功时返回 ok', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://umami.example.com/api/collect'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.example.com'
    // @ts-expect-error 测试中模拟
    navigator.sendBeacon = vi.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })

    const { reportFeedback } = await import('@/lib/feedback-reporter')
    const result = await reportFeedback({
      id: 'test-id',
      timestamp: Date.now(),
      type: 'suggestion',
      contentLength: 50,
      hasContact: true,
      status: 'pending',
    })
    expect(result.ok).toBe(true)
  })

  it('离线时返回失败', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_URL = 'https://umami.example.com/api/collect'
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'nova-star.example.com'
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    const { reportFeedback } = await import('@/lib/feedback-reporter')
    const result = await reportFeedback({
      id: 'test-id',
      timestamp: Date.now(),
      type: 'bug',
      contentLength: 10,
      hasContact: false,
      status: 'pending',
    })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('network-error')
  })
})
