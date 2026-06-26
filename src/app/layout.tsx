import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toast'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { FontSizeRoot } from '@/components/system/font-size-root'
import { PageTransition } from '@/components/system/page-transition'
import { PerfBadge } from '@/components/system/perf-badge'
import { EndingTransition } from '@/components/system/ending-transition'
import { UpdatePrompt } from '@/components/system/update-prompt'
import { InstallPrompt } from '@/components/system/install-prompt'
import { SoundBridgeProvider } from '@/components/system/sound-bridge-provider'
import { WebVitalsReporter } from '@/components/system/web-vitals-reporter'
import {
  getWebSiteSchema,
  getWebApplicationSchema,
  getOrganizationSchema,
} from '@/lib/structured-data'
import { getClientConfig } from '@/config/client'

// 阶段 9 Round 2：根据客户配置动态生成 metadata
// 这样 LUMINA / 其它客户部署后会有自己的品牌名
const clientConfig = getClientConfig()

export const metadata: Metadata = {
  title: {
    default: `${clientConfig.brand.shortName} · ${clientConfig.brand.name}`,
    template: `%s · ${clientConfig.brand.shortName}`,
  },
  description: `一部虚拟工作手机 + 30 天出道前沉浸式人生体验（${clientConfig.brand.name}）`,
  applicationName: clientConfig.brand.shortName,
  authors: [{ name: `${clientConfig.brand.name} Team` }],
  keywords: ['偶像', '养成', '模拟器', '沉浸式', '互动剧情', clientConfig.brand.shortName],
  // 阶段 8 Round 1：metadataBase 用于 OG image 绝对路径
  // 阶段 8 Round 5：URL.canParse 兜底，避免 SSR 时 env 无效导致 new URL() 报错
  metadataBase: (() => {
    const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    try {
      return new URL(raw)
    } catch {
      // 环境变量配置错误时降级到 localhost
      return new URL('http://localhost:3000')
    }
  })(),
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NOVA STAR',
  },
  formatDetection: {
    telephone: false,
  },
  // 阶段 8 Round 1：完善 openGraph（含 og-image）
  openGraph: {
    title: '新星计划 · NOVA STAR',
    description: '一部虚拟工作手机 + 30 天出道前沉浸式人生体验',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'NOVA STAR',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NOVA STAR · 新星计划',
      },
    ],
  },
  // 阶段 8 Round 1：Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: '新星计划 · NOVA STAR',
    description: '30 天出道前沉浸式人生体验',
    images: ['/icons/og-image.png'],
  },
  // 阶段 8 Round 1：搜索引擎爬虫配置
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // 阶段 8 Round 1：alternate languages（中文）
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
    },
  },
  // 阶段 8 Round 3：verification / analytics 留占位
  verification: {
    // 部署时填入：
    // google: 'your-google-site-verification',
    // yandex: 'your-yandex-verification',
    // yahoo: 'your-yahoo-verification',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  // 阶段 6 修复：iOS 16.4+ 键盘弹起时让 viewport 调整内容大小，
  // 避免微信对话页输入时整个 PhoneShell 重排导致画面跳动 ~300ms
  interactiveWidget: 'resizes-content',
  // 阶段 9 Round 2：根据客户配置动态设置 themeColor
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: clientConfig.brand.primaryColor },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 字体预加载（详见 [[../../../../11.项目/爱豆模拟器/03-设计系统规范#2.1 字体家族]]） */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap"
        />
        {/* LXGW 霞鹜文楷 - 来自 CDN（阶段 8 部署时改自托管） */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css"
          crossOrigin="anonymous"
          media="print"
          // @ts-expect-error: React 18 不支持字符串 onLoad，但服务端渲染时用此 hack
          onLoad="this.media='all'"
        />
        {/* 阶段 8 Round 1：PWA / iOS / 社交分享完整链接 */}
        <link rel="icon" href="/icons/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#FFB6C1" />

        {/* 阶段 8 Round 3：JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebSiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebApplicationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-black text-white font-sans antialiased',
          'safe-all'
        )}
        style={
          {
            // 阶段 9 Round 2：注入客户 CSS 变量
            // Tailwind 中可用 text-[var(--client-primary)] 等访问
            '--client-primary': clientConfig.brand.primaryColor,
            '--client-accent': clientConfig.brand.accentColor,
          } as React.CSSProperties
        }
      >
        <ThemeProvider>
          {/* 阶段 9 Round 1：音效桥接（监听设置 + 首次交互初始化） */}
          <SoundBridgeProvider />
          {/* 阶段 9 Round 4：Web Vitals 上报（生产环境） */}
          <WebVitalsReporter />
          <FontSizeRoot />
          <ErrorBoundary>
            <PageTransition>{children}</PageTransition>
          </ErrorBoundary>
          <Toaster />
          {/* 阶段 7 Round 4 修复：开发期性能徽章 */}
          <PerfBadge />
          {/* 阶段 7 Round 5 修复：跳结局的过渡遮罩 */}
          <EndingTransition />
          {/* 阶段 8 Round 2 修复：新版本可用提示 */}
          <UpdatePrompt />
          {/* 阶段 8 Round 6 修复：PWA 安装提示 */}
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
