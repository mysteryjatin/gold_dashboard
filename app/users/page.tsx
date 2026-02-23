'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Users, UserPlus, Shield, Mail, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserRecord {
  email: string
  name: string
  firstOrderAt: string
  orderCount: number
  totalSpent: number
}

interface UsersStats {
  total: number
  newLast30Days: number
  active: number
  pending: number
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

function filterUsersBySearch(list: UserRecord[], query: string): UserRecord[] {
  if (!query.trim()) return list
  const q = query.trim().toLowerCase()
  return list.filter((u) => {
    const n = (u.name ?? '').toLowerCase()
    const e = (u.email ?? '').toLowerCase()
    return n.includes(q) || e.includes(q)
  })
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [stats, setStats] = useState<UsersStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/users')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load')
      }
      const data = await res.json()
      setUsers(data.users ?? [])
      setStats(data.stats ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
      setUsers([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = filterUsersBySearch(users, search)

  return (
    <DashboardLayout pageTitle="Users">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Customers who bought"
            value={loading ? '...' : (stats?.total ?? 0).toLocaleString()}
            icon={Users}
            trend={{ value: stats ? 'from completed orders' : '—', positive: true }}
          />
          <StatCard
            label="New (30d)"
            value={loading ? '...' : (stats?.newLast30Days ?? 0).toLocaleString()}
            icon={UserPlus}
            trend={{
              value:
                stats && stats.total > 0
                  ? Math.round((stats.newLast30Days / stats.total) * 100) + '% of total'
                  : '—',
              positive: true,
            }}
          />
          <StatCard
            label="Active"
            value={loading ? '...' : (stats?.active ?? 0).toLocaleString()}
            icon={Shield}
            trend={{ value: 'purchased', positive: true }}
          />
          <StatCard
            label="Pending"
            value={loading ? '...' : String(stats?.pending ?? 0)}
            icon={Mail}
            trend={{ value: '—', positive: false }}
          />
        </section>

        <PageCard title="Users who bought the bot">
          {error ? (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dashboard-text-muted" />
              <input
                type="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full rounded-md border border-dashboard-border bg-dashboard-bg pl-9 pr-3 py-2',
                  'text-sm text-dashboard-text placeholder:text-dashboard-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-dashboard-gold/50 focus:border-dashboard-gold'
                )}
                aria-label="Search users"
              />
            </div>
            {search ? (
              <span className="text-sm text-dashboard-text-muted">
                {filteredUsers.length} of {users.length} customers
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="py-8 text-center text-dashboard-text-muted">
              Loading users…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-dashboard-border">
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Name
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Email
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      First purchase
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Orders
                    </th>
                    <th className="text-left text-dashboard-text-muted text-xs font-medium uppercase tracking-wider py-3 px-5">
                      Total spent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-dashboard-text-muted">
                        {users.length === 0
                          ? 'No customers with completed orders yet.'
                          : 'No customers match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.email}
                        className="border-b border-dashboard-border/60 transition-colors hover:bg-dashboard-row-hover"
                      >
                        <td className="py-3.5 px-5 text-dashboard-text font-medium">
                          {u.name || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-secondary">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-muted text-sm">
                          {formatDate(u.firstOrderAt)}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-text-secondary tabular-nums">
                          {u.orderCount}
                        </td>
                        <td className="py-3.5 px-5 text-dashboard-gold font-medium tabular-nums">
                          ${Number(u.totalSpent).toLocaleString()}
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
