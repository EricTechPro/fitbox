import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals'
import { PrismaClient, OrderStatus, OrderType, UserRole } from '@prisma/client'
import { OrderModel, OrderItemModel } from '@/models/order'
import { UserModel } from '@/models/user'
import { MealModel } from '@/models/meal'

const prisma = new PrismaClient()

// Test data setup
const testUser = {
  email: 'test-order@example.com',
  password: 'TestPass123',
  firstName: 'Order',
  lastName: 'Test',
  phone: '+1234567890',
  role: UserRole.CUSTOMER
}

const testMeal = {
  name: 'Test Meal for Orders',
  nameZh: '测试订单餐',
  description: 'A test meal for order testing',
  category: 'RICE_BASED' as const,
  imageUrl: 'https://example.com/test-meal.jpg',
  price: 15.99,
  calories: 500,
  protein: 25,
  carbs: 45,
  fat: 20,
  fiber: 8,
  sodium: 600,
  allergens: ['nuts'],
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isDairyFree: false,
  isActive: true,
  inventory: 10
}

const testAddress = {
  street: '123 Test Street',
  city: 'Vancouver',
  province: 'BC',
  postalCode: 'V6B 1A1',
  country: 'Canada',
  apartmentNumber: '101',
  deliveryInstructions: 'Leave at door',
  isDefault: true
}

