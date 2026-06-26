/**
 * Ending 页面 layout（Server Component，仅用于 metadata）
 *
 * 阶段 8 Round 1 修复：ending/page.tsx 是 client component，
 * 不能直接导出 metadata。用 server component layout 包装。
 */
import type { Metadata } from 'next'
import { getArticleSchema } from '@/lib/structured-data'

export function generateStaticParams() {
  return [{ id: 'success' }, { id: 'neutral' }, { id: 'failure' }, { id: 'hidden' }]
}

const ENDING_TITLES: Record<string, string> = {
  success: '成功出道',
  neutral: '平淡收场',
  failure: '遗憾落选',
  hidden: '隐藏彩蛋',
}

const ENDING_DESCRIPTIONS: Record<string, string> = {
  success: '你的 30 天旅程画上了圆满的句号。站在舞台中央的那一刻，所有的努力都值了。',
  neutral: '你的 30 天走到了平凡的终点。没有惊天动地，却也是一段真实的旅程。',
  failure: '你的 30 天以遗憾收场。但这不是终点，是另一段故事的起点。',
  hidden: '你解锁了隐藏结局！感谢你陪伴 NOVA STAR 走过这段特别的旅程。',
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const id = params.id
  const title = ENDING_TITLES[id] ?? '结局'
  const description = ENDING_DESCRIPTIONS[id] ?? 'NOVA STAR 结局页'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: `${title} · NOVA STAR`,
    description,
    alternates: {
      canonical: `${baseUrl}/ending/${id}`,
    },
    openGraph: {
      title: `${title} · NOVA STAR`,
      description,
      type: 'article',
      images: ['/icons/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · NOVA STAR`,
      description,
      images: ['/icons/og-image.png'],
    },
  }
}

export default function EndingLayout({ children }: { children: React.ReactNode }) {
  // 阶段 8 Round 3：layout 不直接注入 JSON-LD，
  // Article schema 注入由 page.tsx 完成（因为 page 才能拿到结局数据）
  // 这里只透传 children
  return <>{children}</>
}