import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function isDashboardAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}
