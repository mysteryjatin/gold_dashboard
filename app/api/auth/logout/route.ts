import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  )

  const proto = request.headers.get('x-forwarded-proto') ?? request.headers.get('x-forwarded-ssl')
  const isHttps = proto === 'https' || (request.nextUrl?.protocol === 'https:')
  const useSecureCookie = process.env.NODE_ENV === 'production' && isHttps

  // Clear the auth token cookie (same options as login so it clears the right one)
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
