/**
 * Device Management System
 * Track and manage trusted devices
 */

import { supabaseAdmin } from './supabase'

export interface TrustedDevice {
  id: string
  userId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
  fingerprint: string
  ipAddress: string
  location?: string
  isTrusted: boolean
  lastUsedAt: Date
  createdAt: Date
}

/**
 * Generate device fingerprint
 */
export function generateDeviceFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptLanguage = request.headers.get('accept-language') || ''
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  
  const rawFingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`
  
  // Simple hash function (in production, use crypto.subtle.digest)
  return Buffer.from(rawFingerprint).toString('base64').substring(0, 32)
}

/**
 * Parse device info from user agent
 */
function parseDeviceInfo(userAgent: string): {
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
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
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'

  // Detect OS
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  // Device name
  let deviceName = `${os} ${deviceType}`
  if (ua.includes('iphone')) deviceName = 'iPhone'
  else if (ua.includes('ipad')) deviceName = 'iPad'
  else if (ua.includes('android')) deviceName = 'Android Device'

  return { deviceName, deviceType, browser, os }
}

/**
 * Register or update device
 */
export async function registerDevice(
  userId: string,
  request: Request,
  isTrusted: boolean = false
): Promise<TrustedDevice> {
  const fingerprint = generateDeviceFingerprint(request)
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'Unknown'

  const deviceInfo = parseDeviceInfo(userAgent)

  // Check if device already exists
  const { data: existing } = await supabaseAdmin
    .from('trusted_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('fingerprint', fingerprint)
    .single()

  if (existing) {
    // Update last used
    const { data: updated } = await supabaseAdmin
      .from('trusted_devices')
      .update({
        last_used_at: new Date().toISOString(),
        ip_address: ipAddress
      })
      .eq('id', existing.id)
      .select()
      .single()

    return {
      id: updated.id,
      userId: updated.user_id,
      deviceName: updated.device_name,
      deviceType: updated.device_type,
      browser: updated.browser,
      os: updated.os,
      fingerprint: updated.fingerprint,
      ipAddress: updated.ip_address,
      location: updated.location,
      isTrusted: updated.is_trusted,
      lastUsedAt: new Date(updated.last_used_at),
      createdAt: new Date(updated.created_at)
    }
  }

  // Create new device
  const { data: newDevice } = await supabaseAdmin
    .from('trusted_devices')
    .insert({
      user_id: userId,
      device_name: deviceInfo.deviceName,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      fingerprint,
      ip_address: ipAddress,
      is_trusted: isTrusted,
      last_used_at: new Date().toISOString()
    })
    .select()
    .single()

  return {
    id: newDevice.id,
    userId: newDevice.user_id,
    deviceName: newDevice.device_name,
    deviceType: newDevice.device_type,
    browser: newDevice.browser,
    os: newDevice.os,
    fingerprint: newDevice.fingerprint,
    ipAddress: newDevice.ip_address,
    location: newDevice.location,
    isTrusted: newDevice.is_trusted,
    lastUsedAt: new Date(newDevice.last_used_at),
    createdAt: new Date(newDevice.created_at)
  }
}

/**
 * Check if device is trusted
 */
export async function isDeviceTrusted(
  userId: string,
  request: Request
): Promise<boolean> {
  const fingerprint = generateDeviceFingerprint(request)

  const { data } = await supabaseAdmin
    .from('trusted_devices')
    .select('is_trusted')
    .eq('user_id', userId)
    .eq('fingerprint', fingerprint)
    .eq('is_trusted', true)
    .single()

  return !!data
}

/**
 * Get all devices for a user
 */
export async function getUserDevices(userId: string): Promise<TrustedDevice[]> {
  const { data, error } = await supabaseAdmin
    .from('trusted_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false })

  if (error || !data) return []

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    deviceName: d.device_name,
    deviceType: d.device_type,
    browser: d.browser,
    os: d.os,
    fingerprint: d.fingerprint,
    ipAddress: d.ip_address,
    location: d.location,
    isTrusted: d.is_trusted,
    lastUsedAt: new Date(d.last_used_at),
    createdAt: new Date(d.created_at)
  }))
}

/**
 * Trust a device
 */
export async function trustDevice(deviceId: string): Promise<void> {
  await supabaseAdmin
    .from('trusted_devices')
    .update({ is_trusted: true })
    .eq('id', deviceId)
}

/**
 * Revoke device trust
 */
export async function revokeDeviceTrust(deviceId: string): Promise<void> {
  await supabaseAdmin
    .from('trusted_devices')
    .update({ is_trusted: false })
    .eq('id', deviceId)
}

/**
 * Remove device
 */
export async function removeDevice(deviceId: string): Promise<void> {
  await supabaseAdmin
    .from('trusted_devices')
    .delete()
    .eq('id', deviceId)
}

/**
 * Detect if this is a new device
 */
export async function isNewDevice(
  userId: string,
  request: Request
): Promise<boolean> {
  const fingerprint = generateDeviceFingerprint(request)

  const { data } = await supabaseAdmin
    .from('trusted_devices')
    .select('id')
    .eq('user_id', userId)
    .eq('fingerprint', fingerprint)
    .single()

  return !data
}

/**
 * Send new device alert
 */
export async function sendNewDeviceAlert(
  userId: string,
  device: TrustedDevice
): Promise<void> {
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      title: '🔐 New Device Login',
      message: `A new ${device.deviceType} (${device.browser} on ${device.os}) logged into your account from ${device.ipAddress}.`,
      type: 'security',
      is_read: false,
      metadata: {
        deviceId: device.id,
        deviceName: device.deviceName,
        ipAddress: device.ipAddress
      }
    })
}

/**
 * Clean up old devices (not used in 90 days)
 */
export async function cleanupOldDevices(): Promise<void> {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  await supabaseAdmin
    .from('trusted_devices')
    .delete()
    .lt('last_used_at', ninetyDaysAgo.toISOString())
}

// Auto cleanup every day
if (typeof window === 'undefined') {
  setInterval(cleanupOldDevices, 24 * 60 * 60 * 1000)
}

