import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken, getCSRFHeaders } from '@/lib/csrf-protection'
import { handleCors, addCorsHeaders } from '@/lib/cors-config'

/**
 * Get CSRF token for client-side usage
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('Origin')

  try {
    // Handle CORS
    const corsResponse = handleCors(request)
    if (corsResponse) {
      return corsResponse
    }

    // Generate new CSRF token
    const { token, cookieValue } = generateCSRFToken()

    const response = NextResponse.json(
      {
        csrfToken: token,
        message: 'CSRF token generated successfully'
      },
      {
        status: 200,
        headers: {
          ...getCSRFHeaders(token, cookieValue),
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

    return addCorsHeaders(response, origin)

  } catch (error) {
    const response = NextResponse.json(
      { message: 'Failed to generate CSRF token' },
      { status: 500 }
    )

    return addCorsHeaders(response, origin)
  }
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCors(request)
  if (corsResponse) {
    return corsResponse
  }

  return new NextResponse(null, { status: 200 })
}