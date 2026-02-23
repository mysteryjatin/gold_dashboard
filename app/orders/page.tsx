'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { ShoppingCart, CheckCircle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderRecord } from '@/lib/orders'

const statusStyles: Record<string, string> = {
  completed: 'bg-dashboard-gold/15 text-dashboard-gold border-dashboard-gold/30',
  pending: 'bg-dashboard-peach/15 text-dashboard-peach border-dashboard-peach/30',
  cancelled: 'bg-dashboard-text-muted/15 text-dashboard-text-muted border-dashboard-text-muted/30',
  failed: 'bg-dashboard-text-muted/15 text-dashboard-text-muted border-dashboard-text-muted/30',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          loadOrders()
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

  async function loadOrders() {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error('Failed to load orders:', await response.json())
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(orderId: string, status: 'completed' | 'cancelled') {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      if (res.ok) {
        await loadOrders()
      } else {
        const data = await res.json()
        console.error('Update failed:', data)
      }
    } catch (e) {
      console.error('Failed to update order:', e)
    }
  }

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  const completedPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const pendingPercentage = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0
  const cancelledPercentage = stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0

  if (isAuthenticated === null || !isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout pageTitle="Orders">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={loading ? '...' : stats.total.toLocaleString()}
            icon={ShoppingCart}
            trend={{ value: `+${stats.total}`, positive: true }}
          />
          <StatCard
            label="Completed"
            value={loading ? '...' : stats.completed.toLocaleString()}
            icon={CheckCircle}
            trend={{ value: `${completedPercentage}%`, positive: true }}
          />
          <StatCard
            label="Pending"
            value={loading ? '...' : stats.pending.toLocaleString()}
            icon={Clock}
            trend={{ value: `${pendingPercentage}%`, positive: false }}
          />
          <StatCard
            label="Cancelled"
            value={loading ? '...' : stats.cancelled.toLocaleString()}
            icon={XCircle}
            trend={{ value: `${cancelledPercentage}%`, positive: false }}
          />
        </section>

        <PageCard title="Recent Orders">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-dashboard-border">
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Order ID
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Product
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Customer
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Amount
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Status
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Payment Method
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Date
                  </th>
                  <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-5 text-center text-dashboard-text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-5 text-center text-dashboard-text-muted">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-dashboard-border/60 transition-colors hover:bg-dashboard-row-hover"
                    >
                      <td className="py-3.5 px-5 text-dashboard-text font-medium font-mono text-sm">
                        {order.id.slice(0, 20)}...
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-text-secondary">
                        {order.items.length > 0 ? order.items[0].name : 'N/A'}
                        {order.items.length > 1 && (
                          <span className="text-xs text-dashboard-text-muted ml-1">
                            +{order.items.length - 1} more
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="text-dashboard-text-secondary">{order.customer.name}</div>
                        <div className="text-dashboard-text-muted text-xs">{order.customer.email}</div>
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-gold font-medium tabular-nums">
                        ${order.totalUSD.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={cn(
                            'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
                            statusStyles[order.status] ?? statusStyles.pending
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-text-muted text-sm">
                        {order.paymentMethod || 'N/A'}
                      </td>
                      <td className="py-3.5 px-5 text-dashboard-text-muted text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-5">
                        {order.status === 'pending' && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="rounded border border-dashboard-gold/50 bg-dashboard-gold/10 px-2 py-1 text-xs font-medium text-dashboard-gold hover:bg-dashboard-gold/20"
                            >
                              Mark completed
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              className="rounded border border-dashboard-text-muted/50 bg-dashboard-text-muted/10 px-2 py-1 text-xs font-medium text-dashboard-text-muted hover:bg-dashboard-text-muted/20"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
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
