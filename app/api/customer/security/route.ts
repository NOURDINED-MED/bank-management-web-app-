import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET customer security data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's 2FA status
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, two_factor_enabled, email, full_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get recent login attempts from audit_logs
    const { data: loginLogs, error: logsError } = await supabaseAdmin
      .from('audit_logs')
      .select('id, action, description, ip_address, created_at, user_agent')
      .eq('user_id', userId)
      .in('action', ['user.login', 'user.logout', 'security.failed_login'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsError) {
      console.error('Error fetching login logs:', logsError)
    }

    // Format login attempts
    const loginAttempts = (loginLogs || []).map((log: any) => {
      const userAgent = log.user_agent || 'Unknown Device'
      const device = parseUserAgent(userAgent)
      
      // Try to get location from IP (simplified - in production use a geolocation service)
      const location = getLocationFromIP(log.ip_address)
      
      const status = log.action === 'security.failed_login' ? 'failed' : 'success'
      
      return {
        id: log.id,
        date: log.created_at,
        location: location,
        device: device.name,
        status: status,
        ipAddress: log.ip_address || 'Unknown'
      }
    })

    // Get active sessions (from audit_logs where action is login and recent)
    const recentLogins = (loginLogs || []).filter((log: any) => 
      log.action === 'user.login' && 
      new Date(log.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    )

    const sessions = recentLogins.map((log: any, index: number) => {
      const userAgent = log.user_agent || 'Unknown Device'
      const device = parseUserAgent(userAgent)
      
      return {
        id: log.id,
        deviceName: device.name,
        deviceType: device.type,
        browser: device.browser,
        location: getLocationFromIP(log.ip_address),
        ipAddress: log.ip_address || 'Unknown',
        lastActive: getTimeAgo(new Date(log.created_at)),
        current: index === 0 // Most recent is current
      }
    })

    return NextResponse.json({
      twoFactorEnabled: user.two_factor_enabled || false,
      loginAttempts: loginAttempts,
      sessions: sessions.slice(0, 10) // Limit to 10 most recent
    })
  } catch (error: any) {
    console.error('Error fetching security data:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update 2FA status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, twoFactorEnabled } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ two_factor_enabled: twoFactorEnabled })
      .eq('id', userId)

    if (error) {
      console.error('Error updating 2FA:', error)
      return NextResponse.json(
        { error: 'Failed to update 2FA status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      twoFactorEnabled 
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function parseUserAgent(userAgent: string): { name: string; type: string; browser: string } {
  if (!userAgent || userAgent === 'Unknown') {
    return { name: 'Unknown Device', type: 'desktop', browser: 'Unknown' }
  }

  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let type = 'desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    type = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'tablet'
  }

  // Detect device name
  let name = 'Unknown Device'
  if (ua.includes('macintosh') || ua.includes('mac os')) {
    name = 'MacBook Pro'
  } else if (ua.includes('windows')) {
    name = 'Windows PC'
  } else if (ua.includes('iphone')) {
    name = 'iPhone'
  } else if (ua.includes('ipad')) {
    name = 'iPad'
  } else if (ua.includes('android')) {
    name = 'Android Device'
  }

  // Detect browser
  let browser = 'Unknown'
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('edg')) {
    browser = 'Edge'
  }

  return { name, type, browser }
}

function getLocationFromIP(ip: string): string {
  // Simplified - in production, use a geolocation service like MaxMind or ipapi.co
  if (!ip || ip === 'Unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'Local Network'
  }
  // For now, return a generic location
  return 'Unknown Location'
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

