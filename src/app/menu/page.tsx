'use client'

import React from 'react'
import { WeeklyMenu } from '@/components/menu/weekly-menu'
import { dataAdapter } from '@/lib/data-adapter'
import type { WeeklyMenuWithMeals } from '@/types/common'

export default function MenuPage() {
  const [weeklyMenu, setWeeklyMenu] = React.useState<WeeklyMenuWithMeals | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchWeeklyMenu = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const menu = await dataAdapter.getWeeklyMenu()
        setWeeklyMenu(menu)
      } catch (err) {
        console.error('Failed to fetch weekly menu:', err)
        setError('Failed to load menu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeklyMenu()
  }, [])

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8">
        <WeeklyMenu
          weeklyMenu={weeklyMenu}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}