/**
 * robots.txt（Next.js App Router 约定）
 *
 * 阶段 8 Round 1 修复：从静态文件迁移到动态生成
 * 详见 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 *
 * 策略：
 * - 允许主流搜索引擎索引公开页面（/、/play、/phone）
 * - 禁止索引 /api/*（虽然纯前端没 API，但保留防御）
 * - 指向 sitemap.xml
 */
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/play', '/phone', '/ending'],
        disallow: ['/api/', '/_next/', '/icons/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}