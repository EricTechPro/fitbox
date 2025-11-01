/**
 * T026: Shopping Cart Item API Endpoint
 *
 * DELETE /api/cart/[mealId] - Remove specific item from cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'

// Rate limiter for cart item endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 300,
})

/**
 * Remove specific item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { mealId: string } }
) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 20, 'CACHE_TOKEN') // 20 requests per minute per IP
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

    const { mealId } = params

    // Validate meal ID format
    if (!mealId || mealId.length < 3 || /[^a-zA-Z0-9\-_]/.test(mealId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal ID format' },
        { status: 400 }
      )
    }

    // Remove cart item
    const result = await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        mealId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    const response = {
      success: true,
      data: {
        message: 'Item removed from cart successfully',
        removedCount: result.count,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Cart item DELETE API error:', error)
    return handleApiError(error, 'Failed to remove item from cart')
  }
}

// Only DELETE method is allowed
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  )
}
