/**
 * T026: Shopping Cart API Endpoints
 *
 * GET /api/cart - Get current user's cart
 * POST /api/cart - Add item to cart
 * PUT /api/cart - Update cart item quantity
 * DELETE /api/cart - Clear entire cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

// Rate limiter for cart endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 300,
})

// Validation schemas
const addToCartSchema = z.object({
  mealId: z.string().min(1, 'Meal ID is required'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum 10 items per meal'),
})

const updateCartSchema = z.object({
  mealId: z.string().min(1, 'Meal ID is required'),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity must be 0 or greater')
    .max(10, 'Maximum 10 items per meal'),
})

/**
 * Get current user's cart items
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 60, 'CACHE_TOKEN') // 60 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get cart items with meal details
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        meal: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.meal.price.toString()) * item.quantity
    }, 0)

    // TODO: Calculate delivery fee based on user's postal code
    const deliveryFee = 0 // Placeholder - implement delivery fee calculation

    const total = subtotal + deliveryFee

    // Transform data for response
    const items = cartItems.map(item => ({
      id: item.id,
      meal: {
        id: item.meal.id,
        name: item.meal.name,
        nameZh: item.meal.nameZh,
        description: item.meal.description,
        category: item.meal.category,
        price: parseFloat(item.meal.price.toString()),
        imageUrl: item.meal.imageUrl,
        imageAlt: item.meal.imageAlt,
        calories: item.meal.calories,
        protein: item.meal.protein,
        carbs: item.meal.carbs,
        fat: item.meal.fat,
        allergens: item.meal.allergens,
        isVegetarian: item.meal.isVegetarian,
        isVegan: item.meal.isVegan,
        isGlutenFree: item.meal.isGlutenFree,
        isDairyFree: item.meal.isDairyFree,
        chefName: item.meal.chefName,
        chefInfo: item.meal.chefInfo,
        isActive: item.meal.isActive,
        inventory: item.meal.inventory,
      },
      quantity: item.quantity,
      addedAt: item.createdAt.toISOString(),
    }))

    const response = {
      success: true,
      data: {
        items,
        subtotal,
        deliveryFee,
        total,
        isOpen: false, // UI state managed on frontend
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Cart GET API error:', error)
    return handleApiError(error, 'Failed to fetch cart')
  }
}

/**
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 30, 'CACHE_TOKEN') // 30 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const validation = addToCartSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Invalid request data',
        },
        { status: 400 }
      )
    }

    const { mealId, quantity } = validation.data

    // Verify meal exists and is active
    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        isActive: true,
      },
    })

    if (!meal) {
      return NextResponse.json(
        { success: false, error: 'Meal not found or unavailable' },
        { status: 404 }
      )
    }

    // Check inventory
    if (meal.inventory < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${meal.inventory} items available` },
        { status: 400 }
      )
    }

    // Upsert cart item (update if exists, create if not)
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_mealId: {
          userId: session.user.id,
          mealId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId: session.user.id,
        mealId,
        quantity,
      },
      include: {
        meal: true,
      },
    })

    // Final inventory check
    if (meal.inventory < cartItem.quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${meal.inventory} items available` },
        { status: 400 }
      )
    }

    const response = {
      success: true,
      data: {
        cartItem: {
          id: cartItem.id,
          quantity: cartItem.quantity,
          addedAt: cartItem.createdAt.toISOString(),
        },
        message: 'Item added to cart successfully',
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Cart POST API error:', error)
    return handleApiError(error, 'Failed to add item to cart')
  }
}

/**
 * Update cart item quantity
 */
export async function PUT(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 30, 'CACHE_TOKEN') // 30 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const validation = updateCartSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Invalid request data',
        },
        { status: 400 }
      )
    }

    const { mealId, quantity } = validation.data

    if (quantity === 0) {
      // Remove item from cart
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          mealId,
        },
      })

      return NextResponse.json({
        success: true,
        data: { message: 'Item removed from cart' },
      })
    }

    // Verify meal exists and check inventory
    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        isActive: true,
      },
    })

    if (!meal) {
      return NextResponse.json(
        { success: false, error: 'Meal not found or unavailable' },
        { status: 404 }
      )
    }

    if (meal.inventory < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${meal.inventory} items available` },
        { status: 400 }
      )
    }

    // Update cart item quantity
    const cartItem = await prisma.cartItem.update({
      where: {
        userId_mealId: {
          userId: session.user.id,
          mealId,
        },
      },
      data: {
        quantity,
      },
    })

    const response = {
      success: true,
      data: {
        cartItem: {
          id: cartItem.id,
          quantity: cartItem.quantity,
        },
        message: 'Cart item updated successfully',
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Cart PUT API error:', error)
    return handleApiError(error, 'Failed to update cart item')
  }
}

/**
 * Clear entire cart
 */
export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 10, 'CACHE_TOKEN') // 10 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Clear all cart items for user
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
      },
    })

    const response = {
      success: true,
      data: { message: 'Cart cleared successfully' },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Cart DELETE API error:', error)
    return handleApiError(error, 'Failed to clear cart')
  }
}
