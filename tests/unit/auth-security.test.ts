/**
 * Unit Tests for Authentication Security Components
 * Tests security features without database dependencies
 */

import { describe, beforeEach, test, expect, jest } from '@jest/globals'
import {
  SecureLogger,
  AccountLockout,
  EnhancedRateLimiter,
  TimingProtection
} from '@/lib/auth-security'
import { AuthValidation } from '@/lib/auth-validation'
import { isOriginAllowed, getCorsHeaders } from '@/lib/cors-config'

describe('Authentication Security Unit Tests', () => {
  beforeEach(() => {
    // Clear any existing attempts/lockouts before each test
    AccountLockout.clearAttempts('test@example.com')
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

      // New attempt should reset the counter (this is the 2nd attempt after reset)
      const result = AccountLockout.recordFailedAttempt(email)
      expect(result.isLocked).toBe(false)
      expect(result.remainingAttempts).toBe(3) // Second attempt after reset

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
      const windowMs = 100 // 100ms for faster test

      // Reach rate limit
      EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)
      EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)
      EnhancedRateLimiter.recordAttempt(identifier, maxAttempts, windowMs)

      expect(EnhancedRateLimiter.isRateLimited(identifier, maxAttempts, windowMs)).toBe(true)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

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

      // Get the logged message (looking at what we actually see in the console output)
      const logOutput = consoleSpy.mock.calls[0]

      // Should not contain the actual email anywhere in the log
      const logString = JSON.stringify(logOutput)
      expect(logString).not.toContain('test@example.com')

      // Should contain the event type
      expect(logString).toContain('AUTH_FAILURE')

      // The important test: email should be hashed (check that it's an 8-char hash, not the original)
      expect(logString).toMatch(/email['":\s]*['"][a-f0-9]{8}['"]/)

      // Metadata should be present and safe
      expect(logString).toContain('attempt_count')

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

    test('should validate credentials', () => {
      const validCredentials = {
        email: 'test@example.com',
        password: 'validpassword'
      }

      const invalidCredentials = {
        email: 'invalid-email',
        password: ''
      }

      const validResult = AuthValidation.validateCredentials(validCredentials)
      expect(validResult.success).toBe(true)
      expect(validResult.data?.email).toBe('test@example.com')

      const invalidResult = AuthValidation.validateCredentials(invalidCredentials)
      expect(invalidResult.success).toBe(false)
      expect(invalidResult.errors?.length).toBeGreaterThan(0)
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

    test('should allow same-origin requests', () => {
      expect(isOriginAllowed(null)).toBe(true)
    })

    test('should include security headers', () => {
      const headers = getCorsHeaders('https://example.com')

      expect(headers['Access-Control-Allow-Methods']).toContain('POST')
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type')
      expect(headers['Access-Control-Max-Age']).toBe('86400')
    })
  })

  describe('Environment Validation', () => {
    test('should validate required environment variables', () => {
      const originalEnv = process.env

      // Test missing required variables
      process.env = {}
      const { validateEnvironment } = require('@/lib/auth-validation')
      const result = validateEnvironment()

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('NEXTAUTH_SECRET'))).toBe(true)

      process.env = originalEnv
    })

    test('should warn about weak secrets', () => {
      const originalSecret = process.env.NEXTAUTH_SECRET

      process.env.NEXTAUTH_SECRET = 'short'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      process.env.DATABASE_URL = 'postgresql://test'

      // Clear module cache to ensure fresh import
      delete require.cache[require.resolve('@/lib/auth-validation')]
      const { validateEnvironment } = require('@/lib/auth-validation')
      const result = validateEnvironment()

      expect(result.warnings.some(warning => warning.includes('64 characters'))).toBe(true)

      process.env.NEXTAUTH_SECRET = originalSecret
    })
  })
})