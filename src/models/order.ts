import { Order, OrderItem, OrderStatus, Prisma, Meal } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { InsufficientInventoryError, OrderError, NotFoundError } from '@/lib/errors'
import type { OrderWithItems, OrderWithFullRelations, CreateOrderInput } from '@/lib/types'

// Order model service layer
export class OrderModel {
  /**
   * Create a new order
   */
  static async create(orderData: CreateOrderInput): Promise<OrderWithItems> {
    return prisma.$transaction(async (tx) => {
      // Step 1: Validate inventory for all meals
      const inventoryChecks = await Promise.all(
        orderData.orderItems.map(async (item) => {
          const meal = await tx.meal.findUnique({
            where: { id: item.mealId },
            select: { id: true, name: true, inventory: true, isActive: true },
          })

          if (!meal) {
            throw new NotFoundError('Meal', item.mealId)
          }

          if (!meal.isActive) {
            throw new OrderError(
              `Meal "${meal.name}" is currently unavailable`,
              undefined,
              item.mealId
            )
          }

          if (meal.inventory < item.quantity) {
            throw new InsufficientInventoryError(
              meal.name,
              meal.inventory,
              item.quantity
            )
          }

          return { mealId: meal.id, quantity: item.quantity, name: meal.name }
        })
      )

      // Step 2: Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: await this.generateOrderNumber(),
          userId: orderData.userId,
          status: OrderStatus.PENDING,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          taxes: orderData.taxes,
          total: orderData.total,
          deliveryAddressId: orderData.deliveryAddressId,
          deliveryZoneId: orderData.deliveryZoneId,
          deliveryDate: orderData.deliveryDate,
          deliveryWindow: orderData.deliveryWindow,
          guestEmail: orderData.guestEmail,
          guestPhone: orderData.guestPhone,
          guestName: orderData.guestName,
          specialInstructions: orderData.specialInstructions,
          needsInsulatedBag: orderData.needsInsulatedBag || orderData.orderItems.reduce((sum, item) => sum + item.quantity, 0) >= 5,
        },
      })

      // Step 3: Create order items and update inventory
      const orderItems = await Promise.all(
        orderData.orderItems.map(async (item) => {
          // Create order item
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: order.id,
              mealId: item.mealId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            },
          })

          // Decrement meal inventory
          await tx.meal.update({
            where: { id: item.mealId },
            data: {
              inventory: {
                decrement: item.quantity,
              },
            },
          })

          return orderItem
        })
      )

      return { ...order, orderItems }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    })
  }

  /**
   * Find order by ID
   */
  static async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
    })
  }

  /**
   * Find order by ID with all relations
   */
  static async findByIdWithRelations(id: string): Promise<OrderWithFullRelations | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { meal: true },
        },
        address: true,
        payments: true,
      },
    })
  }

  /**
   * Generate unique order number with date prefix
   * Format: FB[YYYYMMDD][5-digit-sequence]
   * Example: FB2024011500001
   */
  static async generateOrderNumber(): Promise<string> {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const datePrefix = `FB${year}${month}${day}`

    // Find the latest order number for today
    const latestOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
      select: {
        orderNumber: true,
      },
    })

    let sequence = 1
    if (latestOrder) {
      const latestSequence = parseInt(latestOrder.orderNumber.slice(-5), 10)
      sequence = latestSequence + 1
    }

    return `${datePrefix}${String(sequence).padStart(5, '0')}`
  }

  /**
   * Find order by order number
   */
  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { orderNumber },
    })
  }

  /**
   * Find orders by user ID
   */
  static async findByUserId(
    userId: string,
    options?: {
      skip?: number
      take?: number
      orderBy?: Prisma.OrderOrderByWithRelationInput
    }
  ): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    })
  }

  /**
   * Find orders by status
   */
  static async findByStatus(
    status: OrderStatus,
    options?: {
      skip?: number
      take?: number
    }
  ): Promise<Order[]> {
    return prisma.order.findMany({
      where: { status },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find orders by delivery date
   */
  static async findByDeliveryDate(
    deliveryDate: Date,
    options?: {
      status?: OrderStatus
      take?: number
    }
  ): Promise<Order[]> {
    const whereConditions: Prisma.OrderWhereInput = {
      deliveryDate: {
        gte: new Date(deliveryDate.setHours(0, 0, 0, 0)),
        lt: new Date(deliveryDate.setHours(23, 59, 59, 999)),
      },
    }

    if (options?.status) {
      whereConditions.status = options.status
    }

    return prisma.order.findMany({
      where: whereConditions,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Update order status
   */
  static async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
    })
  }

  /**
   * Update order
   */
  static async update(
    id: string,
    updateData: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Cancel order
   */
  static async cancel(id: string, reason?: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        specialInstructions: reason
          ? `CANCELLED: ${reason}`
          : 'Order cancelled by user',
      },
    })
  }

  /**
   * Get order statistics
   */
  static async getStatistics(dateRange?: { from: Date; to: Date }): Promise<{
    total: number
    byStatus: Record<OrderStatus, number>
    totalRevenue: number
    averageOrderValue: number
  }> {
    const whereConditions: Prisma.OrderWhereInput = {}
    
    if (dateRange) {
      whereConditions.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      }
    }

    const [total, statusStats, revenueStats] = await Promise.all([
      prisma.order.count({ where: whereConditions }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: whereConditions,
      }),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        _avg: { finalAmount: true },
        where: {
          ...whereConditions,
          status: { not: OrderStatus.CANCELLED },
        },
      }),
    ])

    const byStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<OrderStatus, number>)

    return {
      total,
      byStatus,
      totalRevenue: Number(revenueStats._sum.finalAmount) || 0,
      averageOrderValue: Number(revenueStats._avg.finalAmount) || 0,
    }
  }

  /**
   * Generate unique order number
   */
  static async generateOrderNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    
    const datePrefix = `FB${year}${month}${day}`
    
    // Find the latest order number for today
    const latestOrder = await prisma.order.findFirst({
      where: {
        orderNumber: { startsWith: datePrefix },
      },
      orderBy: { orderNumber: 'desc' },
    })

    let sequence = 1
    if (latestOrder) {
      const lastSequence = parseInt(latestOrder.orderNumber.slice(-3))
      sequence = lastSequence + 1
    }

    return `${datePrefix}${sequence.toString().padStart(3, '0')}`
  }
}

