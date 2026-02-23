'use client'

import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const metrics = [
  {
    label: 'Total Profit',
    value: '$12,450',
    sub: 'MT5 account equity gain',
    icon: TrendingUp,
    positive: true,
    trend: '+8.2% this month',
  },
  {
    label: 'Max Drawdown',
    value: '4.2%',
    sub: 'Peak-to-trough decline',
    icon: TrendingDown,
    positive: false,
    trend: 'Within risk limit',
  },
  {
    label: 'Win Rate',
    value: '67.4%',
    sub: 'Winning trades / total',
    icon: Target,
    positive: true,
    trend: '142 wins / 210 trades',
  },
  {
    label: 'Active Trades',
    value: '8',
    sub: 'Open positions across EAs',
    icon: Activity,
    positive: null,
    trend: '3 Gold, 3 Index, 2 Forex',
  },
]

export function MT5Metrics({ className }: { className?: string }) {
  return (
    <section className={cn('', className)}>
      <h2 className="text-card-title font-card-title text-dashboard-text mb-4">
        MT5 Trading Metrics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className={cn(
                'group rounded-card border border-dashboard-border bg-dashboard-card p-5',
                'shadow-stat transition-all duration-300 ease-out',
                'hover:shadow-card-hover hover:border-dashboard-border/80 hover:-translate-y-0.5'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-dashboard-text-muted text-sm font-medium">{m.label}</p>
                  <p className="text-stats-number font-stats-number text-dashboard-gold mt-1 tabular-nums">
                    {m.value}
                  </p>
                  <p className="text-dashboard-text-muted text-xs mt-1">{m.sub}</p>
                  <p
                    className={cn(
                      'text-xs mt-2',
                      m.positive === true && 'text-emerald-400/90',
                      m.positive === false && 'text-red-400/90',
                      m.positive === null && 'text-dashboard-text-secondary'
                    )}
                  >
                    {m.trend}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    m.positive === true && 'bg-dashboard-gold/10 text-dashboard-gold group-hover:bg-dashboard-gold/15',
                    m.positive === false && 'bg-red-500/10 text-red-400/90 group-hover:bg-red-500/15',
                    m.positive === null && 'bg-dashboard-border/50 text-dashboard-text-muted group-hover:bg-dashboard-border'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
