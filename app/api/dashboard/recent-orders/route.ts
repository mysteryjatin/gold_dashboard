import { NextRequest, NextResponse } from 'next/server'
import { getRecentOrders } from '@/lib/orders'
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

    const recentOrders = await getRecentOrders(10)
    return NextResponse.json({ orders: recentOrders })
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
