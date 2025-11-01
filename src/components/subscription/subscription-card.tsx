'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  Clock,
  DollarSign,
  MoreVertical,
  Pause,
  Play,
  Settings,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { DeadlineDisplay } from './deadline-display'

interface SubscriptionCardProps {
  subscription: {
    id: string
    status:
      | 'ACTIVE'
      | 'PAUSED'
      | 'CANCELLED'
      | 'PENDING_CANCELLATION'
      | 'PAYMENT_FAILED'
    deliveryDay: 'SUNDAY' | 'WEDNESDAY'
    billingCycle: 'WEEKLY' | 'MONTHLY'
    bundlePrice: {
      id: string
      mealCount: number
      subscriptionPrice: number
      description: string
    }
    nextBillingDate: Date
    pausedUntil?: Date | null
    autoRenew: boolean
    deadlines: {
      currentWeek: {
        selectionDeadline: Date
        deliveryDate: Date
        isAfterDeadline: boolean
        timeUntilDeadline: string
      }
    }
    mealSelections: {
      currentWeek: any[]
      nextWeek: any[]
    }
    createdAt: Date
  }
  onPause?: (subscriptionId: string) => void
  onResume?: (subscriptionId: string) => void
  onCancel?: (subscriptionId: string) => void
  onManageMeals?: (subscriptionId: string) => void
  onSettings?: (subscriptionId: string) => void
}

export function SubscriptionCard({
  subscription,
  onPause,
  onResume,
  onCancel,
  onManageMeals,
  onSettings,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusInfo = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          variant: 'default' as const,
          label: 'Active',
          description: 'Your subscription is active and running',
        }
      case 'PAUSED':
        return {
          icon: <Pause className="h-4 w-4 text-orange-600" />,
          variant: 'secondary' as const,
          label: 'Paused',
          description: subscription.pausedUntil
            ? `Paused until ${format(new Date(subscription.pausedUntil), 'MMM d, yyyy')}`
            : 'Subscription is paused',
        }
      case 'PENDING_CANCELLATION':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          variant: 'destructive' as const,
          label: 'Pending Cancellation',
          description: 'Will cancel after current billing cycle',
        }
      case 'CANCELLED':
        return {
          icon: <X className="h-4 w-4 text-gray-600" />,
          variant: 'outline' as const,
          label: 'Cancelled',
          description: 'Subscription has been cancelled',
        }
      case 'PAYMENT_FAILED':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          variant: 'destructive' as const,
          label: 'Payment Failed',
          description: 'Please update your payment method',
        }
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          variant: 'outline' as const,
          label: subscription.status,
          description: '',
        }
    }
  }

  const statusInfo = getStatusInfo()
  const hasCurrentWeekSelections =
    subscription.mealSelections.currentWeek.length > 0
  const currentWeekStart = new Date()
  currentWeekStart.setDate(
    currentWeekStart.getDate() - currentWeekStart.getDay()
  )

  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {statusInfo.icon}
              {subscription.bundlePrice.description}
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </CardTitle>
            <CardDescription>{statusInfo.description}</CardDescription>
          </div>

          {(subscription.status === 'ACTIVE' ||
            subscription.status === 'PAUSED') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isLoading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {subscription.status === 'ACTIVE' && onPause && (
                  <DropdownMenuItem
                    onClick={() => handleAction(() => onPause(subscription.id))}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Subscription
                  </DropdownMenuItem>
                )}
                {subscription.status === 'PAUSED' && onResume && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleAction(() => onResume(subscription.id))
                    }
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume Subscription
                  </DropdownMenuItem>
                )}
                {onSettings && (
                  <DropdownMenuItem onClick={() => onSettings(subscription.id)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <Separator className="my-1" />
                {onCancel && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleAction(() => onCancel(subscription.id))
                    }
                    className="text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subscription Details */}
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                ${subscription.bundlePrice.subscriptionPrice.toFixed(2)}
              </p>
              <p className="text-muted-foreground">per week</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{subscription.deliveryDay}s</p>
              <p className="text-muted-foreground">Delivery day</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {subscription.bundlePrice.mealCount} meals
              </p>
              <p className="text-muted-foreground">per week</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Deadline Information - Only show for active subscriptions */}
        {subscription.status === 'ACTIVE' && (
          <DeadlineDisplay
            deliveryDay={subscription.deliveryDay}
            weekStart={currentWeekStart}
            hasSelections={hasCurrentWeekSelections}
          />
        )}

        {/* Payment Failed Alert */}
        {subscription.status === 'PAYMENT_FAILED' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your payment method failed. Please update your payment information
              to continue your subscription.
            </AlertDescription>
          </Alert>
        )}

        {/* Next Billing Information */}
        {(subscription.status === 'ACTIVE' ||
          subscription.status === 'PAUSED') && (
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div>
              <p className="text-sm font-medium">Next Billing Date</p>
              <p className="text-xs text-muted-foreground">
                {format(
                  new Date(subscription.nextBillingDate),
                  "EEEE, MMMM do, yyyy 'at' h:mm a"
                )}
              </p>
            </div>
            {!subscription.autoRenew && (
              <Badge variant="outline" className="text-xs">
                Auto-renew disabled
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {subscription.status === 'ACTIVE' && (
          <div className="flex gap-2">
            {onManageMeals && (
              <Button
                variant="outline"
                onClick={() => onManageMeals(subscription.id)}
                disabled={isLoading}
                className="flex-1"
              >
                Manage Meals
              </Button>
            )}
            {onSettings && (
              <Button
                variant="outline"
                onClick={() => onSettings(subscription.id)}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {subscription.status === 'PAUSED' && onResume && (
          <Button
            onClick={() => handleAction(() => onResume(subscription.id))}
            disabled={isLoading}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Resume Subscription
          </Button>
        )}

        {/* Subscription Start Date */}
        <div className="border-t pt-2 text-xs text-muted-foreground">
          Subscription started{' '}
          {format(new Date(subscription.createdAt), 'MMMM d, yyyy')}
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionCard
