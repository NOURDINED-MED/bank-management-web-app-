/**
 * Rate Limiting Utility
 * Prevents brute force attacks and API abuse
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the interval
}

const defaultConfig: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
}

// Strict rate limits for sensitive endpoints
export const strictRateLimit: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 requests per minute
}

// Login rate limit
export const loginRateLimit: RateLimitConfig = {
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 login attempts per 15 minutes
}

// Transaction rate limit
export const transactionRateLimit: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 transactions per minute
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
  }

  // Get or initialize rate limit entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + config.interval
    }
  }

  // Increment request count
  store[key].count++

  const allowed = store[key].count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - store[key].count)

  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime
  }
}

/**
 * Reset rate limit for a specific identifier
 * Useful for manual override or after successful authentication
 */
export function resetRateLimit(identifier: string): void {
  delete store[identifier]
}

/**
 * Get client identifier from request
 * Uses IP address as fallback
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
  
  return ip
}

/**
 * Middleware helper for Next.js API routes
 * Usage:
 * 
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimitMiddleware(request, loginRateLimit)
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response
 *   }
 *   // Continue with your logic...
 * }
 */
export async function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig = defaultConfig
): Promise<{
  allowed: boolean
  response?: Response
  remaining: number
}> {
  const identifier = getClientIdentifier(request)
  const result = checkRateLimit(identifier, config)

  if (!result.allowed) {
    const resetDate = new Date(result.resetTime)
    
    return {
      allowed: false,
      remaining: result.remaining,
      response: new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          resetTime: resetDate.toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': resetDate.toISOString()
          }
        }
      )
    }
  }

  return {
    allowed: true,
    remaining: result.remaining
  }
}

/**
 * Clean up old entries (call this periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

