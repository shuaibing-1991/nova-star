/**
 * 结构化数据（JSON-LD）工具
 *
 * 阶段 8 Round 3 修复：让搜索引擎理解页面类型
 * 详见 https://schema.org/
 *
 * 使用方式：
 * ```tsx
 * <Script
 *   id="schema-website"
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteSchema()) }}
 * />
 * ```
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const SITE_NAME = 'NOVA STAR · 新星计划'
const SITE_DESCRIPTION =
  '一部虚拟工作手机 + 30 天出道前沉浸式人生体验'
const OG_IMAGE = `${SITE_URL}/icons/og-image.png`

/**
 * WebSite schema - 标识整个网站
 * 适用：根 layout
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * WebApplication schema - 标识这是一个 Web 应用（PWA 游戏）
 * 适用：根 layout
 * 详见 https://schema.org/WebApplication
 */
export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Interactive Fiction',
    operatingSystem: 'Any',
    browserRequirements: 'Requires modern browser with JavaScript enabled',
    inLanguage: 'zh-CN',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    image: OG_IMAGE,
    screenshot: OG_IMAGE,
    featureList: [
      '30 天沉浸式剧情',
      '4 种结局',
      '39 个成就',
      'PWA 离线可玩',
      '无障碍支持',
    ],
  }
}

/**
 * Organization schema - 标识运营方（占位）
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NOVA STAR Team',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    sameAs: [
      // 社交媒体链接占位，部署时填入
      // 'https://twitter.com/nova_star',
      // 'https://weibo.com/nova_star',
    ],
  }
}

/**
 * Article schema - 标识文章/结局页面
 * 适用：ending/[id]/layout.tsx
 */
export function getArticleSchema({
  title,
  description,
  endingType,
}: {
  title: string
  description: string
  endingType: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'zh-CN',
    image: OG_IMAGE,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'NOVA STAR Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/ending/${endingType}`,
    },
  }
}

/**
 * Game schema - 标识游戏
 * 适用：play 页面
 */
export function getGameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    image: OG_IMAGE,
    author: {
      '@type': 'Organization',
      name: 'NOVA STAR Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    genre: ['Interactive Fiction', 'Visual Novel', 'Simulation'],
    gamePlatform: ['Web Browser', 'Mobile Browser'],
    applicationCategory: 'GameApplication',
    playMode: 'SinglePlayer',
    inLanguage: 'zh-CN',
    numberOfPlayers: 1,
  }
}