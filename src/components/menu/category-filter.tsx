'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguageStore } from '@/stores/language-store'
import type { MealCategory } from '@/types/common'

interface CategoryFilterProps {
  selectedCategory: MealCategory | 'ALL'
  onCategoryChange: (category: MealCategory | 'ALL') => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { language } = useLanguageStore()

  const categories = [
    {
      value: 'ALL' as const,
      label: language === 'en' ? 'All Meals' : '所有餐点',
      count: 0 // This would be calculated from actual data
    },
    {
      value: 'RICE_BASED' as const,
      label: language === 'en' ? 'Rice-Based' : '米饭类',
      count: 0
    },
    {
      value: 'NOODLE_SOUPS' as const,
      label: language === 'en' ? 'Noodle Soups' : '面条汤类',
      count: 0
    },
    {
      value: 'PASTA_FUSION' as const,
      label: language === 'en' ? 'Pasta Fusion' : '意面融合',
      count: 0
    },
    {
      value: 'PROTEIN_SIDES' as const,
      label: language === 'en' ? 'Protein & Sides' : '蛋白质配菜',
      count: 0
    }
  ]

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          {language === 'en' ? 'Browse by Category' : '按类别浏览'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Filter our weekly menu by your favorite meal types'
            : '按您喜欢的餐点类型筛选我们的每周菜单'
          }
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="truncate">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}