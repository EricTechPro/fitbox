/**
 * T024: Delivery zones listing API endpoint
 *
 * GET /api/delivery-zones - List all active delivery zones
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'

// Rate limiter for delivery zones endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 300,
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
    const prefix = searchParams.get('prefix')
    const admin = searchParams.get('admin') === 'true'

    // Build query conditions
    const whereConditions: {
      isActive: boolean
      postalCodeList?: { hasSome: string[] }
    } = {
      isActive: true,
    }

    // Filter by postal code prefix if provided
    if (prefix) {
      whereConditions.postalCodeList = {
        hasSome: [prefix.toUpperCase()],
      }
    }

    // Fetch delivery zones
    const deliveryZones = await prisma.deliveryZone.findMany({
      where: whereConditions,
      orderBy: [{ name: 'asc' }],
    })

    // Format response data
    const responseData = deliveryZones.map(zone => ({
      id: zone.id,
      name: zone.name,
      postalCodeList: zone.postalCodeList,
      deliveryFee: parseFloat(zone.deliveryFee.toString()),
      deliveryDays: zone.deliveryDays,
      isActive: zone.isActive,
      // Include admin-only fields if authenticated as admin
      ...(admin && {
        maxOrders: zone.maxOrders,
        createdAt: zone.createdAt.toISOString(),
        updatedAt: zone.updatedAt.toISOString(),
      }),
    }))

    const response = {
      success: true,
      data: responseData,
    }

    // Set caching headers
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=1800, s-maxage=3600') // 30 min client, 1 hour CDN

    return NextResponse.json(response, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Delivery zones listing API error:', error)
    return handleApiError(error, 'Failed to fetch delivery zones')
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
