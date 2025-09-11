import React from 'react'

// Database Model Types (will be replaced by Prisma generated types)
export interface User {
  id: string
  email: string
  emailVerified: boolean
  firstName?: string
  lastName?: string
  phone?: string
  wechat?: string
  emergencyPhone?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
}

export interface Address {
  id: string
  userId: string
  label: string
  firstName: string
  lastName: string
  streetLine1: string
  streetLine2?: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
  deliveryZone: string
}

export interface Meal {
  id: string
  name: string
  nameZh?: string
  description: string
  category: MealCategory
  imageUrl?: string
  basePrice: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
}

export enum MealCategory {
  RICE_BASED = 'RICE_BASED',
  NOODLE_SOUPS = 'NOODLE_SOUPS',
  PASTA_FUSION = 'PASTA_FUSION',
  PROTEIN_SIDES = 'PROTEIN_SIDES',
}

export interface WeeklyMenu {
  id: string
  weekStartDate: Date
  weekEndDate: Date
  publishedAt?: Date
  isActive: boolean
  theme?: string
  menuItems: WeeklyMenuItem[]
}

export interface WeeklyMenuItem {
  id: string
  meal: Meal
  isAvailable: boolean
  currentStock: number
  price: number
}

export interface Subscription {
  id: string
  userId: string
  bundleSize: number
  deliveryDay: DeliveryDay
  deliveryTimeSlot: string
  basePrice: number
  discountPercent: number
  nextBillingDate: Date
  status: SubscriptionStatus
  pausedUntil?: Date
  mealSelectionDue: Date
  hasSelectedMeals: boolean
}

export enum DeliveryDay {
  SUNDAY = 'SUNDAY',
  WEDNESDAY = 'WEDNESDAY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string
  orderType: OrderType
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  discountAmount: number
  deliveryFee: number
  taxAmount: number
  totalAmount: number
  deliveryAddress: Address
  deliveryDay: DeliveryDay
  deliveryDate: Date
  items: OrderItem[]
  createdAt: Date
}

export enum OrderType {
  ONE_TIME = 'ONE_TIME',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export interface OrderItem {
  id: string
  meal: Meal
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface DeliveryZone {
  id: string
  name: string
  code: string
  postalCodes: string[]
  deliveryFee: number
  isActive: boolean
  deliveryDays: DeliveryDay[]
}

export interface PromoCode {
  id: string
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

// API Request/Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    limit: number
    offset: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  wechat?: string
  emergencyPhone?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Cart Types
export interface CartItem {
  id: string
  meal: Meal
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ShoppingCart {
  id: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  promoCode?: string
}

// Form Types
export interface DeliveryAddressForm {
  label: string
  firstName: string
  lastName: string
  streetLine1: string
  streetLine2?: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

export interface PostalCodeValidation {
  isValid: boolean
  deliveryZone?: string
  deliveryFee?: number
  deliveryDays?: DeliveryDay[]
}

export interface CreateOrderRequest {
  deliveryAddressId: string
  deliveryDay: DeliveryDay
  deliveryWindow: string
  deliveryDate: string
  specialInstructions?: string
  promoCode?: string
  giftCardCode?: string
}

// UI State Types
export interface UIState {
  isLoading: boolean
  error?: string
  success?: string
}

export interface CartState extends UIState {
  cart?: ShoppingCart
  isOpen: boolean
}

export interface AuthState extends UIState {
  user?: User
  isAuthenticated: boolean
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type CreateType<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateType<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface PageProps {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Error Types
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
}

export interface ValidationError extends AppError {
  field: string
  value: unknown
}

// Configuration Types
export interface DatabaseConfig {
  url: string
  redis?: string
}

export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
}

export interface EmailConfig {
  provider: 'resend' | 'sendgrid'
  apiKey: string
}

export interface CloudinaryConfig {
  url?: string
  cloudName?: string
  apiKey?: string
  apiSecret?: string
}
