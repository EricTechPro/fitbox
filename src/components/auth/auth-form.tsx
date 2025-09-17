'use client'

import { useState, useEffect } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ErrorBoundary, useErrorHandler } from '@/components/ui/error-boundary'
import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import { AUTH_CONSTANTS } from '@/lib/constants'

import { AuthFormHeader } from './auth-form-header'
import { AuthFormFooter } from './auth-form-footer'
import { AuthFormFields } from './auth-form-fields'
import { EmailConfirmation } from './email-confirmation'

import {
  credentialsSchema,
  registrationSchema,
  emailOnlySchema,
  type CredentialsInput,
  type RegistrationInput,
  type EmailOnlyInput
} from '@/lib/auth-validation'

/**
 * Authentication form modes
 */
type AuthFormMode = 'signin' | 'signup' | 'email'

interface AuthFormProps {
  mode: AuthFormMode
  className?: string
}

/**
 * Form data types for each mode
 */
type FormDataByMode = {
  signin: CredentialsInput
  signup: RegistrationInput
  email: EmailOnlyInput
}

/**
 * Generic form configuration type
 */
interface FormConfig<T extends AuthFormMode> {
  schema: T extends 'signin'
    ? typeof credentialsSchema
    : T extends 'signup'
    ? typeof registrationSchema
    : typeof emailOnlySchema
  defaultValues: FormDataByMode[T]
}

/**
 * Main authentication form component with refactored structure
 */
export function AuthForm({ mode, className }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const handleError = useErrorHandler()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')

  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const urlError = searchParams.get('error')

  /**
   * Form setup based on mode with proper typing
   */
  const getFormConfig = <T extends AuthFormMode>(
    mode: T
  ): FormConfig<T> => {
    switch (mode) {
      case 'signin':
        return {
          schema: credentialsSchema,
          defaultValues: { email: '', password: '' }
        } as FormConfig<T>
      case 'signup':
        return {
          schema: registrationSchema,
          defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
          }
        } as FormConfig<T>
      case 'email':
        return {
          schema: emailOnlySchema,
          defaultValues: { email: '' }
        } as FormConfig<T>
      default:
        throw new Error(`Invalid auth mode: ${mode}`)
    }
  }

  const config = getFormConfig(mode)
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues
  })

  /**
   * Initialize providers and CSRF token
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get OAuth providers
        const providers = await getProviders()
        setProviders(providers)

        // Get CSRF token for custom endpoints
        if (mode === 'signup') {
          const response = await fetch('/api/auth/csrf')
          if (response.ok) {
            const data = await response.json()
            setCsrfToken(data.csrfToken)
          }
        }
      } catch (error) {
        // Failed to initialize auth
      }
    }

    initializeAuth()
  }, [mode])

  /**
   * Handle form submission
   */
  const onSubmit = async (data: FormDataByMode[typeof mode]) => {
    try {
      setIsLoading(true)
      setError(null)

      if (mode === 'signin') {
        const result = await signIn(AUTH_CONSTANTS.PROVIDERS.CREDENTIALS, {
          ...(data as CredentialsInput),
          redirect: false
        })

        if (result?.error) {
          setError(t(translationPaths.auth.invalidCredentials))
        } else if (result?.ok) {
          router.push(callbackUrl)
        }
      } else if (mode === 'signup') {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(data)
        })

        const responseData = await response.json()

        if (!response.ok) {
          if (responseData.errors) {
            setError(responseData.errors.map((e: any) => e.message).join(', '))
          } else {
            setError(responseData.message || 'Registration failed')
          }
        } else {
          // Auto sign in after successful registration
          const signInResult = await signIn('credentials', {
            email: (data as RegistrationInput).email,
            password: (data as RegistrationInput).password,
            redirect: false
          })

          if (signInResult?.ok) {
            router.push(callbackUrl)
          } else {
            router.push(`${AUTH_CONSTANTS.ROUTES.SIGN_IN}?message=registered`)
          }
        }
      } else if (mode === 'email') {
        const result = await signIn(AUTH_CONSTANTS.PROVIDERS.EMAIL, {
          ...(data as EmailOnlyInput),
          redirect: false
        })

        if (result?.error) {
          setError(t(translationPaths.auth.linkExpired))
        } else {
          setEmailSent(true)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      handleError.handleError(error)
      setError(t(translationPaths.auth.invalidCredentials))
    } finally {
      setIsLoading(false)
    }
  }


  /**
   * Display error messages using translations
   */
  const getErrorMessage = () => {
    if (error) return error
    if (urlError) {
      switch (urlError) {
        case 'CredentialsSignin':
          return t(translationPaths.auth.invalidCredentials)
        case 'SessionRequired':
          return t(translationPaths.auth.linkExpired)
        case 'AccessDenied':
          return t(translationPaths.auth.invalidCredentials)
        default:
          return t(translationPaths.auth.invalidCredentials)
      }
    }
    return null
  }

  /**
   * Render email sent confirmation
   */
  if (emailSent && mode === 'email') {
    return (
      <EmailConfirmation
        onBack={() => setEmailSent(false)}
        className={className}
      />
    )
  }

  return (
    <ErrorBoundary>
      <Card className={className}>
        <AuthFormHeader mode={mode} />

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {getErrorMessage() && (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthFormFields mode={mode} form={form} />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              mode === 'signin' ? t(translationPaths.auth.signingIn) :
              mode === 'signup' ? t(translationPaths.auth.signingUp) :
              t(translationPaths.auth.sendingEmail)
            ) : (
              mode === 'signin' ? t(translationPaths.auth.signIn) :
              mode === 'signup' ? t(translationPaths.auth.signUp) :
              t(translationPaths.auth.sendMagicLink)
            )}
          </Button>
        </form>

        {/* Alternative Sign In Methods (Not for Email Mode) */}
        {mode !== 'email' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t(translationPaths.auth.orContinueWith)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/auth/email')}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t(translationPaths.auth.signInWithEmailLink)}
            </Button>
          </>
        )}
      </CardContent>

        <AuthFormFooter mode={mode} />
      </Card>
    </ErrorBoundary>
  )
}