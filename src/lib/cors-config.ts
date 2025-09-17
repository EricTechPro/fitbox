/**
 * CORS Configuration for Production Security
 * Environment-based CORS policy to prevent unauthorized access
 */

/**
 * Get allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  const origins: string[] = []

  // Production origins
  if (process.env.NEXTAUTH_URL) {
    origins.push(process.env.NEXTAUTH_URL)
  }

  // Additional production domains
  if (process.env.CORS_ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    origins.push(...additionalOrigins)
  }

  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    )
  }

  // Remove duplicates and empty strings
  return Array.from(new Set(origins.filter(Boolean)))
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    // Allow same-origin requests (no Origin header)
    return true
  }

  const allowedOrigins = getAllowedOrigins()

  // In development, be more permissive
  if (process.env.NODE_ENV === 'development') {
    return allowedOrigins.some(allowed =>
      origin === allowed ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    )
  }

  // In production, strict matching
  return allowedOrigins.includes(origin)
}

/**
 * Generate CORS headers based on request origin
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin || '*'
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else {
    // Don't set CORS headers for disallowed origins
    // This will cause CORS errors in the browser
  }

  return headers
}

/**
 * Middleware for CORS handling
 */
export function handleCors(request: Request): Response | null {
  const origin = request.headers.get('Origin')
  const method = request.method

  // Handle preflight requests
  if (method === 'OPTIONS') {
    const headers = getCorsHeaders(origin)
    return new Response(null, {
      status: 200,
      headers
    })
  }

  // For other requests, return null to continue processing
  return null
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: Response, origin: string | null): Response {
  const headers = getCorsHeaders(origin)

  // Clone response and add headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      ...headers
    }
  })

  return newResponse
}

/**
 * Security headers for API routes
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  }
}

/**
 * Log CORS violations for monitoring
 */
export function logCorsViolation(origin: string | null, userAgent: string | null): void {
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      level: 'security',
      type: 'CORS_VIOLATION',
      origin: origin || 'null',
      userAgent: userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      allowedOrigins: getAllowedOrigins()
    }))
  } else {
    console.warn(`CORS violation from origin: ${origin}`)
  }
}