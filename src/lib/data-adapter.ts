// Data Adapter Pattern for clean separation between UI and data sources

import type {
  WeeklyMenuWithMeals,
  Meal,
  MealCategory,
  CartState,
  CartItem,
  CreateOrderRequest,
  Order,
  OrderStatus,
  DeliveryValidation
} from '@/types/common'

export interface DataAdapter {
  // Menu Operations
  getWeeklyMenu(): Promise<WeeklyMenuWithMeals>
  getMealsByCategory(category: MealCategory): Promise<Meal[]>
  validatePostalCode(postalCode: string): Promise<DeliveryValidation>

  // Cart Operations
  getCart(): Promise<CartState>
  addToCart(mealId: string, quantity: number): Promise<void>
  updateCartItem(mealId: string, quantity: number): Promise<void>
  removeFromCart(mealId: string): Promise<void>
  clearCart(): Promise<void>

  // Order Operations
  createOrder(orderData: CreateOrderRequest): Promise<Order>
  getOrderStatus(orderId: string): Promise<OrderStatus>
}

// Import mock adapter for initialization
import { MockDataAdapter } from './mock-data/mock-adapter'

// Global adapter instance - can be swapped for production
let _dataAdapter: DataAdapter | null = null

export function setDataAdapter(adapter: DataAdapter) {
  _dataAdapter = adapter
}

export function getDataAdapter(): DataAdapter {
  if (!_dataAdapter) {
    // Auto-initialize with mock adapter if not set
    _dataAdapter = new MockDataAdapter()
  }
  return _dataAdapter
}

// Export the adapter instance
export const dataAdapter = new Proxy({} as DataAdapter, {
  get(target, prop) {
    return getDataAdapter()[prop as keyof DataAdapter]
  }
})