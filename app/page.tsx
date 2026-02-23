'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { MT5Metrics } from '@/components/dashboard/MT5Metrics'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { DistributionChart } from '@/components/dashboard/DistributionChart'
import { RecentTradesTable } from '@/components/dashboard/RecentTradesTable'
import { PendingOrdersCard } from '@/components/dashboard/PendingOrdersCard'
import { Wallet, Bot, TrendingUp, Users } from 'lucide-react'

interface DashboardStats {
  totalBalance: number
  activeBots: number
  monthlyProfit: number
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRatings: number
  averageRating: number
  monthlyOrders: number
  monthlyRevenue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated via API
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
          loadDashboardStats()
        } else {
          setIsAuthenticated(false)
          router.push('/login')
        }
      } catch (error) {
        setIsAuthenticated(false)
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  async function loadDashboardStats() {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard stats loaded:', data.stats)
        setStats(data.stats)
      } else {
        const errorData = await response.json()
        console.error('Failed to load dashboard stats:', errorData)
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
  }

  // Show nothing while checking authentication or if not authenticated
  if (isAuthenticated === null || !isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-8">
        {/* Stats row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Balance"
            value={loading ? '...' : formatCurrency(stats?.totalBalance || 0)}
            icon={Wallet}
            trend={{ 
              value: stats?.completedOrders ? `${stats.completedOrders} orders` : '0 orders', 
              positive: true 
            }}
          />
          <StatCard
            label="Active Bots"
            value={loading ? '...' : formatNumber(stats?.activeBots || 0)}
            icon={Bot}
            trend={{ 
              value: stats?.totalOrders ? `${stats.totalOrders} total orders` : '0 orders', 
              positive: true 
            }}
          />
          <StatCard
            label="Monthly Profit"
            value={loading ? '...' : formatCurrency(stats?.monthlyProfit || 0)}
            icon={TrendingUp}
            trend={{ 
              value: stats?.monthlyOrders ? `${stats.monthlyOrders} orders` : '0 orders', 
              positive: true 
            }}
          />
          <StatCard
            label="Total Users"
            value={loading ? '...' : formatNumber(stats?.totalUsers || 0)}
            icon={Users}
            trend={{ 
              value: stats?.pendingOrders ? `${stats.pendingOrders} pending` : '0 pending', 
              positive: true 
            }}
          />
        </section>

        {/* MT5 metrics */}
        <MT5Metrics />

        {/* Pending Manual Orders - Prominent display */}
        <PendingOrdersCard />

        {/* Charts row */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PerformanceChart />
          <DistributionChart />
        </section>

        {/* Recent trades table */}
        <RecentTradesTable />
      </div>
    </DashboardLayout>
  )
}
