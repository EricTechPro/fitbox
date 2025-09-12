/**
 * FitBox Application Type Definitions
 * 
 * This file contains all custom type definitions and interfaces
 * that extend or complement the Prisma-generated types.
 */

import type { 
  User, 
  Address, 
  Order, 
  OrderItem, 
  Meal, 
  WeeklyMenu, 
  WeeklyMenuItem,
  DeliveryZone,
  Payment
} from '@prisma/client'

// User-related types
export interface UserWithAddresses extends User {
  addresses: Address[]
}

export interface UserWithOrders extends User {
  orders: Order[]
}

export interface UserWithFullRelations extends User {
  addresses: Address[]
  orders: (Order & {
    orderItems: OrderItem[]
    payment: Payment | null
  })[]
}

// Meal-related types
export interface MealWithMenuItems extends Meal {
  weeklyMenuItems: WeeklyMenuItem[]
}

export interface MealWithOrders extends Meal {
  orderItems: OrderItem[]
}

// Order-related types
export interface OrderWithItems extends Order {
  orderItems: OrderItem[]
}

export interface OrderWithFullRelations extends Order {
  orderItems: (OrderItem & {
    meal: Meal
  })[]
  user: User | null
  deliveryAddress: Address | null
  deliveryZone: DeliveryZone | null
  payment: Payment | null
}

export interface OrderItemWithMeal extends OrderItem {
  meal: Meal
}

// Weekly Menu related types
export interface WeeklyMenuWithItems extends WeeklyMenu {
  weeklyMenuItems: WeeklyMenuItem[]
}

export interface WeeklyMenuWithFullRelations extends WeeklyMenu {
  weeklyMenuItems: (WeeklyMenuItem & {
    meal: Meal
  })[]
}

export interface WeeklyMenuItemWithMeal extends WeeklyMenuItem {
  meal: Meal
}

// Delivery Zone related types
export interface DeliveryZoneWithOrders extends DeliveryZone {
  orders: Order[]
}

// Payment related types
export interface PaymentWithOrder extends Payment {
  order: Order
}

// Statistics types
export interface OrderStatistics {
  total: number
  byStatus: Record<string, number>
  totalRevenue: number
  averageOrderValue: number
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface MealStatistics {
  totalMeals: number
  byCategory: Record<string, number>
  averagePrice: number
  totalInventory: number
  lowInventoryItems: Meal[]
}

export interface PopularMeal {
  mealId: string
  mealName: string
  mealNameZh: string | null
  totalQuantity: number
  orderCount: number
  totalRevenue: number
}

// Input types for creation/update operations
export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  role?: 'CUSTOMER' | 'ADMIN'
}

export interface CreateMealInput {
  name: string
  nameZh?: string
  description: string
  descriptionZh?: string
  price: number
  category: 'RICE_BOWLS' | 'NOODLES' | 'SALADS' | 'WRAPS' | 'DESSERTS' | 'BEVERAGES'
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sodium?: number
  allergens?: string[]
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  spicyLevel?: number
  inventory: number
  imageUrl?: string
  isActive?: boolean
}

export interface CreateOrderInput {
  userId?: string
  orderItems: {
    mealId: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  deliveryAddressId?: string
  deliveryZoneId?: string
  deliveryDate: Date
  deliveryWindow: string
  subtotal: number
  deliveryFee: number
  taxes: number
  total: number
  guestEmail?: string
  guestPhone?: string
  guestName?: string
  specialInstructions?: string
  needsInsulatedBag?: boolean
}

export interface UpdateOrderStatusInput {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  cancellationReason?: string
  deliveredAt?: Date
  cancelledAt?: Date
}

// Validation result types
export interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

export interface PostalCodeValidation extends ValidationResult {
  zone?: DeliveryZone
  deliveryFee?: number
}

// Business logic types
export interface InventoryCheckResult {
  available: boolean
  currentInventory: number
  requestedQuantity: number
  shortage?: number
}

export interface DeliverySlot {
  date: Date
  window: string
  available: boolean
  remainingCapacity: number
}

export interface PriceCalculation {
  subtotal: number
  deliveryFee: number
  taxes: number
  discount?: number
  loyaltyPointsUsed?: number
  total: number
}

// Error types
export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'BusinessLogicError'
  }
}

export class ValidationError extends BusinessLogicError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends BusinessLogicError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found` 
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends BusinessLogicError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends BusinessLogicError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export class InsufficientInventoryError extends BusinessLogicError {
  constructor(mealName: string, available: number, requested: number) {
    super(
      `Insufficient inventory for ${mealName}. Available: ${available}, Requested: ${requested}`,
      'INSUFFICIENT_INVENTORY',
      400
    )
    this.name = 'InsufficientInventoryError'
  }
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Date range types
export interface DateRange {
  from: Date
  to: Date
}

// Export all types for easy import
export type * from '@prisma/client'