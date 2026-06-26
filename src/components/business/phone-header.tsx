/**
 * 手机页通用顶部导航
 *
 * 用法：
 *   <PhoneHeader title="数据分析" backHref="/phone" rightSlot={...} />
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export interface PhoneHeaderProps {
  title: string
  backHref?: string
  /** 标题旁的辅助文字（用于辅助语义） */
  titleId?: string
  rightSlot?: React.ReactNode
}

export const PhoneHeader: React.FC<PhoneHeaderProps> = ({
  title,
  backHref = '/phone',
  titleId,
  rightSlot,
}) => {
  return (
    <header
      aria-label={title}
      className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
    >
      <Link
        href={backHref}
        aria-label="返回"
        className="-ml-2 flex h-11 w-11 items-center justify-center text-gray-600"
      >
        <ChevronLeft className="h-6 w-6" />
      </Link>
      <h1
        id={titleId}
        className="text-base font-medium text-gray-800"
      >
        {title}
      </h1>
      {rightSlot ?? <div className="w-11" />}
    </header>
  )
}