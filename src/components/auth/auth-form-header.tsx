'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { CardHeader } from '@/components/ui/card'

type AuthFormMode = 'signin' | 'signup' | 'email'

interface AuthFormHeaderProps {
  mode: AuthFormMode
}

export function AuthFormHeader({ mode }: AuthFormHeaderProps) {
  const { t } = useTranslation()

  const getTitleAndDescription = () => {
    switch (mode) {
      case 'signin':
        return {
          title: t('auth.welcomeBack'),
          description: t('auth.signInToAccount')
        }
      case 'signup':
        return {
          title: t('auth.welcomeToFitbox'),
          description: t('auth.createAccount')
        }
      case 'email':
        return {
          title: t('auth.signInWith'),
          description: 'Enter your email to receive a sign-in link'
        }
      default:
        return {
          title: 'Welcome',
          description: 'Please authenticate to continue'
        }
    }
  }

  const { title, description } = getTitleAndDescription()

  return (
    <CardHeader className="text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
  )
}