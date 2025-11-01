'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cart-store'

export function useCartPersistence() {
  const { data: session, status } = useSession()
  const cartStore = useCartStore()

  // Load cart from API when user session is available
  useEffect(() => {
    if (status === 'loading') return // Still loading session

    if (session?.user) {
      // User is authenticated - load cart from API
      cartStore.loadCart()
    } else {
      // User is not authenticated - clear cart state
      cartStore.setError(null)
      cartStore.setLoading(false)
      // For now, guest carts are not persisted
      // TODO: Implement guest cart persistence with session tokens
    }
  }, [session, status])

  return null
}