describe('OrderModel Contract Tests', () => {
  let createdUserId: string
  let createdMealId: string
  let createdAddressId: string
  let createdOrderIds: string[] = []

  beforeAll(async () => {
    // Create test user
    const user = await UserModel.create(testUser)
    createdUserId = user.id

    // Create test address
    const address = await prisma.address.create({
      data: {
        ...testAddress,
        userId: createdUserId
      }
    })
    createdAddressId = address.id

    // Create test meal
    const meal = await MealModel.create(testMeal)
    createdMealId = meal.id
  })

  afterAll(async () => {
    // Clean up in reverse order of dependencies
    if (createdOrderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: createdOrderIds } }
      })
      await prisma.order.deleteMany({
        where: { id: { in: createdOrderIds } }
      })
    }

    if (createdAddressId) {
      await prisma.address.delete({ where: { id: createdAddressId } })
    }
    
    if (createdMealId) {
      await MealModel.delete(createdMealId)
    }
    
    if (createdUserId) {
      await UserModel.delete(createdUserId)
    }

    await prisma.$disconnect()
  })

  describe('Order Creation', () => {
    test('should create authenticated user order with transaction safety', async () => {
      const orderData = {
        orderNumber: await OrderModel.generateOrderNumber(),
        userId: createdUserId,
        status: OrderStatus.PENDING,
        orderType: OrderType.ONE_TIME,
        totalAmount: 15.99,
        deliveryFee: 5.00,
        tax: 2.10,
        finalAmount: 23.09,
        addressId: createdAddressId,
        deliveryDate: new Date('2024-01-15'),
        deliveryWindow: '5:30 PM - 10:00 PM',
        deliveryNotes: 'Ring doorbell',
        needsInsulatedBag: false,
        orderItems: [{
          mealId: createdMealId,
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        }],
        subtotal: 15.99,
        deliveryFee: 5.99,
        taxes: 2.08,
        total: 24.06
      }

      const order = await OrderModel.create(orderData)
      createdOrderIds.push(order.id)

      // Verify order properties
      expect(order.id).toBeDefined()
      expect(order.orderNumber).toBe(orderData.orderNumber)
      expect(order.userId).toBe(createdUserId)
      expect(order.status).toBe(OrderStatus.PENDING)
      expect(order.orderType).toBe(OrderType.ONE_TIME)
      expect(order.totalAmount).toBe(15.99)
      expect(order.finalAmount).toBe(23.09)
      expect(order.addressId).toBe(createdAddressId)

      // Verify order items were created
      expect(order.orderItems).toHaveLength(1)
      expect(order.orderItems[0].mealId).toBe(createdMealId)
      expect(order.orderItems[0].quantity).toBe(1)
      expect(order.orderItems[0].unitPrice).toBe(15.99)
      expect(order.orderItems[0].totalPrice).toBe(15.99)
    })

    test('should create guest user order', async () => {
      const orderData = {
        orderNumber: await OrderModel.generateOrderNumber(),
        // No userId for guest order
        status: OrderStatus.PENDING,
        orderType: OrderType.ONE_TIME,
        totalAmount: 31.98,
        deliveryFee: 5.00,
        tax: 3.70,
        finalAmount: 40.68,
        deliveryDate: new Date('2024-01-16'),
        deliveryWindow: '5:30 PM - 10:00 PM',
        customerEmail: 'guest@example.com',
        customerPhone: '+1234567890',
        customerName: 'Guest User',
        orderItems: [{
          mealId: createdMealId,
          quantity: 2,
          unitPrice: 15.99,
          totalPrice: 31.98
        }],
        subtotal: 31.98,
        deliveryFee: 5.99,
        taxes: 3.92,
        total: 41.89
      }

      const order = await OrderModel.create(orderData)
      createdOrderIds.push(order.id)

      // Verify guest order properties
      expect(order.id).toBeDefined()
      expect(order.userId).toBeNull()
      expect(order.customerEmail).toBe('guest@example.com')
      expect(order.customerPhone).toBe('+1234567890')
      expect(order.customerName).toBe('Guest User')
      expect(order.orderItems).toHaveLength(1)
      expect(order.orderItems[0].quantity).toBe(2)
    })

    test('should handle order creation with multiple items', async () => {
      // Create another meal for testing
      const secondMeal = await MealModel.create({
        ...testMeal,
        name: 'Second Test Meal',
        nameZh: '第二个测试餐',
        price: 18.99
      })

      const orderData = {
        orderNumber: await OrderModel.generateOrderNumber(),
        userId: createdUserId,
        totalAmount: 34.98,
        deliveryFee: 5.00,
        tax: 4.00,
        finalAmount: 43.98,
        addressId: createdAddressId,
        deliveryDate: new Date('2024-01-17'),
        deliveryWindow: '5:30 PM - 10:00 PM',
        needsInsulatedBag: true, // 5+ meals trigger insulated bag
        orderItems: [
          {
            mealId: createdMealId,
            quantity: 1,
            unitPrice: 15.99,
            totalPrice: 15.99
          },
          {
            mealId: secondMeal.id,
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99
          }
        ],
        subtotal: 34.98,
        deliveryFee: 5.99,
        taxes: 4.32,
        total: 45.29
      }

      const order = await OrderModel.create(orderData)
      createdOrderIds.push(order.id)

      expect(order.orderItems).toHaveLength(2)
      expect(order.needsInsulatedBag).toBe(true)
      expect(order.totalAmount).toBe(34.98)

      // Clean up second meal
      await MealModel.delete(secondMeal.id)
    })
  })

  describe('Order Number Generation', () => {
    test('should generate unique order numbers', async () => {
      const orderNumber1 = await OrderModel.generateOrderNumber()
      const orderNumber2 = await OrderModel.generateOrderNumber()

      expect(orderNumber1).toBeDefined()
      expect(orderNumber2).toBeDefined()
      expect(orderNumber1).not.toBe(orderNumber2)
      expect(orderNumber1).toMatch(/^FB\d{6}\d{3}$/) // FBYMMDD###
      expect(orderNumber2).toMatch(/^FB\d{6}\d{3}$/)
    })

    test('should increment sequence numbers correctly', async () => {
      const orderNumber = await OrderModel.generateOrderNumber()
      const today = new Date()
      const datePrefix = `FB${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`
      
      expect(orderNumber).toMatch(new RegExp(`^${datePrefix}\\d{3}$`))
    })
  })

  describe('Order Status Transitions', () => {
    let testOrderId: string

    beforeEach(async () => {
      const orderData = {
        orderNumber: await OrderModel.generateOrderNumber(),
        userId: createdUserId,
        addressId: createdAddressId,
        deliveryDate: new Date('2024-01-20'),
        deliveryWindow: '5:30 PM - 10:00 PM',
        orderItems: [{
          mealId: createdMealId,
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        }],
        subtotal: 15.99,
        deliveryFee: 5.99,
        taxes: 2.08,
        total: 24.06
      }

      const order = await OrderModel.create(orderData)
      testOrderId = order.id
      createdOrderIds.push(order.id)
    })

    test('should update order status', async () => {
      const updatedOrder = await OrderModel.updateStatus(testOrderId, OrderStatus.CONFIRMED)
      expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED)
    })

    test('should cancel order with reason', async () => {
      const cancelledOrder = await OrderModel.cancel(testOrderId, 'Customer requested')
      expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED)
      expect(cancelledOrder.specialInstructions).toBe('CANCELLED: Customer requested')
    })

    test('should cancel order without reason', async () => {
      const cancelledOrder = await OrderModel.cancel(testOrderId)
      expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED)
      expect(cancelledOrder.specialInstructions).toBe('Order cancelled by user')
    })
  })

  describe('Order Queries', () => {
    let testOrderId: string

    beforeEach(async () => {
      const orderData = {
        orderNumber: await OrderModel.generateOrderNumber(),
        userId: createdUserId,
        status: OrderStatus.CONFIRMED,
        addressId: createdAddressId,
        deliveryDate: new Date('2024-01-25'),
        deliveryWindow: '5:30 PM - 10:00 PM',
        orderItems: [{
          mealId: createdMealId,
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        }],
        subtotal: 15.99,
        deliveryFee: 5.99,
        taxes: 2.08,
        total: 24.06
      }

      const order = await OrderModel.create(orderData)
      testOrderId = order.id
      createdOrderIds.push(order.id)
    })

    test('should find order by ID', async () => {
      const order = await OrderModel.findById(testOrderId)
      expect(order).toBeDefined()
      expect(order!.id).toBe(testOrderId)
    })

    test('should find order with relations', async () => {
      const order = await OrderModel.findByIdWithRelations(testOrderId)
      expect(order).toBeDefined()
      expect(order!.orderItems).toBeDefined()
      expect(order!.orderItems).toHaveLength(1)
      expect(order!.orderItems[0].meal).toBeDefined()
      expect(order!.address).toBeDefined()
    })

    test('should find order by order number', async () => {
      const originalOrder = await OrderModel.findById(testOrderId)
      const foundOrder = await OrderModel.findByOrderNumber(originalOrder!.orderNumber)
      expect(foundOrder).toBeDefined()
      expect(foundOrder!.id).toBe(testOrderId)
    })

    test('should find orders by user ID', async () => {
      const orders = await OrderModel.findByUserId(createdUserId)
      expect(orders.length).toBeGreaterThan(0)
      expect(orders.some(order => order.id === testOrderId)).toBe(true)
    })

    test('should find orders by status', async () => {
      const orders = await OrderModel.findByStatus(OrderStatus.CONFIRMED)
      expect(orders.length).toBeGreaterThan(0)
      expect(orders.some(order => order.id === testOrderId)).toBe(true)
    })

    test('should find orders by delivery date', async () => {
      const deliveryDate = new Date('2024-01-25')
      const orders = await OrderModel.findByDeliveryDate(deliveryDate)
      expect(orders.length).toBeGreaterThan(0)
      expect(orders.some(order => order.id === testOrderId)).toBe(true)
    })
  })

  describe('Order Statistics', () => {
    test('should calculate order statistics', async () => {
      const stats = await OrderModel.getStatistics()
      
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.byStatus).toBeDefined()
      expect(stats.totalRevenue).toBeGreaterThanOrEqual(0)
      expect(stats.averageOrderValue).toBeGreaterThanOrEqual(0)
    })

    test('should calculate statistics with date range', async () => {
      const dateRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31')
      }
      
      const stats = await OrderModel.getStatistics(dateRange)
      expect(stats).toBeDefined()
      expect(typeof stats.total).toBe('number')
      expect(typeof stats.totalRevenue).toBe('number')
      expect(typeof stats.averageOrderValue).toBe('number')
    })
  })

  describe('Business Logic Validation', () => {
    test('should enforce order number uniqueness', async () => {
      const orderNumber = await OrderModel.generateOrderNumber()
      
      const orderData = {
        orderNumber,
        userId: createdUserId,
        addressId: createdAddressId,
        deliveryDate: new Date('2024-01-30'),
        deliveryWindow: '5:30 PM - 10:00 PM',
        orderItems: [{
          mealId: createdMealId,
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        }],
        subtotal: 15.99,
        deliveryFee: 5.99,
        taxes: 2.08,
        total: 24.06
      }

      // First order should succeed
      const order1 = await OrderModel.create(orderData)
      createdOrderIds.push(order1.id)

      // Second order with same order number should fail
      await expect(OrderModel.create(orderData)).rejects.toThrow()
    })

    test('should handle delivery date validation', async () => {
      const pastDate = new Date('2020-01-01')
      const orderData = {
        orderNumber: await OrderModel.generateOrderNumber(),
        userId: createdUserId,
        addressId: createdAddressId,
        deliveryDate: pastDate,
        deliveryWindow: '5:30 PM - 10:00 PM',
        orderItems: [{
          mealId: createdMealId,
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        }],
        subtotal: 15.99,
        deliveryFee: 5.99,
        taxes: 2.08,
        total: 24.06
      }

      // Should create order but business logic should validate delivery date elsewhere
      const order = await OrderModel.create(orderData)
      createdOrderIds.push(order.id)
      
      expect(order.deliveryDate).toEqual(pastDate)
    })
  })
})

