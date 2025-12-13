/**
 * Next.js Middleware
 * Runs on every request - handles security, authentication, and routing
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers (additional layer)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Get client IP for logging
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'

  // Block known malicious IPs (in production, use a service like Cloudflare)
  const blockedIPs: string[] = [] // Add blocked IPs here
  if (blockedIPs.includes(ip)) {
    return new NextResponse('Access Denied', { status: 403 })
  }

  // Log suspicious patterns
  const path = request.nextUrl.pathname
  const userAgent = request.headers.get('user-agent') || ''

  // Block common attack patterns
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /exec\(/i, // Code execution
    /eval\(/i, // Code execution
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(path) || pattern.test(request.nextUrl.search)) {
      console.warn(`🚨 Suspicious request blocked: ${ip} - ${path}`)
      return new NextResponse('Invalid Request', { status: 400 })
    }
  }

  // Block suspicious user agents
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
  ]

  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      console.warn(`🚨 Suspicious user agent blocked: ${ip} - ${userAgent}`)
      return new NextResponse('Access Denied', { status: 403 })
    }
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

