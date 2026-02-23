'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { cn } from '@/lib/utils'

const sampleData = [
  { date: 'Jan 1', pnl: 1200, equity: 101200 },
  { date: 'Jan 5', pnl: 2400, equity: 102400 },
  { date: 'Jan 10', pnl: 1800, equity: 101800 },
  { date: 'Jan 15', pnl: 3200, equity: 103200 },
  { date: 'Jan 20', pnl: 2800, equity: 102800 },
  { date: 'Jan 25', pnl: 4100, equity: 104100 },
  { date: 'Jan 30', pnl: 3850, equity: 103850 },
]

interface PerformanceChartProps {
  className?: string
  data?: { date: string; pnl: number; equity: number }[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-dashboard-border bg-dashboard-card px-3 py-2 shadow-card">
      <p className="text-dashboard-text-muted text-xs">{label}</p>
      <p className="text-dashboard-gold font-semibold">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function PerformanceChart({ className, data }: PerformanceChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData
  return (
    <div
      className={cn(
        'rounded-card border border-dashboard-border bg-dashboard-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <h3 className="text-card-title font-card-title text-dashboard-text mb-4">
        Performance Over Time
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E6B566" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#E6B566" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2B33" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8B8B95"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#8B8B95"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#E6B566"
              strokeWidth={2}
              fill="url(#goldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
