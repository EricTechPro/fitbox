'use client'

import React from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { CartSidebar } from '../cart/cart-sidebar'
import { useCartPersistence } from '@/hooks/use-cart-persistence'

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  // Initialize cart persistence
  useCartPersistence()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </div>
  )
}