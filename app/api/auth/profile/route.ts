import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { findUserById, updateUserName, isOfflineDemoUserId, getOfflineDemoUser } from '@/lib/auth'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export const dynamic = 'force-dynamic'

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (isOfflineDemoUserId(userId)) {
      const demo = getOfflineDemoUser()
      return NextResponse.json({
        email: demo?.email ?? '',
        name: demo?.name ?? 'Demo User',
      })
    }

    const user = await findUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      email: user.email,
      name: user.name || 'Girish Sharma!',
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      )
    }

    if (isOfflineDemoUserId(userId)) {
      return NextResponse.json({
        success: true,
        user: { email: getOfflineDemoUser()?.email ?? '', name: name.trim() },
      })
    }

    const updatedUser = await updateUserName(userId, name.trim())
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
