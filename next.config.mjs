import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // 实验性配置
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
    ],
  },

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 国际化（暂不开启，PRD 6.17E 在第二阶段）
  // i18n: {
  //   locales: ['zh-CN', 'zh-TW', 'en-US'],
  //   defaultLocale: 'zh-CN',
  // },

  // 安全头
  async headers() {
    // 阶段 8 Round 1：Content-Security-Policy
    // - Google Fonts CDN + LXGW CDN 白名单
    // - inline-script 允许（Next.js 需要）
    // - connect-src 仅同源（无后端 API）
    const isReportOnly = process.env.NEXT_PUBLIC_CSP_REPORT_ONLY === 'true'
    const cspHeaderKey = isReportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    const cspValue = [
      // 默认仅同源资源
      "default-src 'self'",
      // 脚本：self + Next.js 内联 + 评估（用于 hydration）
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // 样式：self + Google Fonts + 内联（Tailwind runtime）
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // 图片：self + data: + blob:（缩略图 / canvas）
      "img-src 'self' data: blob:",
      // 字体：self + Google Fonts + LXGW CDN
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
      // 连接：self（无后端，纯前端）
      "connect-src 'self'",
      // 媒体：self
      "media-src 'self'",
      // frame：禁止嵌入（防 clickjacking）
      "frame-src 'none'",
      // worker：self
      "worker-src 'self' blob:",
      // 对象：none（防止 Flash 等插件）
      "object-src 'none'",
      // base URI：self
      "base-uri 'self'",
      // 表单提交：self
      "form-action 'self'",
      // 升级不安全请求（HTTP → HTTPS）
      "upgrade-insecure-requests",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          // 阶段 8 Round 1：CSP
          { key: cspHeaderKey, value: cspValue },
          // 已有安全头
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // 阶段 8 Round 1：Service Worker 不缓存
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // 阶段 8 Round 1：HTML 不缓存（保证 SPA 更新生效）
      {
        source: '/((?!api|_next|icons|.*\\..*).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      // 阶段 8 Round 1：Next.js 静态资源（带 hash）永久缓存
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 阶段 8 Round 1：PWA 图标 30 天缓存
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, must-revalidate',
          },
        ],
      },
      // 阶段 8 Round 1：字体 / 图片优化产物 30 天缓存
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, must-revalidate',
          },
        ],
      },
    ]
  },

  // 输出配置（standalone 模式便于 Docker 部署）
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // 包分析
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
      })
      return withBundleAnalyzer(config)
    },
  }),
}

export default withSerwist(nextConfig)