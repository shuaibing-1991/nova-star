/**
 * 埋点工具（PRD 6.16）
 * 优先自托管 Umami，降级到 console.log
 */
type EventName =
  | 'app_open'
  | 'onboarding_complete'
  | 'day_start'
  | 'day_complete'
  | 'choice_made'
  | 'ending_reached'
  | 'achievement_unlocked'
  | 'screenshot_share'
  | 'reset_progress'
  | 'error_occurred'

interface EventParams {
  [key: string]: string | number | boolean | undefined
}

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || 'default'

/**
 * 发送事件
 */
export function track(event: EventName, params?: EventParams): void {
  // 1. 优先：自托管 Umami
  if (ANALYTICS_URL && ANALYTICS_DOMAIN && typeof window !== 'undefined') {
    try {
      const url = `${ANALYTICS_URL}/api/send`
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          payload: {
            website: ANALYTICS_DOMAIN,
            url: window.location.pathname,
            referrer: document.referrer,
            name: event,
            data: { ...params, client_id: CLIENT_ID },
          },
        }),
        keepalive: true,
      }).catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[analytics] send failed', event, err)
        }
      })
      return
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[analytics] send threw', event, err)
      }
    }
  }

  // 2. 降级：开发模式 console.info，生产静默
  if (process.env.NODE_ENV === 'development') {
    console.info('[analytics]', event, params)
  }
}

/**
 * 页面浏览
 */
export function trackPageView(url?: string): void {
  if (ANALYTICS_URL && ANALYTICS_DOMAIN && typeof window !== 'undefined') {
    try {
      fetch(`${ANALYTICS_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pageview',
          payload: {
            website: ANALYTICS_DOMAIN,
            url: url || window.location.pathname,
            referrer: document.referrer,
          },
        }),
        keepalive: true,
      }).catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[analytics] pageview failed', err)
        }
      })
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[analytics] pageview threw', err)
      }
    }
  }
}