// OrderItem model service layer
export class OrderItemModel {
  /**
   * Find order items by order ID
   */
  static async findByOrderId(orderId: string): Promise<(OrderItem & { meal: Meal })[]> {
    return prisma.orderItem.findMany({
      where: { orderId },
      include: { meal: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Update order item quantity
   */
  static async updateQuantity(
    id: string,
    quantity: number,
    unitPrice: number
  ): Promise<OrderItem> {
    return prisma.orderItem.update({
      where: { id },
      data: {
        quantity,
        totalPrice: quantity * unitPrice,
      },
    })
  }

  /**
   * Delete order item
   */
  static async delete(id: string): Promise<OrderItem> {
    return prisma.orderItem.delete({
      where: { id },
    })
  }

  /**
   * Get popular meals from order history
   */
  static async getPopularMeals(options?: {
    limit?: number
    dateRange?: { from: Date; to: Date }
  }): Promise<Array<{
    mealId: string
    mealName: string
    mealNameZh?: string
    totalQuantity: number
    orderCount: number
  }>> {
    const whereConditions: Prisma.OrderWhereInput = {}

    if (options?.dateRange) {
      whereConditions.createdAt = {
        gte: options.dateRange.from,
        lte: options.dateRange.to,
      }
    }

    const result = await prisma.orderItem.groupBy({
      by: ['mealId', 'mealName', 'mealNameZh'],
      _sum: { quantity: true },
      _count: { id: true },
      where: whereConditions,
      orderBy: { _sum: { quantity: 'desc' } },
      take: options?.limit || 10,
    })

    return result.map((item) => ({
      mealId: item.mealId,
      mealName: item.mealName,
      mealNameZh: item.mealNameZh || undefined,
      totalQuantity: item._sum.quantity || 0,
      orderCount: item._count.id,
    }))
  }
}

// Type exports
export type CreateOrderData = {
  orderNumber: string
  userId?: string
  status?: OrderStatus
  orderType?: OrderType
  totalAmount: number
  deliveryFee?: number
  tax?: number
  finalAmount: number
  addressId?: string
  deliveryDate: Date
  deliveryWindow: string
  deliveryNotes?: string
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  needsInsulatedBag?: boolean
  specialInstructions?: string
  items: Array<{
    mealId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    mealName: string
    mealNameZh?: string
  }>
}

export type UpdateOrderData = Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>

export type OrderWithRelations = Order & {
  orderItems: (OrderItem & { meal: Meal })[]
  address: Address | null
  payments: any[]
}

export type PopularMeal = {
  mealId: string
  mealName: string
  mealNameZh?: string
  totalQuantity: number
  orderCount: number
}