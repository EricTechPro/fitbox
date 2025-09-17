import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registrationSchema, AuthValidation } from '@/lib/auth-validation'
import { SecureLogger, EnhancedRateLimiter } from '@/lib/auth-security'
import { handleCors, addCorsHeaders, getSecurityHeaders, logCorsViolation } from '@/lib/cors-config'
import { csrfProtection, createCSRFErrorResponse } from '@/lib/csrf-protection'

/**
 * Handle user registration
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('Origin')

  try {
    // Handle CORS
    const corsResponse = handleCors(request)
    if (corsResponse) {
      return corsResponse
    }

    // CSRF Protection
    const csrfResult = csrfProtection(request)
    if (csrfResult.isProtected && !csrfResult.isValid) {
      SecureLogger.logSecurityEvent({
        type: 'CSRF_VIOLATION',
        timestamp: new Date(),
        metadata: {
          endpoint: 'signup',
          error: csrfResult.error,
          origin: origin || 'unknown'
        }
      })
      return createCSRFErrorResponse(csrfResult.error || 'CSRF validation failed')
    }

    // Parse request body
    const body = await request.json()

    // Validate input using unified schema
    const validation = AuthValidation.validateRegistration(body)
    if (!validation.success) {
      SecureLogger.logRegistrationAttempt(false, {
        metadata: { error_code: 'INVALID_INPUT' }
      })

      const response = NextResponse.json(
        {
          message: 'Invalid input data',
          errors: validation.errors
        },
        { status: 400 }
      )

      return addCorsHeaders(response, origin)
    }

    const { firstName, lastName, email, phone, password } = validation.data!

    // Check rate limiting with enhanced rate limiter
    const rateLimitResult = EnhancedRateLimiter.recordAttempt(email, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes

    if (rateLimitResult.isLimited) {
      SecureLogger.logSecurityEvent({
        type: 'RATE_LIMITED',
        email,
        timestamp: new Date(),
        metadata: { endpoint: 'signup' }
      })

      const response = NextResponse.json(
        {
          message: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil(EnhancedRateLimiter.getRemainingTime(email) / 1000)
        },
        { status: 429 }
      )

      return addCorsHeaders(response, origin)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    })

    if (existingUser) {
      SecureLogger.logRegistrationAttempt(false, {
        email,
        metadata: { error_code: 'USER_EXISTS' }
      })

      const response = NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )

      return addCorsHeaders(response, origin)
    }

    // Beta limitation check - limit to 10 new users per week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const recentUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    if (recentUsersCount >= 10) {
      SecureLogger.logRegistrationAttempt(false, {
        email,
        metadata: { error_code: 'BETA_LIMIT_REACHED' }
      })

      const response = NextResponse.json(
        {
          message: 'Beta registration limit reached. We are currently limiting signups to 10 new customers per week. Please try again next week.',
          code: 'BETA_LIMIT_REACHED'
        },
        { status: 429 }
      )

      return addCorsHeaders(response, origin)
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'CUSTOMER',
        name: `${firstName} ${lastName}`,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    })

    // Log successful registration
    SecureLogger.logRegistrationAttempt(true, {
      userId: user.id,
      email: user.email
    })

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      },
      {
        status: 201,
        headers: getSecurityHeaders()
      }
    )

    return addCorsHeaders(response, origin)

  } catch (error) {
    SecureLogger.logRegistrationAttempt(false, {
      metadata: { error_code: 'SYSTEM_ERROR' }
    })

    // Handle Prisma specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      let response: NextResponse

      switch (error.code) {
        case 'P2002':
          response = NextResponse.json(
            { message: 'User with this email already exists' },
            { status: 409 }
          )
          break
        case 'P2025':
          response = NextResponse.json(
            { message: 'Invalid request data' },
            { status: 400 }
          )
          break
        default:
          response = NextResponse.json(
            { message: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
          )
      }

      return addCorsHeaders(response, origin)
    }

    const response = NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )

    return addCorsHeaders(response, origin)
  }
}

/**
 * Handle preflight requests with secure CORS
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('Origin')

  // Check if origin is allowed
  if (origin && !require('@/lib/cors-config').isOriginAllowed(origin)) {
    const { logCorsViolation } = require('@/lib/cors-config')
    logCorsViolation(origin, request.headers.get('User-Agent'))

    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden'
    })
  }

  const corsResponse = handleCors(request)
  if (corsResponse) {
    return corsResponse
  }

  return new NextResponse(null, { status: 200 })
}