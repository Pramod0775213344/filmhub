import { updateSession } from './utils/supabase/session'
import { NextResponse } from 'next/server'

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map()

function rateLimit(ip, limit = 100, windowMs = 60000) {
  const now = Date.now()
  const userRequests = rateLimitMap.get(ip) || []
  
  // Clean old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < windowMs)
  
  if (recentRequests.length >= limit) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.every(time => now - time > windowMs)) {
        rateLimitMap.delete(key)
      }
    }
  }
  
  return true
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Apply rate limiting to API routes (100 requests per minute)
  if (pathname.startsWith('/api/')) {
    // More strict rate limiting for sensitive endpoints
    const limit = pathname.includes('/chat') || pathname.includes('/analytics') ? 30 : 100
    
    if (!rateLimit(ip, limit)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      )
    }
  }
  
  const response = await updateSession(request)
  
  // Add comprehensive security headers
  const headers = new Headers(response.headers)
  
  // Content Security Policy - Strict but allows necessary external resources
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com https://preferencenail.com https://*.effectivegatecpm.com https://*.highperformanceformat.com https://al5sm.com https://*.show-sb.com https://*.creative-sb1.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https: wss: *.supabase.co",
    "frame-src 'self' https: blob:",
    "media-src 'self' https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  headers.set('Content-Security-Policy', cspDirectives)
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy - Restrict access to sensitive features
  headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Remove server information
  headers.delete('X-Powered-By')
  headers.set('Server', 'FilmHub')
  
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
    headers
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
