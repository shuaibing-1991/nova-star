/**
 * Toast 轻提示（基于 Radix UI）
 */
'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white text-gray-900',
        success: 'border-semantic-success/30 bg-semantic-success/10 text-gray-900',
        warning: 'border-semantic-warning/30 bg-semantic-warning/10 text-gray-900',
        danger: 'border-semantic-danger/30 bg-semantic-danger/10 text-gray-900',
        info: 'border-semantic-info/30 bg-semantic-info/10 text-gray-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      // 阶段 7 Round 3 修复：min-h-[44px] min-w-[44px] 满足 iOS HIG 触控标准
      'absolute right-1 top-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100',
      className
    )}
    toast-close=""
    aria-label="关闭通知"
    {...props}
  >
    <X className="h-5 w-5" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export {
  type ToastProps,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
}

// ============================================
// Toast 业务封装（自动注入 Provider）
// ============================================
import { create } from 'zustand'
import { nanoid } from 'nanoid'

interface ToastState {
  toasts: Array<{
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    duration?: number
  }>
  toast: (toast: Omit<ToastState['toasts'][0], 'id'>) => void
  dismiss: (id: string) => void
}

/** 维护 id → setTimeout 句柄，避免泄漏 */
const timerMap = new Map<string, ReturnType<typeof setTimeout>>()

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: (toast) => {
    const id = nanoid(8)
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }))
    const timer = setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
      timerMap.delete(id)
    }, toast.duration ?? 3000)
    timerMap.set(id, timer)
  },
  dismiss: (id) => {
    const timer = timerMap.get(id)
    if (timer) {
      clearTimeout(timer)
      timerMap.delete(id)
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

/**
 * 全局 toast 工具
 */
export const toast = {
  info: (description: string, title?: string) =>
    useToastStore.getState().toast({ title, description, variant: 'info' }),
  success: (description: string, title?: string) =>
    useToastStore.getState().toast({ title, description, variant: 'success' }),
  warning: (description: string, title?: string) =>
    useToastStore.getState().toast({ title, description, variant: 'warning' }),
  error: (description: string, title?: string) =>
    useToastStore.getState().toast({ title, description, variant: 'danger' }),
  default: (description: string, title?: string) =>
    useToastStore.getState().toast({ title, description, variant: 'default' }),
}

/**
 * Toaster 容器（放在 layout 中）
 */
export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          onOpenChange={(open) => !open && dismiss(t.id)}
        >
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
