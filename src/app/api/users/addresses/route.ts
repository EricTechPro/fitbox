/**
 * T025: User address management API endpoints
 *
 * GET /api/users/addresses - Get user addresses
 * POST /api/users/addresses - Create new address
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Rate limiter for address endpoints
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 150,
})

// Validation schema for address creation
const createAddressSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  streetLine1: z.string().min(1, 'Street address is required').max(100),
  streetLine2: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(50),
  province: z
    .string()
    .min(2)
    .max(2)
    .refine(val => val === 'BC', 'Only BC province is supported'),
  postalCode: z.string().min(6).max(7),
  instructions: z.string().max(200).optional(),
})

// Canadian postal code regex
const CANADIAN_POSTAL_CODE_REGEX =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim()
}

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

async function validateDeliveryZone(
  postalCode: string
): Promise<string | null> {
  const postalPrefix = getPostalCodePrefix(postalCode)

  const deliveryZone = await prisma.deliveryZone.findFirst({
    where: {
      postalCodeList: {
        has: postalPrefix,
      },
      isActive: true,
    },
  })

  return deliveryZone?.id || null
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 100, 'CACHE_TOKEN')
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch user addresses
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    const response = {
      success: true,
      data: addresses.map(address => ({
        id: address.id,
        name: address.name,
        streetLine1: address.streetLine1,
        streetLine2: address.streetLine2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        instructions: address.instructions,
        deliveryZone: address.deliveryZone,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      })),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get addresses API error:', error)
    return handleApiError(error, 'Failed to fetch user addresses')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 10, 'CACHE_TOKEN') // Lower limit for creates
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
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

    const validation = createAddressSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validation.error.issues[0]?.message || 'Required fields missing',
        },
        { status: 400 }
      )
    }

    const addressData = validation.data

    // Sanitize text inputs
    if (addressData.name) {
      addressData.name = sanitizeInput(addressData.name)
    }
    addressData.streetLine1 = sanitizeInput(addressData.streetLine1)
    if (addressData.streetLine2) {
      addressData.streetLine2 = sanitizeInput(addressData.streetLine2)
    }
    addressData.city = sanitizeInput(addressData.city)
    if (addressData.instructions) {
      addressData.instructions = sanitizeInput(addressData.instructions)
    }

    // Validate and format postal code
    const formattedPostalCode = formatPostalCode(addressData.postalCode)
    if (!CANADIAN_POSTAL_CODE_REGEX.test(formattedPostalCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid postal code format' },
        { status: 400 }
      )
    }

    // Check delivery zone coverage
    const deliveryZone = await validateDeliveryZone(formattedPostalCode)
    if (!deliveryZone) {
      return NextResponse.json(
        { success: false, error: 'Sorry, delivery not available in this area' },
        { status: 400 }
      )
    }

    // Use transaction for atomic address creation with limit check
    let newAddress
    try {
      newAddress = await prisma.$transaction(async tx => {
        // Check address limit (maximum 5 addresses per user) within transaction
        const addressCount = await tx.address.count({
          where: { userId: session.user.id },
        })

        if (addressCount >= 5) {
          throw new Error('Maximum addresses limit reached (5 addresses)')
        }

        // Create new address within transaction
        return await tx.address.create({
          data: {
            userId: session.user.id,
            name: addressData.name,
            streetLine1: addressData.streetLine1,
            streetLine2: addressData.streetLine2,
            city: addressData.city,
            province: addressData.province,
            postalCode: formattedPostalCode,
            instructions: addressData.instructions,
            deliveryZone,
          },
        })
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Maximum addresses limit reached (5 addresses)'
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Maximum addresses limit reached (5 addresses)',
          },
          { status: 400 }
        )
      }
      throw error // Re-throw other errors to be handled by the outer catch block
    }

    const response = {
      success: true,
      data: {
        id: newAddress.id,
        name: newAddress.name,
        streetLine1: newAddress.streetLine1,
        streetLine2: newAddress.streetLine2,
        city: newAddress.city,
        province: newAddress.province,
        postalCode: newAddress.postalCode,
        instructions: newAddress.instructions,
        deliveryZone: newAddress.deliveryZone,
        createdAt: newAddress.createdAt.toISOString(),
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Create address API error:', error)
    return handleApiError(error, 'Failed to create address')
  }
}

// Only GET and POST methods are allowed
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
