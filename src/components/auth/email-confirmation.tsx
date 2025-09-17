'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mail } from 'lucide-react'

interface EmailConfirmationProps {
  onBack: () => void
  className?: string
}

export function EmailConfirmation({ onBack, className }: EmailConfirmationProps) {
  const { t } = useTranslation()

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold">{t('auth.checkEmail')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.verificationSent')}
        </p>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  )
}