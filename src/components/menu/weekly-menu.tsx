'use client'

import React from 'react'
import { CategoryFilter } from './category-filter'
import { MealGrid } from './meal-grid'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import { useLanguageStore } from '@/stores/language-store'
import type { Meal, MealCategory, WeeklyMenuWithMeals } from '@/types/common'

interface WeeklyMenuProps {
  weeklyMenu: WeeklyMenuWithMeals | null
  isLoading?: boolean
  error?: string | null
}

export function WeeklyMenu({ weeklyMenu, isLoading = false, error = null }: WeeklyMenuProps) {
  const { language } = useLanguageStore()
  const [selectedCategory, setSelectedCategory] = React.useState<MealCategory | 'ALL'>('ALL')

  // Filter meals based on selected category
  const filteredMeals = React.useMemo(() => {
    if (!weeklyMenu || selectedCategory === 'ALL') {
      return weeklyMenu?.meals || []
    }
    return weeklyMenu.meals.filter(meal => meal.category === selectedCategory && meal.isActive)
  }, [weeklyMenu, selectedCategory])

  // Format dates for display
  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    }

    const locale = language === 'en' ? 'en-US' : 'zh-CN'
    const startStr = start.toLocaleDateString(locale, options)
    const endStr = end.toLocaleDateString(locale, options)

    return `${startStr} - ${endStr}`
  }

  return (
    <div className="space-y-8">
      {/* Menu Header */}
      {weeklyMenu && !isLoading && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {language === 'en' ? 'This Week\'s Menu' : '本周菜单'}
              </h1>
              <p className="text-muted-foreground">
                {weeklyMenu.name}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  {formatDateRange(weeklyMenu.weekStart, weeklyMenu.weekEnd)}
                </span>
              </Badge>

              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  {language === 'en' ? 'Fresh Daily' : '每日新鲜'}
                </span>
              </Badge>
            </div>
          </div>

          {/* Menu Description */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Choose from our carefully curated selection of Asian fusion meals, prepared fresh daily with premium ingredients. All meals are portion-controlled and nutritionally balanced.'
                : '从我们精心策划的亚洲融合餐点中选择，每日使用优质食材新鲜制作。所有餐点都经过分量控制和营养平衡。'
              }
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {language === 'en' ? 'Nutritionally Balanced' : '营养均衡'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {language === 'en' ? 'Fresh Ingredients' : '新鲜食材'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {language === 'en' ? 'Portion Controlled' : '分量控制'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {language === 'en' ? 'Asian Fusion' : '亚洲融合'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Meal Grid */}
      <MealGrid
        meals={filteredMeals}
        isLoading={isLoading}
        error={error}
      />

      {/* Delivery Information */}
      {weeklyMenu && !isLoading && (
        <div className="mt-12 bg-primary/5 rounded-lg p-6">
          <h3 className="font-semibold mb-3">
            {language === 'en' ? 'Delivery Information' : '配送信息'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">
                {language === 'en' ? 'Delivery Days' : '配送日期'}
              </p>
              <p>
                {language === 'en'
                  ? 'Sunday & Wednesday, 5:30-10:00 PM'
                  : '周日和周三，下午5:30-10:00'
                }
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                {language === 'en' ? 'Order Deadline' : '订购截止时间'}
              </p>
              <p>
                {language === 'en'
                  ? 'Tuesday 6:00 PM (Sunday delivery) • Saturday 6:00 PM (Wednesday delivery)'
                  : '周二下午6:00（周日配送）• 周六下午6:00（周三配送）'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}