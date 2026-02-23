'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is already authenticated
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (data.authenticated) {
          router.push('/')
        }
      } catch (error) {
        // Ignore errors, user is not authenticated
      }
    }
    checkAuth()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect to dashboard
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Base dark gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #0E0E11 0%, #131318 40%, #0E0E11 100%)',
        }}
      />
      {/* Animated gradient layer - slow drift */}
      <div
        className="fixed inset-0 pointer-events-none opacity-90"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, rgba(230, 181, 102, 0.2), transparent 55%)',
          backgroundSize: '200% 200%',
          animation: 'login-gradient-drift 20s ease-in-out infinite',
        }}
      />
      {/* Floating orbs - theme gold/peach */}
      <div
        className="fixed top-1/4 left-1/4 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(230, 181, 102, 0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'login-orb-1 12s ease-in-out infinite',
        }}
      />
      <div
        className="fixed bottom-1/3 right-1/4 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(230, 181, 102, 0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'login-orb-2 15s ease-in-out infinite',
        }}
      />
      <div
        className="fixed top-1/2 right-1/3 w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 214, 179, 0.15) 0%, transparent 70%)',
          filter: 'blur(45px)',
          animation: 'login-orb-3 14s ease-in-out infinite',
        }}
      />
      {/* Subtle grid for depth */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--dashboard-text) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="w-full max-w-[400px] relative">
        {/* Card */}
        <div className="bg-dashboard-card border border-dashboard-border rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center justify-center gap-3 mb-8 no-underline group"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-dashboard-gold/10 ring-1 ring-dashboard-border/50 group-hover:bg-dashboard-gold/15 transition-colors">
              <Image
                src="/hero_logo.png"
                alt="GoldenEdge"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold text-dashboard-gold group-hover:text-dashboard-gold-hover transition-colors">
              GoldenEdge AI
            </span>
          </Link>

          <h1 className="text-center text-lg font-medium text-dashboard-text mb-6">
            Welcome Back Girish Sharma!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-dashboard-peach/15 border border-dashboard-peach/30 text-dashboard-peach text-sm px-3 py-2"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dashboard-text-secondary mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dashboard-text-muted pointer-events-none"
                  aria-hidden
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-dashboard-bg border border-dashboard-border text-dashboard-text placeholder:text-dashboard-text-muted focus:outline-none focus:border-dashboard-gold focus:ring-2 focus:ring-dashboard-gold/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dashboard-text-secondary mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dashboard-text-muted pointer-events-none"
                  aria-hidden
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-dashboard-bg border border-dashboard-border text-dashboard-text placeholder:text-dashboard-text-muted focus:outline-none focus:border-dashboard-gold focus:ring-2 focus:ring-dashboard-gold/20 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-dashboard-gold text-dashboard-bg font-medium hover:bg-dashboard-gold-hover focus:outline-none focus:ring-2 focus:ring-dashboard-gold focus:ring-offset-2 focus:ring-offset-dashboard-bg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dashboard-text-muted">
            Don&apos;t have an account? Contact your administrator.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-dashboard-text-muted">
          © {new Date().getFullYear()} GoldenEdge AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
