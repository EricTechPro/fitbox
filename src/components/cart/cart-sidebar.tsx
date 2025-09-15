'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore, useCartItems, useCartTotals } from '@/stores/cart-store'
import { useLanguageStore } from '@/stores/language-store'
import { CartItem } from './cart-item'

export function CartSidebar() {
  const { isOpen, closeCart } = useCartStore()
  const cartItems = useCartItems()
  const { subtotal, deliveryFee, total } = useCartTotals()
  const { language } = useLanguageStore()

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  const handleCheckout = () => {
    closeCart()
    // Navigate to checkout page
    window.location.href = '/checkout'
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>
              {language === 'en' ? 'Shopping Cart' : '购物车'}
            </span>
          </SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? (language === 'en' ? 'Your cart is empty' : '您的购物车是空的')
              : `${itemCount} ${itemCount === 1
                  ? (language === 'en' ? 'item' : '项商品')
                  : (language === 'en' ? 'items' : '项商品')
                } ${language === 'en' ? 'in your cart' : '在您的购物车中'}`
            }
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 flex flex-col">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {language === 'en' ? 'Your cart is empty' : '您的购物车是空的'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'en'
                    ? 'Add some delicious meals to get started!'
                    : '添加一些美味餐点开始吧！'
                  }
                </p>
              </div>
              <Button onClick={closeCart} variant="outline">
                {language === 'en' ? 'Continue Shopping' : '继续购物'}
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mr-6 pr-6">
                <div className="space-y-4 py-4">
                  {cartItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{language === 'en' ? 'Subtotal' : '小计'}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{language === 'en' ? 'Delivery Fee' : '配送费'}</span>
                    <span>
                      {deliveryFee === 0
                        ? (language === 'en' ? 'Free' : '免费')
                        : `$${deliveryFee.toFixed(2)}`
                      }
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>{language === 'en' ? 'Total' : '总计'}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  {language === 'en' ? 'Proceed to Checkout' : '继续结账'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {language === 'en'
                    ? 'Delivery available Sunday & Wednesday, 5:30-10:00 PM'
                    : '周日和周三配送，下午5:30-10:00'
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}