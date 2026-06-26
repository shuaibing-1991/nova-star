/**
 * /play 页面 layout（Server Component，仅用于 metadata）
 *
 * 阶段 8 Round 6 修复：play/page.tsx 是 client component，
 * 不能直接导出 metadata。用 server component layout 包装。
 *
 * 同 ending layout 的模式（详见 [[./ending/[id]/layout]]）
 */
import type { Metadata } from 'next'

const TITLE = '开始你的 30 天 · NOVA STAR'
const DESCRIPTION =
  '进入 NOVA STAR 的剧情世界，体验偶像练习生的 30 天出道旅程。做出你的选择，塑造你的故事。'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: `${baseUrl}/play`,
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: 'website',
      url: `${baseUrl}/play`,
      images: ['/icons/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: ['/icons/og-image.png'],
    },
  }
}

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  // play 页的 JSON-LD（VideoGame）由 page.tsx 注入
  return <>{children}</>
}