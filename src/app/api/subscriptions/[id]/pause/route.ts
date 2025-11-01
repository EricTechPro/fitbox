import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { addDays, addWeeks, isAfter } from 'date-fns'

interface RouteParams {
  params: {
    id: string
  }
}

const pauseSubscriptionSchema = z.object({
  pausedUntil: z.string().datetime(),
  reason: z.string().optional(),
})

/**
 * POST /api/subscriptions/[id]/pause - Pause subscription
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
    const validatedData = pauseSubscriptionSchema.parse(body)

    // Verify subscription ownership and that it's active
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Active subscription not found' },
        { status: 404 }
      )
    }

    const pausedUntilDate = new Date(validatedData.pausedUntil)
    const now = new Date()

    // Validate pause date is in the future
    if (!isAfter(pausedUntilDate, now)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pause date must be in the future',
        },
        { status: 400 }
      )
    }

    // Validate pause date is not more than 3 months in the future
    const maxPauseDate = addWeeks(now, 12) // 3 months
    if (isAfter(pausedUntilDate, maxPauseDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot pause subscription for more than 3 months',
        },
        { status: 400 }
      )
    }

    // Update subscription to paused status
    const pausedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        status: 'PAUSED',
        pausedUntil: pausedUntilDate,
      },
      include: {
        bundlePrice: true,
      },
    })

    // Log the pause action for audit purposes
    console.log(
      `Subscription ${params.id} paused until ${pausedUntilDate.toISOString()} by user ${session.user.id}${validatedData.reason ? `, reason: ${validatedData.reason}` : ''}`
    )

    return NextResponse.json({
      success: true,
      data: pausedSubscription,
      message: `Subscription paused until ${pausedUntilDate.toLocaleDateString()}`,
    })
  } catch (error) {
    console.error('Error pausing subscription:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pause data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to pause subscription',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscriptions/[id]/pause - Resume (unpause) subscription
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

    // Verify subscription ownership and that it's paused
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'PAUSED',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Paused subscription not found' },
        { status: 404 }
      )
    }

    // Calculate new billing dates when resuming
    const now = new Date()
    const nextBillingDate = addDays(now, 7) // Next week

    // Update subscription to active status
    const resumedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        pausedUntil: null,
        nextBillingDate,
      },
      include: {
        bundlePrice: true,
      },
    })

    // Log the resume action for audit purposes
    console.log(`Subscription ${params.id} resumed by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: resumedSubscription,
      message: 'Subscription resumed successfully',
    })
  } catch (error) {
    console.error('Error resuming subscription:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to resume subscription',
      },
      { status: 500 }
    )
  }
}
