/**
 * 反馈上报工具
 *
 * 阶段 9 Round 3 新增：通过 navigator.sendBeacon 上报结构化反馈
 *
 * 隐私原则：
 * - 不上报 content（可能含 PII）
 * - 不上报 contact（可能含手机号/邮箱）
 * - 仅上报：type / contentLength / hasContact / client_id
 *
 * 链路：
 * - 在线 + Umami 配置可用 → sendBeacon 立即发送
 * - 离线 → 标记 pending，等 online 事件触发重试
 * - sendBeacon 不可用 → 标记 failed，提示用户已暂存
 */
import type { FeedbackEntry } from '@/stores/feedback'

const UMAMI_URL_KEY = 'NEXT_PUBLIC_ANALYTICS_URL'
const UMAMI_DOMAIN_KEY = 'NEXT_PUBLIC_ANALYTICS_DOMAIN'

interface BeaconResult {
  ok: boolean
  reason?: 'no-support' | 'no-config' | 'network-error'
}

/**
 * 通过 navigator.sendBeacon 上报反馈元数据
 *
 * @returns 上报结果（仅用于状态更新，不影响本地存储）
 */
export async function reportFeedback(entry: FeedbackEntry): Promise<BeaconResult> {
  // SSR 兜底
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return { ok: false, reason: 'no-support' }
  }

  // 检查 sendBeacon 支持
  if (typeof navigator.sendBeacon !== 'function') {
    return { ok: false, reason: 'no-support' }
  }

  // 读取 Umami 配置（与现有埋点共用 endpoint）
  const url = process.env[UMAMI_URL_KEY]
  const domain = process.env[UMAMI_DOMAIN_KEY]
  if (!url || !domain) {
    return { ok: false, reason: 'no-config' }
  }

  // 离线状态：直接返回失败（标记 pending）
  if (!navigator.onLine) {
    return { ok: false, reason: 'network-error' }
  }

  // 构造 client_id（与现有 analytics 工具保持一致）
  let clientId = ''
  try {
    clientId = localStorage.getItem('nova-star-client-id') || ''
    if (!clientId) {
      clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem('nova-star-client-id', clientId)
    }
  } catch {
    // localStorage 不可用（隐私模式）
  }

  // Umami v2 event payload
  const payload = JSON.stringify({
    type: 'event',
    payload: {
      client_id: clientId,
      events: [
        {
          event: 'feedback_submit',
          url: typeof window !== 'undefined' ? window.location.pathname : '/',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          website: domain,
          screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
          language: typeof navigator !== 'undefined' ? navigator.language : '',
          title: 'Feedback Submit',
          meta: {
            feedback_id: entry.id,
            feedback_type: entry.type,
            content_length: entry.contentLength,
            has_contact: entry.hasContact,
          },
        },
      ],
    },
  })

  // sendBeacon：Blob + application/json
  try {
    const blob = new Blob([payload], { type: 'application/json' })
    const sent = navigator.sendBeacon(url, blob)
    return { ok: sent, reason: sent ? undefined : 'network-error' }
  } catch {
    return { ok: false, reason: 'network-error' }
  }
}

/**
 * 自动重试待发送的反馈
 *
 * 触发时机：
 * - 应用启动时
 * - online 事件触发时
 */
export async function retryPendingFeedbacks(
  entries: FeedbackEntry[],
  onResult: (id: string, ok: boolean) => void
): Promise<void> {
  const pending = entries.filter((e) => e.status === 'pending' || e.status === 'failed')
  for (const entry of pending) {
    const result = await reportFeedback(entry)
    onResult(entry.id, result.ok)
  }
}
