/**
 * Unified Authentication Validation Schemas
 * Single source of truth for all authentication validation
 */

import { z } from 'zod'

/**
 * Password validation with comprehensive security requirements
 * Requires: lowercase, uppercase, number, special character, min 8 chars
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*(),.?":{}|<>)'
  )
  .regex(
    /^[^\s]*$/,
    'Password cannot contain spaces'
  )
  .refine(
    password => !/(.)\1{2,}/.test(password),
    'Password cannot contain three or more consecutive identical characters'
  )

/**
 * Email validation with normalization
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .transform(email => email.toLowerCase().trim())

/**
 * Name validation
 */
export const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform(name => name.trim())

/**
 * Phone validation (optional)
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone || phone.trim() === '') return true
      // Basic phone validation - adjust regex based on requirements
      return /^[\+]?[\d\s\-\(\)]{10,}$/.test(phone.trim())
    },
    'Please enter a valid phone number'
  )
  .transform(phone => phone?.trim() || undefined)

/**
 * Authentication Schemas
 */

// Base credentials schema for login
export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Registration schema with password confirmation
export const registrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Email-only schema for magic links
export const emailOnlySchema = z.object({
  email: emailSchema
})

// Password reset schema
export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
  token: z.string().min(1, 'Reset token is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Change password schema (for authenticated users)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
})

/**
 * TypeScript types derived from schemas
 */
export type CredentialsInput = z.infer<typeof credentialsSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

/**
 * API response types
 */
export interface AuthErrorResponse {
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
  code?: string
}

export interface AuthSuccessResponse {
  message: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

/**
 * Validation helpers
 */
export class AuthValidation {
  /**
   * Validate and sanitize registration data
   */
  static validateRegistration(data: unknown): {
    success: boolean
    data?: RegistrationInput
    errors?: Array<{ field: string; message: string }>
  } {
    const result = registrationSchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    }

    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    }
  }

  /**
   * Validate and sanitize credentials
   */
  static validateCredentials(data: unknown): {
    success: boolean
    data?: CredentialsInput
    errors?: Array<{ field: string; message: string }>
  } {
    const result = credentialsSchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    }

    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    }
  }

  /**
   * Validate email-only input
   */
  static validateEmail(data: unknown): {
    success: boolean
    data?: EmailOnlyInput
    errors?: Array<{ field: string; message: string }>
  } {
    const result = emailOnlySchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    }

    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    }
  }

  /**
   * Validate password strength and return feedback
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number // 0-100
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) {
      score += 20
    } else {
      feedback.push('Password should be at least 8 characters long')
    }

    if (password.length >= 12) {
      score += 10
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 15
    } else {
      feedback.push('Add lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
      score += 15
    } else {
      feedback.push('Add uppercase letters')
    }

    if (/\d/.test(password)) {
      score += 15
    } else {
      feedback.push('Add numbers')
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 15
    } else {
      feedback.push('Add special characters (!@#$%^&*(),.?":{}|<>)')
    }

    // Common pattern checks
    if (!/(.)\1{2,}/.test(password)) {
      score += 10
    } else {
      feedback.push('Avoid repeating characters')
    }

    const result = passwordSchema.safeParse(password)
    const isValid = result.success

    return {
      isValid,
      score: Math.min(100, score),
      feedback: isValid ? [] : feedback
    }
  }

  /**
   * Sanitize user input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>&"']/g, (char) => {
        const map: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;'
        }
        return map[char] || char
      })
  }
}

/**
 * Environment-specific validation
 */
export const environmentSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional()
})

export type EnvironmentConfig = z.infer<typeof environmentSchema>

/**
 * Validate environment configuration
 */
export function validateEnvironment(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate required environment variables
  const envResult = environmentSchema.safeParse(process.env)

  if (!envResult.success) {
    envResult.error.issues.forEach(issue => {
      errors.push(`${issue.path.join('.')}: ${issue.message}`)
    })
  }

  // Additional security checks
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 64) {
    warnings.push('NEXTAUTH_SECRET should be at least 64 characters for enhanced security')
  }

  if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.includes('localhost')) {
    errors.push('NEXTAUTH_URL should not use localhost in production')
  }

  // Email configuration check
  const emailVars = ['EMAIL_SERVER_HOST', 'EMAIL_SERVER_USER', 'EMAIL_SERVER_PASSWORD', 'EMAIL_FROM']
  const hasEmailVars = emailVars.some(key => process.env[key])
  const missingEmailVars = emailVars.filter(key => !process.env[key])

  if (hasEmailVars && missingEmailVars.length > 0) {
    warnings.push(`Incomplete email configuration. Missing: ${missingEmailVars.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}