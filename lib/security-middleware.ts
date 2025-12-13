/**
 * Security Middleware for API Routes
 * Provides authentication, authorization, and security checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-admin'
import { rateLimitMiddleware, loginRateLimit, transactionRateLimit, strictRateLimit } from './rate-limit'
import { logAudit } from './audit-logger'
import type { UserRole } from './types'
import { hasPermission } from './rbac'

export interface SecurityContext {
  userId: string
  userRole: UserRole
  email: string
  ipAddress: string
  userAgent: string
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  return 'unknown'
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Verify authentication token and get user context
 */
export async function verifyAuth(request: NextRequest): Promise<{
  success: boolean
  context?: SecurityContext
  error?: string
}> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' }
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' }
    }

    const context: SecurityContext = {
      userId: user.id,
      userRole: (profile.role as UserRole) || 'customer',
      email: profile.email || user.email || '',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    }

    return { success: true, context }
  } catch (error: any) {
    console.error('Auth verification error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Check if user has required permission
 */
export function checkPermission(
  userRole: UserRole,
  requiredPermission: string
): boolean {
  return hasPermission(userRole, requiredPermission as any)
}

/**
 * Comprehensive security middleware
 * Combines rate limiting, authentication, and authorization
 */
export async function securityMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean
    requirePermission?: string
    rateLimit?: 'default' | 'login' | 'transaction' | 'strict'
    logAction?: string
  } = {}
): Promise<{
  allowed: boolean
  response?: NextResponse
  context?: SecurityContext
}> {
  const {
    requireAuth = true,
    requirePermission,
    rateLimit = 'default',
    logAction
  } = options

  // 1. Rate Limiting
  let rateLimitConfig
  switch (rateLimit) {
    case 'login':
      rateLimitConfig = loginRateLimit
      break
    case 'transaction':
      rateLimitConfig = transactionRateLimit
      break
    case 'strict':
      rateLimitConfig = strictRateLimit
      break
    default:
      rateLimitConfig = undefined
  }

  if (rateLimitConfig) {
    const rateLimitResult = await rateLimitMiddleware(
      request as any,
      rateLimitConfig
    )
    
    if (!rateLimitResult.allowed) {
      // Log rate limit violation
      if (logAction) {
        await logAudit({
          userId: 'system',
          action: 'security.rate_limit_exceeded' as any,
          entityType: 'security',
          description: `Rate limit exceeded for ${getClientIP(request)}`,
          metadata: {
            ip: getClientIP(request),
            userAgent: getUserAgent(request),
            endpoint: request.nextUrl.pathname
          }
        }).catch(() => {})
      }
      
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: rateLimitResult.remaining
          },
          { status: 429 }
        )
      }
    }
  }

  // 2. Authentication
  if (requireAuth) {
    const authResult = await verifyAuth(request)
    
    if (!authResult.success) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Unauthorized',
            message: authResult.error || 'Authentication required'
          },
          { status: 401 }
        )
      }
    }

    const context = authResult.context!

    // 3. Authorization (Permission Check)
    if (requirePermission) {
      if (!checkPermission(context.userRole, requirePermission)) {
        // Log unauthorized access attempt
        await logAudit({
          userId: context.userId,
          action: 'security.unauthorized_access' as any,
          entityType: 'security',
          description: `Unauthorized access attempt to ${request.nextUrl.pathname}`,
          metadata: {
            requiredPermission: requirePermission,
            userRole: context.userRole,
            ip: context.ipAddress
          }
        }).catch(() => {})

        return {
          allowed: false,
          response: NextResponse.json(
            {
              error: 'Forbidden',
              message: 'You do not have permission to access this resource'
            },
            { status: 403 }
          )
        }
      }
    }

    // 4. Log action if specified
    if (logAction && context) {
      await logAudit({
        userId: context.userId,
        action: logAction as any,
        entityType: 'api',
        description: `${logAction} from ${context.ipAddress}`,
        metadata: {
          ip: context.ipAddress,
          userAgent: context.userAgent,
          endpoint: request.nextUrl.pathname
        }
      }).catch(() => {})
    }

    return {
      allowed: true,
      context
    }
  }

  return { allowed: true }
}

/**
 * CSRF Token Generation and Validation
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  return token === sessionToken
}

/**
 * Input Sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]) as any
    }
  }
  
  return sanitized
}

/**
 * Validate request origin (prevent CSRF)
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  // In production, check against allowed origins
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'https://'),
    ].filter(Boolean)
    
    if (origin && !allowedOrigins.some(allowed => origin.includes(allowed || ''))) {
      return false
    }
  }
  
  return true
}

