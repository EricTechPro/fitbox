import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

  // Authentication
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Stripe
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'STRIPE_PUBLISHABLE_KEY is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').optional(),
  SENDGRID_API_KEY: z
    .string()
    .min(1, 'SENDGRID_API_KEY is required')
    .optional(),

  // Image Storage
  CLOUDINARY_URL: z.string().min(1, 'CLOUDINARY_URL is required').optional(),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'CLOUDINARY_CLOUD_NAME is required')
    .optional(),
  CLOUDINARY_API_KEY: z
    .string()
    .min(1, 'CLOUDINARY_API_KEY is required')
    .optional(),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, 'CLOUDINARY_API_SECRET is required')
    .optional(),

  // Application
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Public environment variables (Next.js prefix)
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
})

// Custom validation: Either CLOUDINARY_URL or individual Cloudinary variables
const envWithCustomValidation = envSchema
  .refine(
    data => {
      return (
        data.CLOUDINARY_URL ||
        (data.CLOUDINARY_CLOUD_NAME &&
          data.CLOUDINARY_API_KEY &&
          data.CLOUDINARY_API_SECRET)
      )
    },
    {
      message:
        'Either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be provided',
    }
  )
  .refine(
    data => {
      // At least one email service must be configured
      return data.RESEND_API_KEY || data.SENDGRID_API_KEY
    },
    {
      message: 'Either RESEND_API_KEY or SENDGRID_API_KEY must be provided',
    }
  )

// Parse and validate environment variables
function validateEnv() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  }

  const result = envWithCustomValidation.safeParse(env)

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Invalid environment variables:',
      result.error.flatten().fieldErrors
    )
    throw new Error('Invalid environment variables')
  }

  return result.data
}

// Export validated environment variables
export const env = validateEnv()

// Type for environment variables
export type Env = z.infer<typeof envSchema>

// Helper functions for environment-specific logic
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Database connection helper
export function getDatabaseConfig() {
  return {
    url: env.DATABASE_URL,
    redis: env.REDIS_URL,
  }
}

// Stripe configuration helper
export function getStripeConfig() {
  return {
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  }
}

// Email service configuration helper
export function getEmailConfig() {
  if (env.RESEND_API_KEY) {
    return {
      provider: 'resend' as const,
      apiKey: env.RESEND_API_KEY,
    }
  }

  if (env.SENDGRID_API_KEY) {
    return {
      provider: 'sendgrid' as const,
      apiKey: env.SENDGRID_API_KEY,
    }
  }

  throw new Error('No email service configured')
}

// Cloudinary configuration helper
export function getCloudinaryConfig() {
  if (env.CLOUDINARY_URL) {
    return { url: env.CLOUDINARY_URL }
  }

  if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    return {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    }
  }

  throw new Error('Cloudinary not properly configured')
}
