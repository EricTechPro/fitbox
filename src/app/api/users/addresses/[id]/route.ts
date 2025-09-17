/**
 * T025: Individual address management API endpoint
 *
 * DELETE /api/users/addresses/[id] - Delete user address
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors'

// Rate limiter for address operations
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 30, 'CACHE_TOKEN')
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

    const { id } = params

    // Validate address ID format
    if (!id || id.length < 3 || /[^a-zA-Z0-9\-_]/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid address ID format' },
        { status: 400 }
      )
    }

    // Check if address exists and belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    // Delete the address
    await prisma.address.delete({
      where: { id },
    })

    const response = {
      success: true,
      data: {
        message: 'Address deleted successfully',
        deletedAddressId: id,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Delete address API error:', error)
    return handleApiError(error, 'Failed to delete address')
  }
}

// Only DELETE method is allowed
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  )
}

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
