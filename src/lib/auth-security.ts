/**
 * Authentication Security Module
 * Handles secure logging, rate limiting, and account lockout protection
 */

import crypto from 'crypto'

/**
 * Security event types for structured logging
 */
export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'REGISTRATION_SUCCESS'
  | 'REGISTRATION_FAILURE'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMITED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'CSRF_VIOLATION'

/**
 * Security event data structure
 */
export interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Secure Logger that prevents timing attacks and information disclosure
 */
export class SecureLogger {
  private static isProduction = process.env.NODE_ENV === 'production'

  /**
   * Log security events without exposing sensitive information
   */
  static logSecurityEvent(event: SecurityEvent): void {
    // Generate sanitized event for logging
    const sanitizedEvent = {
      type: event.type,
      userId: event.userId ? this.hashIdentifier(event.userId) : undefined,
      email: event.email ? this.hashIdentifier(event.email) : undefined,
      ip: event.ip ? this.hashIdentifier(event.ip) : undefined,
      timestamp: event.timestamp,
      environment: process.env.NODE_ENV,
      metadata: this.sanitizeMetadata(event.metadata)
    }

    // In production, use structured logging
    if (this.isProduction) {
      console.log(JSON.stringify({
        level: 'security',
        ...sanitizedEvent
      }))
    } else {
      // Development logging with more detail but still secure
      console.log(`[SECURITY] ${event.type}:`, sanitizedEvent)
    }
  }

  /**
   * Log authentication attempts with generic messages
   */
  static logAuthAttempt(success: boolean, metadata: Partial<SecurityEvent> = {}): void {
    this.logSecurityEvent({
      type: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
      timestamp: new Date(),
      ...metadata
    })
  }

  /**
   * Log registration attempts
   */
  static logRegistrationAttempt(success: boolean, metadata: Partial<SecurityEvent> = {}): void {
    this.logSecurityEvent({
      type: success ? 'REGISTRATION_SUCCESS' : 'REGISTRATION_FAILURE',
      timestamp: new Date(),
      ...metadata
    })
  }

  /**
   * Hash sensitive identifiers for logging
   */
  private static hashIdentifier(identifier: string): string {
    return crypto
      .createHash('sha256')
      .update(identifier + (process.env.NEXTAUTH_SECRET || 'fallback'))
      .digest('hex')
      .substring(0, 8)
  }

  /**
   * Sanitize metadata to prevent information disclosure
   */
  private static sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined

    const sanitized: Record<string, any> = {}

    // Only include safe metadata keys
    const safeKeys = ['attempt_count', 'lockout_duration', 'rate_limit_window', 'error_code']

    for (const key of safeKeys) {
      if (key in metadata) {
        sanitized[key] = metadata[key]
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined
  }
}

/**
 * Account lockout protection against brute force attacks
 */
export class AccountLockout {
  private static attempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>()

  // Configuration
  private static readonly MAX_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
  private static readonly ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

  /**
   * Check if an account is currently locked
   */
  static isLocked(identifier: string): boolean {
    const record = this.attempts.get(identifier)

    if (!record || !record.lockedUntil) return false

    // Check if lockout has expired
    if (new Date() > record.lockedUntil) {
      this.clearAttempts(identifier)
      return false
    }

    return true
  }

  /**
   * Record a failed authentication attempt
   */
  static recordFailedAttempt(identifier: string): { isLocked: boolean; remainingAttempts: number; lockoutDuration?: number } {
    const now = new Date()
    const record = this.attempts.get(identifier)

    if (!record) {
      // First failed attempt
      this.attempts.set(identifier, {
        count: 1,
        lastAttempt: now
      })

      SecureLogger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        email: identifier,
        timestamp: now,
        metadata: { attempt_count: 1 }
      })

      return { isLocked: false, remainingAttempts: this.MAX_ATTEMPTS - 1 }
    }

    // Check if attempt is within the window
    const timeSinceLastAttempt = now.getTime() - record.lastAttempt.getTime()

    if (timeSinceLastAttempt > this.ATTEMPT_WINDOW_MS) {
      // Reset attempts if outside window
      this.attempts.set(identifier, {
        count: 1,
        lastAttempt: now
      })
      return { isLocked: false, remainingAttempts: this.MAX_ATTEMPTS - 1 }
    }

    // Increment attempt count
    const newCount = record.count + 1
    const lockedUntil = newCount >= this.MAX_ATTEMPTS
      ? new Date(now.getTime() + this.LOCKOUT_DURATION_MS)
      : undefined

    this.attempts.set(identifier, {
      count: newCount,
      lastAttempt: now,
      lockedUntil
    })

