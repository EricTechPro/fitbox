import { Metadata } from 'next'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Sign Up | FitBox',
  description: 'Create your FitBox account to start ordering delicious Asian fusion meals.',
}

/**
 * Loading component for Suspense fallback
 */
function AuthFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2 text-center">
            <div className="h-8 w-48 animate-pulse rounded bg-muted mx-auto" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted mx-auto" />
          </div>
          <div className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            {/* Last Name */}
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            {/* Phone */}
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            {/* Password */}
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            {/* Submit Button */}
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Sign Up Page Component
 */
export default async function RegisterPage() {
  // Redirect if user is already authenticated
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">FitBox</h1>
        <p className="text-muted-foreground">
          Asian Fusion Meal Delivery
        </p>
      </div>

      {/* Authentication Form */}
      <Suspense fallback={<AuthFormSkeleton />}>
        <AuthForm
          mode="signup"
          className="w-full max-w-md shadow-lg"
        />
      </Suspense>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground max-w-md">
        <p>
          By creating an account, you agree to our{' '}
          <a href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
        <p className="mt-2">
          We're currently in beta with limited capacity.
          Sign ups are limited to 10 new customers per week.
        </p>
      </div>
    </div>
  )
}