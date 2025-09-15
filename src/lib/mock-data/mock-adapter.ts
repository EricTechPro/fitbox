import type { DataAdapter, WeeklyMenuWithMeals, Meal, MealCategory, CartState, CartItem, CreateOrderRequest, Order, OrderStatus, DeliveryValidation } from '@/lib/data-adapter'
import { mockMeals } from './meals'
import { LocalStorageCart } from './cart-storage'
import { validatePostalCode } from './postal-validation'

export class MockDataAdapter implements DataAdapter {
  private cartStorage = new LocalStorageCart()
  private orderCounter = 1000

  async getWeeklyMenu(): Promise<WeeklyMenuWithMeals> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const today = new Date()
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)

    return {
      id: 'mock-menu-1',
      name: `Week of ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`,
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      isActive: true,
      meals: mockMeals
    }
  }

  async getMealsByCategory(category: MealCategory): Promise<Meal[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))

    return mockMeals.filter(meal => meal.category === category && meal.isActive)
  }

  async validatePostalCode(postalCode: string): Promise<DeliveryValidation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150))

    return validatePostalCode(postalCode)
  }

  async getCart(): Promise<CartState> {
    const items = this.cartStorage.getItems()
    const subtotal = this.cartStorage.getSubtotal()

    // For demo purposes, use a default delivery fee of 0
    // In real implementation, this would be calculated based on validated postal code
    const deliveryFee = 0
    const total = subtotal + deliveryFee

    return {
      items,
      subtotal,
      deliveryFee,
      total,
      isOpen: false // This will be managed by UI state
    }
  }

  async addToCart(mealId: string, quantity: number): Promise<void> {
    const meal = mockMeals.find(m => m.id === mealId)
    if (!meal) {
      throw new Error(`Meal with id ${mealId} not found`)
    }

    if (meal.inventory < quantity) {
      throw new Error(`Not enough inventory. Only ${meal.inventory} available.`)
    }

    const cartItem: CartItem = {
      id: `cart-${mealId}-${Date.now()}`,
      meal,
      quantity,
      addedAt: new Date()
    }

    this.cartStorage.addItem(cartItem)
  }

  async updateCartItem(mealId: string, quantity: number): Promise<void> {
    const meal = mockMeals.find(m => m.id === mealId)
    if (!meal || meal.inventory < quantity) {
      throw new Error(`Cannot update cart item. Not enough inventory or meal not found.`)
    }

    this.cartStorage.updateItem(mealId, quantity)
  }

  async removeFromCart(mealId: string): Promise<void> {
    this.cartStorage.removeItem(mealId)
  }

  async clearCart(): Promise<void> {
    this.cartStorage.clear()
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Validate cart items are still available
    for (const item of orderData.items) {
      const meal = mockMeals.find(m => m.id === item.meal.id)
      if (!meal || meal.inventory < item.quantity) {
        throw new Error(`Meal "${item.meal.name}" is no longer available in requested quantity`)
      }
    }

    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `FB${this.orderCounter++}`,
      status: 'confirmed',
      createdAt: new Date(),
      customerInfo: orderData,
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total
    }

    // Clear cart after successful order
    await this.clearCart()

    return order
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))

    // For demo purposes, return a mock status
    return 'confirmed'
  }
}