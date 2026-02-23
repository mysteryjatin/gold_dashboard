'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageCard } from '@/components/ui/PageCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Star, MessageSquare, Trash2, Mail, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Rating {
  id: string
  name: string
  email: string
  rating: number
  note?: string
  createdAt: string
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRatings()
  }, [])

  async function loadRatings() {
    try {
      const response = await fetch('/api/ratings')
      if (!response.ok) {
        throw new Error('Failed to load ratings')
      }
      const data = await response.json()
      setRatings(data.ratings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this rating?')) {
      return
    }

    try {
      const response = await fetch('/api/ratings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete rating')
      }

      // Remove from local state
      setRatings(ratings.filter((r) => r.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete rating')
    }
  }

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0'

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }))

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

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating
                ? 'fill-dashboard-gold text-dashboard-gold'
                : 'fill-dashboard-border text-dashboard-border'
            )}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-dashboard-text">{rating}/5</span>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Ratings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-dashboard-text-muted">Loading ratings...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Ratings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-dashboard-peach">{error}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Ratings">
      <div className="space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Ratings"
            value={ratings.length.toString()}
            icon={Star}
            trend={{ value: `${ratings.length} reviews`, positive: true }}
          />
          <StatCard
            label="Average Rating"
            value={averageRating}
            icon={Star}
            trend={{ value: 'out of 5', positive: true }}
          />
          <StatCard
            label="With Comments"
            value={ratings.filter((r) => r.note).length.toString()}
            icon={MessageSquare}
            trend={{ value: `${ratings.length > 0 ? Math.round((ratings.filter((r) => r.note).length / ratings.length) * 100) : 0}%`, positive: true }}
          />
          <StatCard
            label="5 Star Ratings"
            value={ratings.filter((r) => r.rating === 5).length.toString()}
            icon={Star}
            trend={{ value: `${ratings.length > 0 ? Math.round((ratings.filter((r) => r.rating === 5).length / ratings.length) * 100) : 0}%`, positive: true }}
          />
        </section>

        {/* Rating Distribution */}
        <PageCard title="Rating Distribution">
          <div className="space-y-3">
            {ratingDistribution.map(({ star, count }) => {
              const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <span className="text-sm font-medium text-dashboard-text w-6">{star}</span>
                    <Star className="h-4 w-4 fill-dashboard-gold text-dashboard-gold" />
                  </div>
                  <div className="flex-1 h-2 bg-dashboard-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dashboard-gold transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-dashboard-text-muted min-w-[60px] text-right">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </PageCard>

        {/* Ratings List */}
        <PageCard title="All Ratings">
          {ratings.length === 0 ? (
            <div className="text-center py-12 text-dashboard-text-muted">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No ratings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="border border-dashboard-border rounded-xl p-5 hover:bg-dashboard-row-hover transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-dashboard-gold/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-dashboard-gold" />
                        </div>
                        <div>
                          <div className="font-medium text-dashboard-text">{rating.name}</div>
                          <div className="flex items-center gap-2 text-sm text-dashboard-text-muted">
                            <Mail className="h-3 w-3" />
                            {rating.email}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">{renderStars(rating.rating)}</div>
                      {rating.note && (
                        <div className="mt-3 p-3 bg-dashboard-bg rounded-lg border border-dashboard-border">
                          <p className="text-sm text-dashboard-text-secondary">{rating.note}</p>
                        </div>
                      )}
                      <div className="mt-3 text-xs text-dashboard-text-muted">
                        {formatDate(rating.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(rating.id)}
                      className="p-2 rounded-lg text-dashboard-peach hover:bg-dashboard-peach/10 transition-colors"
                      title="Delete rating"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  )
}
