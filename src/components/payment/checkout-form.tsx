'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, CreditCard, MapPin, Calendar } from 'lucide-react'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations/checkout'
import { validatePostalCode, formatPostalCode } from '@/lib/mock-data/postal-validation'
import { useLanguageStore } from '@/stores/language-store'
import { useCartStore, useCartItems, useCartTotals } from '@/stores/cart-store'
import { StripePaymentElement } from './stripe-payment-element'
import type { DeliveryValidation } from '@/types/common'

interface CheckoutFormProps {
  onSuccess?: (orderData: any) => void
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { language } = useLanguageStore()
  const { setDeliveryFee, clearCart } = useCartStore()
  const cartItems = useCartItems()
  const { subtotal, deliveryFee, total } = useCartTotals()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [postalValidation, setPostalValidation] = React.useState<DeliveryValidation | null>(null)
  const [paymentError, setPaymentError] = React.useState<string | null>(null)

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      province: 'BC',
      postalCode: '',
      deliveryDate: 'sunday',
      deliveryInstructions: '',
      acceptTerms: false,
      marketingEmails: false,
    },
  })

  // Watch postal code changes for validation
  const postalCode = form.watch('postalCode')

  React.useEffect(() => {
    if (postalCode && postalCode.length >= 6) {
      const validation = validatePostalCode(postalCode)
      setPostalValidation(validation)
      if (validation.isValid) {
        setDeliveryFee(validation.deliveryFee)
        // Format the postal code
        form.setValue('postalCode', formatPostalCode(postalCode))
      } else {
        setDeliveryFee(0)
      }
    }
  }, [postalCode, setDeliveryFee, form])

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      setPaymentError(language === 'en' ? 'Your cart is empty' : '您的购物车是空的')
      return
    }

    if (!postalValidation?.isValid) {
      setPaymentError(language === 'en' ? 'Please enter a valid delivery postal code' : '请输入有效的配送邮政编码')
      return
    }

    setIsSubmitting(true)
    setPaymentError(null)

    try {
      // Mock payment processing - in real implementation, this would process with Stripe
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create mock order
      const orderData = {
        ...data,
        items: cartItems,
        subtotal,
        deliveryFee,
        total,
      }

      // Clear cart on successful order
      clearCart()

      // Call success callback
      onSuccess?.(orderData)

    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentError(
        language === 'en'
          ? 'Payment failed. Please try again.'
          : '支付失败。请重试。'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            {language === 'en' ? 'Your cart is empty. Add some meals to continue.' : '您的购物车是空的。添加一些餐点以继续。'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>{language === 'en' ? 'Order Summary' : '订单摘要'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Review your order before checkout' : '结账前检查您的订单'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>
                  {item.quantity}x {language === 'en' ? item.meal.name : item.meal.nameZh}
                </span>
                <span>${(item.meal.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{language === 'en' ? 'Subtotal' : '小计'}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{language === 'en' ? 'Delivery Fee' : '配送费'}</span>
              <span>
                {deliveryFee === 0 ? (language === 'en' ? 'Free' : '免费') : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{language === 'en' ? 'Total' : '总计'}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Customer Information' : '客户信息'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? 'Full Name' : '全名'}</FormLabel>
                      <FormControl>
                        <Input placeholder={language === 'en' ? 'Enter your full name' : '输入您的全名'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? 'Email' : '电子邮件'}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={language === 'en' ? 'Enter your email' : '输入您的电子邮件'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'en' ? 'Phone Number' : '电话号码'}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'en' ? '(604) 123-4567' : '(604) 123-4567'} {...field} />
                    </FormControl>
                    <FormDescription>
                      {language === 'en' ? 'We\'ll use this to contact you about your delivery' : '我们将使用此号码联系您关于配送事宜'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{language === 'en' ? 'Delivery Address' : '配送地址'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="streetLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'en' ? 'Street Address' : '街道地址'}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'en' ? '123 Main Street' : '123 主街'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'en' ? 'Apartment, suite, etc. (optional)' : '公寓、套房等（可选）'}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'en' ? 'Apt 101' : '公寓 101'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? 'City' : '城市'}</FormLabel>
                      <FormControl>
                        <Input placeholder={language === 'en' ? 'Vancouver' : '温哥华'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? 'Province' : '省份'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BC">BC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? 'Postal Code' : '邮政编码'}</FormLabel>
                      <FormControl>
                        <Input placeholder="V6B 1A1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Postal Code Validation */}
              {postalValidation && (
                <Alert variant={postalValidation.isValid ? 'default' : 'destructive'}>
                  <AlertDescription>
                    {postalValidation.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{language === 'en' ? 'Delivery Options' : '配送选项'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'en' ? 'Delivery Date' : '配送日期'}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sunday">
                          {language === 'en' ? 'Sunday (5:30-10:00 PM)' : '周日（下午5:30-10:00）'}
                        </SelectItem>
                        <SelectItem value="wednesday">
                          {language === 'en' ? 'Wednesday (5:30-10:00 PM)' : '周三（下午5:30-10:00）'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'en' ? 'Delivery Instructions (optional)' : '配送说明（可选）'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'en' ? 'Leave at door, buzz apartment 101, etc.' : '放在门口，按公寓101等。'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Payment Method' : '支付方式'}</CardTitle>
              <CardDescription>
                {language === 'en' ? 'All payments are processed securely by Stripe' : '所有支付均由Stripe安全处理'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StripePaymentElement />
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {language === 'en' ? 'I accept the ' : '我接受'}
                        <span className="text-primary underline cursor-pointer">
                          {language === 'en' ? 'Terms of Service' : '服务条款'}
                        </span>
                        {language === 'en' ? ' and ' : '和'}
                        <span className="text-primary underline cursor-pointer">
                          {language === 'en' ? 'Privacy Policy' : '隐私政策'}
                        </span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {language === 'en'
                          ? 'I would like to receive promotional emails and updates'
                          : '我希望收到促销邮件和更新'
                        }
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Error */}
          {paymentError && (
            <Alert variant="destructive">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !postalValidation?.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'en' ? 'Processing...' : '处理中...'}
              </>
            ) : (
              `${language === 'en' ? 'Place Order' : '下订单'} - $${total.toFixed(2)}`
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}