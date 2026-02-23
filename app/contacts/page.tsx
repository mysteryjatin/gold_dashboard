'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Mail, MessageSquare, User } from 'lucide-react'

interface ContactRecord {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export default function ContactsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          loadContacts()
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

  async function loadContacts() {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      } else {
        console.error('Failed to load contacts:', await response.json())
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated === null || !isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout pageTitle="Contacts">
      <div className="space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            label="Total submissions"
            value={loading ? '...' : contacts.length.toLocaleString()}
            icon={MessageSquare}
            trend={{ value: 'From website contact form', positive: true }}
          />
          <StatCard
            label="Unique senders"
            value={
              loading
                ? '...'
                : new Set(contacts.map((c) => c.email.toLowerCase())).size.toLocaleString()
            }
            icon={User}
            trend={{ value: 'By email', positive: true }}
          />
        </section>

        <PageCard title="Contact form submissions (from website)">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center text-dashboard-text-muted">Loading...</div>
            ) : contacts.length === 0 ? (
              <div className="py-8 text-center text-dashboard-text-muted">
                No contact submissions yet
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-dashboard-border bg-dashboard-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-dashboard-text font-medium">
                        <User className="h-4 w-4 text-dashboard-gold" />
                        {c.name}
                      </div>
                      <span className="text-dashboard-text-muted text-xs">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-dashboard-text-secondary text-sm mb-1">
                      <Mail className="h-3.5 w-3.5 text-dashboard-gold" />
                      <a
                        href={`mailto:${c.email}`}
                        className="text-dashboard-gold hover:underline"
                      >
                        {c.email}
                      </a>
                    </div>
                    <div className="mt-2">
                      <span className="text-dashboard-text-muted text-xs font-medium uppercase">
                        Subject:
                      </span>
                      <p className="text-dashboard-text font-medium">{c.subject}</p>
                    </div>
                    <div className="mt-2">
                      <span className="text-dashboard-text-muted text-xs font-medium uppercase">
                        Message:
                      </span>
                      <p className="text-dashboard-text-secondary text-sm mt-0.5 whitespace-pre-wrap">
                        {c.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>
      </div>
    </DashboardLayout>
  )
}
