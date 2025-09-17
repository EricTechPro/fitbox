/**
 * T022: Contract tests for user profile management endpoints
 *
 * Tests profile updates, address management, contact information
 * Following TDD approach - these tests MUST FAIL before implementation
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// Types for API responses
interface ProfileResponse {
  success: boolean
  data?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    role: UserRole
    createdAt: string
    updatedAt: string
  }
  error?: string
}

interface UpdateProfileResponse {
  success: boolean
  data?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    updatedAt: string
  }
  error?: string
}

interface AddressResponse {
  success: boolean
  data?: Array<{
    id: string
    name?: string
    streetLine1: string
    streetLine2?: string
    city: string
    province: string
    postalCode: string
    instructions?: string
    deliveryZone?: string
    createdAt: string
    updatedAt: string
  }>
  error?: string
}

interface CreateAddressResponse {
  success: boolean
  data?: {
    id: string
    name?: string
    streetLine1: string
    streetLine2?: string
    city: string
    province: string
    postalCode: string
    instructions?: string
    deliveryZone?: string
    createdAt: string
  }
  error?: string
}

interface DeleteAddressResponse {
  success: boolean
  data?: {
    message: string
    deletedAddressId: string
  }
  error?: string
}

describe('Profile API Contract Tests', () => {
  let testUserId: string
  let authToken: string

  beforeAll(async () => {
    // Clean up test data
    await prisma.address.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.address.deleteMany()
    await prisma.user.deleteMany()
  })

  beforeEach(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@fitbox.com',
        password: '$2b$12$hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-604-555-0123',
        role: 'CUSTOMER',
      },
    })

    testUserId = testUser.id

    // Mock auth token (in real implementation, this would come from NextAuth.js)
    authToken = 'mock-jwt-token'

    // Create test addresses
    await prisma.address.create({
      data: {
        id: 'address-1',
        userId: testUserId,
        name: 'Home',
        streetLine1: '123 Main Street',
        streetLine2: 'Apt 4B',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        instructions: 'Ring buzzer #4',
        deliveryZone: 'zone-downtown',
      },
    })
  })

  describe('GET /api/users/profile', () => {
    it('should return authenticated user profile', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)

      const data: ProfileResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: testUserId,
        email: 'test@fitbox.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-604-555-0123',
        role: 'CUSTOMER',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })

      // Verify timestamps are valid ISO strings
      expect(new Date(data.data!.createdAt).toISOString()).toBe(
        data.data!.createdAt
      )
      expect(new Date(data.data!.updatedAt).toISOString()).toBe(
        data.data!.updatedAt
      )
    })

    it('should return 401 for unauthenticated requests', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile')

      expect(response.status).toBe(401)

      const data: ProfileResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 401 for invalid token', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        headers: {
          Authorization: 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(401)

      const data: ProfileResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid token')
    })

    it('should exclude sensitive information', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)

      const data: ProfileResponse = await response.json()
      expect(data.data).toBeDefined()

      // Password should not be included in response
      expect('password' in data.data!).toBe(false)
    })
  })

  describe('PATCH /api/users/profile', () => {
    it('should update user profile information', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-604-555-9876',
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)

      const data: UpdateProfileResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: testUserId,
        email: 'test@fitbox.com', // Email should remain unchanged
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-604-555-9876',
        updatedAt: expect.any(String),
      })

      // Verify updatedAt is recent
      const updatedAt = new Date(data.data!.updatedAt)
      const now = new Date()
      expect(now.getTime() - updatedAt.getTime()).toBeLessThan(5000) // Within 5 seconds
    })

    it('should validate phone number format', async () => {
      const updateData = {
        phone: 'invalid-phone',
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(400)

      const data: UpdateProfileResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid phone number format')
    })

    it('should reject email updates', async () => {
      const updateData = {
        email: 'newemail@fitbox.com',
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(400)

      const data: UpdateProfileResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Email cannot be updated')
    })

    it('should sanitize input data', async () => {
      const updateData = {
        firstName: '<script>alert("xss")</script>John',
        lastName: 'Smith\n\nInjected',
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)

      const data: UpdateProfileResponse = await response.json()
      expect(data.success).toBe(true)

      // Verify XSS prevention
      expect(data.data?.firstName).not.toContain('<script>')
      expect(data.data?.firstName).toBe('John') // Sanitized
      expect(data.data?.lastName).toBe('Smith') // Newlines removed
    })

    it('should require authentication', async () => {
      const updateData = {
        firstName: 'Jane',
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(401)

      const data: UpdateProfileResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('GET /api/users/addresses', () => {
    it('should return user addresses', async () => {
      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      expect(response.status).toBe(200)

      const data: AddressResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data![0]).toMatchObject({
        id: 'address-1',
        name: 'Home',
        streetLine1: '123 Main Street',
        streetLine2: 'Apt 4B',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        instructions: 'Ring buzzer #4',
        deliveryZone: 'zone-downtown',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should return empty array for user with no addresses', async () => {
      // Create user with no addresses
      await prisma.user.create({
        data: {
          email: 'noaddress@fitbox.com',
          password: '$2b$12$hashedpassword',
          role: 'CUSTOMER',
        },
      })

      const newUserToken = 'mock-jwt-token-2'

      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          headers: {
            Authorization: `Bearer ${newUserToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      expect(response.status).toBe(200)

      const data: AddressResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })

    it('should require authentication', async () => {
      const response = await fetch('http://localhost:3000/api/users/addresses')

      expect(response.status).toBe(401)

      const data: AddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('POST /api/users/addresses', () => {
    it('should create new address', async () => {
      const addressData = {
        name: 'Office',
        streetLine1: '456 Business Ave',
        streetLine2: 'Suite 200',
        city: 'Richmond',
        province: 'BC',
        postalCode: 'V6X 2A1',
        instructions: 'Use main entrance',
      }

      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        }
      )

      expect(response.status).toBe(201)

      const data: CreateAddressResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: expect.any(String),
        name: 'Office',
        streetLine1: '456 Business Ave',
        streetLine2: 'Suite 200',
        city: 'Richmond',
        province: 'BC',
        postalCode: 'V6X 2A1',
        instructions: 'Use main entrance',
        deliveryZone: expect.any(String), // Should be calculated
        createdAt: expect.any(String),
      })
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Incomplete Address',
        // Missing required fields
      }

      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidData),
        }
      )

      expect(response.status).toBe(400)

      const data: CreateAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Required fields missing')
    })

    it('should validate postal code format', async () => {
      const addressData = {
        name: 'Invalid',
        streetLine1: '123 Street',
        city: 'Vancouver',
        province: 'BC',
        postalCode: '12345', // Invalid format
      }

      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        }
      )

      expect(response.status).toBe(400)

      const data: CreateAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid postal code format')
    })

    it('should validate delivery zone coverage', async () => {
      const addressData = {
        name: 'Out of Area',
        streetLine1: '123 Remote Street',
        city: 'Calgary',
        province: 'AB',
        postalCode: 'T2P 1A1', // Outside Greater Vancouver Area
      }

      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        }
      )

      expect(response.status).toBe(400)

      const data: CreateAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('delivery not available')
    })

    it('should limit maximum addresses per user', async () => {
      // Create addresses up to limit (assume limit is 5)
      for (let i = 2; i <= 5; i++) {
        await prisma.address.create({
          data: {
            userId: testUserId,
            name: `Address ${i}`,
            streetLine1: `${i}00 Test Street`,
            city: 'Vancouver',
            province: 'BC',
            postalCode: 'V6B 1A1',
          },
        })
      }

      const addressData = {
        name: 'Sixth Address',
        streetLine1: '600 Test Street',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
      }

      const response = await fetch(
        'http://localhost:3000/api/users/addresses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        }
      )

      expect(response.status).toBe(400)

      const data: CreateAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Maximum addresses limit reached')
    })
  })

  describe('DELETE /api/users/addresses/[id]', () => {
    it('should delete user address', async () => {
      const response = await fetch(
        'http://localhost:3000/api/users/addresses/address-1',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      expect(response.status).toBe(200)

      const data: DeleteAddressResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        message: 'Address deleted successfully',
        deletedAddressId: 'address-1',
      })

      // Verify address is deleted
      const deletedAddress = await prisma.address.findUnique({
        where: { id: 'address-1' },
      })
      expect(deletedAddress).toBeNull()
    })

    it('should return 404 for non-existent address', async () => {
      const response = await fetch(
        'http://localhost:3000/api/users/addresses/non-existent',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      expect(response.status).toBe(404)

      const data: DeleteAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Address not found')
    })

    it('should prevent deleting other user addresses', async () => {
      // Create another user with address
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@fitbox.com',
          password: '$2b$12$hashedpassword',
          role: 'CUSTOMER',
        },
      })

      const otherUserAddress = await prisma.address.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Address',
          streetLine1: '789 Other Street',
          city: 'Vancouver',
          province: 'BC',
          postalCode: 'V6B 1A1',
        },
      })

      const response = await fetch(
        `http://localhost:3000/api/users/addresses/${otherUserAddress.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      expect(response.status).toBe(403)

      const data: DeleteAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Access denied')
    })

    it('should validate address ID format', async () => {
      const response = await fetch(
        'http://localhost:3000/api/users/addresses/invalid-id!',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      expect(response.status).toBe(400)

      const data: DeleteAddressResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid address ID')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to profile endpoints', async () => {
      // Make multiple rapid requests
      const requests = Array.from({ length: 20 }, () =>
        fetch('http://localhost:3000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
      )

      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(res => res.status === 429)

      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Security', () => {
    it('should prevent SQL injection in profile updates', async () => {
      const maliciousData = {
        firstName: "'; DROP TABLE users; --",
        lastName: "Robert'); DELETE FROM addresses WHERE ('1'='1",
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maliciousData),
      })

      // Should either succeed with sanitized data or fail validation
      expect([200, 400]).toContain(response.status)

      // Verify tables still exist
      const userCount = await prisma.user.count()
      expect(userCount).toBeGreaterThan(0)
    })

    it('should prevent CSRF attacks', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          // Missing CSRF token header
        },
        body: JSON.stringify({ firstName: 'Test' }),
      })

      expect(response.status).toBe(403)

      const data = await response.json()
      expect(data.error).toContain('CSRF')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should handle invalid HTTP methods', async () => {
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT', // Not supported
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(405)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Method not allowed')
    })
  })
})
