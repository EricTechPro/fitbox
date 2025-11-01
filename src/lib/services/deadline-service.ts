import {
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns'
import { DeliveryDay } from '@prisma/client'

export interface DeadlineInfo {
  selectionDeadline: Date
  nextBillingDate: Date
  deliveryDate: Date
  isAfterDeadline: boolean
  timeUntilDeadline: string
}

export class DeadlineService {
  /**
   * Calculate selection deadline based on delivery day
   * Tuesday 6:00 PM for Sunday delivery
   * Saturday 6:00 PM for Wednesday delivery
   */
  static calculateSelectionDeadline(
    deliveryDay: DeliveryDay,
    weekStart: Date
  ): Date {
    const deadline = new Date(weekStart)

    if (deliveryDay === 'SUNDAY') {
      // Tuesday 6:00 PM for Sunday delivery
      deadline.setDate(deadline.getDate() + 2) // Tuesday
    } else {
      // Saturday 6:00 PM for Wednesday delivery
      deadline.setDate(deadline.getDate() + 6) // Saturday
    }

    // Set to 6:00 PM (18:00)
    return setHours(setMinutes(setSeconds(deadline, 0), 0), 18)
  }

  /**
   * Calculate next billing date (Thursday 12:02 AM)
   */
  static calculateNextBillingDate(weekStart: Date): Date {
    const billingDate = new Date(weekStart)
    billingDate.setDate(billingDate.getDate() + 4) // Thursday
    return setHours(setMinutes(setSeconds(billingDate, 2), 2), 0) // 12:02 AM
  }

  /**
   * Calculate delivery date based on delivery day
   */
  static calculateDeliveryDate(
    deliveryDay: DeliveryDay,
    weekStart: Date
  ): Date {
    const deliveryDate = new Date(weekStart)

    if (deliveryDay === 'SUNDAY') {
      deliveryDate.setDate(deliveryDate.getDate()) // Sunday (same as week start)
    } else {
      deliveryDate.setDate(deliveryDate.getDate() + 3) // Wednesday
    }

    // Set to 5:30 PM delivery window start
    return setHours(setMinutes(setSeconds(deliveryDate, 0), 30), 17)
  }

  /**
   * Get comprehensive deadline information for a subscription
   */
  static getDeadlineInfo(
    deliveryDay: DeliveryDay,
    weekStart: Date
  ): DeadlineInfo {
    const now = new Date()
    const selectionDeadline = this.calculateSelectionDeadline(
      deliveryDay,
      weekStart
    )
    const nextBillingDate = this.calculateNextBillingDate(weekStart)
    const deliveryDate = this.calculateDeliveryDate(deliveryDay, weekStart)

    const isAfterDeadline = isAfter(now, selectionDeadline)

    // Calculate time until deadline
    let timeUntilDeadline = ''
    if (!isAfterDeadline) {
      const timeDiff = selectionDeadline.getTime() - now.getTime()
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        timeUntilDeadline = `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`
      } else if (hours > 0) {
        timeUntilDeadline = `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
      } else {
        timeUntilDeadline = `${minutes} minute${minutes !== 1 ? 's' : ''}`
      }
    } else {
      timeUntilDeadline = 'Deadline passed'
    }

    return {
      selectionDeadline,
      nextBillingDate,
      deliveryDate,
      isAfterDeadline,
      timeUntilDeadline,
    }
  }

  /**
   * Check if a subscription needs auto-default meal selection
   */
  static needsAutoSelection(
    deliveryDay: DeliveryDay,
    weekStart: Date
  ): boolean {
    const { isAfterDeadline } = this.getDeadlineInfo(deliveryDay, weekStart)
    return isAfterDeadline
  }

  /**
   * Get the current week start (Monday) for subscription calculations
   */
  static getCurrentWeekStart(): Date {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)

    // Calculate days to subtract to get to Monday (0 = Sunday, 1 = Monday, etc.)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    monday.setDate(monday.getDate() - daysToSubtract)

    // Set to start of day
    return setHours(setMinutes(setSeconds(monday, 0), 0), 0)
  }

  /**
   * Get next week start for future subscriptions
   */
  static getNextWeekStart(): Date {
    const currentWeekStart = this.getCurrentWeekStart()
    return addDays(currentWeekStart, 7)
  }

  /**
   * Format deadline for user display
   */
  static formatDeadline(deadline: Date): string {
    return format(deadline, "EEEE, MMMM do 'at' h:mm a")
  }

  /**
   * Get deadline notification times
   * Notifications sent: 48h, 24h, 6h, 2h before deadline
   */
  static getNotificationTimes(selectionDeadline: Date): Date[] {
    return [
      addDays(selectionDeadline, -2), // 48 hours before
      addDays(selectionDeadline, -1), // 24 hours before
      setHours(
        addDays(selectionDeadline, -1),
        selectionDeadline.getHours() + 12
      ), // 6 hours before
      setHours(selectionDeadline, selectionDeadline.getHours() - 2), // 2 hours before
    ]
  }
}
