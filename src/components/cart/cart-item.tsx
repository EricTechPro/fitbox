'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useTranslation, translationPaths } from '@/hooks/useTranslation'
import type { CartItem } from '@/types/common'

interface CartItemProps {
  item: CartItem
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const { t, tf, allergen, lang } = useTranslation()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.meal.id)
    } else if (newQuantity <= item.meal.inventory) {
      updateQuantity(item.meal.id, newQuantity)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    handleQuantityChange(value)
  }

  const itemTotal = item.meal.price * item.quantity

  return (
    <div className="flex space-x-4 py-3">
      {/* Meal Image */}
      <div className="flex-shrink-0">
        <div className="relative h-16 w-16 rounded-lg overflow-hidden">
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
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none truncate">
            {lang.isEnglish ? item.meal.name : item.meal.nameZh}
          </h4>
          <p className="text-xs text-muted-foreground">
            ${item.meal.price.toFixed(2)} {t(translationPaths.cart.each)}
          </p>

          {/* Allergens */}
          {item.meal.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.meal.allergens.slice(0, 2).map((allergenName) => (
                <Badge key={allergenName} variant="secondary" className="text-xs">
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
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={t(translationPaths.actions.decrease)}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              value={item.quantity}
              onChange={handleInputChange}
              className="w-12 h-7 text-center text-xs"
              min={1}
              max={item.meal.inventory}
            />

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.meal.inventory}
              aria-label={t(translationPaths.actions.increase)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              ${itemTotal.toFixed(2)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => removeItem(item.meal.id)}
              aria-label={t(translationPaths.cart.remove)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Inventory Warning */}
        {item.quantity >= item.meal.inventory && (
          <p className="text-xs text-orange-600 mt-1">
            {tf(translationPaths.cart.onlyAvailable, { count: item.meal.inventory })}
          </p>
        )}
      </div>
    </div>
  )
}