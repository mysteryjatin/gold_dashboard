'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { DistributionChart } from '@/components/dashboard/DistributionChart'
import { PageCard } from '@/components/ui/PageCard'
import { BarChart3, TrendingUp, Eye, DollarSign } from 'lucide-react'
import type { AnalyticsData } from '@/lib/analytics'

function formatCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return new Intl.NumberFormat('en-US').format(num)
}

function formatTrend(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value}%`
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          loadAnalytics()
        } else {
          setIsAuthenticated(false)
          router.push('/login')
        }
      } catch {
        setIsAuthenticated(false)
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  async function loadAnalytics() {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        console.error('Failed to load analytics:', await response.json())
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = analytics?.stats
  const performanceData = analytics?.performanceData ?? []
  const distributionData = analytics?.distributionData ?? []
  const topPerformingEAs = analytics?.topPerformingEAs ?? []

  if (isAuthenticated === null || !isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout pageTitle="Analytics">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={loading ? '...' : `$${stats ? Math.round(stats.totalRevenue).toLocaleString() : '0'}`}
            icon={DollarSign}
            trend={{
              value: stats ? formatTrend(stats.revenueTrend) : '—',
              positive: (stats?.revenueTrend ?? 0) >= 0,
            }}
          />
          <StatCard
            label="Page Views"
            value={loading ? '...' : formatCompact(stats?.pageViews ?? 0)}
            icon={Eye}
            trend={{
              value: stats ? formatTrend(stats.pageViewsTrend) : '—',
              positive: (stats?.pageViewsTrend ?? 0) >= 0,
            }}
          />
          <StatCard
            label="Conversion Rate"
            value={loading ? '...' : `${stats?.conversionRate ?? 0}%`}
            icon={TrendingUp}
            trend={{
              value: stats ? formatTrend(stats.conversionRateTrend) : '—',
              positive: (stats?.conversionRateTrend ?? 0) >= 0,
            }}
          />
          <StatCard
            label="Active Sessions"
            value={loading ? '...' : (stats?.activeSessions ?? 0).toLocaleString()}
            icon={BarChart3}
            trend={{
              value: stats?.activeSessionsTrend ?? 'This month',
              positive: true,
            }}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PerformanceChart data={performanceData} />
          <DistributionChart data={distributionData} />
        </section>

        <PageCard title="Top performing EAs (last 30 days)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-dashboard-border">
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    EA / Product
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Sales
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Revenue
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-5 text-center text-dashboard-text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : topPerformingEAs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-5 text-center text-dashboard-text-muted">
                      No data for the last 30 days
                    </td>
                  </tr>
                ) : (
                  topPerformingEAs.map((row, i) => (
                    <tr
                      key={`${row.name}-${i}`}
                      className="border-b border-dashboard-border/60 transition-colors hover:bg-dashboard-row-hover"
                    >
                      <td className="py-3.5 px-5 text-dashboard-text font-medium">{row.name}</td>
                      <td className="py-3.5 px-5 text-dashboard-text-secondary tabular-nums">{row.sales}</td>
                      <td className="py-3.5 px-5 text-dashboard-gold font-medium tabular-nums">
                        ${row.revenue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-text-secondary">{row.winRate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PageCard>
      </div>
    </DashboardLayout>
  )
}
