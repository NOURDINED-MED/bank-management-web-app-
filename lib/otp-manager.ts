/**
 * OTP (One-Time Password) Manager
 * For transaction confirmation and 2FA
 */

import { supabaseAdmin } from './supabase'

export interface OTPCode {
  id: string
  userId: string
  code: string
  purpose: 'transaction' | '2fa' | 'password_reset' | 'email_verification'
  channel: 'email' | 'sms'
  expiresAt: Date
  attempts: number
  isUsed: boolean
  metadata?: any
}

const MAX_ATTEMPTS = 3
const OTP_EXPIRY = 10 * 60 * 1000 // 10 minutes
const OTP_LENGTH = 6

/**
 * Generate random OTP code
 */
function generateOTP(length: number = OTP_LENGTH): string {
  const digits = '0123456789'
  let otp = ''
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  
  return otp
}

/**
 * Create OTP code
 */
export async function createOTP(
  userId: string,
  purpose: 'transaction' | '2fa' | 'password_reset' | 'email_verification',
  channel: 'email' | 'sms' = 'email',
  metadata?: any
): Promise<{ code: string; id: string }> {
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY)

  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .insert({
      user_id: userId,
      code,
      purpose,
      channel,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      is_used: false,
      metadata
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to create OTP')
  }

  return { code, id: data.id }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  userId: string,
  code: string,
  purpose: 'transaction' | '2fa' | 'password_reset' | 'email_verification'
): Promise<{ valid: boolean; reason?: string; otpId?: string }> {
  // Find OTP
  const { data: otpRecord } = await supabaseAdmin
    .from('otp_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('purpose', purpose)
    .eq('is_used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!otpRecord) {
    return { valid: false, reason: 'Invalid or expired code' }
  }

  // Check expiration
  if (new Date(otpRecord.expires_at) < new Date()) {
    await supabaseAdmin
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id)
    
    return { valid: false, reason: 'Code has expired' }
  }

  // Check attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await supabaseAdmin
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id)
    
    return { valid: false, reason: 'Too many attempts' }
  }

  // Check code match
  if (otpRecord.code !== code) {
    await supabaseAdmin
      .from('otp_codes')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id)
    
    const remainingAttempts = MAX_ATTEMPTS - (otpRecord.attempts + 1)
    return { 
      valid: false, 
      reason: `Invalid code. ${remainingAttempts} attempts remaining` 
    }
  }

  // Mark as used
  await supabaseAdmin
    .from('otp_codes')
    .update({ is_used: true })
    .eq('id', otpRecord.id)

  return { valid: true, otpId: otpRecord.id }
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  purpose: string
): Promise<void> {
  // In production, use a real email service (SendGrid, AWS SES, etc.)
  console.log(`📧 Sending OTP to ${email}: ${code} for ${purpose}`)
  
  // Example with SendGrid or similar:
  /*
  await emailService.send({
    to: email,
    subject: `Your ${purpose} verification code`,
    html: `
      <h2>Verification Code</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `
  })
  */
}

/**
 * Send OTP via SMS
 */
export async function sendOTPSMS(
  phone: string,
  code: string,
  purpose: string
): Promise<void> {
  // In production, use Twilio, AWS SNS, or similar
  console.log(`📱 Sending OTP to ${phone}: ${code} for ${purpose}`)
  
  // Example with Twilio:
  /*
  await twilioClient.messages.create({
    body: `Your ${purpose} verification code is: ${code}. Valid for 10 minutes.`,
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER
  })
  */
}

/**
 * Send transaction confirmation OTP
 */
export async function sendTransactionOTP(
  userId: string,
  email: string,
  phone: string | null,
  amount: number,
  transactionType: string,
  channel: 'email' | 'sms' = 'email'
): Promise<string> {
  const { code, id } = await createOTP(userId, 'transaction', channel, {
    amount,
    transactionType
  })

  const message = `${transactionType} of $${amount.toFixed(2)}`

  if (channel === 'email') {
    await sendOTPEmail(email, code, message)
  } else if (channel === 'sms' && phone) {
    await sendOTPSMS(phone, code, message)
  }

  return id
}

/**
 * Send 2FA OTP
 */
export async function send2FAOTP(
  userId: string,
  email: string,
  phone: string | null,
  channel: 'email' | 'sms' = 'email'
): Promise<string> {
  const { code, id } = await createOTP(userId, '2fa', channel)

  if (channel === 'email') {
    await sendOTPEmail(email, code, 'login verification')
  } else if (channel === 'sms' && phone) {
    await sendOTPSMS(phone, code, 'login verification')
  }

  return id
}

/**
 * Clean up expired OTP codes
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  await supabaseAdmin
    .from('otp_codes')
    .delete()
    .lt('expires_at', new Date().toISOString())
}

/**
 * Get user's OTP history
 */
export async function getUserOTPHistory(
  userId: string,
  limit: number = 10
): Promise<OTPCode[]> {
  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    code: d.code,
    purpose: d.purpose,
    channel: d.channel,
    expiresAt: new Date(d.expires_at),
    attempts: d.attempts,
    isUsed: d.is_used,
    metadata: d.metadata
  }))
}

/**
 * Check if user has pending OTP
 */
export async function hasPendingOTP(
  userId: string,
  purpose: 'transaction' | '2fa' | 'password_reset' | 'email_verification'
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('otp_codes')
    .select('id')
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .limit(1)

  return !!data && data.length > 0
}

/**
 * Resend OTP (with rate limiting)
 */
export async function resendOTP(
  userId: string,
  purpose: 'transaction' | '2fa' | 'password_reset' | 'email_verification',
  channel: 'email' | 'sms' = 'email'
): Promise<{ success: boolean; message: string }> {
  // Check if user recently received OTP (within 1 minute)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  
  const { data: recentOTP } = await supabaseAdmin
    .from('otp_codes')
    .select('created_at')
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .gte('created_at', oneMinuteAgo.toISOString())
    .limit(1)

  if (recentOTP && recentOTP.length > 0) {
    return {
      success: false,
      message: 'Please wait 1 minute before requesting a new code'
    }
  }

  // Get user info
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, phone')
    .eq('id', userId)
    .single()

  if (!user) {
    return { success: false, message: 'User not found' }
  }

  // Create and send new OTP
  const { code } = await createOTP(userId, purpose, channel)

  if (channel === 'email') {
    await sendOTPEmail(user.email, code, purpose)
  } else if (channel === 'sms' && user.phone) {
    await sendOTPSMS(user.phone, code, purpose)
  }

  return {
    success: true,
    message: 'New verification code sent'
  }
}

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
}

