import { PrismaClient } from '@prisma/client'
import { DatabaseError } from './errors'

/**
 * Enhanced Prisma client configuration for FitBox application
 * Includes connection pooling, logging, and error handling optimizations
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

/**
 * Database configuration based on environment
 */
const getDatabaseConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  const isTest = process.env.NODE_ENV === 'test'
  
  return {
    // Logging configuration
    log: isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : isTest
      ? ['warn', 'error']
      : ['error'],
    
    // Error formatting
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
    
    // Datasource configuration for connection pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  } as const
}

/**
 * Create optimized Prisma client instance
 */
function createPrismaClient(): PrismaClient {
  const config = getDatabaseConfig()
  
  const client = new PrismaClient({
    log: config.log,
    errorFormat: config.errorFormat as any,
    datasources: config.datasources
  })
  
  // Add error handling middleware
  client.$use(async (params, next) => {
    const start = Date.now()
    
    try {
      const result = await next(params)
      const duration = Date.now() - start
      
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`Slow query detected (${duration}ms):`, {
          model: params.model,
          action: params.action,
          duration
        })
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      // Enhanced error logging
      console.error('Database operation failed:', {
        model: params.model,
        action: params.action,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        args: process.env.NODE_ENV === 'development' ? params.args : undefined
      })
      
      // Transform Prisma errors to application errors
      if (error instanceof Error) {
        // Handle common Prisma error codes
        if ('code' in error) {
          switch (error.code) {
            case 'P2002':
              throw new DatabaseError(params.action || 'operation', 'Unique constraint violation')
            case 'P2025':
              throw new DatabaseError(params.action || 'operation', 'Record not found')
            case 'P2003':
              throw new DatabaseError(params.action || 'operation', 'Foreign key constraint violation')
            case 'P2016':
              throw new DatabaseError(params.action || 'operation', 'Query interpretation error')
            case 'P2021':
              throw new DatabaseError(params.action || 'operation', 'Table does not exist')
            default:
              throw new DatabaseError(params.action || 'operation', error.message)
          }
        }
      }
      
      throw error
    }
  })
  
  return client
}

/**
 * Singleton Prisma client instance with proper connection management
 */
export const prisma = globalThis.__prisma ?? createPrismaClient()

// Store client globally in development to prevent multiple instances during hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

/**
 * Connection management utilities
 */
export class PrismaConnectionManager {
  private static healthCheckInterval?: NodeJS.Timeout
  
  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }
  
  /**
   * Get database connection info
   */
  static async getConnectionInfo(): Promise<{
    isConnected: boolean
    databaseVersion?: string
    connectionCount?: number
  }> {
    try {
      const [connectionTest, versionResult] = await Promise.all([
        this.testConnection(),
        prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`
      ])
      
      return {
        isConnected: connectionTest,
        databaseVersion: versionResult[0]?.version,
        connectionCount: undefined // Would need custom query for connection count
      }
    } catch (error) {
      return {
        isConnected: false
      }
    }
  }
  
  /**
   * Start connection health monitoring
   */
  static startHealthMonitoring(intervalMs: number = 60000): void {
    if (this.healthCheckInterval) {
      return // Already monitoring
    }
    
    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.testConnection()
      if (!isHealthy) {
        console.error('Database health check failed - connection lost')
      }
    }, intervalMs)
  }
  
  /**
   * Stop connection health monitoring
   */
  static stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = undefined
    }
  }
  
  /**
   * Gracefully disconnect from database
   */
  static async disconnect(): Promise<void> {
    this.stopHealthMonitoring()
    await prisma.$disconnect()
  }
}

/**
 * Database transaction utilities
 */
export class PrismaTransactionManager {
  /**
   * Execute operations in a transaction with retry logic
   * @param operations - Transaction operations
   * @param options - Transaction options
   * @returns Transaction result
   */
  static async executeTransaction<T>(
    operations: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>,
    options?: {
      maxRetries?: number
      timeout?: number
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? 3
    const timeout = options?.timeout ?? 30000 // 30 seconds
    
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await prisma.$transaction(
          operations,
          {
            timeout,
            // Serializable isolation level for consistency
            isolationLevel: 'Serializable'
          }
        )
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown transaction error')
        
        // Check if error is retryable
        const isRetryable = this.isRetryableError(lastError)
        
        if (!isRetryable || attempt === maxRetries) {
          throw new DatabaseError(
            'transaction',
            `Transaction failed after ${attempt} attempts: ${lastError.message}`,
            { attempts: attempt, maxRetries }
          )
        }
        
        // Exponential backoff before retry
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message)
      }
    }
    
    throw lastError!
  }
  
  /**
   * Check if error is retryable (transient)
   */
  private static isRetryableError(error: Error): boolean {
    // Prisma error codes that indicate transient issues
    const retryableCodes = ['P2034', 'P2024', 'P1001', 'P1002', 'P1008', 'P1017']
    
    if ('code' in error && typeof error.code === 'string') {
      return retryableCodes.includes(error.code)
    }
    
    // Check error messages for transient issues
    const retryableMessages = [
      'connection',
      'timeout',
      'deadlock',
      'serialization failure',
      'could not serialize access'
    ]
    
    return retryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    )
  }
}

/**
 * Performance monitoring utilities
 */
export class PrismaPerformanceMonitor {
  private static queryMetrics = new Map<string, {
    count: number
    totalDuration: number
    maxDuration: number
    minDuration: number
  }>()
  
  /**
   * Record query metrics
   */
  static recordQuery(model: string, action: string, duration: number): void {
    const key = `${model}.${action}`
    const existing = this.queryMetrics.get(key)
    
    if (existing) {
      existing.count++
      existing.totalDuration += duration
      existing.maxDuration = Math.max(existing.maxDuration, duration)
      existing.minDuration = Math.min(existing.minDuration, duration)
    } else {
      this.queryMetrics.set(key, {
        count: 1,
        totalDuration: duration,
        maxDuration: duration,
        minDuration: duration
      })
    }
  }
  
  /**
   * Get performance statistics
   */
  static getStatistics(): Record<string, {
    count: number
    avgDuration: number
    maxDuration: number
    minDuration: number
  }> {
    const stats: Record<string, any> = {}
    
    for (const [key, metrics] of this.queryMetrics) {
      stats[key] = {
        count: metrics.count,
        avgDuration: Math.round(metrics.totalDuration / metrics.count),
        maxDuration: metrics.maxDuration,
        minDuration: metrics.minDuration
      }
    }
    
    return stats
  }
  
  /**
   * Reset performance metrics
   */
  static resetStatistics(): void {
    this.queryMetrics.clear()
  }
}

/**
 * Export utilities for easy access
 */
export {
  PrismaConnectionManager as ConnectionManager,
  PrismaTransactionManager as TransactionManager,
  PrismaPerformanceMonitor as PerformanceMonitor
}

/**
 * Graceful shutdown handler
 */
process.on('beforeExit', async () => {
  await PrismaConnectionManager.disconnect()
})

process.on('SIGINT', async () => {
  await PrismaConnectionManager.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await PrismaConnectionManager.disconnect()
  process.exit(0)
})