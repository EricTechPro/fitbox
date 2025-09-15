import { create } from 'zustand'
import type { CartItem, CartState } from '@/types/common'

interface CartStore extends CartState {
  // Actions
  addItem: (meal: any, quantity: number) => void
  updateQuantity: (mealId: string, quantity: number) => void
  removeItem: (mealId: string) => void
  toggleCart: () => void
  closeCart: () => void
  clearCart: () => void
  setDeliveryFee: (fee: number) => void
  // Internal methods
  calculateTotals: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
  isOpen: false,

  // Calculate subtotal and total
  calculateTotals: () => {
    const { items, deliveryFee } = get()
    const subtotal = items.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0)
    const total = subtotal + deliveryFee

    set({ subtotal, total })
  },

  // Add item to cart
  addItem: (meal, quantity) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(item => item.meal.id === meal.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += quantity
        return { items: updatedItems }
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart-${meal.id}-${Date.now()}`,
          meal,
          quantity,
          addedAt: new Date()
        }
        return { items: [...state.items, newItem] }
      }
    })
    get().calculateTotals()
  },

  // Update item quantity
  updateQuantity: (mealId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return { items: state.items.filter(item => item.meal.id !== mealId) }
      } else {
        // Update quantity
        const updatedItems = state.items.map(item =>
          item.meal.id === mealId
            ? { ...item, quantity }
            : item
        )
        return { items: updatedItems }
      }
    })
    get().calculateTotals()
  },

  // Remove item from cart
  removeItem: (mealId) => {
    set((state) => ({
      items: state.items.filter(item => item.meal.id !== mealId)
    }))
    get().calculateTotals()
  },

  // Toggle cart visibility
  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }))
  },

  // Close cart
  closeCart: () => {
    set({ isOpen: false })
  },

  // Clear all items
  clearCart: () => {
    set({ items: [], subtotal: 0, total: 0 })
  },

  // Set delivery fee (called when postal code is validated)
  setDeliveryFee: (fee) => {
    set({ deliveryFee: fee })
    get().calculateTotals()
  }
}))

// Computed selectors for convenience
export const useCartItemCount = () => useCartStore((state) =>
  state.items.reduce((total, item) => total + item.quantity, 0)
)

export const useCartItems = () => useCartStore((state) => state.items)
export const useCartTotals = () => useCartStore((state) => ({
  subtotal: state.subtotal,
  deliveryFee: state.deliveryFee,
  total: state.total
}))
export const useCartIsOpen = () => useCartStore((state) => state.isOpen)