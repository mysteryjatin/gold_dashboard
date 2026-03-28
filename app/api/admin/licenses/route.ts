import { NextRequest, NextResponse } from 'next/server'
import { createLicenseKeys, listLicenses } from '@/lib/licenses'
import { isDashboardAuthenticated } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!(await isDashboardAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const licenses = await listLicenses()
    return NextResponse.json({ licenses })
  } catch (e) {
    console.error('Admin licenses GET:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to list licenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isDashboardAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const count = typeof body.count === 'number' ? body.count : parseInt(String(body.count ?? 1), 10)
    const keys = await createLicenseKeys(Number.isFinite(count) ? count : 1)
    return NextResponse.json({ keys })
  } catch (e) {
    console.error('Admin licenses POST:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create keys' },
      { status: 500 }
    )
  }
}
