/**
 * T023: Menu and meal API endpoints implementation
 *
 * GET /api/menus/current - Current menu endpoint with meal details, search and filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MealCategory } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'

// Rate limiter for menu endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per minute
})

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 100, 'CACHE_TOKEN') // 100 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const vegetarian = searchParams.get('vegetarian') === 'true'
    const vegan = searchParams.get('vegan') === 'true'
    const glutenFree = searchParams.get('glutenFree') === 'true'
    const dairyFree = searchParams.get('dairyFree') === 'true'

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    )
    const skip = (page - 1) * limit

    // Validate category filter
    if (
      category &&
      !Object.values(MealCategory).includes(category as MealCategory)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid category filter' },
        { status: 400 }
      )
    }

    // Find current active menu
    const currentMenu = await prisma.weeklyMenu.findFirst({
      where: {
        isActive: true,
        isPublished: true,
      },
      include: {
        menuItems: {
          where: {
            isAvailable: true,
            meal: {
              isActive: true,
              // Apply search filter
              ...(search && {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { nameZh: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              }),
              // Apply category filter
              ...(category && { category: category as MealCategory }),
              // Apply dietary filters
              ...(vegetarian && { isVegetarian: true }),
              ...(vegan && { isVegan: true }),
              ...(glutenFree && { isGlutenFree: true }),
              ...(dairyFree && { isDairyFree: true }),
            },
          },
          include: {
            meal: true,
          },
        },
      },
    })

    if (!currentMenu) {
      return NextResponse.json(
        { success: false, error: 'No active menu found' },
        { status: 404 }
      )
    }

    // Apply pagination to menu items
    const paginatedMenuItems = currentMenu.menuItems.slice(skip, skip + limit)

    // Get total count for pagination metadata
    const totalItems = currentMenu.menuItems.length

    // Transform data for response
    const meals = paginatedMenuItems
      .filter(item => item.meal) // Filter out null meals (shouldn't happen with proper relations)
      .map(item => ({
        id: item.meal.id,
        name: item.meal.name,
        nameZh: item.meal.nameZh,
        description: item.meal.description,
        category: item.meal.category,
        price: parseFloat(
          item.specialPrice?.toString() || item.meal.price.toString()
        ),
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
        isAvailable: item.isAvailable,
        inventoryLimit: item.inventoryLimit,
      }))

    // Get unique categories from available meals
    const categories = Array.from(new Set(meals.map(meal => meal.category)))

    const response = {
      success: true,
      data: {
        weeklyMenu: {
          id: currentMenu.id,
          name: currentMenu.name,
          weekStart: currentMenu.weekStart.toISOString(),
          weekEnd: currentMenu.weekEnd.toISOString(),
          isActive: currentMenu.isActive,
        },
        meals,
        categories: categories.sort(),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit,
          hasNextPage: skip + limit < totalItems,
          hasPreviousPage: page > 1,
        },
      },
    }

    // Set caching headers
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600') // 5 min client, 10 min CDN
    headers.set(
      'ETag',
      `"menu-${currentMenu.id}-${currentMenu.updatedAt.getTime()}"`
    )

    return NextResponse.json(response, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Menu API error:', error)
    return handleApiError(error, 'Failed to fetch current menu')
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
