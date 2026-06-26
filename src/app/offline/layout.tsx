/**
 * /offline 页面 layout（Server Component，仅用于 metadata）
 *
 * 阶段 8 Round 6 修复：offline/page.tsx 是 client component，
 * 不能直接导出 metadata。用 server component layout 包装。
 */
import type { Metadata } from 'next'

const TITLE = '你已离线 · NOVA STAR'
const DESCRIPTION = '当前网络不可用，请检查连接后重试。'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: `${baseUrl}/offline`,
    },
    // offline 页 noindex（兜底页，不应被索引）
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}