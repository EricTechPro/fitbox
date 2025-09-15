'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ArrowRight, Utensils } from 'lucide-react'
import { MealCard, MealCardSkeleton } from '../menu/meal-card'
import { useLanguageStore } from '@/stores/language-store'
import { dataAdapter } from '@/lib/data-adapter'
import type { Meal } from '@/types/common'

export function FeaturedMeals() {
  const { language } = useLanguageStore()
  const [featuredMeals, setFeaturedMeals] = React.useState<Meal[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchFeaturedMeals = async () => {
      try {
        setIsLoading(true)
        const weeklyMenu = await dataAdapter.getWeeklyMenu()
        // Get featured meals or first 4 meals
        const featured = weeklyMenu.meals
          .filter(meal => meal.featured || meal.isActive)
          .slice(0, 4)
        setFeaturedMeals(featured)
      } catch (err) {
        console.error('Failed to fetch featured meals:', err)
        setError('Failed to load featured meals')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedMeals()
  }, [])

  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mx-auto">
              <Utensils className="mr-1 h-3 w-3" />
              {language === 'en' ? 'This Week\'s Highlights' : '本周精选'}
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight">
              {language === 'en' ? 'Featured Meals' : '精选餐点'}
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'en'
                ? 'Discover our chef\'s weekly recommendations. Each meal is carefully crafted with premium ingredients and authentic flavors.'
                : '发现我们厨师的每周推荐。每道餐点都使用优质食材和正宗口味精心制作。'
              }
            </p>
          </div>

          {/* Featured Meals Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <MealCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {language === 'en' ? 'Unable to load featured meals' : '无法加载精选餐点'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>

              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden">
                <ScrollArea className="w-full">
                  <div className="flex space-x-4 p-1">
                    {featuredMeals.map((meal) => (
                      <div key={meal.id} className="shrink-0 w-72">
                        <MealCard meal={meal} />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </>
          )}

          {/* Call to Action */}
          <div className="text-center pt-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/menu">
                {language === 'en' ? 'View Full Menu' : '查看完整菜单'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}