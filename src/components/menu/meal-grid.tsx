'use client'

import React from 'react'
import { MealCard, MealCardSkeleton } from './meal-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useLanguageStore } from '@/stores/language-store'
import type { Meal } from '@/types/common'

interface MealGridProps {
  meals: Meal[]
  isLoading?: boolean
  error?: string | null
}

export function MealGrid({ meals, isLoading = false, error = null }: MealGridProps) {
  const { language } = useLanguageStore()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {language === 'en'
            ? 'Unable to load meals. Please try again later.'
            : '无法加载餐点。请稍后再试。'
          }
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <MealCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">
            {language === 'en' ? 'No meals found' : '未找到餐点'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {language === 'en'
              ? 'No meals match your current filter. Try selecting a different category or check back later for new options.'
              : '没有符合当前筛选条件的餐点。尝试选择不同的类别或稍后查看新选项。'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  )
}