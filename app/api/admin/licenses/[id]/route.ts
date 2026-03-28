import { NextRequest, NextResponse } from 'next/server'
import { resetLicenseToUnused } from '@/lib/licenses'
import { isDashboardAuthenticated } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

/** Reset a key to unused (support / manual re-issue). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isDashboardAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    const ok = await resetLicenseToUnused(id)
    if (!ok) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin license PATCH:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to reset' },
      { status: 500 }
    )
  }
}
