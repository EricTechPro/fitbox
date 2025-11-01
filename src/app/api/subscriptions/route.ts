import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DeadlineService } from '@/lib/services/deadline-service'
import { DeliveryDay } from '@prisma/client'

const createSubscriptionSchema = z.object({
  bundlePriceId: z.string().cuid(),
  deliveryDay: z.enum(['SUNDAY', 'WEDNESDAY']),
  billingCycle: z.enum(['WEEKLY', 'MONTHLY']).default('WEEKLY'),
  paymentMethodId: z.string().optional(),
})

/**
 * GET /api/subscriptions - Get user's subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const whereClause: any = {
      userId: session.user.id,
    }

    if (status) {
      whereClause.status = status
    } else if (!includeInactive) {
      whereClause.status = {
        in: ['ACTIVE', 'PAUSED'],
      }
    }

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        bundlePrice: true,
        mealSelections: {
          where: {
            weekStart: {
              gte: DeadlineService.getCurrentWeekStart(),
            },
          },
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                nameZh: true,
                imageUrl: true,
                price: true,
              },
            },
          },
          orderBy: {
            weekStart: 'asc',
          },
        },
        orders: {
          where: {
            orderType: 'SUBSCRIPTION',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Enhance subscriptions with deadline information
    const enhancedSubscriptions = subscriptions.map(subscription => {
      const currentWeekStart = DeadlineService.getCurrentWeekStart()
      const nextWeekStart = DeadlineService.getNextWeekStart()

      const currentWeekDeadline = DeadlineService.getDeadlineInfo(
        subscription.deliveryDay as DeliveryDay,
        currentWeekStart
      )

      const nextWeekDeadline = DeadlineService.getDeadlineInfo(
        subscription.deliveryDay as DeliveryDay,
        nextWeekStart
      )

      // Group meal selections by week
      const mealSelectionsByWeek = subscription.mealSelections.reduce(
        (acc, selection) => {
          const weekKey = selection.weekStart.toISOString()
          if (!acc[weekKey]) {
            acc[weekKey] = []
          }
          acc[weekKey].push(selection)
          return acc
        },
        {} as Record<string, typeof subscription.mealSelections>
      )

      return {
        id: subscription.id,
        status: subscription.status,
        deliveryDay: subscription.deliveryDay,
        billingCycle: subscription.billingCycle,
        bundlePrice: subscription.bundlePrice,
        nextBillingDate: subscription.nextBillingDate,
        lastBillingDate: subscription.lastBillingDate,
        selectionDeadline: subscription.selectionDeadline,
        pausedUntil: subscription.pausedUntil,
        autoRenew: subscription.autoRenew,
        paymentMethodId: subscription.paymentMethodId,
        deadlines: {
          currentWeek: currentWeekDeadline,
          nextWeek: nextWeekDeadline,
        },
        mealSelections: {
          currentWeek:
            mealSelectionsByWeek[currentWeekStart.toISOString()] || [],
          nextWeek: mealSelectionsByWeek[nextWeekStart.toISOString()] || [],
          upcoming: Object.entries(mealSelectionsByWeek)
            .filter(([weekKey]) => new Date(weekKey) > nextWeekStart)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .slice(0, 3)
            .map(([weekKey, selections]) => ({
              weekStart: new Date(weekKey),
              selections,
            })),
        },
        recentOrders: subscription.orders,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: enhancedSubscriptions,
      meta: {
        total: enhancedSubscriptions.length,
        active: enhancedSubscriptions.filter(s => s.status === 'ACTIVE').length,
        paused: enhancedSubscriptions.filter(s => s.status === 'PAUSED').length,
      },
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscriptions',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions - Create new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)

    // Verify bundle price exists
    const bundlePrice = await prisma.bundlePrice.findUnique({
      where: {
        id: validatedData.bundlePriceId,
        isActive: true,
      },
    })

    if (!bundlePrice) {
      return NextResponse.json(
        { success: false, error: 'Bundle price not found or inactive' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          error:
            'You already have an active subscription. Please cancel or pause your current subscription first.',
        },
        { status: 409 }
      )
    }

    // Calculate next billing date and selection deadline
    const currentWeekStart = DeadlineService.getCurrentWeekStart()
    const nextBillingDate =
      DeadlineService.calculateNextBillingDate(currentWeekStart)
    const selectionDeadline = DeadlineService.calculateSelectionDeadline(
      validatedData.deliveryDay as DeliveryDay,
      currentWeekStart
    )

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        bundlePriceId: validatedData.bundlePriceId,
        deliveryDay: validatedData.deliveryDay,
        billingCycle: validatedData.billingCycle,
        nextBillingDate,
        selectionDeadline,
        paymentMethodId: validatedData.paymentMethodId,
        status: 'ACTIVE',
        autoRenew: true,
      },
      include: {
        bundlePrice: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully',
    })
  } catch (error) {
    console.error('Error creating subscription:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid subscription data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create subscription',
      },
      { status: 500 }
    )
  }
}
