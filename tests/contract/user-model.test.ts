import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

describe('User Model Contract Tests', () => {
  // Setup and teardown
  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect()
  })

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up data before each test
    await prisma.user.deleteMany()
  })

  describe('User CRUD Operations', () => {
    test('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@fitbox.ca',
        password: await bcrypt.hash('password123', 12),
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-604-123-4567',
        role: 'CUSTOMER' as const
      }

      const user = await prisma.user.create({
        data: userData
      })

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.firstName).toBe(userData.firstName)
      expect(user.lastName).toBe(userData.lastName)
      expect(user.phone).toBe(userData.phone)
      expect(user.role).toBe('CUSTOMER')
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    test('should enforce unique email constraint', async () => {
      const email = 'duplicate@fitbox.ca'
      const passwordHash = await bcrypt.hash('password123', 12)

      // Create first user
      await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          firstName: 'First',
          lastName: 'User'
        }
      })

      // Attempt to create second user with same email
      await expect(
        prisma.user.create({
          data: {
            email,
            password: passwordHash,
            firstName: 'Second',
            lastName: 'User'
          }
        })
      ).rejects.toThrow()
    })

    test('should retrieve user by email', async () => {
      const email = 'findme@fitbox.ca'
      const passwordHash = await bcrypt.hash('password123', 12)

      const createdUser = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          firstName: 'Find',
          lastName: 'Me'
        }
      })

      const foundUser = await prisma.user.findUnique({
        where: { email }
      })

      expect(foundUser).not.toBeNull()
      expect(foundUser?.id).toBe(createdUser.id)
      expect(foundUser?.email).toBe(email)
    })

    test('should update user information', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'update@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Old',
          lastName: 'Name'
        }
      })

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: 'New',
          lastName: 'Name',
          phone: '+1-604-999-8888'
        }
      })

      expect(updatedUser.firstName).toBe('New')
      expect(updatedUser.lastName).toBe('Name')
      expect(updatedUser.phone).toBe('+1-604-999-8888')
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime())
    })

    test('should delete user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'delete@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Delete',
          lastName: 'Me'
        }
      })

      await prisma.user.delete({
        where: { id: user.id }
      })

      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id }
      })

      expect(deletedUser).toBeNull()
    })
  })

  describe('User Validation Rules', () => {
    test('should require email field', async () => {
      await expect(
        prisma.user.create({
          data: {
            password: await bcrypt.hash('password123', 12),
            firstName: 'No',
            lastName: 'Email'
          } as any
        })
      ).rejects.toThrow()
    })

    test('should require password field', async () => {
      await expect(
        prisma.user.create({
          data: {
            email: 'nopassword@fitbox.ca',
            firstName: 'No',
            lastName: 'Password'
          } as any
        })
      ).rejects.toThrow()
    })

    test('should default role to CUSTOMER', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'defaultrole@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Default',
          lastName: 'Role'
        }
      })

      expect(user.role).toBe('CUSTOMER')
    })

    test('should allow ADMIN role', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'admin@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      })

      expect(user.role).toBe('ADMIN')
    })

    test('should allow null firstName and lastName', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'minimal@fitbox.ca',
          password: await bcrypt.hash('password123', 12)
        }
      })

      expect(user.firstName).toBeNull()
      expect(user.lastName).toBeNull()
      expect(user.phone).toBeNull()
    })
  })

  describe('Password Hashing', () => {
    test('should store hashed password, not plain text', async () => {
      const plainPassword = 'mySecretPassword123'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      const user = await prisma.user.create({
        data: {
          email: 'hash@fitbox.ca',
          password: hashedPassword,
          firstName: 'Hash',
          lastName: 'Test'
        }
      })

      // Password should be hashed, not plain text
      expect(user.password).not.toBe(plainPassword)
      expect(user.password).toBe(hashedPassword)
      
      // Should be able to verify the password
      const isValid = await bcrypt.compare(plainPassword, user.password)
      expect(isValid).toBe(true)
    })

    test('should verify correct password', async () => {
      const plainPassword = 'correctPassword123'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      await prisma.user.create({
        data: {
          email: 'verify@fitbox.ca',
          password: hashedPassword,
          firstName: 'Verify',
          lastName: 'Password'
        }
      })

      const isValid = await bcrypt.compare(plainPassword, hashedPassword)
      expect(isValid).toBe(true)
    })

    test('should reject incorrect password', async () => {
      const plainPassword = 'correctPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      await prisma.user.create({
        data: {
          email: 'reject@fitbox.ca',
          password: hashedPassword,
          firstName: 'Reject',
          lastName: 'Wrong'
        }
      })

      const isValid = await bcrypt.compare(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('User Relations', () => {
    test('should support addresses relationship', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'addresses@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Address',
          lastName: 'Test'
        }
      })

      // This test verifies the relationship exists in the schema
      // Address creation will be tested in address model tests
      const userWithAddresses = await prisma.user.findUnique({
        where: { id: user.id },
        include: { addresses: true }
      })

      expect(userWithAddresses?.addresses).toBeDefined()
      expect(Array.isArray(userWithAddresses?.addresses)).toBe(true)
    })

    test('should support orders relationship', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'orders@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Order',
          lastName: 'Test'
        }
      })

      // This test verifies the relationship exists in the schema
      // Order creation will be tested in order model tests
      const userWithOrders = await prisma.user.findUnique({
        where: { id: user.id },
        include: { orders: true }
      })

      expect(userWithOrders?.orders).toBeDefined()
      expect(Array.isArray(userWithOrders?.orders)).toBe(true)
    })
  })

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date()
      
      const user = await prisma.user.create({
        data: {
          email: 'timestamps@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Timestamp',
          lastName: 'Test'
        }
      })

      const afterCreate = new Date()

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
    })

    test('should update updatedAt on modification', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'updatetime@fitbox.ca',
          password: await bcrypt.hash('password123', 12),
          firstName: 'Update',
          lastName: 'Time'
        }
      })

      const originalUpdatedAt = user.updatedAt

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { firstName: 'Updated' }
      })

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })
})