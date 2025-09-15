'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Menu, ShoppingCart, Globe, User } from 'lucide-react'
import { useLanguageStore } from '@/stores/language-store'
import { useCartStore, useCartItemCount } from '@/stores/cart-store'
import { cn } from '@/lib/utils'

export function Header() {
  const { language, toggleLanguage } = useLanguageStore()
  const { toggleCart } = useCartStore()
  const cartItemCount = useCartItemCount()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navigationItems = [
    {
      title: language === 'en' ? 'Menu' : '菜单',
      href: '/menu',
      description: language === 'en' ? 'Browse our weekly meal selection' : '浏览本周餐点选择'
    },
    {
      title: language === 'en' ? 'How It Works' : '使用方法',
      href: '/how-it-works',
      description: language === 'en' ? 'Learn about our meal delivery service' : '了解我们的送餐服务'
    },
    {
      title: language === 'en' ? 'About' : '关于我们',
      href: '/about',
      description: language === 'en' ? 'Our story and mission' : '我们的故事和使命'
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">FB</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            FitBox
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="hidden sm:flex"
            aria-label={`Switch to ${language === 'en' ? 'Chinese' : 'English'}`}
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">Switch language</span>
          </Button>

          {/* Cart */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCart}
            className="relative"
            aria-label={`Shopping cart with ${cartItemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                variant="destructive"
                data-testid="cart-badge"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Shopping cart</span>
          </Button>

          {/* User Account - Mock for now */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {language === 'en' ? 'Guest User' : '访客用户'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {language === 'en' ? 'Sign in to save preferences' : '登录以保存偏好设置'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {language === 'en' ? 'Sign In' : '登录'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {language === 'en' ? 'Create Account' : '创建账户'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {language === 'en' ? 'Order History' : '订单历史'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {language === 'en' ? 'Settings' : '设置'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    {language === 'en' ? 'Menu' : '菜单'}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col space-y-1 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </Link>
                  ))}

                  <div className="border-t pt-4 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleLanguage()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {language === 'en' ? 'Switch to Chinese' : '切换到英文'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}