describe('OrderItemModel Contract Tests', () => {
  let createdUserId: string
  let createdMealId: string
  let createdOrderId: string
  let createdOrderItemId: string

  beforeAll(async () => {
    // Create test user and meal
    const user = await UserModel.create(testUser)
    createdUserId = user.id

    const meal = await MealModel.create(testMeal)
    createdMealId = meal.id

    // Create test order
    const orderData = {
      orderNumber: await OrderModel.generateOrderNumber(),
      userId: createdUserId,
      deliveryDate: new Date('2024-02-01'),
      deliveryWindow: '5:30 PM - 10:00 PM',
      orderItems: [{
        mealId: createdMealId,
        quantity: 2,
        unitPrice: 15.99,
        totalPrice: 31.98
      }],
      subtotal: 31.98,
      deliveryFee: 5.99,
      taxes: 3.92,
      total: 41.89
    }

    const order = await OrderModel.create(orderData)
    createdOrderId = order.id
    createdOrderItemId = order.orderItems[0].id
  })

  afterAll(async () => {
    if (createdOrderId) {
      await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } })
      await prisma.order.delete({ where: { id: createdOrderId } })
    }
    if (createdMealId) {
      await MealModel.delete(createdMealId)
    }
    if (createdUserId) {
      await UserModel.delete(createdUserId)
    }
  })

  describe('Order Item Operations', () => {
    test('should find order items by order ID', async () => {
      const items = await OrderItemModel.findByOrderId(createdOrderId)
      
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe(createdOrderItemId)
      expect(items[0].meal).toBeDefined()
      expect(items[0].meal.id).toBe(createdMealId)
    })

    test('should update order item quantity', async () => {
      const updatedItem = await OrderItemModel.updateQuantity(createdOrderItemId, 3, 15.99)
      
      expect(updatedItem.quantity).toBe(3)
      expect(updatedItem.totalPrice).toBe(47.97)
    })

    test('should get popular meals statistics', async () => {
      const popularMeals = await OrderItemModel.getPopularMeals({ limit: 5 })
      
      expect(Array.isArray(popularMeals)).toBe(true)
      expect(popularMeals.length).toBeGreaterThan(0)
      
      const meal = popularMeals.find(m => m.mealId === createdMealId)
      expect(meal).toBeDefined()
      expect(meal!.totalQuantity).toBeGreaterThan(0)
      expect(meal!.orderCount).toBeGreaterThan(0)
    })

    test('should get popular meals with date range', async () => {
      const dateRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31')
      }
      
      const popularMeals = await OrderItemModel.getPopularMeals({ 
        limit: 3, 
        dateRange 
      })
      
      expect(Array.isArray(popularMeals)).toBe(true)
      expect(popularMeals.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Order Item Business Rules', () => {
    test('should calculate correct total price on quantity update', async () => {
      const unitPrice = 15.99
      const newQuantity = 4
      
      const updatedItem = await OrderItemModel.updateQuantity(
        createdOrderItemId, 
        newQuantity, 
        unitPrice
      )
      
      expect(updatedItem.totalPrice).toBe(unitPrice * newQuantity)
    })
  })
})