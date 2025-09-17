'use client'

import React, { useState, forwardRef, useCallback } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthValidation } from '@/lib/auth-validation'
import { debounce } from '@/lib/debounce'
import { AUTH_CONSTANTS } from '@/lib/constants'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string
  placeholder?: string
  className?: string
  error?: string
  showStrengthIndicator?: boolean
  onStrengthChange?: (strength: { isValid: boolean; score: number; feedback: string[] }) => void
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, placeholder = 'Enter password', className, error, showStrengthIndicator = false, onStrengthChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    // Create debounced password strength validation
    const debouncedPasswordValidation = useCallback(
      debounce((password: string) => {
        if (showStrengthIndicator && onStrengthChange) {
          const strength = AuthValidation.validatePasswordStrength(password)
          onStrengthChange(strength)
        }
      }, AUTH_CONSTANTS.VALIDATION.DEBOUNCE_DELAY_MS),
      [] // Dependencies handled by debounce function
    )

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Call the original onChange handler if provided
      if (props.onChange) {
        props.onChange(e)
      }

      // Debounced password strength validation
      debouncedPasswordValidation(e.target.value)
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            {...props}
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            className={`pl-9 pr-9 ${className}`}
            onChange={handlePasswordChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'