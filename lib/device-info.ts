import { NextRequest } from 'next/server'

export interface DeviceInfo {
  browser?: string
  os?: string
  device?: string
}

export interface LocationInfo {
  city?: string
  region?: string
  country?: string
  timezone?: string
  coordinates?: {
    lat?: number
    lon?: number
  }
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const info: DeviceInfo = {}

  // Browser detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    info.browser = 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    info.browser = 'Firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    info.browser = 'Safari'
  } else if (userAgent.includes('Edg')) {
    info.browser = 'Edge'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    info.browser = 'Opera'
  } else {
    info.browser = 'Unknown'
  }

  // OS detection
  if (userAgent.includes('Windows')) {
    info.os = 'Windows'
    if (userAgent.includes('Windows NT 10.0')) {
      info.os = 'Windows 10/11'
    } else if (userAgent.includes('Windows NT 6.3')) {
      info.os = 'Windows 8.1'
    } else if (userAgent.includes('Windows NT 6.2')) {
      info.os = 'Windows 8'
    } else if (userAgent.includes('Windows NT 6.1')) {
      info.os = 'Windows 7'
    }
  } else if (userAgent.includes('Mac OS X') || userAgent.includes('macOS')) {
    info.os = 'macOS'
  } else if (userAgent.includes('Linux')) {
    info.os = 'Linux'
  } else if (userAgent.includes('Android')) {
    info.os = 'Android'
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    info.os = 'iOS'
  } else {
    info.os = 'Unknown'
  }

  // Device type detection
  if (userAgent.includes('Mobile')) {
    info.device = 'Mobile'
  } else if (userAgent.includes('Tablet')) {
    info.device = 'Tablet'
  } else if (userAgent.includes('iPad')) {
    info.device = 'Tablet'
  } else {
    info.device = 'Desktop'
  }

  return info
}

export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  // Fallback to connection remote address if available
  return request.ip || 'Unknown'
}

export async function getLocationFromIP(ip: string): Promise<LocationInfo | null> {
  // Skip if IP is localhost or private
  if (ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return null
  }

  try {
    // Using ipapi.co (free tier: 1000 requests/day)
    // Alternative: ip-api.com, ipgeolocation.io, etc.
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'GoldenEdge-AI-Dashboard/1.0',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.error) {
      return null
    }

    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      timezone: data.timezone,
      coordinates: data.latitude && data.longitude
        ? {
            lat: data.latitude,
            lon: data.longitude,
          }
        : undefined,
    }
  } catch (error) {
    console.error('Failed to fetch location from IP:', error)
    return null
  }
}
