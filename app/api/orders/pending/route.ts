import { NextRequest, NextResponse } from 'next/server'
import { getPendingOrders, getPendingManualOrders } from '@/lib/orders'
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

    const { searchParams } = new URL(request.url)
    const manualOnly = searchParams.get('manual') === 'true'

    const orders = manualOnly ? await getPendingManualOrders() : await getPendingOrders()
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching pending orders:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch pending orders', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
