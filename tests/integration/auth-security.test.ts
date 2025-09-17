/**
 * Security Integration Tests for Authentication System
 * Tests the enhanced security features including timing attack protection,
 * account lockout, rate limiting, and secure logging
 */

import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import {
  SecureLogger,
  AccountLockout,
  EnhancedRateLimiter,
  TimingProtection
} from '@/lib/auth-security'
import { AuthValidation } from '@/lib/auth-validation'
import { isOriginAllowed, getCorsHeaders } from '@/lib/cors-config'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
    }
  }
})

describe('Authentication Security Integration Tests', () => {
  let testUser: {
    id: string
    email: string
    password: string
  }

  beforeAll(async () => {
    // Clean up test database
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'security-test'
        }
      }
    })

    // Create test user
    const testEmail = `security-test-${Date.now()}@example.com`
    const plainPassword = 'TestPassword123!'
    const hashedPassword = await hash(plainPassword, 12)

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Security',
        lastName: 'Test',
        role: 'CUSTOMER'
      }
    })

    testUser = {
      id: user.id,
      email: testEmail,
      password: plainPassword
    }
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    await prisma.$disconnect()
  })

  beforeEach(() => {
    // Clear any existing attempts/lockouts before each test
    AccountLockout.clearAttempts(testUser.email)
    jest.clearAllMocks()
  })

  describe('Account Lockout Protection', () => {
    test('should lock account after 5 failed attempts', () => {
      const email = 'lockout-test@example.com'

      // First 4 attempts should not lock the account
      for (let i = 0; i < 4; i++) {
        const result = AccountLockout.recordFailedAttempt(email)
        expect(result.isLocked).toBe(false)
        expect(result.remainingAttempts).toBe(5 - (i + 1))
      }

      // 5th attempt should lock the account
      const lockResult = AccountLockout.recordFailedAttempt(email)
      expect(lockResult.isLocked).toBe(true)
      expect(lockResult.remainingAttempts).toBe(0)
      expect(lockResult.lockoutDuration).toBe(15 * 60 * 1000) // 15 minutes

      // Account should be locked
      expect(AccountLockout.isLocked(email)).toBe(true)
    })

    test('should clear attempts after successful authentication', () => {
      const email = 'success-test@example.com'

      // Record some failed attempts
      AccountLockout.recordFailedAttempt(email)
      AccountLockout.recordFailedAttempt(email)

      // Successful attempt should clear all attempts
      AccountLockout.recordSuccessfulAttempt(email)

      // Should not be locked and attempts should be cleared
      expect(AccountLockout.isLocked(email)).toBe(false)
    })

    test('should reset attempts after window expires', () => {
      const email = 'window-test@example.com'

      // Record failed attempts
      AccountLockout.recordFailedAttempt(email)

      // Mock time passing beyond the window
      const originalDate = Date.now
      Date.now = jest.fn(() => originalDate() + 16 * 60 * 1000) // 16 minutes later

      // New attempt should reset the counter
      const result = AccountLockout.recordFailedAttempt(email)
      expect(result.isLocked).toBe(false)
      expect(result.remainingAttempts).toBe(4) // Should be first attempt again

      // Restore Date.now
      Date.now = originalDate
    })
  })

  describe('Enhanced Rate Limiting', () => {
    test('should rate limit after max attempts', () => {
      const identifier = 'rate-limit-test@example.com'
      const maxAttempts = 3
      const windowMs = 60000 // 1 minute

      // First 3 attempts should succeed
      for (let i = 0; i < maxAttempts; i++) {
        const result = EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)
        expect(result.isLimited).toBe(false)
        expect(result.remainingAttempts).toBe(maxAttempts - (i + 1))
      }

      // 4th attempt should be rate limited
      const limitedResult = EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)
      expect(limitedResult.isLimited).toBe(true)
      expect(limitedResult.remainingAttempts).toBe(0)

      // Should be rate limited
      expect(EnhancedRateLimiter.isRateLimited(identifier, maxAttempts, windowMs)).toBe(true)
    })

    test('should reset after window expires', async () => {
      const identifier = 'reset-test@example.com'
      const maxAttempts = 2
      const windowMs = 1000 // 1 second

      // Reach rate limit
      EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)
      EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)
      EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)

      expect(EnhancedRateLimiter.isRateLimited(identifier, maxAttempts, windowMs)).toBe(true)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Should no longer be rate limited
      expect(EnhancedRateLimiter.isRateLimited(identifier, maxAttempts, windowMs)).toBe(false)
    })
  })

  describe('Timing Attack Protection', () => {
    test('should ensure minimum operation time', async () => {
      const startTime = Date.now()

      const result = await TimingProtection.ensureMinimumTime(async () => {
        // Quick operation that would normally take <100ms
        return 'test-result'
      }, 200)

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result).toBe('test-result')
      expect(duration).toBeGreaterThanOrEqual(200)
    })

    test('should not add delay if operation already takes long enough', async () => {
      const startTime = Date.now()

      const result = await TimingProtection.ensureMinimumTime(async () => {
        // Slow operation
        await new Promise(resolve => setTimeout(resolve, 300))
        return 'slow-result'
      }, 200)

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result).toBe('slow-result')
      expect(duration).toBeGreaterThanOrEqual(300)
      expect(duration).toBeLessThan(350) // Should not add significant delay
    })

    test('should provide constant-time string comparison', () => {
      const string1 = 'password123'
      const string2 = 'password123'
      const string3 = 'different123'

      expect(TimingProtection.constantTimeCompare(string1, string2)).toBe(true)
      expect(TimingProtection.constantTimeCompare(string1, string3)).toBe(false)
      expect(TimingProtection.constantTimeCompare('', '')).toBe(true)
      expect(TimingProtection.constantTimeCompare('a', 'ab')).toBe(false)
    })
  })

  describe('Secure Logging', () => {
    test('should log security events without exposing sensitive data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      SecureLogger.logAuthAttempt(false, {
        email: 'test@example.com',
        metadata: { attempt_count: 3 }
      })

      expect(consoleSpy).toHaveBeenCalled()
      const logCall = consoleSpy.mock.calls[0][0]

      // Should not contain the actual email
      expect(logCall).not.toContain('test@example.com')
      // Should contain hashed version and safe metadata
      expect(logCall).toContain('AUTH_FAILURE')
      expect(logCall).toContain('attempt_count')

      consoleSpy.mockRestore()
    })

    test('should hash sensitive identifiers', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      SecureLogger.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        email: 'sensitive@example.com',
        ip: '192.168.1.1',
        timestamp: new Date()
      })

      expect(consoleSpy).toHaveBeenCalled()
      const logCall = consoleSpy.mock.calls[0][0]

      // Should not contain original sensitive data
      expect(logCall).not.toContain('sensitive@example.com')
      expect(logCall).not.toContain('192.168.1.1')

      consoleSpy.mockRestore()
    })
  })

  describe('Unified Validation', () => {
    test('should validate registration data consistently', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      const result = AuthValidation.validateRegistration(validData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.email).toBe('john.doe@example.com')
    })

    test('should reject invalid registration data', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different'
      }

      const result = AuthValidation.validateRegistration(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    test('should validate password strength', () => {
      const weakPassword = 'password'
      const strongPassword = 'SecurePassword123!'

      const weakResult = AuthValidation.validatePasswordStrength(weakPassword)
      expect(weakResult.isValid).toBe(false)
      expect(weakResult.score).toBeLessThan(70)
      expect(weakResult.feedback.length).toBeGreaterThan(0)

      const strongResult = AuthValidation.validatePasswordStrength(strongPassword)
      expect(strongResult.isValid).toBe(true)
      expect(strongResult.score).toBeGreaterThan(70)
      expect(strongResult.feedback.length).toBe(0)
    })
  })

  describe('CORS Security', () => {
    test('should allow configured origins', () => {
      const allowedOrigin = 'https://fitbox.example.com'
      process.env.NEXTAUTH_URL = allowedOrigin

      expect(isOriginAllowed(allowedOrigin)).toBe(true)

      const headers = getCorsHeaders(allowedOrigin)
      expect(headers['Access-Control-Allow-Origin']).toBe(allowedOrigin)
    })

    test('should reject unauthorized origins in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const unauthorizedOrigin = 'https://malicious.com'
      expect(isOriginAllowed(unauthorizedOrigin)).toBe(false)

      const headers = getCorsHeaders(unauthorizedOrigin)
      expect(headers['Access-Control-Allow-Origin']).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })

    test('should be permissive in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const localhostOrigin = 'http://localhost:3001'
      expect(isOriginAllowed(localhostOrigin)).toBe(true)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Integration: Complete Authentication Flow', () => {
    test('should handle failed authentication with security measures', async () => {
      const email = 'integration-test@example.com'

      // Mock console.log to capture security logs
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      // Simulate multiple failed authentication attempts
      for (let i = 0; i < 5; i++) {
        AccountLockout.recordFailedAttempt(email)
      }

      // Account should be locked
      expect(AccountLockout.isLocked(email)).toBe(true)

      // Should have logged security events
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should handle successful authentication flow', async () => {
      const email = 'success-integration@example.com'

      // Mock console.log to capture security logs
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      // Record successful authentication
      AccountLockout.recordSuccessfulAttempt(email)

      // Should have logged success event
      expect(consoleSpy).toHaveBeenCalled()

      // Account should not be locked
      expect(AccountLockout.isLocked(email)).toBe(false)

      consoleSpy.mockRestore()
    })
  })
})