'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutForm } from '@/components/payment/checkout-form'
import { StripeProvider } from '@/components/payment/stripe-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { useCartTotals } from '@/stores/cart-store'
import { useLanguageStore } from '@/stores/language-store'

export default function CheckoutPage() {
  const router = useRouter()
  const { total } = useCartTotals()
  const { language } = useLanguageStore()
  const [orderSuccess, setOrderSuccess] = React.useState(false)
  const [orderData, setOrderData] = React.useState<any>(null)

  const handleOrderSuccess = (data: any) => {
    setOrderData(data)
    setOrderSuccess(true)
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              {language === 'en' ? 'Order Confirmed!' : '订单已确认！'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Thank you for your order. You\'ll receive a confirmation email shortly.'
                : '感谢您的订单。您将很快收到确认邮件。'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {language === 'en' ? 'Order Details:' : '订单详情：'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Order Total: ' : '订单总额：'}
                    <span className="font-medium">${orderData?.total.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Delivery Date: ' : '配送日期：'}
                    <span className="font-medium">
                      {orderData?.deliveryDate === 'sunday'
                        ? (language === 'en' ? 'Sunday' : '周日')
                        : (language === 'en' ? 'Wednesday' : '周三')
                      }
                    </span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <button
                onClick={() => router.push('/menu')}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                {language === 'en' ? 'Order Again' : '再次订购'}
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 transition-colors"
              >
                {language === 'en' ? 'Back to Home' : '返回首页'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {language === 'en' ? 'Checkout' : '结账'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Complete your order and enjoy fresh meals delivered to your door.'
                : '完成您的订单，享受新鲜餐点送到您的家门口。'
              }
            </p>
          </div>

          <StripeProvider amount={Math.round(total * 100)}>
            <CheckoutForm onSuccess={handleOrderSuccess} />
          </StripeProvider>
        </div>
      </div>
    </div>
  )
}