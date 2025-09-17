'use client'

import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'

type AuthFormMode = 'signin' | 'signup' | 'email'

interface AuthFormFooterProps {
  mode: AuthFormMode
}

/**
 * Authentication form footer component
 * Provides navigation links between different auth modes
 */
export function AuthFormFooter({ mode }: AuthFormFooterProps) {
  const { t } = useTranslation()

  return (
    <CardFooter className="flex flex-col space-y-2">
      {/* Alternative Action Link */}
      <div className="text-center text-sm">
        {mode === 'signin' && (
          <>
            <span className="text-muted-foreground">{t(translationPaths.auth.noAccount)} </span>
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <a href="/auth/register">
                {t(translationPaths.auth.signUp)}
              </a>
            </Button>
          </>
        )}
        {(mode === 'signup' || mode === 'email') && (
          <>
            <span className="text-muted-foreground">{t(translationPaths.auth.hasAccount)} </span>
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <a href="/auth/login">
                {t(translationPaths.auth.signIn)}
              </a>
            </Button>
          </>
        )}
      </div>

      {/* Forgot Password Link (Sign In Only) */}
      {mode === 'signin' && (
        <Button variant="link" className="p-0 h-auto font-normal text-sm">
          {t(translationPaths.auth.forgotPassword)}
        </Button>
      )}
    </CardFooter>
  )
}