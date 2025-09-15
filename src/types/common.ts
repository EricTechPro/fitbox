// Core types for the FitBox Meal App

export type MealCategory = 'RICE_BASED' | 'NOODLE_SOUPS' | 'PASTA_FUSION' | 'PROTEIN_SIDES'

export interface Meal {
  id: string
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  category: MealCategory
  price: number
  imageUrl: string
  allergens: string[]
  isActive: boolean
  inventory: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string
  isSpicy?: boolean
  featured?: boolean
}

export interface WeeklyMenuWithMeals {
  id: string
  name: string
  weekStart: Date
  weekEnd: Date
  isActive: boolean
  meals: Meal[]
}

export interface CartItem {
  id: string
  meal: Meal
  quantity: number
  addedAt: Date
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  isOpen: boolean
}

export interface DeliveryValidation {
  isValid: boolean
  deliveryFee: number
  message: string
}

export interface CreateOrderRequest {
  customerName: string
  customerEmail: string
  customerPhone: string
  streetLine1: string
  streetLine2?: string
  city: string
  province: string
  postalCode: string
  deliveryDate: 'sunday' | 'wednesday'
  deliveryInstructions?: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'
  createdAt: Date
  customerInfo: CreateOrderRequest
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

export type OrderStatus = Order['status']

export type Language = 'en' | 'zh'