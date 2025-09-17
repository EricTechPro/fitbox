'use client'

import { AUTH_CONSTANTS } from '@/lib/constants'

interface PasswordStrength {
  isValid: boolean
  score: number
  feedback: string[]
}

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  show: boolean
}

export function PasswordStrengthIndicator({ strength, show }: PasswordStrengthIndicatorProps) {
  if (!show) return null

  const getStrengthColor = (score: number) => {
    const { WEAK, FAIR, GOOD } = AUTH_CONSTANTS.VALIDATION.PASSWORD_STRENGTH_THRESHOLDS
    if (score < WEAK) return 'bg-red-500'
    if (score < FAIR) return 'bg-yellow-500'
    if (score < GOOD) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    const { WEAK, FAIR, GOOD } = AUTH_CONSTANTS.VALIDATION.PASSWORD_STRENGTH_THRESHOLDS
    if (score < WEAK) return 'Weak'
    if (score < FAIR) return 'Fair'
    if (score < GOOD) return 'Good'
    return 'Strong'
  }

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.score < AUTH_CONSTANTS.VALIDATION.PASSWORD_STRENGTH_THRESHOLDS.WEAK ? 'text-red-600' :
          strength.score < AUTH_CONSTANTS.VALIDATION.PASSWORD_STRENGTH_THRESHOLDS.FAIR ? 'text-yellow-600' :
          strength.score < AUTH_CONSTANTS.VALIDATION.PASSWORD_STRENGTH_THRESHOLDS.GOOD ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {getStrengthText(strength.score)}
        </span>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center space-x-1">
              <span className="text-red-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Success Message */}
      {strength.isValid && strength.score >= AUTH_CONSTANTS.VALIDATION.PASSWORD_STRENGTH_THRESHOLDS.GOOD && (
        <p className="text-xs text-green-600 flex items-center space-x-1">
          <span>✓</span>
          <span>Password meets all requirements</span>
        </p>
      )}
    </div>
  )
}