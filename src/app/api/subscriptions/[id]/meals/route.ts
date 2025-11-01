import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DeadlineService } from '@/lib/services/deadline-service'

interface RouteParams {
  params: {
    id: string
  }
}

const mealSelectionSchema = z.object({
  weekStart: z.string().datetime(),
  mealSelections: z.array(
    z.object({
      mealId: z.string().cuid(),
      quantity: z.number().int().min(1).max(5),
    })
  ),
})

/**
 * GET /api/subscriptions/[id]/meals - Get meal selections for a subscription
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    if (!weekStart) {
      return NextResponse.json(
        { success: false, error: 'weekStart parameter required' },
        { status: 400 }
      )
    }

    // Verify subscription ownership
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        bundlePrice: true,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const weekStartDate = new Date(weekStart)

    // Get meal selections for the week
    const mealSelections = await prisma.mealSelection.findMany({
      where: {
        subscriptionId: params.id,
        weekStart: weekStartDate,
      },
      include: {
        meal: {
          include: {
            weeklyMenuItems: {
              where: {
                weeklyMenu: {
                  weekStart: weekStartDate,
                  isActive: true,
                  isPublished: true,
                },
              },
            },
          },
        },
      },
      orderBy: {
        selectedAt: 'asc',
      },
    })

    // Get deadline information
    const deadlineInfo = DeadlineService.getDeadlineInfo(
      subscription.deliveryDay,
      weekStartDate
    )

    // Get available meals for this week
    const weeklyMenu = await prisma.weeklyMenu.findFirst({
      where: {
        weekStart: weekStartDate,
        isActive: true,
        isPublished: true,
      },
      include: {
        menuItems: {
          include: {
            meal: true,
          },
          where: {
            isAvailable: true,
          },
        },
      },
    })

    const totalSelected = mealSelections.reduce(
      (sum, selection) => sum + selection.quantity,
      0
    )
    const requiredMeals = subscription.bundlePrice.mealCount

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: params.id,
        weekStart: weekStartDate,
        deadline: deadlineInfo,
        mealSelections: mealSelections.map(selection => ({
          id: selection.id,
          meal: selection.meal,
          quantity: selection.quantity,
          isAutoSelected: selection.isAutoSelected,
          selectedAt: selection.selectedAt,
        })),
        availableMeals: weeklyMenu?.menuItems.map(item => item.meal) || [],
        summary: {
          totalSelected,
          requiredMeals,
          remaining: Math.max(0, requiredMeals - totalSelected),
          canModify: !deadlineInfo.isAfterDeadline,
          isComplete: totalSelected === requiredMeals,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching meal selections:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meal selections',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions/[id]/meals - Update meal selections for a subscription
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = mealSelectionSchema.parse(body)

    // Verify subscription ownership
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        bundlePrice: true,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Active subscription not found' },
        { status: 404 }
      )
    }

    const weekStartDate = new Date(validatedData.weekStart)

    // Check if deadline has passed
    const deadlineInfo = DeadlineService.getDeadlineInfo(
      subscription.deliveryDay,
      weekStartDate
    )

    if (deadlineInfo.isAfterDeadline) {
      return NextResponse.json(
        {
          success: false,
          error: 'Selection deadline has passed',
          deadline: deadlineInfo.selectionDeadline,
        },
        { status: 409 }
      )
    }

    // Validate total meals matches bundle
    const totalMeals = validatedData.mealSelections.reduce(
      (sum, selection) => sum + selection.quantity,
      0
    )

    if (totalMeals !== subscription.bundlePrice.mealCount) {
      return NextResponse.json(
        {
          success: false,
          error: `Total meals (${totalMeals}) must equal bundle size (${subscription.bundlePrice.mealCount})`,
        },
        { status: 400 }
      )
    }

    // Verify all meals are available
    const mealIds = validatedData.mealSelections.map(s => s.mealId)
    const availableMeals = await prisma.weeklyMenuItem.findMany({
      where: {
        mealId: { in: mealIds },
        isAvailable: true,
        weeklyMenu: {
          weekStart: weekStartDate,
          isActive: true,
          isPublished: true,
        },
      },
      include: {
        meal: true,
      },
    })

    if (availableMeals.length !== mealIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some selected meals are not available this week',
        },
        { status: 400 }
      )
    }

    // Transaction to update meal selections
    await prisma.$transaction(async tx => {
      // Remove existing selections for this week
      await tx.mealSelection.deleteMany({
        where: {
          subscriptionId: params.id,
          weekStart: weekStartDate,
        },
      })

      // Create new selections
      const newSelections = validatedData.mealSelections.map(selection => ({
        subscriptionId: params.id,
        weekStart: weekStartDate,
        mealId: selection.mealId,
        quantity: selection.quantity,
        isAutoSelected: false,
        selectedAt: new Date(),
      }))

      await tx.mealSelection.createMany({
        data: newSelections,
      })
    })

    // Fetch updated selections
    const updatedSelections = await prisma.mealSelection.findMany({
      where: {
        subscriptionId: params.id,
        weekStart: weekStartDate,
      },
      include: {
        meal: true,
      },
      orderBy: {
        selectedAt: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: params.id,
        weekStart: weekStartDate,
        mealSelections: updatedSelections,
        summary: {
          totalSelected: totalMeals,
          requiredMeals: subscription.bundlePrice.mealCount,
          isComplete: true,
        },
      },
      message: 'Meal selections updated successfully',
    })
  } catch (error) {
    console.error('Error updating meal selections:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid meal selection data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update meal selections',
      },
      { status: 500 }
    )
  }
}
