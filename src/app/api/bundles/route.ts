import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const getBundlesSchema = z.object({
  orderType: z.enum(['ONE_TIME', 'SUBSCRIPTION']).optional(),
})

/**
 * GET /api/bundles - Get available bundle prices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderType = searchParams.get('orderType')

    const validatedParams = getBundlesSchema.parse({
      orderType: orderType as 'ONE_TIME' | 'SUBSCRIPTION' | undefined,
    })

    const bundles = await prisma.bundlePrice.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        mealCount: 'asc',
      },
    })

    // Calculate pricing based on order type
    const bundlesWithPricing = bundles.map(bundle => ({
      id: bundle.id,
      mealCount: bundle.mealCount,
      description: bundle.description,
      oneTimePrice: bundle.oneTimePrice,
      subscriptionPrice: bundle.subscriptionPrice,
      recommendedPrice:
        validatedParams.orderType === 'SUBSCRIPTION'
          ? bundle.subscriptionPrice
          : bundle.oneTimePrice,
      discount:
        validatedParams.orderType === 'SUBSCRIPTION'
          ? {
              amount: bundle.oneTimePrice.minus(bundle.subscriptionPrice),
              percentage: Math.round(
                bundle.oneTimePrice
                  .minus(bundle.subscriptionPrice)
                  .div(bundle.oneTimePrice)
                  .mul(100)
                  .toNumber()
              ),
            }
          : null,
      pricePerMeal:
        validatedParams.orderType === 'SUBSCRIPTION'
          ? bundle.subscriptionPrice.div(bundle.mealCount)
          : bundle.oneTimePrice.div(bundle.mealCount),
      isActive: bundle.isActive,
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: bundlesWithPricing,
      meta: {
        total: bundlesWithPricing.length,
        orderType: validatedParams.orderType || 'ONE_TIME',
      },
    })
  } catch (error) {
    console.error('Error fetching bundles:', error)

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
        error: 'Failed to fetch bundles',
      },
      { status: 500 }
    )
  }
}

const createBundleSchema = z.object({
  mealCount: z.number().int().min(3).max(20),
  oneTimePrice: z.number().positive(),
  subscriptionPrice: z.number().positive(),
  description: z.string().optional(),
})

/**
 * POST /api/bundles - Create new bundle price (Admin only)
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
    const validatedData = createBundleSchema.parse(body)

    // Check if bundle with this meal count already exists
    const existingBundle = await prisma.bundlePrice.findUnique({
      where: { mealCount: validatedData.mealCount },
    })

    if (existingBundle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bundle with this meal count already exists',
        },
        { status: 409 }
      )
    }

    // Validate subscription price is less than one-time price
    if (validatedData.subscriptionPrice >= validatedData.oneTimePrice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subscription price must be less than one-time price',
        },
        { status: 400 }
      )
    }

    const bundle = await prisma.bundlePrice.create({
      data: {
        mealCount: validatedData.mealCount,
        oneTimePrice: validatedData.oneTimePrice,
        subscriptionPrice: validatedData.subscriptionPrice,
        description:
          validatedData.description ||
          `Weekly Bundle - ${validatedData.mealCount} Meals`,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: bundle,
      message: 'Bundle created successfully',
    })
  } catch (error) {
    console.error('Error creating bundle:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid bundle data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create bundle',
      },
      { status: 500 }
    )
  }
}
