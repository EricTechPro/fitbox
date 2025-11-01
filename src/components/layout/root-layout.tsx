'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Header } from './header'
import { Footer } from './footer'
import { CartSidebar } from '../cart/cart-sidebar'
import { useCartPersistence } from '@/hooks/use-cart-persistence'

interface RootLayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: RootLayoutProps) {
  // Initialize cart persistence inside SessionProvider
  useCartPersistence()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  )
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <SessionProvider>
      <LayoutContent>{children}</LayoutContent>
    </SessionProvider>
  )
}
