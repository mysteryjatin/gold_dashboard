'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

const DEFAULT_DISTRIBUTION_DATA = [
  { name: 'Gold Sniper EA Bot', value: 60, color: '#E6B566' },
  { name: 'Forex Sniper EA Bot', value: 40, color: '#22C55E' },
]

interface DistributionChartProps {
  className?: string
  data?: { name: string; value: number; color: string }[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-dashboard-border bg-dashboard-card px-3 py-2 shadow-card">
      <p className="text-dashboard-text font-medium">{d.name}</p>
      <p className="text-dashboard-gold text-sm font-semibold">{d.value}%</p>
    </div>
  )
}

export function DistributionChart({ className, data }: DistributionChartProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_DISTRIBUTION_DATA
  return (
    <div
      className={cn(
        'rounded-card border border-dashboard-border bg-dashboard-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <h3 className="text-card-title font-card-title text-dashboard-text mb-4">
        Bot / Asset Distribution
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              formatter={(value) => <span className="text-dashboard-text-secondary text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
