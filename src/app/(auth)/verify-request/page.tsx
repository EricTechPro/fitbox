import { Metadata } from 'next'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Check Your Email | FitBox',
  description: 'A verification link has been sent to your email address.',
}

/**
 * Email Verification Request Page Component
 */
interface VerifyRequestPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function VerifyRequestPage({ searchParams }: VerifyRequestPageProps) {
  const email = searchParams.email as string
  const callbackUrl = (searchParams.callbackUrl as string) || '/'

  /**
   * Mask email for privacy while showing verification was sent
   */
  const getMaskedEmail = (email: string): string => {
    if (!email) return 'your email address'

    const [localPart, domain] = email.split('@')
    if (!domain) return 'your email address'

    const maskedLocal = localPart.length > 2
      ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
      : localPart

    return `${maskedLocal}@${domain}`
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

      {/* Verification Card */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">
            A sign-in link has been sent to{' '}
            <span className="font-medium">{getMaskedEmail(email)}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Click the link in your email to sign in to your account.
              The link will expire in 24 hours for security.
            </AlertDescription>
          </Alert>

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <h3 className="font-medium text-foreground">Didn't receive the email?</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {/* Action Buttons */}
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Different Email
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Security Notice */}
      <div className="mt-8 text-center text-xs text-muted-foreground max-w-md">
        <div className="rounded-lg bg-muted/50 p-3">
          <h4 className="font-medium text-foreground mb-1">Security Notice</h4>
          <p>
            We sent this link to {getMaskedEmail(email)}. If you didn't request this,
            you can safely ignore this email. Only someone with access to your
            email can sign in to your account.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
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