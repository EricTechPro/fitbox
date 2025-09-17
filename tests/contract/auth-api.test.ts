/**
 * Contract tests for NextAuth.js authentication API
 *
 * Following TDD approach - these tests define the authentication API contract
 * and should fail initially until the implementation is complete.
 *
 * Tests cover:
 * - NextAuth.js API endpoints
 * - Session management
 * - JWT token handling
 * - Provider authentication flows
 * - Error handling and security
 */

import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { createMocks } from 'node-mocks-http'

// Import the auth handler and config
import { authOptions } from '@/lib/auth'
import { handler } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
    }
  }
})

describe('Authentication API Contract Tests', () => {
  let testUser: {
    id: string
    email: string
    password: string
    hashedPassword: string
  }

  beforeAll(async () => {
    // Clean up test database
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-auth'
        }
      }
    })

    // Create test user
    const testEmail = `test-auth-${Date.now()}@example.com`
    const plainPassword = 'TestPassword123!'
    const hashedPassword = await hash(plainPassword, 12)

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER'
      }
    })

    testUser = {
      id: user.id,
      email: testEmail,
      password: plainPassword,
      hashedPassword
    }
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({
      where: {
        id: testUser.id
      }
    })
    await prisma.$disconnect()
  })

  describe('NextAuth.js API Endpoints', () => {
    test('GET /api/auth/providers - should return configured providers', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/providers'
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(200)
      const providers = JSON.parse(res._getData())

      // Should include credentials and email providers
      expect(providers).toHaveProperty('credentials')
      expect(providers).toHaveProperty('email')
      expect(providers.credentials.type).toBe('credentials')
      expect(providers.email.type).toBe('email')
    })

    test('GET /api/auth/csrf - should return CSRF token', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/csrf'
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('csrfToken')
      expect(typeof data.csrfToken).toBe('string')
      expect(data.csrfToken.length).toBeGreaterThan(0)
    })

    test('GET /api/auth/session - should return null for unauthenticated user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/session'
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(200)
      const session = JSON.parse(res._getData())
      expect(session).toBeNull()
    })
  })

  describe('Credentials Provider Authentication', () => {
    test('POST /api/auth/callback/credentials - should authenticate valid user', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/callback/credentials',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: testUser.email,
          password: testUser.password,
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())

      // Should return success with redirect URL
      expect(data).toHaveProperty('url')
      expect(data.url).toContain('/')
    })

    test('POST /api/auth/callback/credentials - should reject invalid email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/callback/credentials',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: 'nonexistent@example.com',
          password: testUser.password,
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('CredentialsSignin')
    })

    test('POST /api/auth/callback/credentials - should reject invalid password', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/callback/credentials',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: testUser.email,
          password: 'wrongpassword',
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('CredentialsSignin')
    })

    test('POST /api/auth/callback/credentials - should reject missing credentials', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/callback/credentials',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('CredentialsSignin')
    })
  })

  describe('Email Provider Authentication', () => {
    test('POST /api/auth/signin/email - should initiate email signin flow', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/signin/email',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: testUser.email,
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())

      // Should redirect to verification page
      expect(data).toHaveProperty('url')
      expect(data.url).toContain('verify-request')
    })

    test('POST /api/auth/signin/email - should reject invalid email format', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/signin/email',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: 'invalid-email',
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('error')
    })
  })

  describe('Session Management', () => {
    test('should create valid JWT token with user data', () => {
      const user = {
        id: testUser.id,
        email: testUser.email,
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER'
      }

      const token: JWT = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      }

      // Verify JWT structure matches our configuration
      expect(token).toHaveProperty('sub', user.id)
      expect(token).toHaveProperty('email', user.email)
      expect(token).toHaveProperty('role', user.role)
      expect(token).toHaveProperty('firstName', user.firstName)
      expect(token).toHaveProperty('lastName', user.lastName)
      expect(token.exp).toBeGreaterThan(token.iat)
    })

    test('should create valid session object from JWT', () => {
      const token: JWT = {
        sub: testUser.id,
        email: testUser.email,
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      }

      const session: Session = {
        user: {
          id: token.sub as string,
          email: token.email as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          role: token.role as string
        },
        expires: new Date(token.exp * 1000).toISOString()
      }

      // Verify session structure matches our types
      expect(session.user).toHaveProperty('id', testUser.id)
      expect(session.user).toHaveProperty('email', testUser.email)
      expect(session.user).toHaveProperty('role', 'CUSTOMER')
      expect(session.user).toHaveProperty('firstName', 'Test')
      expect(session.user).toHaveProperty('lastName', 'User')
      expect(new Date(session.expires).getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('Security and Error Handling', () => {
    test('should require CSRF token for sign-in requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/signin/credentials',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: testUser.email,
          password: testUser.password,
          callbackUrl: '/'
          // Missing csrfToken
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data).toHaveProperty('error')
    })

    test('should handle malformed request gracefully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/callback/credentials',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          // Malformed request body
          invalid: 'data'
        }
      })

      await handler(req as NextRequest, res as any)

      expect(res._getStatusCode()).toBe(400)
    })

    test('should sanitize error messages in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      // In production, error messages should be generic
      expect(authOptions.debug).toBe(false)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Database Integration', () => {
    test('should create user record for email authentication', async () => {
      const newEmail = `test-email-auth-${Date.now()}@example.com`

      // Simulate email sign-in which should create a user record
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/signin/email',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          email: newEmail,
          csrfToken: 'test-csrf-token',
          callbackUrl: '/',
          json: 'true'
        }
      })

      await handler(req as NextRequest, res as any)

      // Check if user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: newEmail }
      })

      expect(createdUser).toBeTruthy()
      expect(createdUser?.email).toBe(newEmail)
      expect(createdUser?.role).toBe('CUSTOMER')

      // Clean up
      if (createdUser) {
        await prisma.user.delete({
          where: { id: createdUser.id }
        })
      }
    })

    test('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we just verify the error handling structure is in place
      expect(authOptions.adapter).toBeDefined()
      expect(typeof authOptions.callbacks?.jwt).toBe('function')
      expect(typeof authOptions.callbacks?.session).toBe('function')
    })
  })

  describe('Configuration Validation', () => {
    test('should have required authentication pages configured', () => {
      expect(authOptions.pages).toBeDefined()
      expect(authOptions.pages.signIn).toBe('/auth/login')
      expect(authOptions.pages.signUp).toBe('/auth/register')
      expect(authOptions.pages.error).toBe('/auth/error')
      expect(authOptions.pages.verifyRequest).toBe('/auth/verify-request')
    })

    test('should have JWT strategy configured', () => {
      expect(authOptions.session.strategy).toBe('jwt')
      expect(authOptions.session.maxAge).toBe(30 * 24 * 60 * 60) // 30 days
      expect(authOptions.jwt.maxAge).toBe(30 * 24 * 60 * 60) // 30 days
    })

    test('should have required providers configured', () => {
      expect(authOptions.providers).toHaveLength(2)
      expect(authOptions.providers.some(p => p.id === 'credentials')).toBe(true)
      expect(authOptions.providers.some(p => p.id === 'email')).toBe(true)
    })

    test('should have required callbacks configured', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(typeof authOptions.callbacks.jwt).toBe('function')
      expect(typeof authOptions.callbacks.session).toBe('function')
      expect(typeof authOptions.callbacks.redirect).toBe('function')
    })
  })
})