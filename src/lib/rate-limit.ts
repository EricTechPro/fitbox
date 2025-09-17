/**
 * Rate limiting implementation for API endpoints
 * Used to prevent abuse and ensure fair usage
 *
 * Production Note: This implementation uses in-memory storage for development.
 * For production, replace with Redis-based implementation.
 */

import { NextRequest } from 'next/server'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Maximum requests per interval
}

interface RateLimitData {
  count: number
  resetTime: number
}

// Storage interface for rate limiting
interface RateLimitStorage {
  get(key: string): Promise<RateLimitData | null>
  set(key: string, data: RateLimitData): Promise<void>
  delete(key: string): Promise<void>
  cleanup(): Promise<void>
}

// In-memory storage implementation (for development)
class MemoryRateLimitStorage implements RateLimitStorage {
  private store = new Map<string, RateLimitData>()

  async get(key: string): Promise<RateLimitData | null> {
    return this.store.get(key) || null
  }

  async set(key: string, data: RateLimitData): Promise<void> {
    this.store.set(key, data)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async cleanup(): Promise<void> {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < now) {
        this.store.delete(key)
      }
    }
  }
}

// Redis storage implementation (for production)
// Note: Currently commented out to avoid unused variable warnings
// Uncomment and configure when Redis is needed in production
/*
class RedisRateLimitStorage implements RateLimitStorage {
  private redis: unknown // Redis client type

  constructor(redisClient: unknown) {
    this.redis = redisClient
  }

  async get(key: string): Promise<RateLimitData | null> {
    try {
      const data = await (this.redis as any).get(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  async set(key: string, data: RateLimitData): Promise<void> {
    try {
      const ttl = Math.ceil((data.resetTime - Date.now()) / 1000)
      if (ttl > 0) {
        await (this.redis as any).setex(key, ttl, JSON.stringify(data))
      }
    } catch {
      // Fail silently - rate limiting is not critical for functionality
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await (this.redis as any).del(key)
    } catch {
      // Fail silently
    }
  }

  async cleanup(): Promise<void> {
    // Redis handles TTL automatically, no cleanup needed
  }
}
*/

// Storage singleton
let storage: RateLimitStorage

function getStorage(): RateLimitStorage {
  if (!storage) {
    // Use Redis in production if REDIS_URL is available
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
      try {
        // Note: In real implementation, import and configure Redis client here
        // const Redis = require('ioredis')
        // const redis = new Redis(process.env.REDIS_URL)
        // storage = new RedisRateLimitStorage(redis)
        // eslint-disable-next-line no-console
        console.warn(
          'Redis URL provided but Redis client not configured. Using memory storage.'
        )
        storage = new MemoryRateLimitStorage()
      } catch {
        storage = new MemoryRateLimitStorage()
      }
    } else {
      storage = new MemoryRateLimitStorage()
    }
  }
  return storage
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (
      request: NextRequest,
      limit: number,
      token?: string
    ): Promise<void> => {
      const rateLimitStorage = getStorage()

      // Get identifier from IP address or custom token
      const identifier = token || getClientIdentifier(request)
      const now = Date.now()

      // Periodic cleanup (only for memory storage)
      if (Math.random() < 0.01) {
        // 1% chance
        await rateLimitStorage.cleanup()
      }

      // Get current rate limit data
      const current = (await rateLimitStorage.get(identifier)) || {
        count: 0,
        resetTime: now + config.interval,
      }

      // Reset counter if window has expired
      if (current.resetTime < now) {
        current.count = 0
        current.resetTime = now + config.interval
      }

      // Check if limit exceeded
      if (current.count >= limit) {
        throw new Error('Rate limit exceeded')
      }

      // Increment counter
      current.count++
      await rateLimitStorage.set(identifier, current)
    },
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback to connection IP
  return request.ip || 'unknown'
}

// Cleanup function to prevent memory leaks
export async function cleanupRateLimit(): Promise<void> {
  const rateLimitStorage = getStorage()
  await rateLimitStorage.cleanup()
}

// Schedule periodic cleanup (every 5 minutes) - only for memory storage
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(
    async () => {
      if (process.env.NODE_ENV !== 'production') {
        await cleanupRateLimit()
      }
    },
    5 * 60 * 1000
  )
}
