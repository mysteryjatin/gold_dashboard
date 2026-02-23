'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { User, Bell, Shield, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-dashboard-text placeholder:text-dashboard-text-muted focus:border-dashboard-gold focus:outline-none focus:ring-2 focus:ring-dashboard-gold/20 transition-colors'
const labelClass = 'block text-sm font-medium text-dashboard-text-secondary mb-2'
const btnPrimary =
  'rounded-xl bg-dashboard-gold px-5 py-2.5 text-sm font-medium text-dashboard-bg hover:bg-dashboard-gold-hover focus:outline-none focus:ring-2 focus:ring-dashboard-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const btnSecondary =
  'rounded-xl border border-dashboard-border px-5 py-2.5 text-sm font-medium text-dashboard-text-secondary hover:bg-dashboard-border/50 focus:outline-none focus:ring-2 focus:ring-dashboard-border transition-colors'

export default function SettingsPage() {
  const [name, setName] = useState('Girish Sharma!')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setName(data.name || 'Girish Sharma!')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSavingProfile(true)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileError(data.error || 'Failed to update profile')
        return
      }

      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (error) {
      setProfileError('Failed to update profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    setSavingPassword(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to update password')
        return
      }

      setPasswordSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="space-y-8 max-w-2xl">
        {/* Profile */}
        <PageCard
          title="Profile"
          className="[&>div:last-child]:p-0"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dashboard-gold/10 text-dashboard-gold">
              <User className="h-4 w-4" />
            </span>
          }
        >
          <form onSubmit={handleSaveProfile} className="p-6 pt-0 space-y-5">
            <p className="text-dashboard-text-muted text-sm -mt-1">
              Update your account display name.
            </p>
            {profileError && (
              <div className="rounded-lg bg-dashboard-peach/15 border border-dashboard-peach/30 text-dashboard-peach text-sm px-3 py-2">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="rounded-lg bg-green-500/15 border border-green-500/30 text-green-500 text-sm px-3 py-2">
                {profileSuccess}
              </div>
            )}
            <div>
              <label className={labelClass}>Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
                required
                disabled={loadingProfile}
              />
            </div>
            <button type="submit" className={btnPrimary} disabled={savingProfile || loadingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </PageCard>

        {/* Notifications */}
        <PageCard
          title="Notifications"
          className="[&>div:last-child]:p-0"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dashboard-gold/10 text-dashboard-gold">
              <Bell className="h-4 w-4" />
            </span>
          }
        >
          <div className="p-6 pt-0">
            <p className="text-dashboard-text-muted text-sm mb-5">
              Choose how you want to be notified about orders and updates.
            </p>
            <div className="divide-y divide-dashboard-border rounded-xl border border-dashboard-border overflow-hidden">
              {[
                { label: 'Email notifications', desc: 'Receive updates via email', checked: true },
                { label: 'Order & payment alerts', desc: 'Alerts for new orders and payments', checked: true },
                { label: 'Marketing (optional)', desc: 'Product updates and offers', checked: false },
              ].map((item, i) => (
                <label
                  key={i}
                  className={cn(
                    'flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer transition-colors hover:bg-dashboard-border/30',
                    i === 0 && 'rounded-t-xl',
                    i === 2 && 'rounded-b-xl'
                  )}
                >
                  <div>
                    <span className="block text-sm font-medium text-dashboard-text">{item.label}</span>
                    <span className="block text-xs text-dashboard-text-muted mt-0.5">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.checked}
                    className="h-5 w-5 rounded border-dashboard-border bg-dashboard-bg text-dashboard-gold focus:ring-2 focus:ring-dashboard-gold/30 focus:ring-offset-0 focus:ring-offset-transparent accent-dashboard-gold cursor-pointer"
                  />
                </label>
              ))}
            </div>
            <button type="button" className={cn(btnPrimary, 'mt-5')}>
              Save preferences
            </button>
          </div>
        </PageCard>

        {/* Security */}
        <PageCard
          title="Security"
          className="[&>div:last-child]:p-0"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dashboard-gold/10 text-dashboard-gold">
              <Shield className="h-4 w-4" />
            </span>
          }
        >
          <form onSubmit={handleChangePassword} className="p-6 pt-0 space-y-5">
            <p className="text-dashboard-text-muted text-sm -mt-1">
              Change your password. Use a strong password with letters, numbers, and symbols.
            </p>
            {passwordError && (
              <div className="rounded-lg bg-dashboard-peach/15 border border-dashboard-peach/30 text-dashboard-peach text-sm px-3 py-2">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg bg-green-500/15 border border-green-500/30 text-green-500 text-sm px-3 py-2">
                {passwordSuccess}
              </div>
            )}
            <div>
              <label className={labelClass}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
                disabled={savingPassword}
              />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
                minLength={8}
                disabled={savingPassword}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
                minLength={8}
                disabled={savingPassword}
              />
            </div>
            <button type="submit" className={btnPrimary} disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </PageCard>

        {/* API & Integrations */}
        <PageCard
          title="API & Integrations"
          className="[&>div:last-child]:p-0"
          action={
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dashboard-gold/10 text-dashboard-gold">
              <Key className="h-4 w-4" />
            </span>
          }
        >
          <div className="p-6 pt-0 space-y-5">
            <p className="text-dashboard-text-muted text-sm -mt-1">
              Manage API keys for MT5, webhooks, and third-party integrations. Keep your key secret.
            </p>
            <div>
              <label className={labelClass}>API key (masked)</label>
              <input
                type="text"
                defaultValue="ge_live_••••••••••••••••"
                readOnly
                className={cn(inputClass, 'font-mono text-sm text-dashboard-text-muted bg-dashboard-sidebar cursor-default')}
              />
            </div>
            <button type="button" className={btnSecondary}>
              Regenerate API key
            </button>
          </div>
        </PageCard>
      </div>
    </DashboardLayout>
  )
}
