import { NextRequest, NextResponse } from 'next/server'
import { getAllRatings, deleteRating } from '@/lib/ratings'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export const dynamic = 'force-dynamic'

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return false

  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ratings = await getAllRatings()
    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Rating ID is required' },
        { status: 400 }
      )
    }

    const success = await deleteRating(id)
    if (!success) {
      return NextResponse.json(
        { error: 'Rating not found or failed to delete' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Rating deleted successfully' })
  } catch (error) {
    console.error('Error deleting rating:', error)
    return NextResponse.json(
      { error: 'Failed to delete rating' },
      { status: 500 }
    )
  }
}
