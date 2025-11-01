'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Check, Zap, Star, Users } from 'lucide-react'

interface BundlePrice {
  id: string
  mealCount: number
  description: string
  oneTimePrice: number
  subscriptionPrice: number
  recommendedPrice: number
  discount: {
    amount: number
    percentage: number
  } | null
  pricePerMeal: number
}

interface BundleSelectorProps {
  orderType: 'ONE_TIME' | 'SUBSCRIPTION'
  selectedBundleId?: string
  onBundleSelect: (bundleId: string) => void
  className?: string
}

export function BundleSelector({
  orderType,
  selectedBundleId,
  onBundleSelect,
  className,
}: BundleSelectorProps) {
  const [bundles, setBundles] = useState<BundlePrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBundles()
  }, [orderType])

  const fetchBundles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/bundles?orderType=${orderType}`)
      const data = await response.json()

      if (data.success) {
        setBundles(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to load bundle options')
    } finally {
      setIsLoading(false)
    }
  }

  const getPopularityInfo = (mealCount: number) => {
    if (mealCount === 8) {
      return {
        label: 'Most Popular',
        icon: <Star className="h-3 w-3" />,
        variant: 'default' as const,
      }
    }
    if (mealCount === 6) {
      return {
        label: 'Great Starter',
        icon: <Users className="h-3 w-3" />,
        variant: 'secondary' as const,
      }
    }
    if (mealCount === 12) {
      return {
        label: 'Best Value',
        icon: <Zap className="h-3 w-3" />,
        variant: 'outline' as const,
      }
    }
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Choose Your Bundle</CardTitle>
          <CardDescription>Loading bundle options...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Choose Your Bundle</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchBundles} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Choose Your Bundle
          {orderType === 'SUBSCRIPTION' && (
            <Badge variant="secondary" className="ml-2">
              <Zap className="mr-1 h-3 w-3" />
              5% Off
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {orderType === 'SUBSCRIPTION'
            ? 'Save 5% with a weekly subscription. Cancel or pause anytime.'
            : 'Perfect for trying our meals or occasional orders.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <RadioGroup value={selectedBundleId} onValueChange={onBundleSelect}>
          <div className="space-y-4">
            {bundles.map(bundle => {
              const popularityInfo = getPopularityInfo(bundle.mealCount)
              const isSelected = selectedBundleId === bundle.id

              return (
                <div key={bundle.id} className="relative">
                  <Label
                    htmlFor={bundle.id}
                    className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? 'bg-primary/5 border-primary'
                        : 'hover:border-primary/50 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={bundle.id}
                          id={bundle.id}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="font-semibold">
                              {bundle.mealCount} Meals
                            </p>
                            {popularityInfo && (
                              <Badge
                                variant={popularityInfo.variant}
                                className="text-xs"
                              >
                                {popularityInfo.icon}
                                {popularityInfo.label}
                              </Badge>
                            )}
                          </div>

                          <p className="mb-2 text-sm text-muted-foreground">
                            {bundle.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="font-medium">
                                ${bundle.pricePerMeal.toFixed(2)}
                              </span>
                              <span className="text-muted-foreground">
                                {' '}
                                per meal
                              </span>
                            </div>

                            {orderType === 'SUBSCRIPTION' &&
                              bundle.discount && (
                                <div className="text-green-600">
                                  <span className="font-medium">
                                    Save ${bundle.discount.amount.toFixed(2)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {' '}
                                    ({bundle.discount.percentage}%)
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${bundle.recommendedPrice.toFixed(2)}
                        </div>

                        {orderType === 'SUBSCRIPTION' && (
                          <div className="text-sm text-muted-foreground line-through">
                            ${bundle.oneTimePrice.toFixed(2)}
                          </div>
                        )}

                        <div className="mt-1 text-xs text-muted-foreground">
                          {orderType === 'SUBSCRIPTION'
                            ? 'per week'
                            : 'one-time'}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute right-2 top-2">
                        <div className="rounded-full bg-primary p-1 text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </Label>
                </div>
              )
            })}
          </div>
        </RadioGroup>

        {orderType === 'SUBSCRIPTION' && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">
              Subscription Benefits
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-blue-600" />
                5% discount on all orders
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-blue-600" />
                Priority access to new meals
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-blue-600" />
                Flexible pause and cancellation
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-blue-600" />
                Automatic weekly billing
              </li>
            </ul>
          </div>
        )}

        <Separator className="my-6" />

        <div className="text-xs text-muted-foreground">
          <p>• Delivery available Sunday & Wednesday, 5:30-10:00 PM</p>
          <p>• Greater Vancouver Area only</p>
          <p>• Free insulated bag for 5+ meal orders</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BundleSelector
