/**
 * Zod validation schemas for FitBox application
 * Provides runtime validation and type safety for all data models
 */

import { z } from 'zod'
import { UserRole, OrderStatus, OrderType, MealCategory, UserSubscriptionStatus } from '@prisma/client'

/**
 * Common validation patterns and utilities
 */
export const CommonSchemas = {
  email: z.string().email('Invalid email format'),
  
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long'),
  
  postalCode: z.string()
    .regex(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/, 'Invalid Canadian postal code format (A1A 1A1)')
    .transform(code => code.replace(/\s+/g, ' ').toUpperCase()),
  
  bcPostalCode: z.string()
    .regex(/^V\d[A-Z]\s?\d[A-Z]\d$/, 'Must be a valid BC postal code (starts with V)')
    .transform(code => code.replace(/\s+/g, ' ').toUpperCase()),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  
  uuid: z.string().uuid('Invalid UUID format'),
  
  positiveNumber: z.number().positive('Must be a positive number'),
  
  nonNegativeNumber: z.number().min(0, 'Must be non-negative'),
  
  futureDate: z.date()
    .refine(date => date > new Date(), 'Date must be in the future'),
  
  pastOrPresentDate: z.date()
    .refine(date => date <= new Date(), 'Date cannot be in the future')
}

/**
 * User validation schemas
 */
export const UserSchemas = {
  create: z.object({
    email: CommonSchemas.email,
    password: CommonSchemas.password,
    firstName: z.string()
      .min(1, 'First name is required')
      .max(100, 'First name too long')
      .optional(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(100, 'Last name too long')
      .optional(),
    phone: CommonSchemas.phone.optional(),
    role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER)
  }),

  update: z.object({
    email: CommonSchemas.email.optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: CommonSchemas.phone.optional(),
    role: z.nativeEnum(UserRole).optional()
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: CommonSchemas.password
  }),

  login: z.object({
    email: CommonSchemas.email,
    password: z.string().min(1, 'Password is required')
  })
}

/**
 * Address validation schemas
 */
export const AddressSchemas = {
  create: z.object({
    street: z.string().min(1, 'Street address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    province: z.string().length(2, 'Province must be 2 characters').default('BC'),
    postalCode: CommonSchemas.bcPostalCode,
    country: z.string().default('Canada'),
    apartmentNumber: z.string().max(20).optional(),
    deliveryInstructions: z.string().max(500).optional(),
    isDefault: z.boolean().default(false)
  }),

  update: z.object({
    street: z.string().min(1).max(200).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().length(2).optional(),
    postalCode: CommonSchemas.bcPostalCode.optional(),
    country: z.string().optional(),
    apartmentNumber: z.string().max(20).optional(),
    deliveryInstructions: z.string().max(500).optional(),
    isDefault: z.boolean().optional()
  })
}

/**
 * Meal validation schemas
 */
export const MealSchemas = {
  create: z.object({
    name: z.string().min(1, 'Meal name is required').max(200),
    nameZh: z.string().max(200).optional(),
    description: z.string().min(1, 'Description is required').max(1000),
    descriptionZh: z.string().max(1000).optional(),
    ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient required'),
    allergens: z.array(z.string()).default([]),
    nutritionInfo: z.object({
      calories: z.number().int().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0),
      sodium: z.number().min(0)
    }),
    price: CommonSchemas.positiveNumber,
    category: z.nativeEnum(MealCategory),
    dietaryRestrictions: z.array(z.string()).default([]),
    spicyLevel: z.number().int().min(0).max(5).default(0),
    preparationTime: z.number().int().min(1).max(180),
    isActive: z.boolean().default(true),
    imageUrl: z.string().url().optional(),
    inventoryCount: CommonSchemas.nonNegativeNumber.default(0),
    lowStockThreshold: z.number().int().min(0).default(5)
  }),

  update: z.object({
    name: z.string().min(1).max(200).optional(),
    nameZh: z.string().max(200).optional(),
    description: z.string().min(1).max(1000).optional(),
    descriptionZh: z.string().max(1000).optional(),
    ingredients: z.array(z.string().min(1)).optional(),
    allergens: z.array(z.string()).optional(),
    nutritionInfo: z.object({
      calories: z.number().int().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0),
      sodium: z.number().min(0)
    }).optional(),
    price: CommonSchemas.positiveNumber.optional(),
    category: z.nativeEnum(MealCategory).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    spicyLevel: z.number().int().min(0).max(5).optional(),
    preparationTime: z.number().int().min(1).max(180).optional(),
    isActive: z.boolean().optional(),
    imageUrl: z.string().url().optional(),
    inventoryCount: CommonSchemas.nonNegativeNumber.optional(),
    lowStockThreshold: z.number().int().min(0).optional()
  }),

  inventoryUpdate: z.object({
    inventoryCount: CommonSchemas.nonNegativeNumber,
    operation: z.enum(['SET', 'ADD', 'SUBTRACT']).default('SET')
  })
}

/**
 * Order validation schemas
 */
