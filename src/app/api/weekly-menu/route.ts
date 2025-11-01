import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DeadlineService } from '@/lib/services/deadline-service'

const getMenuSchema = z.object({
  weekStart: z.string().datetime().nullable().optional(),
  includeInactive: z
    .string()
    .nullable()
    .default('false')
    .transform(val => val === 'true'),
})

const createMenuSchema = z.object({
  name: z.string().min(1),
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  mealIds: z.array(z.string().cuid()).min(1).max(20),
})

/**
 * GET /api/weekly-menu - Get weekly menus
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')
    const includeInactive = searchParams.get('includeInactive')

    const validatedParams = getMenuSchema.parse({
      weekStart,
      includeInactive,
    })

    const whereClause: any = {}

    if (validatedParams.weekStart) {
      whereClause.weekStart = new Date(validatedParams.weekStart)
    } else {
      // Default to current and next week
      const currentWeekStart = DeadlineService.getCurrentWeekStart()
      const nextWeekStart = DeadlineService.getNextWeekStart()

      whereClause.weekStart = {
        in: [currentWeekStart, nextWeekStart],
      }
    }

    if (!validatedParams.includeInactive) {
      whereClause.isActive = true
      whereClause.isPublished = true
    }

    const weeklyMenus = await prisma.weeklyMenu.findMany({
      where: whereClause,
      include: {
        menuItems: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                nameZh: true,
                description: true,
                category: true,
                imageUrl: true,
                imageAlt: true,
                price: true,
                calories: true,
                protein: true,
                carbs: true,
                fat: true,
                allergens: true,
                isVegetarian: true,
                isVegan: true,
                isGlutenFree: true,
                isDairyFree: true,
                chefName: true,
                isActive: true,
                inventory: true,
              },
            },
          },
          where: validatedParams.includeInactive
            ? {}
            : {
                isAvailable: true,
                meal: {
                  isActive: true,
                  inventory: {
                    gt: 0,
                  },
                },
              },
          orderBy: [{ meal: { category: 'asc' } }, { meal: { name: 'asc' } }],
        },
      },
      orderBy: {
        weekStart: 'asc',
      },
    })

    const menusWithDeadlines = weeklyMenus.map(menu => {
      // Calculate deadlines for both delivery days
      const sundayDeadline = DeadlineService.getDeadlineInfo(
        'SUNDAY',
        menu.weekStart
      )
      const wednesdayDeadline = DeadlineService.getDeadlineInfo(
        'WEDNESDAY',
        menu.weekStart
      )

      return {
        id: menu.id,
        name: menu.name,
        weekStart: menu.weekStart,
        weekEnd: menu.weekEnd,
        isActive: menu.isActive,
        isPublished: menu.isPublished,
        publishedAt: menu.publishedAt,
        deadlines: {
          sunday: {
            selectionDeadline: sundayDeadline.selectionDeadline,
            deliveryDate: sundayDeadline.deliveryDate,
            isAfterDeadline: sundayDeadline.isAfterDeadline,
            timeUntilDeadline: sundayDeadline.timeUntilDeadline,
          },
          wednesday: {
            selectionDeadline: wednesdayDeadline.selectionDeadline,
            deliveryDate: wednesdayDeadline.deliveryDate,
            isAfterDeadline: wednesdayDeadline.isAfterDeadline,
            timeUntilDeadline: wednesdayDeadline.timeUntilDeadline,
          },
        },
        meals: menu.menuItems.map(item => ({
          ...item.meal,
          weeklyMenuItem: {
            id: item.id,
            isAvailable: item.isAvailable,
            inventoryLimit: item.inventoryLimit,
            specialPrice: item.specialPrice,
          },
        })),
        mealCount: menu.menuItems.length,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: menusWithDeadlines,
      meta: {
        total: menusWithDeadlines.length,
        includeInactive: validatedParams.includeInactive,
      },
    })
  } catch (error) {
    console.error('Error fetching weekly menus:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weekly menus',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/weekly-menu - Create new weekly menu (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createMenuSchema.parse(body)

    const weekStartDate = new Date(validatedData.weekStart)
    const weekEndDate = new Date(validatedData.weekEnd)

    // Validate week dates
    if (weekEndDate <= weekStartDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Week end date must be after week start date',
        },
        { status: 400 }
      )
    }

    // Check if menu for this week already exists
    const existingMenu = await prisma.weeklyMenu.findFirst({
      where: {
        weekStart: weekStartDate,
      },
    })

    if (existingMenu) {
      return NextResponse.json(
        {
          success: false,
          error: 'Weekly menu for this week already exists',
        },
        { status: 409 }
      )
    }

    // Verify all meals exist and are active
    const meals = await prisma.meal.findMany({
      where: {
        id: { in: validatedData.mealIds },
        isActive: true,
      },
    })

    if (meals.length !== validatedData.mealIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some meals not found or inactive',
        },
        { status: 400 }
      )
    }

    // Create weekly menu with menu items
    const weeklyMenu = await prisma.weeklyMenu.create({
      data: {
        name: validatedData.name,
        weekStart: weekStartDate,
        weekEnd: weekEndDate,
        isActive: true,
        isPublished: validatedData.publishedAt ? true : false,
        publishedAt: validatedData.publishedAt
          ? new Date(validatedData.publishedAt)
          : null,
        menuItems: {
          create: validatedData.mealIds.map(mealId => ({
            mealId,
            isAvailable: true,
          })),
        },
      },
      include: {
        menuItems: {
          include: {
            meal: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: weeklyMenu,
      message: 'Weekly menu created successfully',
    })
  } catch (error) {
    console.error('Error creating weekly menu:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid menu data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create weekly menu',
      },
      { status: 500 }
    )
  }
}
