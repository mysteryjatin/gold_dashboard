import { NextRequest, NextResponse } from 'next/server'
import { getBotsWithSales } from '@/lib/products'
import { isDashboardAuthenticated } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!(await isDashboardAuthenticated(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const bots = await getBotsWithSales()
    return NextResponse.json({ bots })
  } catch (error) {
    console.error('Error fetching bots:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch bots',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
