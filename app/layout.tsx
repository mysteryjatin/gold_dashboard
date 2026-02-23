import type { Metadata } from 'next'
import './globals.css'
import { DashboardProvider } from '@/components/providers/DashboardProvider'

export const metadata: Metadata = {
  title: 'GoldenEdge AI — MT5 Dashboard',
  description: 'Premium admin dashboard for MT5 trading bots',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-dashboard-bg text-dashboard-text font-sans">
        <DashboardProvider>{children}</DashboardProvider>
      </body>
    </html>
  )
}
