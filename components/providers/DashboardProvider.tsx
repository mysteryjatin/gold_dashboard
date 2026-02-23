'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type DashboardContextType = {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  toggleSidebarCollapsed: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        sidebarOpen,
        sidebarCollapsed,
        toggleSidebar,
        toggleSidebarCollapsed,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (ctx === undefined) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return ctx
}
