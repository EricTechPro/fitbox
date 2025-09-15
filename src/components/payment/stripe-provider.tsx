'use client'

import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Mock Stripe publishable key for development
// In production, this would come from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key_for_development')

interface StripeProviderProps {
  children: React.ReactNode
  amount?: number // Amount in cents
}

export function StripeProvider({ children, amount = 0 }: StripeProviderProps) {
  const options = {
    mode: 'payment' as const,
    amount: amount,
    currency: 'cad',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'hsl(222.2 84% 4.9%)', // Match shadcn/ui primary color
        colorBackground: 'hsl(0 0% 100%)',
        colorText: 'hsl(222.2 84% 4.9%)',
        colorDanger: 'hsl(0 84.2% 60.2%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}