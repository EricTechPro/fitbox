'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { LocalStorageCart } from '@/lib/mock-data/cart-storage'

const cartStorage = new LocalStorageCart()

export function useCartPersistence() {
  const cartStore = useCartStore()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedItems = cartStorage.getItems()
    if (savedItems.length > 0 && cartStore.items.length === 0) {
      // Initialize cart with saved items only if cart is empty
      savedItems.forEach(item => {
        cartStore.addItem(item.meal, item.quantity)
      })
    }
  }, [])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    cartStorage.setItems(cartStore.items)
  }, [cartStore.items])

  return null
}