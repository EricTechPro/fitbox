'use client'

import React from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLanguageStore } from '@/stores/language-store'

export function StripePaymentElement() {
  const stripe = useStripe()
  const elements = useElements()
  const { language } = useLanguageStore()

  // Mock implementation for development
  // In production, this would integrate with real Stripe Elements
  const isMockMode = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'pk_test_mock_key_for_development'

  if (isMockMode) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            {language === 'en'
              ? '🚧 Development Mode: Mock payment form (Stripe not configured)'
              : '🚧 开发模式：模拟支付表单（未配置Stripe）'
            }
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {language === 'en' ? 'Card Number' : '卡号'}
              </label>
              <div className="h-10 border rounded-md bg-background p-3 text-sm text-muted-foreground">
                4242 4242 4242 4242
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {language === 'en' ? 'Expiry' : '有效期'}
                </label>
                <div className="h-10 border rounded-md bg-background p-3 text-sm text-muted-foreground">
                  12/25
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">CVC</label>
                <div className="h-10 border rounded-md bg-background p-3 text-sm text-muted-foreground">
                  123
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {language === 'en'
            ? '💳 This is a mock payment form. No real payment will be processed.'
            : '💳 这是模拟支付表单。不会处理真实支付。'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      <p className="text-xs text-muted-foreground">
        {language === 'en'
          ? '🔒 Your payment information is encrypted and secure'
          : '🔒 您的支付信息已加密且安全'
        }
      </p>
    </div>
  )
}