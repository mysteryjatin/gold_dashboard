'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useDashboard } from '@/components/providers/DashboardProvider'
import { cn } from '@/lib/utils'

type DashboardLayoutProps = {
  children: ReactNode
  pageTitle?: string
}

export function DashboardLayout({ children, pageTitle = 'Dashboard' }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useDashboard()

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Sidebar />
      {/* Main content: always offset by sidebar width (fixed px) so it never overlaps */}
      <div
        className={cn(
          'min-h-screen flex flex-col transition-[margin-left] duration-300 ease-in-out',
          'lg:ml-[260px]',
          sidebarCollapsed && 'lg:ml-[72px]'
        )}
      >
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 max-w-dashboard w-full mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
