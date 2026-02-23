'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { ArrowDownLeft, ArrowUpRight, Wallet, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionRecord {
  id: string
  type: string
  amount: number
  method: string
  status: string
  date: string
  customerName?: string
  customerEmail?: string
}

interface TransactionStats {
  totalIn: number
  pendingAmount: number
  completedCount: number
  pendingCount: number
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

const statusStyles: Record<string, string> = {
  completed: 'bg-dashboard-gold/15 text-dashboard-gold border-dashboard-gold/30',
  pending: 'bg-dashboard-peach/15 text-dashboard-peach border-dashboard-peach/30',
  cancelled: 'bg-dashboard-text-muted/15 text-dashboard-text-muted border-dashboard-text-muted/30',
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/transactions')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load')
      }
      const data = await res.json()
      setTransactions(data.transactions ?? [])
      setStats(data.stats ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions')
      setTransactions([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <DashboardLayout pageTitle="Transactions">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total In"
            value={loading ? '...' : '$' + (stats?.totalIn ?? 0).toLocaleString()}
            icon={ArrowDownLeft}
            trend={{ value: stats ? `${stats.completedCount} completed` : '—', positive: true }}
          />
          <StatCard
            label="Pending"
            value={loading ? '...' : '$' + (stats?.pendingAmount ?? 0).toLocaleString()}
            icon={ArrowUpRight}
            trend={{ value: stats ? `${stats.pendingCount} orders` : '—', positive: false }}
          />
          <StatCard
            label="Net (revenue)"
            value={loading ? '...' : '$' + (stats?.totalIn ?? 0).toLocaleString()}
            icon={Wallet}
            trend={{ value: 'from completed', positive: true }}
          />
          <StatCard
            label="Pending count"
            value={loading ? '...' : String(stats?.pendingCount ?? 0)}
            icon={CreditCard}
            trend={{ value: 'orders', positive: false }}
          />
        </section>

        <PageCard title="Recent Transactions">
          {error ? (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="py-8 text-center text-dashboard-text-muted">
              Loading transactions…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-dashboard-border">
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      ID
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Type
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Amount
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Method
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Status
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Date
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Customer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-dashboard-text-muted">
                        No transactions (orders) yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-dashboard-border/60 transition-colors hover:bg-dashboard-row-hover"
                      >
                        <td className="py-3.5 px-5 text-dashboard-text font-medium tabular-nums">
                          {tx.id}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-secondary capitalize">
                          {tx.type}
                        </td>
                        <td
                          className={cn(
                            'py-3.5 px-5 font-medium tabular-nums',
                            tx.amount >= 0 ? 'text-dashboard-gold' : 'text-red-400/90'
                          )}
                        >
                          {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-secondary">
                          {tx.method}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={cn(
                              'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
                              statusStyles[tx.status] ?? statusStyles.pending
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-muted text-sm">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-secondary text-sm">
                          {tx.customerName || tx.customerEmail || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  )
}
