'use client'

import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import { CardHeader } from '@/components/ui/card'

type AuthFormMode = 'signin' | 'signup' | 'email'

interface AuthFormHeaderProps {
  mode: AuthFormMode
}

/**
 * Authentication form header component
 * Displays title and description based on the current authentication mode
 */
export function AuthFormHeader({ mode }: AuthFormHeaderProps) {
  const { t } = useTranslation()

  /**
   * Get title and description based on authentication mode
   * Uses type-safe translation paths
   */
  const getTitleAndDescription = () => {
    switch (mode) {
      case 'signin':
        return {
          title: t(translationPaths.auth.welcomeBack),
          description: t(translationPaths.auth.signInToAccount)
        }
      case 'signup':
        return {
          title: t(translationPaths.auth.welcomeToFitbox),
          description: t(translationPaths.auth.createAccount)
        }
      case 'email':
        return {
          title: t(translationPaths.auth.signInWith),
          description: t(translationPaths.auth.emailSentMessage)
        }
      default:
        return {
          title: t(translationPaths.auth.welcomeBack),
          description: t(translationPaths.auth.signInToAccount)
        }
    }
  }

  const { title, description } = getTitleAndDescription()

  return (
    <CardHeader className="text-center space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{description}</p>
    </CardHeader>
  )
}