/**
 * CSRF Protection Utilities
 * Provides secure CSRF token generation and validation for custom auth endpoints
 */

import { randomBytes, createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

const CSRF_SECRET = process.env.NEXTAUTH_SECRET || process.env.CSRF_SECRET || 'fallback-dev-secret'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = '__Host-next-auth.csrf-token'
const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

/**
 * CSRF token structure
 */
interface CSRFToken {
  value: string
  timestamp: number
  signature: string
}

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): {
  token: string
  cookieValue: string
} {
  const value = randomBytes(32).toString('hex')
  const timestamp = Date.now()

  // Create HMAC signature
  const hmac = createHmac('sha256', CSRF_SECRET)
  hmac.update(`${value}:${timestamp}`)
  const signature = hmac.digest('hex')

  const tokenData: CSRFToken = { value, timestamp, signature }
  const token = Buffer.from(JSON.stringify(tokenData)).toString('base64')

  // Cookie value includes additional entropy
  const cookieEntropy = randomBytes(16).toString('hex')
  const cookieValue = `${token}.${cookieEntropy}`

  return { token, cookieValue }
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): {
  isValid: boolean
  error?: string
} {
  try {
    // Get token from header
    const headerToken = request.headers.get(CSRF_HEADER)
    if (!headerToken) {
      return { isValid: false, error: 'Missing CSRF token in header' }
    }

    // Get token from cookie
    const cookies = request.headers.get('cookie')
    if (!cookies) {
      return { isValid: false, error: 'Missing CSRF cookie' }
    }

    const cookieMatch = cookies.match(new RegExp(`${CSRF_COOKIE}=([^;]+)`))
    if (!cookieMatch) {
      return { isValid: false, error: 'Missing CSRF cookie value' }
    }

    const cookieValue = cookieMatch[1]
    const [cookieToken] = cookieValue.split('.')

    // Validate tokens match
    if (!timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))) {
      return { isValid: false, error: 'CSRF token mismatch' }
    }

    // Parse and validate token structure
    const tokenData: CSRFToken = JSON.parse(
      Buffer.from(headerToken, 'base64').toString('utf8')
    )

    // Verify timestamp
    if (Date.now() - tokenData.timestamp > TOKEN_MAX_AGE) {
      return { isValid: false, error: 'CSRF token expired' }
    }

    // Verify signature
    const hmac = createHmac('sha256', CSRF_SECRET)
    hmac.update(`${tokenData.value}:${tokenData.timestamp}`)
    const expectedSignature = hmac.digest('hex')

    if (!timingSafeEqual(Buffer.from(tokenData.signature), Buffer.from(expectedSignature))) {
      return { isValid: false, error: 'Invalid CSRF token signature' }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid CSRF token format'
    }
  }
}

/**
 * Check if request needs CSRF protection
 */
export function requiresCSRFProtection(request: NextRequest): boolean {
  const method = request.method
  const path = request.nextUrl.pathname

  // Only protect state-changing operations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return false
  }

  // Protect custom auth endpoints
  const protectedPaths = [
    '/api/auth/signup',
    '/api/auth/reset-password',
    '/api/auth/change-password',
    '/api/auth/verify-email'
  ]

  return protectedPaths.some(protectedPath => path.startsWith(protectedPath))
}

/**
 * Create CSRF protection headers for responses
 */
export function getCSRFHeaders(token?: string, cookieValue?: string): Record<string, string> {
  const headers: Record<string, string> = {}

  if (token) {
    headers[CSRF_HEADER] = token
  }

  if (cookieValue) {
    // Use __Host- prefix for enhanced security
    headers['Set-Cookie'] = `${CSRF_COOKIE}=${cookieValue}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TOKEN_MAX_AGE / 1000}`
  }

  return headers
}

/**
 * Middleware helper for CSRF protection
 */
export function csrfProtection(request: NextRequest): {
  isProtected: boolean
  isValid: boolean
  error?: string
  headers?: Record<string, string>
} {
  if (!requiresCSRFProtection(request)) {
    return { isProtected: false, isValid: true }
  }

  const validation = validateCSRFToken(request)

  // For development, allow bypassing CSRF if explicitly disabled
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CSRF === 'true') {
    console.warn('⚠️  CSRF protection disabled in development mode')
    return { isProtected: true, isValid: true }
  }

  return {
    isProtected: true,
    isValid: validation.isValid,
    error: validation.error
  }
}

/**
 * Get CSRF token for client-side use
 */
export function getCSRFTokenForClient(): {
  token: string
  cookieValue: string
} {
  return generateCSRFToken()
}

/**
 * CSRF protection error response
 */
export function createCSRFErrorResponse(error: string) {
  return new Response(
    JSON.stringify({
      message: 'CSRF protection failed',
      error,
      code: 'CSRF_ERROR'
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    }
  )
}