export const OrderSchemas = {
  item: z.object({
    mealId: CommonSchemas.uuid,
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    unitPrice: CommonSchemas.positiveNumber,
    totalPrice: CommonSchemas.positiveNumber,
    mealName: z.string().min(1),
    mealNameZh: z.string().optional()
  }),

  create: z.object({
    userId: CommonSchemas.uuid.optional(),
    orderType: z.nativeEnum(OrderType).default(OrderType.ONE_TIME),
    addressId: CommonSchemas.uuid.optional(),
    deliveryDate: z.date(),
    deliveryWindow: z.enum(['5:30 PM - 10:00 PM']),
    deliveryNotes: z.string().max(500).optional(),
    customerEmail: CommonSchemas.email.optional(),
    customerPhone: CommonSchemas.phone.optional(),
    customerName: z.string().max(200).optional(),
    specialInstructions: z.string().max(1000).optional(),
    items: z.array(z.lazy(() => OrderSchemas.item)).min(1, 'At least one item required')
  }).refine(data => {
    // Either userId or guest info must be provided
    const hasUserId = !!data.userId
    const hasGuestInfo = !!(data.customerEmail && data.customerPhone && data.customerName)
    return hasUserId || hasGuestInfo
  }, {
    message: 'Either userId or complete guest information (email, phone, name) must be provided'
  }),

  update: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    deliveryDate: z.date().optional(),
    deliveryWindow: z.enum(['5:30 PM - 10:00 PM']).optional(),
    deliveryNotes: z.string().max(500).optional(),
    specialInstructions: z.string().max(1000).optional()
  }),

  cancel: z.object({
    reason: z.string().max(500).optional()
  })
}

/**
 * Weekly menu validation schemas
 */
export const WeeklyMenuSchemas = {
  create: z.object({
    title: z.string().min(1, 'Menu title is required').max(200),
    titleZh: z.string().max(200).optional(),
    weekStartDate: z.date(),
    isActive: z.boolean().default(true),
    mealIds: z.array(CommonSchemas.uuid)
      .min(1, 'At least one meal required')
      .max(12, 'Maximum 12 meals per menu')
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    titleZh: z.string().max(200).optional(),
    isActive: z.boolean().optional(),
    mealIds: z.array(CommonSchemas.uuid).min(1).max(12).optional()
  })
}

/**
 * Delivery zone validation schemas
 */
export const DeliveryZoneSchemas = {
  create: z.object({
    name: z.string().min(1, 'Zone name is required').max(100),
    postalCodePrefixes: z.array(z.string().regex(/^V\d[A-Z]$/))
      .min(1, 'At least one postal code prefix required'),
    deliveryFee: CommonSchemas.nonNegativeNumber,
    isActive: z.boolean().default(true),
    maxDeliveryDistance: z.number().min(0).optional(),
    estimatedDeliveryTime: z.string().max(50).optional()
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    postalCodePrefixes: z.array(z.string().regex(/^V\d[A-Z]$/)).optional(),
    deliveryFee: CommonSchemas.nonNegativeNumber.optional(),
    isActive: z.boolean().optional(),
    maxDeliveryDistance: z.number().min(0).optional(),
    estimatedDeliveryTime: z.string().max(50).optional()
  }),

  validatePostalCode: z.object({
    postalCode: CommonSchemas.bcPostalCode
  })
}

/**
 * Payment validation schemas
 */
export const PaymentSchemas = {
  create: z.object({
    orderId: CommonSchemas.uuid,
    amount: CommonSchemas.positiveNumber,
    currency: z.string().length(3).default('CAD'),
    paymentMethodId: z.string().min(1),
    description: z.string().max(500).optional()
  }),

  loyaltyPointsRedemption: z.object({
    userId: CommonSchemas.uuid,
    pointsToRedeem: z.number().int().min(1000, 'Minimum 1000 points required for redemption')
      .multipleOf(1000, 'Points must be in multiples of 1000')
  })
}

/**
 * Business logic validation helpers
 */
export const BusinessValidation = {
  /**
   * Validate delivery date and time constraints
   */
  deliveryDateTime: z.object({
    deliveryDate: z.date(),
    currentTime: z.date().optional()
  }).refine(data => {
    const currentTime = data.currentTime || new Date()
    const deliveryDate = data.deliveryDate
    
    // Check if delivery date is Sunday or Wednesday
    const dayOfWeek = deliveryDate.getDay()
    const isValidDay = dayOfWeek === 0 || dayOfWeek === 3 // 0 = Sunday, 3 = Wednesday
    
    if (!isValidDay) {
      return false
    }
    
    // Calculate order deadline
    let deadline: Date
    if (dayOfWeek === 0) { // Sunday delivery
      deadline = new Date(deliveryDate)
      deadline.setDate(deadline.getDate() - 5) // Previous Tuesday
      deadline.setHours(18, 0, 0, 0) // 6:00 PM
    } else { // Wednesday delivery
      deadline = new Date(deliveryDate)
      deadline.setDate(deadline.getDate() - 4) // Previous Saturday
      deadline.setHours(18, 0, 0, 0) // 6:00 PM
    }
    
    return currentTime <= deadline
  }, {
    message: 'Order deadline has passed or invalid delivery date'
  }),

  /**
   * Validate meal bundle sizes
   */
  bundleSize: z.number().int()
    .refine(size => [3, 6, 8, 10, 12].includes(size), {
      message: 'Bundle size must be 3, 6, 8, 10, or 12 meals'
    }),

  /**
   * Validate loyalty points calculation
   */
  loyaltyPoints: z.object({
    orderAmount: CommonSchemas.positiveNumber,
    pointsEarned: z.number().int().min(0)
  }).refine(data => {
    const expectedPoints = Math.floor(data.orderAmount)
    return data.pointsEarned === expectedPoints
  }, {
    message: 'Points earned must equal floor of order amount (1 dollar = 1 point)'
  })
}

/**
 * Validation result types for better type inference
 */
export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  errors: z.ZodError
}

/**
 * Safe validation wrapper that returns result instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Validation middleware factory for API routes
 */
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return schema.parse(data)
  }
}

/**
 * Format validation errors for client response
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(err.message)
  })
  
  return formatted
}