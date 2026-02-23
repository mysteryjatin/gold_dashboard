import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, getPendingOrders, getCompletedOrders, updateOrderStatus } from '@/lib/orders'
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
    const status = searchParams.get('status')

    let orders
    if (status === 'pending') {
      orders = await getPendingOrders()
    } else if (status === 'completed') {
      orders = await getCompletedOrders()
    } else {
      orders = await getAllOrders()
    }
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: pending, completed, cancelled' },
        { status: 400 }
      )
    }

    const updated = await updateOrderStatus(orderId, status)
    if (!updated) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
