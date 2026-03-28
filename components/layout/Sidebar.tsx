'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Users,
  ArrowLeftRight,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Star,
  Mail,
  KeyRound,
} from 'lucide-react'
import { useDashboard } from '@/components/providers/DashboardProvider'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  // { href: '/bot', label: 'Bots / Products', icon: Bot },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/licenses', label: 'EA licenses', icon: KeyRound },
  { href: '/ratings', label: 'Ratings', icon: Star },
  { href: '/contacts', label: 'Contacts', icon: Mail },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed } = useDashboard()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'sidebar-overlay lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-dashboard-sidebar border-r border-dashboard-border',
          'flex flex-col transition-all duration-sidebar ease-in-out',
          'w-sidebar',
          sidebarCollapsed && 'lg:w-sidebar-collapsed',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & collapse toggle: row when expanded, column when collapsed so arrow never overlaps logo */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-between border-b border-dashboard-border gap-2 transition-all duration-sidebar',
            'min-h-[72px] px-4 lg:px-3 py-3',
            sidebarCollapsed ? 'lg:flex-col lg:justify-center lg:py-4' : 'flex-row'
          )}
        >
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-90 shrink-0',
              sidebarCollapsed && 'lg:justify-center lg:gap-0'
            )}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-dashboard-gold/10">
              <Image
                src="/hero_logo.png"
                alt="GoldenEdge"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span
              className={cn(
                'text-base font-semibold text-dashboard-gold whitespace-nowrap transition-all duration-sidebar',
                sidebarCollapsed && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
              )}
            >
              GoldenEdge AI
            </span>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-dashboard-text-secondary hover:bg-dashboard-border hover:text-dashboard-text transition-colors"
              aria-label="Close menu"
            >
              <Menu className="h-5 w-5 rotate-90" />
            </button>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-dashboard-text-secondary hover:bg-dashboard-border hover:text-dashboard-text transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                className={cn('h-5 w-5 transition-transform duration-sidebar', sidebarCollapsed && 'rotate-180')}
              />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          <ul className="space-y-0.5">
            {menuItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => sidebarOpen && toggleSidebar()}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-item font-sidebar-item transition-all duration-200',
                      'hover:bg-dashboard-border/60 hover:text-dashboard-text',
                      isActive
                        ? 'bg-dashboard-border/50 text-dashboard-gold border-l-4 border-dashboard-gold -ml-[2px] pl-[14px]'
                        : 'text-dashboard-text-secondary border-l-4 border-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive ? 'text-dashboard-gold' : 'text-dashboard-text-muted'
                      )}
                    />
                    <span
                      className={cn(
                        'whitespace-nowrap transition-all duration-sidebar',
                        sidebarCollapsed && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 border-t border-dashboard-border pt-4">
            <Link
              href="/logout"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-item font-sidebar-item text-dashboard-text-muted transition-all duration-200',
                'hover:bg-dashboard-border/60 hover:text-dashboard-peach',
                sidebarCollapsed && 'lg:justify-center lg:px-2'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap transition-all duration-sidebar',
                  sidebarCollapsed && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                )}
              >
                Logout
              </span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}
