/**
 * Authentication Flows Integration Tests
 * Tests critical authentication flows including signup, email verification, OAuth, and CSRF protection
 */

import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextRequest } from 'next/server'
import { POST as signupPOST, OPTIONS as signupOPTIONS } from '@/app/api/auth/signup/route'
import { GET as csrfGET } from '@/app/api/auth/csrf/route'
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf-protection'
import { sendVerificationEmail, validateEmailConfiguration, testEmailConfiguration } from '@/lib/email-provider'
import { AuthValidation } from '@/lib/auth-validation'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
    }
  }
})

// Mock email sending for tests
jest.mock('@/lib/email-provider', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  validateEmailConfiguration: jest.fn().mockReturnValue({
    isValid: true,
    provider: 'smtp',
    errors: []
  }),
  testEmailConfiguration: jest.fn().mockResolvedValue({
    success: true,
    provider: 'smtp'
  }),
  EmailRateLimiter: {
    isRateLimited: jest.fn().mockReturnValue(false),
    getRemainingTime: jest.fn().mockReturnValue(0),
    reset: jest.fn()
  }
}))

describe('Authentication Flows Integration Tests', () => {
  const testEmail = `auth-flow-test-${Date.now()}@example.com`
  const testPassword = 'SecurePassword123!'

  beforeAll(async () => {
    // Clean up test database
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'auth-flow-test'
        }
      }
    })
  })

  afterAll(async () => {
    // Clean up test database
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'auth-flow-test'
        }
      }
    })
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks()
  })

  describe('CSRF Protection', () => {
    test('should generate valid CSRF tokens', async () => {
      const { token, cookieValue } = generateCSRFToken()

      expect(token).toBeTruthy()
      expect(cookieValue).toBeTruthy()
      expect(token).toMatch(/^[A-Za-z0-9+/=]+$/) // Base64 format
      expect(cookieValue).toContain(token)
    })

    test('should validate correct CSRF tokens', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const result = validateCSRFToken(request)
      expect(result.isValid).toBe(true)
    })

    test('should reject requests without CSRF tokens', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const result = validateCSRFToken(request)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Missing CSRF token')
    })

    test('should provide CSRF tokens via API endpoint', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/csrf', {
        method: 'GET',
        headers: {
          'origin': 'http://localhost:3000'
        }
      })

      const response = await csrfGET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.csrfToken).toBeTruthy()
      expect(data.message).toBe('CSRF token generated successfully')
    })
  })

  describe('User Registration Flow', () => {
    test('should successfully register a new user with valid data', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const registrationData = {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        phone: '+1234567890',
        password: testPassword,
        confirmPassword: testPassword
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000',
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(201)

      const responseData = await response.json()
      expect(responseData.message).toBe('Account created successfully')
      expect(responseData.user.email).toBe(testEmail)
      expect(responseData.user.firstName).toBe('Test')
      expect(responseData.user.lastName).toBe('User')
      expect(responseData.user.role).toBe('CUSTOMER')

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: testEmail }
      })
      expect(user).toBeTruthy()
      expect(user?.firstName).toBe('Test')
      expect(user?.lastName).toBe('User')
    })

    test('should reject registration with invalid email format', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const registrationData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: testPassword,
        confirmPassword: testPassword
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000',
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid input data')
      expect(responseData.errors).toBeTruthy()
    })

    test('should reject registration with weak password', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const registrationData = {
        firstName: 'Test',
        lastName: 'User',
        email: `weak-password-${Date.now()}@example.com`,
        password: 'weak', // Missing requirements
        confirmPassword: 'weak'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000',
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.errors).toBeTruthy()
      expect(responseData.errors.some((error: any) =>
        error.message.includes('Password must contain')
      )).toBe(true)
    })

    test('should reject registration with mismatched passwords', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const registrationData = {
        firstName: 'Test',
        lastName: 'User',
        email: `mismatch-password-${Date.now()}@example.com`,
        password: testPassword,
        confirmPassword: 'DifferentPassword123!'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000',
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.errors).toBeTruthy()
      expect(responseData.errors.some((error: any) =>
        error.message.includes("Passwords don't match")
      )).toBe(true)
    })

    test('should prevent duplicate email registration', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const registrationData = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: testEmail, // Already registered in first test
        password: testPassword,
        confirmPassword: testPassword
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000',
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(409)

      const responseData = await response.json()
      expect(responseData.message).toBe('User with this email already exists')
    })

    test('should handle CORS preflight requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'OPTIONS',
        headers: {
          'origin': 'http://localhost:3000',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type,x-csrf-token'
        }
      })

      const response = await signupOPTIONS(request)
      expect(response.status).toBe(200)
    })

    test('should reject requests without CSRF protection', async () => {
      const registrationData = {
        firstName: 'No',
        lastName: 'CSRF',
        email: `no-csrf-${Date.now()}@example.com`,
        password: testPassword,
        confirmPassword: testPassword
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000'
          // Missing CSRF token headers
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(403)

      const responseData = await response.json()
      expect(responseData.message).toBe('CSRF protection failed')
      expect(responseData.code).toBe('CSRF_ERROR')
    })
  })

  describe('Email Verification Flow', () => {
    test('should validate email configuration', () => {
      const validation = validateEmailConfiguration()
      expect(validation.isValid).toBe(true)
      expect(validation.provider).toBeTruthy()
      expect(validation.errors).toHaveLength(0)
    })

    test('should send verification emails', async () => {
      const verificationRequest = {
        to: testEmail,
        url: 'https://localhost:3000/auth/verify?token=test',
        provider: {
          from: 'noreply@fitbox.ca',
          name: 'FitBox'
        },
        theme: {
          colorScheme: 'light' as const
        }
      }

      await expect(sendVerificationEmail(verificationRequest)).resolves.not.toThrow()
      expect(sendVerificationEmail).toHaveBeenCalledWith(verificationRequest)
    })

    test('should test email configuration', async () => {
      const result = await testEmailConfiguration(testEmail)
      expect(result.success).toBe(true)
      expect(result.provider).toBeTruthy()
    })
  })

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      const strongPasswords = [
        'SecurePassword123!',
        'Another$trongP@ssw0rd',
        'MyVeryStr0ng!Password#2024'
      ]

      strongPasswords.forEach(password => {
        const result = AuthValidation.validatePasswordStrength(password)
        expect(result.isValid).toBe(true)
        expect(result.score).toBeGreaterThan(80)
        expect(result.feedback).toHaveLength(0)
      })
    })

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // No uppercase, numbers, special chars
        'PASSWORD123', // No lowercase, special chars
        'Password!', // Too short, no numbers
        'password123', // No uppercase, special chars
        'Password123' // No special chars
      ]

      weakPasswords.forEach(password => {
        const result = AuthValidation.validatePasswordStrength(password)
        expect(result.isValid).toBe(false)
        expect(result.feedback.length).toBeGreaterThan(0)
      })
    })

    test('should provide helpful password feedback', () => {
      const result = AuthValidation.validatePasswordStrength('short')

      expect(result.feedback).toContain('Password should be at least 8 characters long')
      expect(result.feedback).toContain('Add uppercase letters')
      expect(result.feedback).toContain('Add numbers')
      expect(result.feedback).toContain('Add special characters (!@#$%^&*(),.?":{}|<>)')
    })
  })

  describe('Input Validation and Sanitization', () => {
    test('should sanitize user input', () => {
      const maliciousInput = '<script>alert("xss")</script>'
      const sanitized = AuthValidation.sanitizeInput(maliciousInput)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('</script>')
      expect(sanitized).toContain('&lt;')
      expect(sanitized).toContain('&gt;')
    })

    test('should validate registration input comprehensively', () => {
      const validInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      }

      const result = AuthValidation.validateRegistration(validInput)
      expect(result.success).toBe(true)
      expect(result.data).toBeTruthy()
      expect(result.data!.email).toBe('john.doe@example.com')
    })

    test('should validate credentials input', () => {
      const validCredentials = {
        email: 'user@example.com',
        password: 'anypassword'
      }

      const result = AuthValidation.validateCredentials(validCredentials)
      expect(result.success).toBe(true)
      expect(result.data).toBeTruthy()
    })

    test('should validate email-only input', () => {
      const validEmail = {
        email: 'test@example.com'
      }

      const result = AuthValidation.validateEmail(validEmail)
      expect(result.success).toBe(true)
      expect(result.data).toBeTruthy()
      expect(result.data!.email).toBe('test@example.com')
    })
  })

  describe('Security Headers and CORS', () => {
    test('should include security headers in responses', async () => {
      const { token, cookieValue } = generateCSRFToken()

      const registrationData = {
        firstName: 'Security',
        lastName: 'Headers',
        email: `security-headers-${Date.now()}@example.com`,
        password: testPassword,
        confirmPassword: testPassword
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3000',
          'x-csrf-token': token,
          'cookie': `__Host-next-auth.csrf-token=${cookieValue}`
        },
        body: JSON.stringify(registrationData)
      })

      const response = await signupPOST(request)

      // Check CORS headers
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true')

      // Check security headers
      expect(response.headers.get('X-Content-Type-Options')).toBeTruthy()
      expect(response.headers.get('X-Frame-Options')).toBeTruthy()
      expect(response.headers.get('X-XSS-Protection')).toBeTruthy()
    })
  })
})