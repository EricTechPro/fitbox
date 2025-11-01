'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Menu,
  ShoppingCart,
  Globe,
  User,
  LogIn,
  UserPlus,
  Settings,
  History,
  LogOut,
  Crown,
  Zap,
} from 'lucide-react'
import { useLanguageStore } from '@/stores/language-store'
import { useCartStore, useCartItemCount } from '@/stores/cart-store'
import { cn } from '@/lib/utils'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { language, toggleLanguage } = useLanguageStore()
  const { toggleCart } = useCartStore()
  const cartItemCount = useCartItemCount()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  // Premium auth action handlers
  const handleSignIn = () => {
    router.push('/login')
  }

  const handleSignUp = () => {
    router.push('/register')
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      // Sign out error occurred
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleOrderHistory = () => {
    if (session) {
      router.push('/account/orders')
    } else {
      router.push('/login?redirect=/account/orders')
    }
  }

  const handleSettings = () => {
    if (session) {
      router.push('/account/settings')
    } else {
      router.push('/login?redirect=/account/settings')
    }
  }

  const navigationItems = [
    {
      title: language === 'en' ? 'Menu' : '菜单',
      href: '/menu',
      description:
        language === 'en'
          ? 'Browse our weekly meal selection'
          : '浏览本周餐点选择',
    },
    {
      title: language === 'en' ? 'How It Works' : '使用方法',
      href: '/how-it-works',
      description:
        language === 'en'
          ? 'Learn about our meal delivery service'
          : '了解我们的送餐服务',
    },
    {
      title: language === 'en' ? 'About' : '关于我们',
      href: '/about',
      description:
        language === 'en' ? 'Our story and mission' : '我们的故事和使命',
    },
  ]

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">FB</span>
          </div>
          <span className="text-xl font-bold tracking-tight">FitBox</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          <nav className="flex items-center space-x-6">
            {navigationItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            ))}
          </nav>
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
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                variant="destructive"
                data-testid="cart-badge"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Shopping cart</span>
          </Button>

          {/* Premium User Account with Authentication */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'relative h-8 w-8 rounded-full transition-all duration-200',
                  'hover:ring-primary/20 hover:bg-primary/5 hover:ring-2',
                  session && 'ring-primary/30 ring-2'
                )}
              >
                <Avatar className="h-8 w-8">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                    />
                  ) : (
                    <AvatarFallback
                      className={cn(
                        'transition-colors duration-200',
                        session
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {session ? (
                        session.user.firstName ? (
                          session.user.firstName[0].toUpperCase()
                        ) : session.user.lastName ? (
                          `${session.user.firstName?.[0] || ''}${session.user.lastName[0]}`.toUpperCase()
                        ) : (
                          session.user.email?.[0].toUpperCase()
                        )
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  )}
                </Avatar>
                {/* Premium status indicator */}
                {session && (
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              {session ? (
                // Authenticated User Menu
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="flex items-center gap-2 text-sm font-medium leading-none">
                        {session.user.firstName && session.user.lastName
                          ? `${session.user.firstName} ${session.user.lastName}`
                          : session.user.email}
                        <Crown className="h-3 w-3 text-amber-500" />
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 text-xs"
                        >
                          <Zap className="mr-1 h-3 w-3" />
                          {language === 'en' ? 'Member' : '会员'}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleOrderHistory}
                    className="group cursor-pointer"
                  >
                    <History className="mr-2 h-4 w-4 transition-colors group-hover:text-primary" />
                    {language === 'en' ? 'Order History' : '订单历史'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSettings}
                    className="group cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4 transition-colors group-hover:text-primary" />
                    {language === 'en' ? 'Settings' : '设置'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="group cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isSigningOut
                      ? language === 'en'
                        ? 'Signing out...'
                        : '登出中...'
                      : language === 'en'
                        ? 'Sign Out'
                        : '登出'}
                  </DropdownMenuItem>
                </>
              ) : (
                // Guest User Menu with Premium Conversion UX
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {language === 'en'
                          ? 'Welcome to FitBox!'
                          : '欢迎来到FitBox！'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {language === 'en'
                          ? 'Join our community for exclusive benefits'
                          : '加入我们，享受专属优惠'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Premium Sign Up CTA */}
                  <DropdownMenuItem
                    onClick={handleSignUp}
                    className="bg-primary/5 hover:bg-primary/10 group cursor-pointer"
                  >
                    <UserPlus className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-1 flex-col">
                      <span className="font-medium text-primary">
                        {language === 'en' ? 'Create Account' : '创建账户'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === 'en'
                          ? '5% subscription discount'
                          : '订阅享5%折扣'}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSignIn}
                    className="group cursor-pointer"
                  >
                    <LogIn className="mr-2 h-4 w-4 transition-colors group-hover:text-primary" />
                    {language === 'en' ? 'Sign In' : '登录'}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Guest options with auth prompts */}
                  <DropdownMenuItem
                    onClick={handleOrderHistory}
                    className="group cursor-pointer"
                  >
                    <History className="mr-2 h-4 w-4 transition-colors group-hover:text-primary" />
                    <div className="flex flex-1 flex-col">
                      <span>
                        {language === 'en' ? 'Order History' : '订单历史'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Sign in required' : '需要登录'}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSettings}
                    className="group cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4 transition-colors group-hover:text-primary" />
                    <div className="flex flex-1 flex-col">
                      <span>
                        {language === 'en' ? 'Account Settings' : '账户设置'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Sign in required' : '需要登录'}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  {/* Beta access reminder */}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <p className="text-center text-xs text-muted-foreground">
                      {language === 'en'
                        ? '🚀 Limited beta: 10 spots/week'
                        : '🚀 限量内测：每周10个名额'}
                    </p>
                  </div>
                </>
              )}
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
                  {navigationItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col space-y-1 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </Link>
                  ))}

                  <div className="space-y-2 border-t pt-4">
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
