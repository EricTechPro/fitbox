import { NextAuthOptions } from "next-auth"
import type { Provider } from "next-auth/providers/index"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { credentialsSchema, emailOnlySchema } from "@/lib/auth-validation"
import {
  SecureLogger,
  AccountLockout,
  TimingProtection
} from "@/lib/auth-security"
import { AUTH_CONSTANTS } from "@/lib/constants"

/**
 * Enhanced Credentials Provider with validation and security
 */
const credentialsProvider = CredentialsProvider({
  id: AUTH_CONSTANTS.PROVIDERS.CREDENTIALS,
  name: "Email and Password",
  credentials: {
    email: {
      label: "Email",
      type: "email",
      placeholder: "your@email.com"
    },
    password: {
      label: "Password",
      type: "password",
      placeholder: "Enter your password"
    }
  },
  async authorize(credentials, req) {
    return await TimingProtection.ensureMinimumTime(async () => {
      try {
        // Validate input format
        if (!credentials?.email || !credentials?.password) {
          SecureLogger.logAuthAttempt(false, {
            metadata: { error_code: 'MISSING_CREDENTIALS' }
          })
          return null
        }

        // Validate email and password format
        const validation = credentialsSchema.safeParse(credentials)
        if (!validation.success) {
          SecureLogger.logAuthAttempt(false, {
            email: credentials.email,
            metadata: { error_code: 'INVALID_FORMAT' }
          })
          return null
        }

        const { email, password } = validation.data

        // Check account lockout
        if (AccountLockout.isLocked(email)) {
          SecureLogger.logAuthAttempt(false, {
            email,
            metadata: { error_code: 'ACCOUNT_LOCKED' }
          })
          return null
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: email.toLowerCase()
          },
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true
          }
        })

        // Always perform password comparison to prevent timing attacks
        const providedPassword = password
        const storedPassword = user?.password || '$2a$12$dummy.hash.to.prevent.timing.attacks'

        const isPasswordValid = await compare(providedPassword, storedPassword)

        // Check if user exists and password is valid
        if (!user || !isPasswordValid) {
          AccountLockout.recordFailedAttempt(email)
          SecureLogger.logAuthAttempt(false, {
            email,
            metadata: { error_code: 'AUTHENTICATION_FAILED' }
          })
          return null
        }

        // Record successful authentication
        AccountLockout.recordSuccessfulAttempt(email)
        SecureLogger.logAuthAttempt(true, {
          userId: user.id,
          email: user.email
        })

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || user.email
        }
      } catch (error) {
        SecureLogger.logSecurityEvent({
          type: 'AUTH_FAILURE',
          timestamp: new Date(),
          metadata: { error_code: 'SYSTEM_ERROR' }
        })
        return null
      }
    }, AUTH_CONSTANTS.SECURITY.TIMING_ATTACK_PROTECTION_MS) // Minimum time to prevent timing attacks
  }
})

/**
 * Enhanced Email Provider with custom configuration
 */
const emailProvider = EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: process.env.EMAIL_SERVER_SECURE === "true",
  },
  from: process.env.EMAIL_FROM,
  maxAge: 24 * 60 * 60, // 24 hours
  sendVerificationRequest: async ({ identifier, url, provider, theme }) => {
    try {
      // Import email provider functions
      const { sendVerificationEmail, EmailRateLimiter } = await import("@/lib/email-provider")

      // Check rate limiting before sending
      if (EmailRateLimiter.isRateLimited(identifier)) {
        const remainingTime = EmailRateLimiter.getRemainingTime(identifier)
        const minutes = Math.ceil(remainingTime / 60000)

        SecureLogger.logSecurityEvent({
          type: 'AUTH_FAILURE',
          email: identifier,
          timestamp: new Date(),
          metadata: {
            error_code: 'EMAIL_RATE_LIMITED',
            remaining_minutes: minutes
          }
        })

        throw new Error(`Too many email requests. Please wait ${minutes} minutes before trying again.`)
      }

      await sendVerificationEmail({
        to: identifier,
        url,
        provider,
        theme
      })

      SecureLogger.logSecurityEvent({
        type: 'AUTH_SUCCESS',
        email: identifier,
        timestamp: new Date(),
        metadata: { auth_method: 'email_link' }
      })
    } catch (error) {
      SecureLogger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        email: identifier,
        timestamp: new Date(),
        metadata: {
          error_code: 'EMAIL_SEND_FAILED',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      throw error
    }
  },
})

/**
 * Database adapter configuration with enhanced error handling
 */
const prismaAdapter = PrismaAdapter(prisma)

/**
 * Enhanced adapter with custom user creation logic and secure logging
 */
const enhancedAdapter = {
  ...prismaAdapter,
  async createUser(user: any) {
    try {
      // Ensure email is lowercase for consistency
      const normalizedUser = {
        ...user,
        email: user.email.toLowerCase(),
        role: 'CUSTOMER' as const, // Default role for new users
      }

      const createdUser = await prisma.user.create({
        data: normalizedUser
      })

      SecureLogger.logRegistrationAttempt(true, {
        userId: createdUser.id,
        email: createdUser.email
      })

      return createdUser
    } catch (error) {
      SecureLogger.logRegistrationAttempt(false, {
        email: user?.email,
        metadata: { error_code: 'USER_CREATION_FAILED' }
      })
      throw error
    }
  },

  async getUser(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id }
      })
    } catch (error) {
      SecureLogger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        userId: id,
        timestamp: new Date(),
        metadata: { error_code: 'USER_FETCH_FAILED' }
      })
      return null
    }
  },

  async getUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })
    } catch (error) {
      SecureLogger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        email: email,
        timestamp: new Date(),
        metadata: { error_code: 'USER_EMAIL_FETCH_FAILED' }
      })
      return null
    }
  },

  async getUserByAccount({ providerAccountId, provider }: any) {
    try {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId
          }
        },
        include: {
          user: true
        }
      })
      return account?.user ?? null
    } catch (error) {
      SecureLogger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        timestamp: new Date(),
        metadata: {
          error_code: 'USER_ACCOUNT_FETCH_FAILED',
          provider,
          providerAccountId: provider // Don't log the actual account ID
        }
      })
      return null
    }
  }
}

/**
 * Provider configuration factory
 */
export function createProviders(): Provider[] {
  const providers: Provider[] = [credentialsProvider]

  // Add email provider if configured
  if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
    providers.push(emailProvider)
  } else {
    console.warn("Email provider not configured - missing EMAIL_SERVER_HOST or EMAIL_FROM")
  }

  return providers
}

/**
 * Adapter configuration factory
 */
export function createAdapter() {
  return enhancedAdapter
}

/**
 * Environment validation for authentication configuration
 */
export function validateAuthEnvironment(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  // Use the comprehensive validation from auth-validation.ts
  const { validateEnvironment } = require("@/lib/auth-validation")
  return validateEnvironment()
}

/**
 * Development helper to check authentication configuration
 */
export function logAuthConfiguration() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const validation = validateAuthEnvironment()

  console.log('\n🔐 Authentication Configuration Check:')
  console.log('=====================================')

  if (validation.isValid) {
    console.log('✅ Configuration is valid')
  } else {
    console.log('❌ Configuration has errors:')
    validation.errors.forEach(error => console.log(`  - ${error}`))
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:')
    validation.warnings.forEach(warning => console.log(`  - ${warning}`))
  }

  const providers = createProviders()
  console.log(`📦 Configured providers: ${providers.map(p => p.id).join(', ')}`)

  console.log('=====================================\n')
}

// Export provider instances for use in auth options
export const providers = createProviders()
export const adapter = createAdapter()