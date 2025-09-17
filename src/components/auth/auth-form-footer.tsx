'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'

type AuthFormMode = 'signin' | 'signup' | 'email'

interface AuthFormFooterProps {
  mode: AuthFormMode
}

export function AuthFormFooter({ mode }: AuthFormFooterProps) {
  const { t } = useTranslation()

  return (
    <CardFooter className="flex flex-col space-y-2">
      {/* Alternative Action Link */}
      <div className="text-center text-sm">
        {mode === 'signin' && (
          <>
            <span className="text-muted-foreground">{t('auth.noAccount')} </span>
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <a href="/auth/register">
                {t('auth.signUp')}
              </a>
            </Button>
          </>
        )}
        {(mode === 'signup' || mode === 'email') && (
          <>
            <span className="text-muted-foreground">{t('auth.hasAccount')} </span>
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <a href="/auth/login">
                {t('auth.signIn')}
              </a>
            </Button>
          </>
        )}
      </div>

      {/* Forgot Password Link (Sign In Only) */}
      {mode === 'signin' && (
        <Button variant="link" className="p-0 h-auto font-normal text-sm">
          {t('auth.forgotPassword')}
        </Button>
      )}
    </CardFooter>
  )
}