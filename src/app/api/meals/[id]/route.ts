/**
 * T023: Individual meal details API endpoint
 *
 * GET /api/meals/[id] - Meal details with weekly availability information
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'

// Rate limiter for meal endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 200, 'CACHE_TOKEN') // 200 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { id } = params

    // Validate meal ID format (basic validation)
    if (!id || id.length < 3 || /[^a-zA-Z0-9\-_]/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal ID format' },
        { status: 400 }
      )
    }

    // Find meal with weekly availability
    const meal = await prisma.meal.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        weeklyMenuItems: {
          include: {
            weeklyMenu: true,
          },
          where: {
            weeklyMenu: {
              isActive: true,
              isPublished: true,
            },
          },
        },
      },
    })

    if (!meal) {
      return NextResponse.json(
        { success: false, error: 'Meal not found or inactive' },
        { status: 404 }
      )
    }

    // Find current weekly availability
    const currentWeeklyItem = meal.weeklyMenuItems.find(
      item => item.weeklyMenu && item.weeklyMenu.isActive
    )

    const response = {
      success: true,
      data: {
        id: meal.id,
        name: meal.name,
        nameZh: meal.nameZh,
        description: meal.description,
        category: meal.category,
        price: parseFloat(meal.price.toString()),
        imageUrl: meal.imageUrl,
        imageAlt: meal.imageAlt,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        sugar: meal.sugar,
        sodium: meal.sodium,
        allergens: meal.allergens,
        isVegetarian: meal.isVegetarian,
        isVegan: meal.isVegan,
        isGlutenFree: meal.isGlutenFree,
        isDairyFree: meal.isDairyFree,
        chefName: meal.chefName,
        chefInfo: meal.chefInfo,
        isActive: meal.isActive,
        inventory: meal.inventory,
        ...(currentWeeklyItem && {
          weeklyAvailability: {
            isAvailable: currentWeeklyItem.isAvailable,
            inventoryLimit: currentWeeklyItem.inventoryLimit,
            specialPrice: currentWeeklyItem.specialPrice
              ? parseFloat(currentWeeklyItem.specialPrice.toString())
              : undefined,
          },
        }),
      },
    }

    // Set caching headers
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=600, s-maxage=1800') // 10 min client, 30 min CDN
    headers.set('ETag', `"meal-${meal.id}-${meal.updatedAt.getTime()}"`)

    return NextResponse.json(response, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Meal details API error:', error)
    return handleApiError(error, 'Failed to fetch meal details')
  }
}

// Only GET method is allowed
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

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  )
}
