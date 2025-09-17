'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import { User, Phone, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/useTranslation'
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

export function AuthFormFields({ mode, form }: AuthFormFieldsProps) {
  const { t } = useTranslation()
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    score: 0,
    feedback: []
  })
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  const getFieldError = (fieldName: string) => {
    return form.formState.errors[fieldName as keyof FormData]?.message
  }

  return (
    <div className="space-y-4">
      {/* First Name Field (Sign Up Only) */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="firstName">{t('auth.firstName')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              type="text"
              placeholder="John"
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
          <Label htmlFor="lastName">{t('auth.lastName')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
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
        <Label htmlFor="email">{t('auth.email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
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
          <Label htmlFor="phone">{t('auth.phone')} (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
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
          <Label htmlFor="password">{t('auth.password')}</Label>
          <PasswordInput
            id="password"
            placeholder={t('auth.passwordPlaceholder')}
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
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder={t('auth.confirmPassword')}
            error={getFieldError('confirmPassword')}
            {...form.register('confirmPassword')}
          />
        </div>
      )}
    </div>
  )
}