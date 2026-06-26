/**
 * Badge 徽标
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-gray-900 hover:bg-primary-400',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100',
        destructive:
          'border-transparent bg-semantic-danger text-white hover:bg-semantic-danger/90',
        outline: 'text-gray-900 dark:text-gray-100',
        success:
          'border-transparent bg-semantic-success/15 text-semantic-success',
        warning:
          'border-transparent bg-semantic-warning/15 text-semantic-warning',
        info: 'border-transparent bg-semantic-info/15 text-semantic-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
