/**
 * /onboarding 页面 layout（Server Component，仅用于 metadata）
 *
 * 阶段 8 Round 6 修复：onboarding/page.tsx 是 client component，
 * 不能直接导出 metadata。用 server component layout 包装。
 */
import type { Metadata } from 'next'

const TITLE = '创建你的艺人档案 · NOVA STAR'
const DESCRIPTION =
  '6 步打造你的偶像人设：姓名、人设、定位、艺名、口号、目标。开启你的 30 天出道之旅。'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: `${baseUrl}/onboarding`,
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: 'website',
      url: `${baseUrl}/onboarding`,
      images: ['/icons/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: ['/icons/og-image.png'],
    },
    // onboarding 页 noindex（用户流程页，不应被搜索引擎索引）
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}