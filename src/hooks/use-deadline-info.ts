'use client'

import { useState, useEffect } from 'react'
import { DeadlineService, DeadlineInfo } from '@/lib/services/deadline-service'
import { DeliveryDay } from '@prisma/client'

export interface UseDeadlineInfoReturn {
  deadlineInfo: DeadlineInfo | null
  isLoading: boolean
  refresh: () => void
}

/**
 * Hook for managing deadline information and real-time updates
 */
export function useDeadlineInfo(
  deliveryDay: DeliveryDay,
  weekStart: Date
): UseDeadlineInfoReturn {
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const calculateDeadlineInfo = () => {
    try {
      const info = DeadlineService.getDeadlineInfo(deliveryDay, weekStart)
      setDeadlineInfo(info)
    } catch (error) {
      console.error('Error calculating deadline info:', error)
      setDeadlineInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    calculateDeadlineInfo()
  }

  useEffect(() => {
    calculateDeadlineInfo()

    // Update deadline info every minute to keep countdown accurate
    const interval = setInterval(() => {
      calculateDeadlineInfo()
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [deliveryDay, weekStart])

  return {
    deadlineInfo,
    isLoading,
    refresh,
  }
}

/**
 * Hook for checking if auto-selection is needed
 */
export function useAutoSelectionStatus(
  deliveryDay: DeliveryDay,
  weekStart: Date,
  hasSelections: boolean
) {
  const { deadlineInfo } = useDeadlineInfo(deliveryDay, weekStart)

  const needsAutoSelection = deadlineInfo?.isAfterDeadline && !hasSelections
  const canModifySelections = deadlineInfo
    ? !deadlineInfo.isAfterDeadline
    : false

  return {
    needsAutoSelection,
    canModifySelections,
    deadlineInfo,
  }
}
