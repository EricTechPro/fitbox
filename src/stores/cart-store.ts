import { create } from 'zustand'
import type { CartState } from '@/types/common'
import { dataAdapter } from '@/lib/data-adapter'

interface CartStore extends CartState {
  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  addItem: (meal: any, quantity: number) => Promise<void>
  updateQuantity: (mealId: string, quantity: number) => Promise<void>
  removeItem: (mealId: string) => Promise<void>
  loadCart: () => Promise<void>
  toggleCart: () => void
  closeCart: () => void
  clearCart: () => Promise<void>
  setDeliveryFee: (fee: number) => void
  // Internal methods
  calculateTotals: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
  isOpen: false,
  isLoading: false,
  error: null,

  // Helper methods
  setError: (error: string | null) => {
    set({ error })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  // Calculate subtotal and total
  calculateTotals: () => {
    const { items, deliveryFee } = get()
    const subtotal = items.reduce(
      (sum, item) => sum + item.meal.price * item.quantity,
      0
    )
    const total = subtotal + deliveryFee

    set({ subtotal, total })
  },

  // Load cart from API
  loadCart: async () => {
    try {
      get().setLoading(true)
      get().setError(null)

      const cartState = await dataAdapter.getCart()

      set({
        items: cartState.items,
        subtotal: cartState.subtotal,
        deliveryFee: cartState.deliveryFee,
        total: cartState.total,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load cart'
      get().setError(errorMessage)
      console.error('Failed to load cart:', error)
    } finally {
      get().setLoading(false)
    }
  },

  // Add item to cart
  addItem: async (meal, quantity) => {
    try {
      get().setLoading(true)
      get().setError(null)

      await dataAdapter.addToCart(meal.id, quantity)

      // Reload cart to get updated state
      await get().loadCart()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add item to cart'
      get().setError(errorMessage)
      console.error('Failed to add item to cart:', error)
    } finally {
      get().setLoading(false)
    }
  },

  // Update item quantity
  updateQuantity: async (mealId, quantity) => {
    try {
      get().setLoading(true)
      get().setError(null)

      await dataAdapter.updateCartItem(mealId, quantity)

      // Reload cart to get updated state
      await get().loadCart()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update cart item'
      get().setError(errorMessage)
      console.error('Failed to update cart item:', error)
    } finally {
      get().setLoading(false)
    }
  },

  // Remove item from cart
  removeItem: async mealId => {
    try {
      get().setLoading(true)
      get().setError(null)

      await dataAdapter.removeFromCart(mealId)

      // Reload cart to get updated state
      await get().loadCart()
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to remove item from cart'
      get().setError(errorMessage)
      console.error('Failed to remove item from cart:', error)
    } finally {
      get().setLoading(false)
    }
  },

  // Clear all items
  clearCart: async () => {
    try {
      get().setLoading(true)
      get().setError(null)

      await dataAdapter.clearCart()

      // Update local state
      set({ items: [], subtotal: 0, total: 0 })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to clear cart'
      get().setError(errorMessage)
      console.error('Failed to clear cart:', error)
    } finally {
      get().setLoading(false)
    }
  },

  // Toggle cart visibility
  toggleCart: () => {
    set(state => ({ isOpen: !state.isOpen }))
  },

  // Close cart
  closeCart: () => {
    set({ isOpen: false })
  },

  // Set delivery fee (called when postal code is validated)
  setDeliveryFee: fee => {
    set({ deliveryFee: fee })
    get().calculateTotals()
  },
}))

// Computed selectors for convenience
export const useCartItemCount = () =>
  useCartStore(state =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )

export const useCartItems = () => useCartStore(state => state.items)
export const useCartTotals = () =>
  useCartStore(state => ({
    subtotal: state.subtotal,
    deliveryFee: state.deliveryFee,
    total: state.total,
  }))
export const useCartIsOpen = () => useCartStore(state => state.isOpen)
