import { Payment, PaymentStatus, Order, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// Payment model service layer
export class PaymentModel {
  /**
   * Create a new payment record
   */
  static async create(paymentData: {
    orderId: string
    amount: number
    currency?: string
    status?: PaymentStatus
    paymentMethod: string
    stripePaymentIntentId?: string
    stripeClientSecret?: string
    metadata?: Prisma.JsonValue
    failureReason?: string
    retryCount?: number
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'CAD',
        status: paymentData.status || PaymentStatus.PENDING,
        paymentMethod: paymentData.paymentMethod,
        stripePaymentIntentId: paymentData.stripePaymentIntentId,
        stripeClientSecret: paymentData.stripeClientSecret,
        metadata: paymentData.metadata,
        failureReason: paymentData.failureReason,
        retryCount: paymentData.retryCount || 0,
      },
    })
  }

  /**
   * Find payment by ID
   */
  static async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
    })
  }

  /**
   * Find payment by Stripe Payment Intent ID
   */
  static async findByStripePaymentIntent(paymentIntentId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    })
  }

  /**
   * Find payments by order ID
   */
  static async findByOrderId(orderId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find payments by status
   */
  static async findByStatus(
    status: PaymentStatus,
    options?: {
      skip?: number
      take?: number
      orderBy?: Prisma.PaymentOrderByWithRelationInput
    }
  ): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { status },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    })
  }

  /**
   * Update payment status
   */
  static async updateStatus(
    id: string,
    status: PaymentStatus,
    metadata?: Prisma.JsonValue
  ): Promise<Payment> {
    const updateData: any = { status }
    
    if (metadata) {
      updateData.metadata = metadata
    }

    return prisma.payment.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Mark payment as successful
   */
  static async markPaid(
    id: string,
    stripePaymentIntentId: string,
    metadata?: Prisma.JsonValue
  ): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        stripePaymentIntentId,
        metadata,
        failureReason: null, // Clear any previous failure reason
      },
    })
  }

  /**
   * Mark payment as failed
   */
  static async markFailed(
    id: string,
    failureReason: string,
    metadata?: Prisma.JsonValue
  ): Promise<Payment> {
    const payment = await prisma.payment.findUnique({ where: { id } })
    
    return prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason,
        retryCount: (payment?.retryCount || 0) + 1,
        metadata,
      },
    })
  }

  /**
   * Process refund
   */
  static async processRefund(
    id: string,
    refundAmount?: number,
    reason?: string
  ): Promise<Payment> {
    const payment = await prisma.payment.findUnique({ where: { id } })
    
    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new Error('Can only refund successful payments')
    }

    const isPartialRefund = refundAmount && refundAmount < Number(payment.amount)
    const newStatus = isPartialRefund 
      ? PaymentStatus.PARTIALLY_REFUNDED 
      : PaymentStatus.REFUNDED

    const refundMetadata = {
      ...(payment.metadata as any || {}),
      refund: {
        amount: refundAmount || payment.amount,
        reason: reason || 'Customer requested refund',
        processedAt: new Date().toISOString(),
      },
    }

    return prisma.payment.update({
      where: { id },
      data: {
        status: newStatus,
        metadata: refundMetadata,
      },
    })
  }

  /**
   * Retry failed payment
   */
  static async retryPayment(
    id: string,
    newStripePaymentIntentId: string,
    newClientSecret: string
  ): Promise<Payment> {
    const payment = await prisma.payment.findUnique({ where: { id } })
    
    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== PaymentStatus.FAILED) {
      throw new Error('Can only retry failed payments')
    }

    if (payment.retryCount >= 3) {
      throw new Error('Maximum retry attempts exceeded')
    }

    return prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PROCESSING,
        stripePaymentIntentId: newStripePaymentIntentId,
        stripeClientSecret: newClientSecret,
        retryCount: payment.retryCount + 1,
        failureReason: null,
      },
    })
  }

  /**
   * Get payment statistics
   */
  static async getStatistics(dateRange?: { from: Date; to: Date }): Promise<{
    totalPayments: number
    totalAmount: number
    successfulPayments: number
    failedPayments: number
    refundedAmount: number
    averagePaymentAmount: number
    successRate: number
  }> {
    const whereConditions: any = {}
    
    if (dateRange) {
      whereConditions.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      }
    }

    const [
      totalStats,
      successfulStats,
      failedCount,
      refundedStats
    ] = await Promise.all([
      prisma.payment.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        _avg: { amount: true },
        where: whereConditions,
      }),
      prisma.payment.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: {
          ...whereConditions,
          status: PaymentStatus.PAID,
        },
      }),
      prisma.payment.count({
        where: {
          ...whereConditions,
          status: PaymentStatus.FAILED,
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          ...whereConditions,
          status: { in: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED] },
        },
      }),
    ])

    const totalPayments = totalStats._count.id
    const successfulPayments = successfulStats._count.id
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

    return {
      totalPayments,
      totalAmount: Number(totalStats._sum.amount) || 0,
      successfulPayments,
      failedPayments: failedCount,
      refundedAmount: Number(refundedStats._sum.amount) || 0,
      averagePaymentAmount: Number(totalStats._avg.amount) || 0,
      successRate: Math.round(successRate * 100) / 100,
    }
  }

  /**
   * Get failed payments needing retry
   */
  static async getFailedPaymentsForRetry(): Promise<(Payment & { order: Order })[]> {
    return prisma.payment.findMany({
      where: {
        status: PaymentStatus.FAILED,
        retryCount: { lt: 3 },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
        },
      },
      include: { order: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Clean up old pending payments
   */
  static async cleanupOldPendingPayments(olderThanHours: number = 24): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    const result = await prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: { lt: cutoffDate },
      },
      data: {
        status: PaymentStatus.CANCELLED,
        failureReason: 'Payment timeout - automatically cancelled',
      },
    })

    return result.count
  }

  /**
   * Get payment history for order
   */
  static async getOrderPaymentHistory(orderId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    })
  }
}

// Type exports
export type CreatePaymentData = {
  orderId: string
  amount: number
  currency?: string
  status?: PaymentStatus
  paymentMethod: string
  stripePaymentIntentId?: string
  stripeClientSecret?: string
  metadata?: Prisma.JsonValue
  failureReason?: string
  retryCount?: number
}

export type UpdatePaymentData = Partial<Omit<Payment, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>>

export type PaymentWithOrder = Payment & { order: Order }

export type PaymentStatistics = {
  totalPayments: number
  totalAmount: number
  successfulPayments: number
  failedPayments: number
  refundedAmount: number
  averagePaymentAmount: number
  successRate: number
}