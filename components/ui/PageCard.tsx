'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageCardProps = {
  title?: string | ReactNode
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function PageCard({ title, children, className, action }: PageCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-dashboard-border bg-dashboard-card overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b border-dashboard-border">
          {title && (
            <h3 className="text-card-title font-card-title text-dashboard-text">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
