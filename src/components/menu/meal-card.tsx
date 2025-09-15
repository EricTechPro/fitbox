'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, Info } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import type { Meal } from '@/types/common'

interface MealCardProps {
  meal: Meal
  isLoading?: boolean
}

export function MealCard({ meal, isLoading = false }: MealCardProps) {
  const { addItem } = useCartStore()
  const { t, tf, allergen, lang } = useTranslation()
  const [imageLoading, setImageLoading] = React.useState(true)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  const handleAddToCart = () => {
    addItem(meal, 1)
  }

  if (isLoading) {
    return <MealCardSkeleton />
  }

  const mealName = lang.isEnglish ? meal.name : meal.nameZh
  const mealDescription = lang.isEnglish ? meal.description : meal.descriptionZh

  return (
    <Card className="w-full max-w-sm mx-auto group hover:shadow-md transition-shadow duration-200" data-testid="meal-card">
      <CardHeader className="pb-3">
        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
          {imageLoading && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <Image
            src={meal.imageUrl}
            alt={mealName}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {meal.featured && (
            <Badge className="absolute top-2 left-2" variant="destructive">
              {t(translationPaths.actions.featured)}
            </Badge>
          )}
          {meal.isSpicy && (
            <div className="absolute top-2 right-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <CardTitle className="text-lg font-semibold leading-tight">
            <span lang={lang.isEnglish ? 'en' : 'zh'}>
              {mealName}
            </span>
          </CardTitle>
          <CardDescription className="mt-1 text-sm line-clamp-2">
            {mealDescription}
          </CardDescription>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${meal.price.toFixed(2)}
          </span>
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4 mr-1" />
                {t(translationPaths.actions.details)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle lang={lang.isEnglish ? 'en' : 'zh'}>
                  {mealName}
                </DialogTitle>
                <DialogDescription>
                  {lang.isEnglish ? meal.name : meal.nameZh}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src={meal.imageUrl}
                    alt={mealName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {mealDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {t(translationPaths.nutrition.nutritionalInfo)}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>{t(translationPaths.nutrition.calories)}: {meal.calories}</div>
                    <div>{t(translationPaths.nutrition.protein)}: {meal.protein}g</div>
                    <div>{t(translationPaths.nutrition.carbs)}: {meal.carbs}g</div>
                    <div>{t(translationPaths.nutrition.fat)}: {meal.fat}g</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {t(translationPaths.nutrition.ingredients)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {meal.ingredients}
                  </p>
                </div>
                {meal.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t(translationPaths.nutrition.allergens)}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {meal.allergens.map((allergenName) => (
                        <Badge key={allergenName} variant="secondary">
                          {allergen(allergenName)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAddToCart} className="w-full" disabled={meal.inventory === 0}>
                  {meal.inventory === 0
                    ? t(translationPaths.actions.outOfStock)
                    : `${t(translationPaths.actions.addToCart)} - $${meal.price.toFixed(2)}`
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Allergens */}
        {meal.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meal.allergens.slice(0, 3).map((allergenName) => (
              <Badge key={allergenName} variant="outline" className="text-xs">
                {allergen(allergenName)}
              </Badge>
            ))}
            {meal.allergens.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{meal.allergens.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Inventory warning */}
        {meal.inventory <= 5 && meal.inventory > 0 && (
          <p className="text-xs text-orange-600">
            {tf(translationPaths.cart.onlyLeft, { count: meal.inventory })}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={meal.inventory === 0}
        >
          {meal.inventory === 0
            ? t(translationPaths.actions.outOfStock)
            : t(translationPaths.actions.addToCart)
          }
        </Button>
      </CardFooter>
    </Card>
  )
}

export function MealCardSkeleton() {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="pb-3">
        <Skeleton className="aspect-video w-full rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}