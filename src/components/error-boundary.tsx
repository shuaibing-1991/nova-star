/**
 * 全局错误边界
 * 兜底运行时错误，防止白屏
 *
 * 阶段 8 Round 2 修复：增加错误上报（Umami + console）
 * 阶段 8 Round 4 修复：移除 broken `@sentry/browser` 动态 import
 *   - 该包未在 dependencies 中声明
 *   - 动态 import 在 DSN 配置时会失败且被 .catch 吞掉
 *   - 现统一用 Umami + console.error 兜底
 *   - 如未来需接入 Sentry，请先 `pnpm add @sentry/nextjs` 并在 layout 初始化
 */
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 1. console.error 保留（开发期 + 兜底）
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error', error, errorInfo)

    // 2. 自托管 Umami 埋点（不阻塞；失败时降级 console）
    if (typeof window !== 'undefined') {
      import('@/lib/analytics')
        .then(({ track }) => {
          track('error_occurred', {
            message: error.message,
            stack: error.stack?.slice(0, 500), // 截断避免超长
            url: window.location.pathname,
            // 阶段 8 Round 4：附上 componentStack 便于定位
            componentStack: errorInfo.componentStack?.slice(0, 500),
          })
        })
        .catch(() => {
          // analytics 模块加载失败，静默
        })
    }

    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-blue-50 px-4 text-center dark:from-gray-900 dark:to-gray-800">
          <div className="mb-6 text-6xl">😢</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
            出错了
          </h1>
          <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
            游戏中遇到了一些问题。请尝试重新加载游戏，或者联系客服。
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 max-w-2xl rounded-md bg-red-50 p-4 text-left text-xs dark:bg-red-900/30">
              <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                错误详情（仅开发模式显示）
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap text-red-800 dark:text-red-200">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              重试
            </Button>
            <Button onClick={this.handleReload}>重新加载</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}