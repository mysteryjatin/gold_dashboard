'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  name: string
  priceUSD: number
}

interface Order {
  id: string
  customer: {
    name: string
    email: string
  }
  items: OrderItem[]
  totalUSD: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-dashboard-gold/15 text-dashboard-gold border-dashboard-gold/30' },
  pending: { label: 'Pending', className: 'bg-dashboard-peach/15 text-dashboard-peach border-dashboard-peach/30' },
  cancelled: { label: 'Cancelled', className: 'bg-dashboard-text-muted/15 text-dashboard-text-muted border-dashboard-text-muted/30' },
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export function RecentTradesTable({ className }: { className?: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch('/api/dashboard/recent-orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Failed to load recent orders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-card border border-dashboard-border bg-dashboard-card overflow-hidden shadow-card',
          className
        )}
      >
        <div className="p-5 border-b border-dashboard-border">
          <h3 className="text-card-title font-card-title text-dashboard-text">
            Recent Trades / Orders
          </h3>
        </div>
        <div className="p-8 text-center text-dashboard-text-muted">Loading...</div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div
        className={cn(
          'rounded-card border border-dashboard-border bg-dashboard-card overflow-hidden shadow-card',
          className
        )}
      >
        <div className="p-5 border-b border-dashboard-border">
          <h3 className="text-card-title font-card-title text-dashboard-text">
            Recent Trades / Orders
          </h3>
        </div>
        <div className="p-8 text-center text-dashboard-text-muted">No orders found</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-card border border-dashboard-border bg-dashboard-card overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <div className="p-5 border-b border-dashboard-border">
        <h3 className="text-card-title font-card-title text-dashboard-text">
          Recent Trades / Orders
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-dashboard-border">
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Order ID
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Customer
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Items
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Total
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Status
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              return (
                <tr
                  key={order.id}
                  className="border-b border-dashboard-border/60 transition-colors duration-200 hover:bg-dashboard-row-hover"
                >
                  <td className="py-3.5 px-5 text-dashboard-text font-medium font-mono text-sm">
                    {order.id.slice(0, 20)}...
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="text-dashboard-text font-medium">{order.customer.name}</div>
                    <div className="text-dashboard-text-muted text-xs">{order.customer.email}</div>
                  </td>
                  <td className="py-3.5 px-5 text-dashboard-text-secondary text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="py-3.5 px-5 text-dashboard-gold font-medium tabular-nums">
                    ${order.totalUSD.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-dashboard-text-muted text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
