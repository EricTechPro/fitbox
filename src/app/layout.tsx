import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RootLayout } from '@/components/layout/root-layout'
import '@/lib/init-adapter' // Initialize data adapter

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitBox - Asian Fusion Meal Delivery',
  description:
    'Authentic, healthy Asian fusion cuisine delivered to your door in Greater Vancouver Area',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  )
}
