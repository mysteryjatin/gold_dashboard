'use client'

import { useEffect, useState } from 'react'
import { PageCard } from '@/components/ui/PageCard'
import { Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderRecord } from '@/lib/orders'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PendingOrdersCard({ className }: { className?: string }) {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPendingOrders() {
      try {
        const response = await fetch('/api/orders/pending?manual=true')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        } else {
          console.error('Failed to load pending orders')
        }
      } catch (error) {
        console.error('Error loading pending orders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPendingOrders()
  }, [])

  if (loading) {
    return (
      <PageCard title="Pending Manual Orders" className={className}>
        <div className="py-8 text-center text-dashboard-text-muted">Loading...</div>
      </PageCard>
    )
  }

  if (orders.length === 0) {
    return (
      <PageCard title="Pending Manual Orders" className={className}>
        <div className="py-8 text-center text-dashboard-text-muted">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-dashboard-text-muted/50" />
          <p>No pending manual orders</p>
        </div>
      </PageCard>
    )
  }

  return (
    <PageCard 
      title={
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-dashboard-peach" />
          <span>Pending Manual Orders ({orders.length})</span>
        </div>
      } 
      className={className}
    >
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
                Amount
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Payment Method
              </th>
              <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-dashboard-border/60 transition-colors hover:bg-dashboard-row-hover"
              >
                <td className="py-3.5 px-5 text-dashboard-text font-medium font-mono text-sm">
                  {order.id.slice(0, 20)}...
                </td>
                <td className="py-3.5 px-5">
                  <div className="text-dashboard-text font-medium">{order.customer.name}</div>
                  <div className="text-dashboard-text-muted text-xs">{order.customer.email}</div>
                  {order.customer.phone && (
                    <div className="text-dashboard-text-muted text-xs">{order.customer.phone}</div>
                  )}
                </td>
                <td className="py-3.5 px-5">
                  <div className="text-dashboard-text-secondary text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="mb-1">
                        {item.name}
                        {item.type === 'upsell' && (
                          <span className="ml-1 text-xs text-dashboard-text-muted">(upsell)</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-dashboard-text-muted text-xs mt-1">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="py-3.5 px-5 text-dashboard-gold font-medium tabular-nums">
                  ${order.totalUSD.toFixed(2)}
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={cn(
                      'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
                      'bg-dashboard-peach/15 text-dashboard-peach border-dashboard-peach/30'
                    )}
                  >
                    {order.paymentMethod || 'manual'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-dashboard-text-muted text-sm">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageCard>
  )
}
