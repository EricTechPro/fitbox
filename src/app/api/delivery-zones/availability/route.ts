/**
 * T024: Delivery availability API endpoint
 *
 * GET /api/delivery-zones/availability - Check delivery availability and slots for postal code
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'

// Rate limiter for availability endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 200,
})

// Canadian postal code regex pattern
const CANADIAN_POSTAL_CODE_REGEX =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i

function formatPostalCode(postalCode: string): string {
  const cleaned = postalCode.replace(/\s+/g, '').toUpperCase()
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  }
  return cleaned
}

function getPostalCodePrefix(postalCode: string): string {
  const formatted = formatPostalCode(postalCode)
  return formatted.slice(0, 3)
}

function calculateDeliverySlots() {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Delivery cutoff times (6 PM = 18:00)
  const cutoffHour = 18 // 6 PM

  // Calculate next Sunday delivery
  const daysToSunday = (7 - currentDay) % 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + (daysToSunday === 0 ? 7 : daysToSunday))

  // Calculate next Wednesday delivery
  const daysToWednesday = (3 - currentDay + 7) % 7
  const nextWednesday = new Date(now)
  nextWednesday.setDate(
    now.getDate() + (daysToWednesday === 0 ? 7 : daysToWednesday)
  )

  // Calculate Sunday cutoff time (Tuesday 6 PM before delivery Sunday)
  const sundayCutoff = new Date(nextSunday)
  sundayCutoff.setDate(nextSunday.getDate() - 5) // Tuesday before
  sundayCutoff.setHours(cutoffHour, 0, 0, 0)

  // Calculate Wednesday cutoff time (Saturday 6 PM before delivery Wednesday)
  const wednesdayCutoff = new Date(nextWednesday)
  wednesdayCutoff.setDate(nextWednesday.getDate() - 4) // Saturday before
  wednesdayCutoff.setHours(cutoffHour, 0, 0, 0)

  // Check if cutoff has passed
  const sundayPastCutoff = now > sundayCutoff
  const wednesdayPastCutoff = now > wednesdayCutoff

  return {
    sunday: {
      date: nextSunday.toISOString().split('T')[0],
      cutoffTime: sundayCutoff.toISOString(),
      isPastCutoff: sundayPastCutoff,
    },
    wednesday: {
      date: nextWednesday.toISOString().split('T')[0],
      cutoffTime: wednesdayCutoff.toISOString(),
      isPastCutoff: wednesdayPastCutoff,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 60, 'CACHE_TOKEN') // 60 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postalCode = searchParams.get('postalCode')

    if (!postalCode) {
      return NextResponse.json(
        { success: false, error: 'postalCode parameter is required' },
        { status: 400 }
      )
    }

    // Validate postal code format
    if (!CANADIAN_POSTAL_CODE_REGEX.test(postalCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid postal code format' },
        { status: 400 }
      )
    }

    const postalPrefix = getPostalCodePrefix(postalCode)

    // Find delivery zone for this postal code
    const deliveryZone = await prisma.deliveryZone.findFirst({
      where: {
        postalCodeList: {
          has: postalPrefix,
        },
        isActive: true,
      },
    })

    if (!deliveryZone) {
      return NextResponse.json(
        { success: false, error: 'Postal code is not serviceable' },
        { status: 404 }
      )
    }

    // Calculate delivery availability
    const deliverySlots = calculateDeliverySlots()

    // Get current order counts for this zone (simplified - in real app would query orders)
    // For now, we'll simulate slot availability
    const maxSlots = deliveryZone.maxOrders || 50
    const currentSundayOrders = Math.floor(Math.random() * maxSlots * 0.8) // Simulate 0-80% capacity
    const currentWednesdayOrders = Math.floor(Math.random() * maxSlots * 0.7) // Simulate 0-70% capacity

    const response = {
      success: true,
      data: {
        zone: {
          id: deliveryZone.id,
          name: deliveryZone.name,
          deliveryFee: parseFloat(deliveryZone.deliveryFee.toString()),
        },
        availability: {
          sunday: {
            date: deliverySlots.sunday.date,
            isAvailable:
              deliveryZone.deliveryDays.includes('SUNDAY') &&
              !deliverySlots.sunday.isPastCutoff,
            slotsRemaining: Math.max(0, maxSlots - currentSundayOrders),
            cutoffTime: deliverySlots.sunday.cutoffTime,
            isPastCutoff: deliverySlots.sunday.isPastCutoff,
          },
          wednesday: {
            date: deliverySlots.wednesday.date,
            isAvailable:
              deliveryZone.deliveryDays.includes('WEDNESDAY') &&
              !deliverySlots.wednesday.isPastCutoff,
            slotsRemaining: Math.max(0, maxSlots - currentWednesdayOrders),
            cutoffTime: deliverySlots.wednesday.cutoffTime,
            isPastCutoff: deliverySlots.wednesday.isPastCutoff,
          },
        },
      },
    }

    // Set caching headers (short cache for availability data)
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600') // 5 min client, 10 min CDN

    return NextResponse.json(response, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Delivery availability API error:', error)
    return handleApiError(error, 'Failed to check delivery availability')
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
