import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, verifyPassword, getOfflineDemoUser, isOfflineDemoLogin, OFFLINE_DEMO_USER_ID } from '@/lib/auth'
import { sendLoginNotification } from '@/lib/email'
import { parseUserAgent, getClientIP, getLocationFromIP } from '@/lib/device-info'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user by email (or use offline demo when MongoDB is unreachable in dev)
    let user = null
    try {
      user = await findUserByEmail(email.trim())
    } catch (dbError) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError)
      const isMongoUnavailable = msg.includes('timed out') || msg.includes('Server selection') || msg.includes('Mongo')
      if (isMongoUnavailable && isOfflineDemoLogin(email, password)) {
        user = getOfflineDemoUser()
        if (user) console.warn('Login via offline demo (MongoDB unreachable). Add your IP in Atlas Network Access to use real DB.')
      }
      if (!user) throw dbError
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password (skip for offline demo; password already checked above)
    if (user.password) {
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
    }

    // Gather device and location information for email notification
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ipAddress = getClientIP(request)
    const deviceInfo = parseUserAgent(userAgent)
    
    // Get location information (non-blocking - don't wait if it fails)
    let location = null
    try {
      location = await getLocationFromIP(ipAddress)
    } catch (error) {
      console.error('Failed to get location:', error)
    }

    // Send login notification email (skip for offline demo user)
    if (user._id?.toString() !== OFFLINE_DEMO_USER_ID) {
      sendLoginNotification({
        email: user.email,
        ipAddress,
        userAgent,
        location: location || undefined,
        deviceInfo,
        timestamp: new Date(),
      }).catch((error) => {
        console.error('Failed to send login notification email:', error)
      })
    }

    // Create JWT token
    const userId = user._id?.toString() ?? ''
    const token = await new SignJWT({ userId, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Create response with token in httpOnly cookie
    const response = NextResponse.json(
      { success: true, user: { email: user.email } },
      { status: 200 }
    )

    // Use Secure cookie only when the request is over HTTPS (direct or via proxy).
    // On VPS behind HTTP or without SSL, secure: true would prevent the cookie from being stored.
    const proto = request.headers.get('x-forwarded-proto') ?? request.headers.get('x-forwarded-ssl')
    const isHttps = proto === 'https' || (request.nextUrl?.protocol === 'https:')
    const useSecureCookie = process.env.NODE_ENV === 'production' && isHttps

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
