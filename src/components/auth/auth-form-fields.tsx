'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import { User, Phone, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import { PasswordInput } from './password-input'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import {
  type CredentialsInput,
  type RegistrationInput,
  type EmailOnlyInput
} from '@/lib/auth-validation'

type AuthFormMode = 'signin' | 'signup' | 'email'
type FormData = CredentialsInput | RegistrationInput | EmailOnlyInput

interface AuthFormFieldsProps {
  mode: AuthFormMode
  form: UseFormReturn<FormData>
}

interface PasswordStrength {
  isValid: boolean
  score: number
  feedback: string[]
}

/**
 * Authentication form fields component
 * Renders different sets of fields based on the authentication mode
 */
export function AuthFormFields({ mode, form }: AuthFormFieldsProps) {
  const { t } = useTranslation()
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    feedback: []
  })
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  /**
   * Get field error message safely
   */
  const getFieldError = (fieldName: string) => {
    return form.formState.errors[fieldName as keyof FormData]?.message
  }

  return (
    <div className="space-y-4">
      {/* First Name Field (Sign Up Only) */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="firstName">{t(translationPaths.auth.firstName)}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              type="text"
              placeholder={t(translationPaths.auth.firstNamePlaceholder)}
              className="pl-9"
              {...form.register('firstName')}
            />
          </div>
          {getFieldError('firstName') && (
            <p className="text-sm text-destructive">{getFieldError('firstName')}</p>
          )}
        </div>
      )}

      {/* Last Name Field (Sign Up Only) */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="lastName">{t(translationPaths.auth.lastName)}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastName"
              type="text"
              placeholder={t(translationPaths.auth.lastNamePlaceholder)}
              className="pl-9"
              {...form.register('lastName')}
            />
          </div>
          {getFieldError('lastName') && (
            <p className="text-sm text-destructive">{getFieldError('lastName')}</p>
          )}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">{t(translationPaths.auth.email)}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t(translationPaths.auth.emailPlaceholder)}
            className="pl-9"
            {...form.register('email')}
          />
        </div>
        {getFieldError('email') && (
          <p className="text-sm text-destructive">{getFieldError('email')}</p>
        )}
      </div>

      {/* Phone Field (Sign Up Only) */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="phone">{t(translationPaths.auth.phone)} (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder={t(translationPaths.auth.phonePlaceholder)}
              className="pl-9"
              {...form.register('phone')}
            />
          </div>
          {getFieldError('phone') && (
            <p className="text-sm text-destructive">{getFieldError('phone')}</p>
          )}
        </div>
      )}

      {/* Password Field (Not for Email Mode) */}
      {mode !== 'email' && (
        <div className="space-y-2">
          <Label htmlFor="password">{t(translationPaths.auth.password)}</Label>
          <PasswordInput
            id="password"
            placeholder={t(translationPaths.auth.passwordPlaceholder)}
            error={getFieldError('password')}
            showStrengthIndicator={mode === 'signup'}
            onStrengthChange={(strength) => {
              setPasswordStrength(strength)
              setShowPasswordStrength(true)
            }}
            {...form.register('password')}
          />
          {mode === 'signup' && (
            <PasswordStrengthIndicator
              strength={passwordStrength}
              show={showPasswordStrength}
            />
          )}
        </div>
      )}

      {/* Confirm Password Field (Sign Up Only) */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t(translationPaths.auth.confirmPassword)}</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder={t(translationPaths.auth.passwordPlaceholder)}
            error={getFieldError('confirmPassword')}
            {...form.register('confirmPassword')}
          />
        </div>
      )}
    </div>
  )
}