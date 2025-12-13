/**
 * Session Management System
 * Track and manage user sessions across devices
 */

import { supabase, supabaseAdmin } from './supabase'

export interface Session {
  id: string
  userId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  ipAddress: string
  location?: string
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
  isActive: boolean
}

const ACTIVE_SESSIONS: Map<string, Session> = new Map()
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const MAX_SESSIONS_PER_USER = 5

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  request: Request
): Promise<Session> {
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 'Unknown'

  const deviceInfo = parseUserAgent(userAgent)
  
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    deviceName: deviceInfo.deviceName,
    deviceType: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    ipAddress,
    location: await getLocationFromIP(ipAddress),
    createdAt: new Date(),
    lastActiveAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_TIMEOUT),
    isActive: true
  }

  // Check max sessions limit
  const userSessions = await getUserSessions(userId)
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    // Terminate oldest session
    const oldestSession = userSessions.sort((a, b) => 
      a.lastActiveAt.getTime() - b.lastActiveAt.getTime()
    )[0]
    await terminateSession(oldestSession.id)
  }

  ACTIVE_SESSIONS.set(session.id, session)

  // Store in database
  await supabaseAdmin
    .from('sessions')
    .insert({
      id: session.id,
      user_id: userId,
      device_name: session.deviceName,
      device_type: session.deviceType,
      browser: session.browser,
      ip_address: session.ipAddress,
      location: session.location,
      expires_at: session.expiresAt.toISOString()
    })

  return session
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())

  if (error || !data) return []

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    deviceName: d.device_name,
    deviceType: d.device_type,
    browser: d.browser,
    ipAddress: d.ip_address,
    location: d.location,
    createdAt: new Date(d.created_at),
    lastActiveAt: new Date(d.last_active_at),
    expiresAt: new Date(d.expires_at),
    isActive: d.is_active
  }))
}

/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const session = ACTIVE_SESSIONS.get(sessionId)
  if (session) {
    session.lastActiveAt = new Date()
    session.expiresAt = new Date(Date.now() + SESSION_TIMEOUT)
    
    await supabaseAdmin
      .from('sessions')
      .update({
        last_active_at: session.lastActiveAt.toISOString(),
        expires_at: session.expiresAt.toISOString()
      })
      .eq('id', sessionId)
  }
}

/**
 * Terminate a specific session
 */
export async function terminateSession(sessionId: string): Promise<void> {
  ACTIVE_SESSIONS.delete(sessionId)
  
  await supabaseAdmin
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
}

/**
 * Terminate all sessions for a user (except current)
 */
export async function terminateAllSessions(userId: string, exceptSessionId?: string): Promise<number> {
  const sessions = await getUserSessions(userId)
  let terminated = 0

  for (const session of sessions) {
    if (session.id !== exceptSessionId) {
      await terminateSession(session.id)
      terminated++
    }
  }

  return terminated
}

/**
 * Check if session is valid
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = ACTIVE_SESSIONS.get(sessionId)
  
  if (!session) {
    // Check database
    const { data } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single()
    
    if (!data) return false
    
    // Restore to memory
    ACTIVE_SESSIONS.set(sessionId, {
      id: data.id,
      userId: data.user_id,
      deviceName: data.device_name,
      deviceType: data.device_type,
      browser: data.browser,
      ipAddress: data.ip_address,
      location: data.location,
      createdAt: new Date(data.created_at),
      lastActiveAt: new Date(data.last_active_at),
      expiresAt: new Date(data.expires_at),
      isActive: data.is_active
    })
    
    return true
  }

  // Check if expired
  if (session.expiresAt < new Date()) {
    await terminateSession(sessionId)
    return false
  }

  return true
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date()
  
  // Clean memory
  for (const [sessionId, session] of ACTIVE_SESSIONS.entries()) {
    if (session.expiresAt < now) {
      ACTIVE_SESSIONS.delete(sessionId)
    }
  }

  // Clean database
  await supabaseAdmin
    .from('sessions')
    .update({ is_active: false })
    .lt('expires_at', now.toISOString())
}

/**
 * Parse user agent to extract device info
 */
function parseUserAgent(userAgent: string): {
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
} {
  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown'
  if (/mobile|android|iphone|ipod|phone/.test(ua)) {
    deviceType = 'mobile'
  } else if (/tablet|ipad/.test(ua)) {
    deviceType = 'tablet'
  } else if (/desktop|windows|mac|linux/.test(ua)) {
    deviceType = 'desktop'
  }

  // Detect browser
  let browser = 'Unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'

  // Detect device name
  let deviceName = 'Unknown Device'
  if (ua.includes('iphone')) deviceName = 'iPhone'
  else if (ua.includes('ipad')) deviceName = 'iPad'
  else if (ua.includes('android')) deviceName = 'Android Device'
  else if (ua.includes('windows')) deviceName = 'Windows PC'
  else if (ua.includes('mac')) deviceName = 'Mac'
  else if (ua.includes('linux')) deviceName = 'Linux'

  return { deviceName, deviceType, browser }
}

/**
 * Get location from IP address (simplified)
 * In production, use a geolocation API
 */
async function getLocationFromIP(ipAddress: string): Promise<string> {
  // In production, use ipapi.co or similar service
  // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
  // const data = await response.json()
  // return `${data.city}, ${data.country_name}`
  
  return 'Unknown Location'
}

/**
 * Detect suspicious session patterns
 */
export async function detectSuspiciousSession(
  userId: string,
  newSession: Session
): Promise<{ suspicious: boolean; reasons: string[] }> {
  const reasons: string[] = []
  const userSessions = await getUserSessions(userId)

  // Check for multiple locations
  const locations = new Set(userSessions.map(s => s.location))
  if (locations.size > 3) {
    reasons.push('Multiple simultaneous locations detected')
  }

  // Check for rapid device switching
  const recentSessions = userSessions.filter(s => 
    s.createdAt.getTime() > Date.now() - 60 * 60 * 1000 // Last hour
  )
  if (recentSessions.length > 3) {
    reasons.push('Multiple devices used in short timeframe')
  }

  // Check for unusual IP
  const userIPs = userSessions.map(s => s.ipAddress)
  if (!userIPs.includes(newSession.ipAddress) && userSessions.length > 0) {
    reasons.push('Login from new IP address')
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  }
}

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000)
}

