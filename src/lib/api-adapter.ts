import type {
  DataAdapter,
  WeeklyMenuWithMeals,
  Meal,
  MealCategory,
  CartState,
  CreateOrderRequest,
  Order,
  OrderStatus,
  DeliveryValidation,
} from './data-adapter'

/**
 * API Data Adapter - Real API implementation for production use
 * Replaces MockDataAdapter with actual HTTP calls to backend APIs
 */
export class ApiDataAdapter implements DataAdapter {
  private baseUrl: string

  constructor(baseUrl?: string) {
    // Use environment variable or default to current domain
    this.baseUrl =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000')
  }

  private async makeRequest<T>(
    endpoint: string,
    options?: globalThis.RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'API request failed')
    }

    return data.data
  }

  async getWeeklyMenu(): Promise<WeeklyMenuWithMeals> {
    const data = await this.makeRequest<{
      weeklyMenu: {
        id: string
        name: string
        weekStart: string
        weekEnd: string
        isActive: boolean
      }
      meals: Array<{
        id: string
        name: string
        nameZh?: string
        description: string
        category: MealCategory
        price: number
        imageUrl: string
        imageAlt?: string
        calories: number
        protein: number
        carbs: number
        fat: number
        allergens: string[]
        isVegetarian: boolean
        isVegan: boolean
        isGlutenFree: boolean
        isDairyFree: boolean
        chefName?: string
        chefInfo?: string
        isAvailable: boolean
        inventoryLimit?: number
      }>
    }>('/api/menus/current')

    // Transform API response to match interface
    return {
      id: data.weeklyMenu.id,
      name: data.weeklyMenu.name,
      weekStart: new Date(data.weeklyMenu.weekStart),
      weekEnd: new Date(data.weeklyMenu.weekEnd),
      isActive: data.weeklyMenu.isActive,
      meals: data.meals.map(meal => ({
        id: meal.id,
        name: meal.name,
        nameZh: meal.nameZh,
        description: meal.description,
        category: meal.category,
        price: meal.price,
        imageUrl: meal.imageUrl,
        imageAlt: meal.imageAlt,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        allergens: meal.allergens,
        isVegetarian: meal.isVegetarian,
        isVegan: meal.isVegan,
        isGlutenFree: meal.isGlutenFree,
        isDairyFree: meal.isDairyFree,
        chefName: meal.chefName,
        chefInfo: meal.chefInfo,
        isActive: meal.isAvailable,
        inventory: meal.inventoryLimit || 0,
      })),
    }
  }

  async getMealsByCategory(category: MealCategory): Promise<Meal[]> {
    const data = await this.makeRequest<{
      meals: Array<{
        id: string
        name: string
        nameZh?: string
        description: string
        category: MealCategory
        price: number
        imageUrl: string
        imageAlt?: string
        calories: number
        protein: number
        carbs: number
        fat: number
        allergens: string[]
        isVegetarian: boolean
        isVegan: boolean
        isGlutenFree: boolean
        isDairyFree: boolean
        chefName?: string
        chefInfo?: string
        isAvailable: boolean
        inventoryLimit?: number
      }>
    }>(`/api/menus/current?category=${encodeURIComponent(category)}`)

    return data.meals.map(meal => ({
      id: meal.id,
      name: meal.name,
      nameZh: meal.nameZh,
      description: meal.description,
      category: meal.category,
      price: meal.price,
      imageUrl: meal.imageUrl,
      imageAlt: meal.imageAlt,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      allergens: meal.allergens,
      isVegetarian: meal.isVegetarian,
      isVegan: meal.isVegan,
      isGlutenFree: meal.isGlutenFree,
      isDairyFree: meal.isDairyFree,
      chefName: meal.chefName,
      chefInfo: meal.chefInfo,
      isActive: meal.isAvailable,
      inventory: meal.inventoryLimit || 0,
    }))
  }

  async validatePostalCode(postalCode: string): Promise<DeliveryValidation> {
    const data = await this.makeRequest<{
      isValid: boolean
      deliveryZone?: {
        id: string
        name: string
        deliveryFee: number
        deliveryDays: string[]
        isActive: boolean
      }
      postalCode: string
      estimatedDeliveryDates?: {
        sunday?: string
        wednesday?: string
      }
    }>('/api/delivery-zones/validate', {
      method: 'POST',
      body: JSON.stringify({ postalCode }),
    })

    return {
      isValid: data.isValid,
      postalCode: data.postalCode,
      deliveryFee: data.deliveryZone?.deliveryFee || 0,
      deliveryDays: data.deliveryZone?.deliveryDays || [],
      estimatedDeliveryDates: data.estimatedDeliveryDates || {},
    }
  }

  // Cart operations - Real API implementation
  async getCart(): Promise<CartState> {
    const data = await this.makeRequest<{
      items: Array<{
        id: string
        meal: {
          id: string
          name: string
          nameZh?: string
          description: string
          category: string
          price: number
          imageUrl: string
          imageAlt?: string
          calories: number
          protein: number
          carbs: number
          fat: number
          allergens: string[]
          isVegetarian: boolean
          isVegan: boolean
          isGlutenFree: boolean
          isDairyFree: boolean
          chefName?: string
          chefInfo?: string
          isActive: boolean
          inventory: number
        }
        quantity: number
        addedAt: string
      }>
      subtotal: number
      deliveryFee: number
      total: number
      isOpen: boolean
    }>('/api/cart')

    // Transform API response to match interface
    return {
      items: data.items.map(item => ({
        id: item.id,
        meal: item.meal,
        quantity: item.quantity,
        addedAt: new Date(item.addedAt),
      })),
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      total: data.total,
      isOpen: data.isOpen,
    }
  }

  async addToCart(mealId: string, quantity: number): Promise<void> {
    await this.makeRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ mealId, quantity }),
    })
  }

  async updateCartItem(mealId: string, quantity: number): Promise<void> {
    await this.makeRequest('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ mealId, quantity }),
    })
  }

  async removeFromCart(mealId: string): Promise<void> {
    await this.makeRequest(`/api/cart/${mealId}`, {
      method: 'DELETE',
    })
  }

  async clearCart(): Promise<void> {
    await this.makeRequest('/api/cart', {
      method: 'DELETE',
    })
  }

  // Order operations - These will need order API endpoints
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  async createOrder(_orderData: CreateOrderRequest): Promise<Order> {
    // TODO: Replace with order API call when order endpoints are implemented
    console.warn(
      'Order API not yet implemented - createOrder operation simulated'
    )
    throw new Error(
      'Order operations require implementation of order processing API'
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  async getOrderStatus(_orderId: string): Promise<OrderStatus> {
    // TODO: Replace with order API call when order endpoints are implemented
    console.warn(
      'Order API not yet implemented - getOrderStatus operation simulated'
    )
    throw new Error(
      'Order operations require implementation of order processing API'
    )
  }
}
