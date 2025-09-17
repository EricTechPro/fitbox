/**
 * T024: Delivery zone validation API endpoint
 *
 * POST /api/delivery-zones/validate - Postal code validation, delivery zone lookup, fee calculation
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

// Rate limiter for delivery validation endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 300,
})

// Validation schema for postal code
const postalCodeSchema = z.object({
  postalCode: z.string().min(1, 'Postal code is required'),
})

// Canadian postal code regex pattern
const CANADIAN_POSTAL_CODE_REGEX =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i

function formatPostalCode(postalCode: string): string {
  // Remove spaces and convert to uppercase
  const cleaned = postalCode.replace(/\s+/g, '').toUpperCase()

  // Add space in the middle if it's 6 characters
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  }

  return cleaned
}

function validateCanadianPostalCode(postalCode: string): boolean {
  const formatted = formatPostalCode(postalCode)
  return CANADIAN_POSTAL_CODE_REGEX.test(formatted)
}

function getPostalCodePrefix(postalCode: string): string {
  const formatted = formatPostalCode(postalCode)
  return formatted.slice(0, 3)
}

function calculateNextDeliveryDates(): { sunday?: string; wednesday?: string } {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Find next Sunday
  const daysToSunday = (7 - currentDay) % 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + (daysToSunday === 0 ? 7 : daysToSunday))

  // Find next Wednesday
  const daysToWednesday = (3 - currentDay + 7) % 7
  const nextWednesday = new Date(now)
  nextWednesday.setDate(
    now.getDate() + (daysToWednesday === 0 ? 7 : daysToWednesday)
  )

  return {
    sunday: nextSunday.toISOString().split('T')[0],
    wednesday: nextWednesday.toISOString().split('T')[0],
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 50, 'CACHE_TOKEN') // 50 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const validation = postalCodeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validation.error.issues[0]?.message || 'postalCode is required',
        },
        { status: 400 }
      )
    }

    const { postalCode } = validation.data

    // Validate Canadian postal code format
    if (!validateCanadianPostalCode(postalCode)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid Canadian postal code format. Please use format: A1A 1A1',
        },
        { status: 400 }
      )
    }

    const formattedPostalCode = formatPostalCode(postalCode)
    const postalPrefix = getPostalCodePrefix(postalCode)

    // Find delivery zone that services this postal code
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
        {
          success: true,
          data: {
            isValid: false,
            postalCode: formattedPostalCode,
          },
        },
        { status: 200 }
      )
    }

    // Get estimated delivery dates
    const estimatedDeliveryDates = calculateNextDeliveryDates()

    const response = {
      success: true,
      data: {
        isValid: true,
        deliveryZone: {
          id: deliveryZone.id,
          name: deliveryZone.name,
          deliveryFee: parseFloat(deliveryZone.deliveryFee.toString()),
          deliveryDays: deliveryZone.deliveryDays,
          isActive: deliveryZone.isActive,
        },
        postalCode: formattedPostalCode,
        formattedPostalCode,
        estimatedDeliveryDates,
      },
    }

    // Set caching headers (cache postal code lookups for 1 hour)
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200') // 1 hour client, 2 hours CDN
    headers.set('X-Cache', 'MISS') // Indicate cache status

    return NextResponse.json(response, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Delivery zone validation API error:', error)
    return handleApiError(error, 'Failed to validate delivery zone')
  }
}

// Only POST method is allowed
export async function GET() {
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
