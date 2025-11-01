'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { DeadlineService, DeadlineInfo } from '@/lib/services/deadline-service'
import { DeliveryDay } from '@prisma/client'

interface DeadlineDisplayProps {
  deliveryDay: DeliveryDay
  weekStart: Date
  hasSelections: boolean
  className?: string
}

export function DeadlineDisplay({
  deliveryDay,
  weekStart,
  hasSelections,
  className,
}: DeadlineDisplayProps) {
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update deadline info when props change
    const info = DeadlineService.getDeadlineInfo(deliveryDay, weekStart)
    setDeadlineInfo(info)

    // Update current time every minute to keep countdown accurate
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      const updatedInfo = DeadlineService.getDeadlineInfo(
        deliveryDay,
        weekStart
      )
      setDeadlineInfo(updatedInfo)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [deliveryDay, weekStart])

  if (!deadlineInfo) {
    return null
  }

  const getStatusInfo = () => {
    if (hasSelections) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        variant: 'success' as const,
        title: 'Meals Selected',
        description: 'Your meals are confirmed for this week',
      }
    }

    if (deadlineInfo.isAfterDeadline) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        variant: 'destructive' as const,
        title: 'Deadline Passed',
        description: 'Auto-selection will apply recommended meals',
      }
    }

    // Determine urgency based on time remaining
    const hoursRemaining =
      (deadlineInfo.selectionDeadline.getTime() - currentTime.getTime()) /
      (1000 * 60 * 60)

    if (hoursRemaining <= 2) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        variant: 'destructive' as const,
        title: 'Urgent: Select Soon',
        description: 'Less than 2 hours remaining',
      }
    }

    if (hoursRemaining <= 6) {
      return {
        icon: <Clock className="h-4 w-4 text-orange-600" />,
        variant: 'warning' as const,
        title: 'Select Your Meals',
        description: 'Deadline approaching soon',
      }
    }

    return {
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      variant: 'default' as const,
      title: 'Selection Open',
      description: 'Choose your meals for this week',
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {statusInfo.icon}
            {statusInfo.title}
          </CardTitle>
          <Badge
            variant={
              statusInfo.variant === 'success'
                ? 'default'
                : statusInfo.variant === 'destructive'
                  ? 'destructive'
                  : statusInfo.variant === 'warning'
                    ? 'secondary'
                    : 'outline'
            }
          >
            {deliveryDay === 'SUNDAY'
              ? 'Sunday Delivery'
              : 'Wednesday Delivery'}
          </Badge>
        </div>
        <CardDescription>{statusInfo.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deadline Information */}
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="font-medium text-muted-foreground">
              Selection Deadline
            </p>
            <p className="font-mono">
              {DeadlineService.formatDeadline(deadlineInfo.selectionDeadline)}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Delivery Date</p>
            <p className="font-mono">
              {DeadlineService.formatDeadline(deadlineInfo.deliveryDate)}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Billing Date</p>
            <p className="font-mono">
              {DeadlineService.formatDeadline(deadlineInfo.nextBillingDate)}
            </p>
          </div>
        </div>

        {/* Time Remaining / Status */}
        {!hasSelections && (
          <Alert
            variant={
              statusInfo.variant === 'destructive' ? 'destructive' : 'default'
            }
          >
            <AlertDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {deadlineInfo.isAfterDeadline ? (
                <span>
                  Selection deadline has passed. Our system will automatically
                  select balanced meals for your delivery based on popular
                  choices.
                </span>
              ) : (
                <span>
                  <strong>{deadlineInfo.timeUntilDeadline}</strong> remaining to
                  select your meals.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-selection Notice */}
        {deadlineInfo.isAfterDeadline && !hasSelections && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="mb-1 font-medium text-blue-900">
              Auto-Selection Active
            </h4>
            <p className="text-sm text-blue-800">
              Since you missed the selection deadline, we&apos;ve automatically
              chosen a balanced variety of our most popular meals for your
              delivery. You can still modify your selections until your order is
              prepared.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DeadlineDisplay
