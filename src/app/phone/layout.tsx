/**
 * /phone 页面 layout（Server Component，仅用于 metadata）
 *
 * 阶段 8 Round 6 修复：phone/page.tsx 是 client component，
 * 不能直接导出 metadata。用 server component layout 包装。
 */
import type { Metadata } from 'next'

const TITLE = '工作手机 · NOVA STAR'
const DESCRIPTION =
  'NOUVA STAR 的虚拟工作手机：查看日程、回复微信、追踪数据、参与粉丝运营，像真正的练习生一样生活。'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: `${baseUrl}/phone`,
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: 'website',
      url: `${baseUrl}/phone`,
      images: ['/icons/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: ['/icons/og-image.png'],
    },
    // 阶段 8 Round 6：工作手机页 noindex（避免重复内容）
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function PhoneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}