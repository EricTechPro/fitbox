import { User, UserRole, Prisma, Address, Order } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { UserSchemas, validateInput, safeValidate } from '@/lib/validations'
import { ErrorFactory, ValidationError, NotFoundError, ConflictError, DatabaseError, asyncErrorHandler, AuthenticationError } from '@/lib/errors'

/**
 * User model service layer with comprehensive validation and error handling
 * Provides type-safe operations for user management with business logic validation
 */
export class UserModel {
  /**
   * Create a new user with validation and error handling
   * @param userData - User data to create
   * @returns Promise<User> - Created user without sensitive data
   * @throws {ValidationError} - When input data is invalid
   * @throws {ConflictError} - When email already exists
   * @throws {DatabaseError} - When database operation fails
   */
  static create = asyncErrorHandler(async (userData: CreateUserInput): Promise<User> => {
    // Validate input data
    const validatedData = validateInput(UserSchemas.create)(userData)
    
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
        select: { id: true }
      })
      
      if (existingUser) {
        throw ErrorFactory.conflict(`User with email ${validatedData.email} already exists`)
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone,
          role: validatedData.role,
        },
        // Exclude sensitive data from response
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      return user as User
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error
      }
      throw ErrorFactory.database('user creation', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Find user by email with validation
   * @param email - Email address to search for
   * @returns Promise<User | null> - Found user or null
   * @throws {ValidationError} - When email format is invalid
   */
  static findByEmail = asyncErrorHandler(async (email: string): Promise<User | null> => {
    // Validate email format
    const validation = safeValidate(UserSchemas.create.pick({ email: true }), { email })
    if (!validation.success) {
      throw new ValidationError('Invalid email format', { email })
    }
    
    try {
      return await prisma.user.findUnique({
        where: { email: validation.data.email },
        select: {
          id: true,
          email: true,
          password: true, // Include for authentication
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }) as User | null
    } catch (error) {
      throw ErrorFactory.database('user lookup by email', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Find user by ID with validation
   * @param id - User UUID to search for
   * @returns Promise<User | null> - Found user or null
   * @throws {ValidationError} - When ID format is invalid
   */
  static findById = asyncErrorHandler(async (id: string): Promise<User | null> => {
    // Validate UUID format
    const validation = safeValidate(UserSchemas.create.pick({ email: true }).extend({ id: z.string().uuid() }), { id, email: 'dummy@test.com' })
    if (!validation.success) {
      throw new ValidationError('Invalid user ID format', { id })
    }
    
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }) as User | null
    } catch (error) {
      throw ErrorFactory.database('user lookup by ID', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Find user by ID with addresses
   * @param id - User UUID to search for
   * @returns Promise<UserWithAddresses | null> - Found user with addresses or null
   * @throws {ValidationError} - When ID format is invalid
   */
  static findByIdWithAddresses = asyncErrorHandler(async (id: string): Promise<UserWithAddresses | null> => {
    // Validate UUID format
    const validation = safeValidate(z.string().uuid(), id)
    if (!validation.success) {
      throw new ValidationError('Invalid user ID format', { id })
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          addresses: {
            select: {
              id: true,
              street: true,
              city: true,
              province: true,
              postalCode: true,
              country: true,
              apartmentNumber: true,
              deliveryInstructions: true,
              isDefault: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      return user as UserWithAddresses | null
    } catch (error) {
      throw ErrorFactory.database('user lookup with addresses', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Find user by ID with orders
   * @param id - User UUID to search for
   * @param options - Query options for pagination and ordering
   * @returns Promise<UserWithOrders | null> - Found user with orders or null
   * @throws {ValidationError} - When ID format is invalid
   */
  static findByIdWithOrders = asyncErrorHandler(async (
    id: string,
    options?: {
      skip?: number
      take?: number
      orderBy?: Prisma.OrderOrderByWithRelationInput
    }
  ): Promise<UserWithOrders | null> => {
    // Validate UUID format
    const validation = safeValidate(z.string().uuid(), id)
    if (!validation.success) {
      throw new ValidationError('Invalid user ID format', { id })
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              orderType: true,
              totalAmount: true,
              finalAmount: true,
              deliveryDate: true,
              deliveryWindow: true,
              createdAt: true,
              updatedAt: true
            },
            skip: options?.skip,
            take: options?.take || 10,
            orderBy: options?.orderBy || { createdAt: 'desc' }
          }
        }
      })
      
      return user as UserWithOrders | null
    } catch (error) {
      throw ErrorFactory.database('user lookup with orders', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Update user information with validation
   * @param id - User UUID to update
   * @param updateData - Data to update
   * @returns Promise<User> - Updated user
   * @throws {ValidationError} - When input data is invalid
   * @throws {NotFoundError} - When user doesn't exist
   * @throws {ConflictError} - When email already exists
   */
  static update = asyncErrorHandler(async (id: string, updateData: UpdateUserInput): Promise<User> => {
    // Validate UUID format
    const idValidation = safeValidate(z.string().uuid(), id)
    if (!idValidation.success) {
      throw new ValidationError('Invalid user ID format', { id })
    }
    
    // Validate update data
    const dataValidation = safeValidate(UserSchemas.update, updateData)
    if (!dataValidation.success) {
      throw new ValidationError('Invalid update data', { errors: dataValidation.errors.errors })
    }
    
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true }
      })
      
      if (!existingUser) {
        throw ErrorFactory.notFound('User', id)
      }
      
      // Check if email is being changed and already exists
      if (dataValidation.data.email && dataValidation.data.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: dataValidation.data.email },
          select: { id: true }
        })
        
        if (emailExists) {
          throw ErrorFactory.conflict(`User with email ${dataValidation.data.email} already exists`)
        }
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataValidation.data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      return updatedUser as User
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error
      }
      throw ErrorFactory.database('user update', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Update user password with validation
   * @param id - User UUID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns Promise<User> - Updated user
   * @throws {ValidationError} - When passwords don't meet requirements
   * @throws {NotFoundError} - When user doesn't exist
   * @throws {AuthenticationError} - When current password is incorrect
   */
  static updatePassword = asyncErrorHandler(async (
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> => {
    // Validate input
    const validation = safeValidate(
      z.object({
        id: z.string().uuid(),
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: UserSchemas.create.shape.password
      }),
      { id, currentPassword, newPassword }
    )
    
    if (!validation.success) {
      throw new ValidationError('Invalid input data', { errors: validation.errors.errors })
    }
    
    try {
      // Get user with password for verification
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, password: true }
      })
      
      if (!user) {
        throw ErrorFactory.notFound('User', id)
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        throw ErrorFactory.unauthorized('Current password is incorrect')
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      // Update password
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      return updatedUser as User
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthenticationError) {
        throw error
      }
      throw ErrorFactory.database('password update', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Verify user password
   * @param plainPassword - Plain text password to verify
   * @param hashedPassword - Hashed password to compare against
   * @returns Promise<boolean> - True if password matches
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false
    }
    
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      // Log error but don't throw to avoid exposing internal details
      console.error('Password verification error:', error)
      return false
    }
  }

  /**
   * Soft delete user (deactivate instead of hard delete)
   * @param id - User UUID to delete
   * @returns Promise<User> - Deactivated user
   * @throws {ValidationError} - When ID format is invalid
   * @throws {NotFoundError} - When user doesn't exist
   */
  static softDelete = asyncErrorHandler(async (id: string): Promise<User> => {
    const validation = safeValidate(z.string().uuid(), id)
    if (!validation.success) {
      throw new ValidationError('Invalid user ID format', { id })
    }
    
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true }
      })
      
      if (!existingUser) {
        throw ErrorFactory.notFound('User', id)
      }
      
      // Soft delete by updating email to prevent conflicts
      const timestamp = new Date().getTime()
      const deletedUser = await prisma.user.update({
        where: { id },
        data: {
          email: `deleted_${timestamp}_${existingUser.id}@deleted.com`,
          firstName: null,
          lastName: null,
          phone: null
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      return deletedUser as User
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      throw ErrorFactory.database('user deletion', error instanceof Error ? error.message : 'Unknown error')
    }
  })
  
  /**
   * Hard delete user (use with caution - for testing/admin only)
   * @param id - User UUID to delete
   * @returns Promise<User> - Deleted user
   * @throws {ValidationError} - When ID format is invalid
   * @throws {NotFoundError} - When user doesn't exist
   */
  static delete = asyncErrorHandler(async (id: string): Promise<User> => {
    const validation = safeValidate(z.string().uuid(), id)
    if (!validation.success) {
      throw new ValidationError('Invalid user ID format', { id })
    }
    
    try {
      const deletedUser = await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      return deletedUser as User
    } catch (error) {
      if (error.code === 'P2025') {
        throw ErrorFactory.notFound('User', id)
      }
      throw ErrorFactory.database('user deletion', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Check if email exists with validation
   * @param email - Email address to check
   * @returns Promise<boolean> - True if email exists
   * @throws {ValidationError} - When email format is invalid
   */
  static emailExists = asyncErrorHandler(async (email: string): Promise<boolean> => {
    const validation = safeValidate(UserSchemas.create.pick({ email: true }), { email })
    if (!validation.success) {
      throw new ValidationError('Invalid email format', { email })
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: validation.data.email },
        select: { id: true }
      })
      
      return !!user
    } catch (error) {
      throw ErrorFactory.database('email existence check', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Get all users with pagination and filtering (admin only)
   * @param options - Query options for pagination and ordering
   * @returns Promise<User[]> - Array of users
   */
  static findAll = asyncErrorHandler(async (options?: {
    skip?: number
    take?: number
    orderBy?: Prisma.UserOrderByWithRelationInput
    role?: UserRole
  }): Promise<User[]> => {
    try {
      const whereConditions: Prisma.UserWhereInput = {}
      
      if (options?.role) {
        whereConditions.role = options.role
      }
      
      const users = await prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        skip: options?.skip || 0,
        take: Math.min(options?.take || 50, 100), // Limit to max 100 records
        orderBy: options?.orderBy || { createdAt: 'desc' }
      })
      
      return users as User[]
    } catch (error) {
      throw ErrorFactory.database('user listing', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Count total users with optional filtering
   * @param filters - Optional filters to apply
   * @returns Promise<number> - Total count of users
   */
  static count = asyncErrorHandler(async (filters?: {
    role?: UserRole
    createdAfter?: Date
    createdBefore?: Date
  }): Promise<number> => {
    try {
      const whereConditions: Prisma.UserWhereInput = {}
      
      if (filters?.role) {
        whereConditions.role = filters.role
      }
      
      if (filters?.createdAfter || filters?.createdBefore) {
        whereConditions.createdAt = {}
        if (filters.createdAfter) {
          whereConditions.createdAt.gte = filters.createdAfter
        }
        if (filters.createdBefore) {
          whereConditions.createdAt.lte = filters.createdBefore
        }
      }
      
      return await prisma.user.count({ where: whereConditions })
    } catch (error) {
      throw ErrorFactory.database('user counting', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Find users by role with pagination
   * @param role - User role to filter by
   * @param options - Query options for pagination
   * @returns Promise<User[]> - Array of users with specified role
   */
  static findByRole = asyncErrorHandler(async (
    role: UserRole,
    options?: {
      skip?: number
      take?: number
      orderBy?: Prisma.UserOrderByWithRelationInput
    }
  ): Promise<User[]> => {
    try {
      const users = await prisma.user.findMany({
        where: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        skip: options?.skip || 0,
        take: Math.min(options?.take || 50, 100),
        orderBy: options?.orderBy || { createdAt: 'desc' }
      })
      
      return users as User[]
    } catch (error) {
      throw ErrorFactory.database('user lookup by role', error instanceof Error ? error.message : 'Unknown error')
    }
  })
  
  /**
   * Authenticate user with email and password
   * @param email - User email
   * @param password - Plain text password
   * @returns Promise<User | null> - Authenticated user or null
   * @throws {ValidationError} - When input data is invalid
   */
  static authenticate = asyncErrorHandler(async (email: string, password: string): Promise<User | null> => {
    const validation = safeValidate(UserSchemas.login, { email, password })
    if (!validation.success) {
      throw new ValidationError('Invalid login credentials format', { errors: validation.errors.errors })
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: validation.data.email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      if (!user) {
        return null
      }
      
      const isValidPassword = await this.verifyPassword(password, user.password)
      if (!isValidPassword) {
        return null
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw ErrorFactory.database('user authentication', error instanceof Error ? error.message : 'Unknown error')
    }
  })
}

/**
 * Business logic helper methods
 */
export class UserBusinessLogic {
  /**
   * Generate user display name
   * @param user - User object
   * @returns string - Display name
   */
  static getDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) {
      return user.firstName
    }
    return user.email
  }
  
  /**
   * Check if user is admin
   * @param user - User object
   * @returns boolean - True if user is admin
   */
  static isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN
  }
  
  /**
   * Check if user can manage other users
   * @param user - User object
   * @returns boolean - True if user can manage others
   */
  static canManageUsers(user: User): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.STAFF
  }
}

// Legacy type exports maintained for backward compatibility
export type CreateUserData = CreateUserInput
export type UpdateUserData = UpdateUserInput


// Proper type definitions replacing 'any' types
export type UserWithAddresses = User & {
  addresses: Address[]
}

export type UserWithOrders = User & {
  orders: Order[]
}

export type UserWithRelations = User & {
  addresses?: Address[]
  orders?: Order[]
}

export type CreateUserInput = z.infer<typeof UserSchemas.create>
export type UpdateUserInput = z.infer<typeof UserSchemas.update>