import { Metadata } from 'next'
import { Suspense } from 'react'
import { AlertTriangle, ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Authentication Error | FitBox',
  description: 'An error occurred during authentication.',
}

/**
 * Authentication error messages mapping
 */
const errorMessages = {
  Configuration: {
    title: 'Configuration Error',
    description: 'There is a problem with the server configuration.',
    action: 'Please contact support if this issue persists.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
    action: 'Please contact support if you believe this is an error.',
  },
  Verification: {
    title: 'Verification Error',
    description: 'The verification link is invalid or has expired.',
    action: 'Please request a new verification link.',
  },
  SessionRequired: {
    title: 'Session Expired',
    description: 'Your session has expired.',
    action: 'Please sign in again.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication.',
    action: 'Please try again or contact support if the problem persists.',
  },
} as const

type ErrorType = keyof typeof errorMessages

/**
 * Get error details from URL parameters
 */
function getErrorDetails(searchParams: URLSearchParams): {
  type: ErrorType
  title: string
  description: string
  action: string
} {
  const error = searchParams.get('error') || 'Default'
  const errorType = error in errorMessages ? (error as ErrorType) : 'Default'

  return {
    type: errorType,
    ...errorMessages[errorType],
  }
}

/**
 * Authentication Error Page Component
 */
interface AuthErrorPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const urlSearchParams = new URLSearchParams(
    Object.entries(searchParams).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)
  )

  const errorDetails = getErrorDetails(urlSearchParams)
  const callbackUrl = urlSearchParams.get('callbackUrl') || '/'

  /**
   * Render action buttons based on error type
   */
  const renderActionButtons = () => {
    switch (errorDetails.type) {
      case 'Verification':
        return (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <Mail className="mr-2 h-4 w-4" />
                Request New Link
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        )

      case 'SessionRequired':
        return (
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sign In Again
            </Link>
          </Button>
        )

      case 'AccessDenied':
        return (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="mailto:support@fitbox.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        )

      case 'Configuration':
        return (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="mailto:support@fitbox.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="text-4xl font-bold text-primary mb-2 block">
          FitBox
        </Link>
        <p className="text-muted-foreground">
          Asian Fusion Meal Delivery
        </p>
      </div>

      {/* Error Card */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold">{errorDetails.title}</h1>
          <p className="text-sm text-muted-foreground">
            {errorDetails.description}
          </p>
        </CardHeader>

        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorDetails.action}
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {renderActionButtons()}
        </CardFooter>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          Need help?{' '}
          <a
            href="mailto:support@fitbox.com"
            className="underline hover:text-foreground"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}