'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: { value: string; positive: boolean }
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative min-h-[120px] rounded-stat-card border border-dashboard-border bg-dashboard-card p-5',
        'shadow-stat transition-all duration-300 ease-out',
        'hover:shadow-card-hover hover:border-dashboard-border/80',
        'hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-2">
          <span className="text-dashboard-text-muted text-sm font-medium truncate">
            {label}
          </span>
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dashboard-gold/10 text-dashboard-gold transition-colors group-hover:bg-dashboard-gold/15">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-2">
          <span className="text-stats-number font-stats-number text-dashboard-gold tabular-nums">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'ml-2 text-sm font-medium',
                trend.positive ? 'text-emerald-400/90' : 'text-red-400/90'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