    if (lockedUntil) {
      SecureLogger.logSecurityEvent({
        type: 'ACCOUNT_LOCKED',
        email: identifier,
        timestamp: now,
        metadata: {
          attempt_count: newCount,
          lockout_duration: this.LOCKOUT_DURATION_MS
        }
      })

      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: this.LOCKOUT_DURATION_MS
      }
    }

    SecureLogger.logSecurityEvent({
      type: 'AUTH_FAILURE',
      email: identifier,
      timestamp: now,
      metadata: { attempt_count: newCount }
    })

    return {
      isLocked: false,
      remainingAttempts: this.MAX_ATTEMPTS - newCount
    }
  }

  /**
   * Record a successful authentication (clears failed attempts)
   */
  static recordSuccessfulAttempt(identifier: string): void {
    this.clearAttempts(identifier)

    SecureLogger.logSecurityEvent({
      type: 'AUTH_SUCCESS',
      email: identifier,
      timestamp: new Date()
    })
  }

  /**
   * Clear failed attempts for an identifier
   */
  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Get remaining lockout time in milliseconds
   */
  static getRemainingLockoutTime(identifier: string): number {
    const record = this.attempts.get(identifier)

    if (!record || !record.lockedUntil) return 0

    const remaining = record.lockedUntil.getTime() - new Date().getTime()
    return Math.max(0, remaining)
  }

  /**
   * Cleanup expired lockouts (should be called periodically)
   */
  static cleanup(): void {
    const now = new Date()

    for (const [identifier, record] of this.attempts.entries()) {
      if (record.lockedUntil && now > record.lockedUntil) {
        this.attempts.delete(identifier)
      }
    }
  }
}

/**
 * Enhanced rate limiter with Redis-compatible interface
 */
export class EnhancedRateLimiter {
  private static attempts = new Map<string, { count: number; windowStart: Date }>()

  /**
   * Check if an identifier is rate limited
   */
  static isRateLimited(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = new Date()
    const record = this.attempts.get(identifier)

    if (!record) return false

    // Check if window has expired
    if (now.getTime() - record.windowStart.getTime() > windowMs) {
      this.attempts.delete(identifier)
      return false
    }

    return record.count >= maxAttempts
  }

  /**
   * Record an attempt and return rate limit status
   */
  static recordAttempt(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): {
    isLimited: boolean
    remainingAttempts: number
    resetTime: Date
  } {
    const now = new Date()
    const record = this.attempts.get(identifier)

    if (!record || now.getTime() - record.windowStart.getTime() > windowMs) {
      // New window
      this.attempts.set(identifier, {
        count: 1,
        windowStart: now
      })

      return {
        isLimited: false,
        remainingAttempts: maxAttempts - 1,
        resetTime: new Date(now.getTime() + windowMs)
      }
    }

    // Increment count
    const newCount = record.count + 1
    this.attempts.set(identifier, {
      count: newCount,
      windowStart: record.windowStart
    })

    const isLimited = newCount > maxAttempts

    if (isLimited) {
      SecureLogger.logSecurityEvent({
        type: 'RATE_LIMITED',
        email: identifier,
        timestamp: now,
        metadata: {
          attempt_count: newCount,
          rate_limit_window: windowMs
        }
      })
    }

    return {
      isLimited,
      remainingAttempts: Math.max(0, maxAttempts - newCount),
      resetTime: new Date(record.windowStart.getTime() + windowMs)
    }
  }

  /**
   * Get remaining time until rate limit resets
   */
  static getRemainingTime(identifier: string, windowMs: number = 60000): number {
    const record = this.attempts.get(identifier)

    if (!record) return 0

    const resetTime = record.windowStart.getTime() + windowMs
    return Math.max(0, resetTime - new Date().getTime())
  }

  /**
   * Cleanup expired windows
   */
  static cleanup(windowMs: number = 60000): void {
    const now = new Date()

    for (const [identifier, record] of this.attempts.entries()) {
      if (now.getTime() - record.windowStart.getTime() > windowMs) {
        this.attempts.delete(identifier)
      }
    }
  }
}

/**
 * Timing attack protection utilities
 */
export class TimingProtection {
  /**
   * Constant-time comparison to prevent timing attacks
   */
  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * Add random delay to prevent timing analysis
   */
  static async addRandomDelay(minMs: number = 100, maxMs: number = 300): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Ensure minimum operation time to prevent timing attacks
   */
  static async ensureMinimumTime<T>(
    operation: () => Promise<T>,
    minimumMs: number = 200
  ): Promise<T> {
    const startTime = Date.now()
    const result = await operation()

    const elapsedTime = Date.now() - startTime
    const remainingTime = minimumMs - elapsedTime

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }

    return result
  }
}

/**
 * Cleanup task for security components
 */
export function runSecurityCleanup(): void {
  AccountLockout.cleanup()
  EnhancedRateLimiter.cleanup()
}

// Schedule cleanup every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(runSecurityCleanup, 5 * 60 * 1000)
}