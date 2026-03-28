import { NextRequest, NextResponse } from 'next/server'
import { activateLicenseKey } from '@/lib/licenses'

export const dynamic = 'force-dynamic'

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || ''
  }
  return request.headers.get('x-real-ip') || ''
}

async function parseActivateBody(request: NextRequest): Promise<{ key: string; account: number }> {
  const ct = (request.headers.get('content-type') || '').toLowerCase()
  const raw = await request.text()

  if (!raw.trim()) {
    return { key: '', account: 0 }
  }

  if (ct.includes('application/json')) {
    try {
      const body = JSON.parse(raw) as Record<string, unknown>
      return {
        key: typeof body.key === 'string' ? body.key : '',
        account:
          typeof body.account === 'number'
            ? body.account
            : parseInt(String(body.account ?? 0), 10) || 0,
      }
    } catch {
      return { key: '', account: 0 }
    }
  }

  // form-urlencoded (with or without Content-Type — MT5 often omits it)
  if (ct.includes('application/x-www-form-urlencoded') || raw.includes('=')) {
    const params = new URLSearchParams(raw)
    return {
      key: params.get('key') || '',
      account: parseInt(params.get('account') || '0', 10) || 0,
    }
  }

  return { key: '', account: 0 }
}

/**
 * One-time EA activation (MQL5 WebRequest POST).
 * Body: key & account as form-urlencoded or JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const { key, account } = await parseActivateBody(request)
    const ip = clientIp(request)

    const result = await activateLicenseKey(key, account, ip)

    if (result.ok) {
      return NextResponse.json({ status: 'success', msg: 'Activated' })
    }

    const msg =
      result.error === 'invalid_key'
        ? 'Invalid key'
        : result.error === 'not_found'
          ? 'Key not found'
          : result.error === 'already_used'
            ? 'Key already used'
            : 'Server error'

    return NextResponse.json({ status: 'error', msg })
  } catch (e) {
    console.error('License activate error:', e)
    return NextResponse.json({ status: 'error', msg: 'Server error' }, { status: 500 })
  }
}

/** MT5 / tools may send OPTIONS for CORS */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
