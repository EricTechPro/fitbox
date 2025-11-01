'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import type { CartItem as CartItemType } from '@/types/common'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCartStore()
  const { t, tf, allergen, lang } = useTranslation()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      if (newQuantity <= 0) {
        await removeItem(item.meal.id)
      } else if (newQuantity <= item.meal.inventory) {
        await updateQuantity(item.meal.id, newQuantity)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    await handleQuantityChange(value)
  }

  const handleRemove = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await removeItem(item.meal.id)
    } finally {
      setIsUpdating(false)
    }
  }

  const itemTotal = item.meal.price * item.quantity

  return (
    <div className="flex space-x-4 py-3">
      {/* Meal Image */}
      <div className="flex-shrink-0">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg">
          <Image
            src={item.meal.imageUrl}
            alt={item.meal.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      </div>

      {/* Meal Details */}
      <div className="min-w-0 flex-1">
        <div className="space-y-1">
          <h4 className="truncate text-sm font-medium leading-none">
            {lang.isEnglish ? item.meal.name : item.meal.nameZh}
          </h4>
          <p className="text-xs text-muted-foreground">
            ${item.meal.price.toFixed(2)} {t(translationPaths.cart.each)}
          </p>

          {/* Allergens */}
          {item.meal.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.meal.allergens.slice(0, 2).map(allergenName => (
                <Badge
                  key={allergenName}
                  variant="secondary"
                  className="text-xs"
                >
                  {allergen(allergenName)}
                </Badge>
              ))}
              {item.meal.allergens.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.meal.allergens.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating || isLoading}
              aria-label={t(translationPaths.actions.decrease)}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </Button>

            <Input
              type="number"
              value={item.quantity}
              onChange={handleInputChange}
              className="h-7 w-12 text-center text-xs"
              min={1}
              max={item.meal.inventory}
              disabled={isUpdating || isLoading}
            />

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={
                item.quantity >= item.meal.inventory || isUpdating || isLoading
              }
              aria-label={t(translationPaths.actions.increase)}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">${itemTotal.toFixed(2)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={isUpdating || isLoading}
              aria-label={t(translationPaths.cart.remove)}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Inventory Warning */}
        {item.quantity >= item.meal.inventory && (
          <p className="mt-1 text-xs text-orange-600">
            {tf(translationPaths.cart.onlyAvailable, {
              count: item.meal.inventory,
            })}
          </p>
        )}
      </div>
    </div>
  )
}
