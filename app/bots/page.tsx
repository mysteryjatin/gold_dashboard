'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Bot, TrendingUp, Users, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BotWithSales {
  id: string
  name: string
  type: string
  status: string
  salesCount: number
  totalRevenue: number
}

const statusStyles: Record<string, string> = {
  active: 'bg-dashboard-gold/15 text-dashboard-gold border-dashboard-gold/30',
  beta: 'bg-dashboard-peach/15 text-dashboard-peach border-dashboard-peach/30',
  inactive: 'bg-dashboard-border/50 text-dashboard-text-muted border-dashboard-border',
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotWithSales[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/bots')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to load: ${res.status}`)
      }
      const data = await res.json()
      setBots(data.bots ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bots')
      setBots([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBots()
  }, [fetchBots])

  const totalSales = bots.reduce((s, b) => s + b.salesCount, 0)
  const combinedRevenue = bots.reduce((s, b) => s + b.totalRevenue, 0)

  return (
    <DashboardLayout pageTitle="Bots / Products">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Products"
            value="3"
            icon={Bot}
            trend={{ value: 'Gold, Crypto, Forex', positive: true }}
          />
          <StatCard
            label="Total Sales"
            value={totalSales.toLocaleString()}
            icon={Users}
            trend={{ value: 'orders (completed)', positive: true }}
          />
          <StatCard
            label="Combined Revenue"
            value={`$${combinedRevenue.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 'from DB', positive: true }}
          />
          <StatCard
            label="Active EAs"
            value="3"
            icon={Activity}
            trend={{ value: 'Running', positive: true }}
          />
        </section>

        <PageCard title="EA / Products">
          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-dashboard-text-muted">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-dashboard-border">
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Product
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Type
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Status
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Sales
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-dashboard-border/60 transition-colors hover:bg-dashboard-row-hover"
                    >
                      <td className="py-3.5 px-5 text-dashboard-text font-medium">{b.name}</td>
                      <td className="py-3.5 px-5 text-dashboard-text-secondary">{b.type}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={cn(
                            'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
                            statusStyles[b.status] ?? statusStyles.active
                          )}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-text-secondary tabular-nums">
                        {b.salesCount}
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-gold font-medium tabular-nums">
                        ${Number(b.totalRevenue).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  )
}
