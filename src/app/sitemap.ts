/**
 * Sitemap（Next.js App Router 约定）
 *
 * 阶段 8 Round 1 修复：自动生成 sitemap.xml
 * 详见 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * 注意：本应用是 SPA，URL 是客户端路由。
 * 这里列出的 URL 对 SEO 来说只包括公开页面：
 * - /（开场沉浸页）
 * - /play（剧情播放）
 * - /phone（工作手机主入口）
 * - /ending/success, /ending/neutral, /ending/failure, /ending/hidden
 *
 * 受保护页面（需要 onboarding）：onboarding / phone/chat / phone/schedule 等
 * 不列入 sitemap，避免被搜索引擎索引用户私人内容。
 */
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const now = new Date()

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/phone`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ending/success`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ending/neutral`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ending/failure`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ending/hidden`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}