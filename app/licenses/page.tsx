'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Key, Copy, RefreshCw, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LicenseRow {
  id: string
  licenseKey: string
  status: 'unused' | 'used'
  activatedAccount: number
  activatedAt: string | null
  activatedIp: string | null
  createdAt: string
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function LicensesPage() {
  const [rows, setRows] = useState<LicenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<string[]>([])
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])

  /** Public HTTPS URL for MT5 (set in .env when the app is deployed or when you use localhost for admin). */
  const envPublicUrl =
    typeof process.env.NEXT_PUBLIC_LICENSE_ACTIVATION_URL === 'string'
      ? process.env.NEXT_PUBLIC_LICENSE_ACTIVATION_URL.trim().replace(/\/$/, '')
      : ''

  const activationUrl =
    envPublicUrl.length > 0
      ? envPublicUrl.includes('/api/license/activate')
        ? envPublicUrl
        : `${envPublicUrl}/api/license/activate`
      : origin
        ? `${origin}/api/license/activate`
        : '/api/license/activate'

  const isLocalhost =
    activationUrl.includes('localhost') || activationUrl.includes('127.0.0.1')

  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/licenses')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to load: ${res.status}`)
      }
      const data = await res.json()
      setRows(data.licenses ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load licenses')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLicenses()
  }, [fetchLicenses])

  const generate = async () => {
    try {
      setGenerating(true)
      setError(null)
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setLastGenerated(data.keys ?? [])
      await fetchLicenses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generate failed')
    } finally {
      setGenerating(false)
    }
  }

  const resetKey = async (id: string) => {
    if (!confirm('Reset this key to unused? Customer can activate again on a new install.')) return
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'PATCH' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      await fetchLicenses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed')
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  const unused = rows.filter((r) => r.status === 'unused').length
  const used = rows.filter((r) => r.status === 'used').length

  return (
    <DashboardLayout pageTitle="EA licenses">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total keys"
            value={loading ? '...' : rows.length.toLocaleString()}
            icon={Key}
            trend={{ value: 'in database', positive: true }}
          />
          <StatCard
            label="Unused"
            value={loading ? '...' : unused.toLocaleString()}
            icon={Key}
            trend={{ value: 'ready to sell', positive: true }}
          />
          <StatCard
            label="Used"
            value={loading ? '...' : used.toLocaleString()}
            icon={Key}
            trend={{ value: 'activated', positive: false }}
          />
          <StatCard
            label="Activation URL"
            value="HTTPS"
            icon={Key}
            trend={{ value: 'see below', positive: true }}
          />
        </section>

        <PageCard title="Setup for MT5 (Expert Advisors)">
          <p className="mb-3 text-sm text-dashboard-text-secondary">
            Customers only need a <strong className="text-dashboard-text">neutral activation host</strong> (e.g.{' '}
            <code className="text-dashboard-gold">license.goldenedge.ai</code>), not your admin URL. Add that subdomain
            in your DNS / hosting (same deployment as this app) so WebRequest and the EA use a name that does not reveal
            “dashboard”.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-dashboard-text-secondary">
            <li>
              Add this URL to MT5: <span className="text-dashboard-text">Tools → Options → Expert Advisors → Allow WebRequest</span>{' '}
              — use the same host as below (MetaTrader requires listing the site; a neutral subdomain keeps your admin
              hostname private).
            </li>
            <li>
              In the EA inputs, set <code className="text-dashboard-gold">LicenseActivationUrl</code> to the HTTPS URL
              below (not localhost).
            </li>
          </ol>
          {isLocalhost && !envPublicUrl && (
            <p className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/95">
              You are on a dev URL. For real customers, deploy this app and set{' '}
              <code className="font-mono">NEXT_PUBLIC_LICENSE_ACTIVATION_URL</code> in{' '}
              <code className="font-mono">.env</code> (e.g. <code className="font-mono">https://yourdomain.com</code>)
              so this box shows the correct activation link.
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashboard-border bg-dashboard-bg/50 px-3 py-2 font-mono text-xs sm:text-sm text-dashboard-text break-all">
            <span className="flex-1 min-w-0">{activationUrl}</span>
            <button
              type="button"
              onClick={() => copy(activationUrl)}
              className="shrink-0 inline-flex items-center gap-1 rounded-md border border-dashboard-border px-2 py-1 text-xs text-dashboard-text-secondary hover:bg-dashboard-border/40"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <p className="mt-3 text-xs text-dashboard-text-muted">
            Buyers paste the license key once on first attach; after activation the EA works offline. One key = one
            activation; reinstall requires a new key or a reset from this page.
          </p>
        </PageCard>

        <PageCard title="Generate keys">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="gen-count" className="block text-xs font-medium text-dashboard-text-secondary mb-1">
                Count
              </label>
              <input
                id="gen-count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))}
                className="w-24 rounded-lg border border-dashboard-border bg-dashboard-bg px-3 py-2 text-sm text-dashboard-text"
              />
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-dashboard-gold/90 px-4 py-2 text-sm font-medium text-dashboard-bg hover:bg-dashboard-gold disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
          </div>
          {lastGenerated.length > 0 && (
            <div className="mt-4 rounded-lg border border-dashboard-gold/30 bg-dashboard-gold/5 p-3">
              <p className="text-xs text-dashboard-text-secondary mb-2">New keys (copy to email):</p>
              <ul className="space-y-1 font-mono text-sm text-dashboard-text">
                {lastGenerated.map((k) => (
                  <li key={k} className="flex flex-wrap items-center gap-2">
                    <span>{k}</span>
                    <button
                      type="button"
                      onClick={() => copy(k)}
                      className="text-xs text-dashboard-gold hover:underline"
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PageCard>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <PageCard title="All license keys">
          <div className="overflow-x-auto -mx-1">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dashboard-border text-dashboard-text-secondary">
                  <th className="py-2 pr-4 font-medium">Key</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Account</th>
                  <th className="py-2 pr-4 font-medium">Activated</th>
                  <th className="py-2 pr-4 font-medium">IP</th>
                  <th className="py-2 font-medium w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-dashboard-text-muted">
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-dashboard-text-muted">
                      No keys yet. Generate some above.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-dashboard-border/60">
                      <td className="py-2 pr-4 font-mono text-xs sm:text-sm whitespace-nowrap">
                        {r.licenseKey}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={cn(
                            'inline-flex rounded px-2 py-0.5 text-xs border',
                            r.status === 'unused'
                              ? 'bg-dashboard-gold/10 text-dashboard-gold border-dashboard-gold/30'
                              : 'bg-dashboard-border/40 text-dashboard-text-muted border-dashboard-border'
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 tabular-nums">
                        {r.activatedAccount > 0 ? r.activatedAccount : '—'}
                      </td>
                      <td className="py-2 pr-4 text-xs text-dashboard-text-secondary whitespace-nowrap">
                        {formatWhen(r.activatedAt)}
                      </td>
                      <td className="py-2 pr-4 text-xs text-dashboard-text-muted max-w-[120px] truncate">
                        {r.activatedIp || '—'}
                      </td>
                      <td className="py-2">
                        {r.status === 'used' ? (
                          <button
                            type="button"
                            onClick={() => resetKey(r.id)}
                            className="inline-flex items-center gap-1 text-xs text-dashboard-peach hover:underline"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                          </button>
                        ) : (
                          <span className="text-xs text-dashboard-text-muted">—</span>
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
