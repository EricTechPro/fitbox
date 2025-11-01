import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DeadlineService } from '@/lib/services/deadline-service'
import { DeliveryDay } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

const updateSubscriptionSchema = z.object({
  deliveryDay: z.enum(['SUNDAY', 'WEDNESDAY']).optional(),
  billingCycle: z.enum(['WEEKLY', 'MONTHLY']).optional(),
  paymentMethodId: z.string().optional(),
  autoRenew: z.boolean().optional(),
})

/**
 * GET /api/subscriptions/[id] - Get specific subscription
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

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        bundlePrice: true,
        mealSelections: {
          include: {
            meal: true,
          },
          orderBy: {
            weekStart: 'desc',
          },
          take: 10,
        },
        orders: {
          where: {
            orderType: 'SUBSCRIPTION',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Add deadline information
    const currentWeekStart = DeadlineService.getCurrentWeekStart()
    const deadlineInfo = DeadlineService.getDeadlineInfo(
      subscription.deliveryDay as DeliveryDay,
      currentWeekStart
    )

    const enhancedSubscription = {
      ...subscription,
      currentWeekDeadline: deadlineInfo,
      nextDeliveryDate: deadlineInfo.deliveryDate,
      canModifySelections: !deadlineInfo.isAfterDeadline,
      upcomingOrders: subscription.orders.filter(
        order => order.deliveryDate > new Date()
      ),
      recentMealSelections: subscription.mealSelections.slice(0, 5),
    }

    return NextResponse.json({
      success: true,
      data: enhancedSubscription,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/subscriptions/[id] - Update subscription
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateSubscriptionSchema.parse(body)

    // Verify subscription ownership
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.deliveryDay) {
      updateData.deliveryDay = validatedData.deliveryDay

      // Recalculate selection deadline if delivery day changes
      const currentWeekStart = DeadlineService.getCurrentWeekStart()
      updateData.selectionDeadline = DeadlineService.calculateSelectionDeadline(
        validatedData.deliveryDay as DeliveryDay,
        currentWeekStart
      )
    }

    if (validatedData.billingCycle !== undefined) {
      updateData.billingCycle = validatedData.billingCycle
    }

    if (validatedData.paymentMethodId !== undefined) {
      updateData.paymentMethodId = validatedData.paymentMethodId
    }

    if (validatedData.autoRenew !== undefined) {
      updateData.autoRenew = validatedData.autoRenew
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: updateData,
      include: {
        bundlePrice: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully',
    })
  } catch (error) {
    console.error('Error updating subscription:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update subscription',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscriptions/[id] - Cancel subscription
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const immediate = searchParams.get('immediate') === 'true'

    // Verify subscription ownership
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Active subscription not found' },
        { status: 404 }
      )
    }

    let updateData: any

    if (immediate) {
      // Cancel immediately
      updateData = {
        status: 'CANCELLED',
        autoRenew: false,
      }
    } else {
      // Schedule cancellation after current billing cycle
      updateData = {
        status: 'PENDING_CANCELLATION',
        autoRenew: false,
      }
    }

    const cancelledSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: updateData,
      include: {
        bundlePrice: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: cancelledSubscription,
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled after current billing cycle',
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel subscription',
      },
      { status: 500 }
    )
  }
}
