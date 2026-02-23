'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Logout via API
    async function logout() {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
        })
      } catch (error) {
        // Ignore errors
      } finally {
        // Redirect to login page
        router.push('/login')
      }
    }
    logout()
  }, [router])

  return null
}
