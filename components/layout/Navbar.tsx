'use client'

import { useState, useEffect } from 'react'
import { Bell, User } from 'lucide-react'
import { useDashboard } from '@/components/providers/DashboardProvider'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavbarProps = {
  pageTitle?: string
}

export function Navbar({ pageTitle = 'Dashboard' }: NavbarProps) {
  const { toggleSidebar } = useDashboard()
  const [userName, setUserName] = useState('Girish Sharma!')

  useEffect(() => {
    async function loadUserName() {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const data = await response.json()
          setUserName(data.name || 'Girish Sharma!')
        }
      } catch (error) {
        // Ignore errors, use default name
      }
    }
    loadUserName()
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-navbar min-h-[72px] items-center justify-between',
        'border-b border-dashboard-border bg-dashboard-bg/95 backdrop-blur-sm',
        'px-4 sm:px-6 lg:px-8'
      )}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-dashboard-text-secondary hover:bg-dashboard-border hover:text-dashboard-text transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-page-heading font-page-heading text-dashboard-text truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-dashboard-text-secondary hover:bg-dashboard-border hover:text-dashboard-text transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-dashboard-gold" />
        </button>
        <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-dashboard-border">
          <div className="h-9 w-9 rounded-full bg-dashboard-border flex items-center justify-center overflow-hidden ring-2 ring-dashboard-gold/30">
            <User className="h-4 w-4 text-dashboard-text-muted" />
          </div>
          <span className="text-sm font-medium text-dashboard-text truncate max-w-[180px]">
            {userName}
          </span>
        </div>
      </div>
    </header>
  )
}
