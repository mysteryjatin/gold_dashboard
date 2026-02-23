import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const userId = payload.userId as string
      const { findUserById, isOfflineDemoUserId, getOfflineDemoUser } = await import('@/lib/auth')

      if (isOfflineDemoUserId(userId)) {
        const demo = getOfflineDemoUser()
        return NextResponse.json(
          {
            authenticated: true,
            user: {
              email: demo?.email ?? payload.email,
              name: demo?.name ?? 'Demo User',
            },
          },
          { status: 200 }
        )
      }

      const user = await findUserById(userId)
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            email: payload.email,
            name: user?.name || 'Girish Sharma!',
          },
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}
