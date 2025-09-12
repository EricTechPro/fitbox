import { DeliveryZone, Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { DeliveryZoneSchemas, validateInput, safeValidate, CommonSchemas } from '@/lib/validations'
import { ErrorFactory, ValidationError, NotFoundError, ConflictError, DatabaseError, DeliveryZoneError, asyncErrorHandler } from '@/lib/errors'

/**
 * DeliveryZone model service layer with comprehensive validation and business logic
 * Handles BC postal code validation, delivery scheduling, and zone management
 */
export class DeliveryZoneModel {
  /**
   * Create a new delivery zone with validation
   * @param zoneData - Zone data to create
   * @returns Promise<DeliveryZone> - Created delivery zone
   * @throws {ValidationError} - When input data is invalid
   * @throws {ConflictError} - When zone name already exists
   * @throws {DeliveryZoneError} - When postal codes are invalid
   */
  static create = asyncErrorHandler(async (zoneData: CreateDeliveryZoneInput): Promise<DeliveryZone> => {
    // Validate input data
    const validatedData = validateInput(DeliveryZoneSchemas.create)(zoneData)
    
    try {
      // Check if zone name already exists
      const existingZone = await prisma.deliveryZone.findFirst({
        where: { name: validatedData.name },
        select: { id: true }
      })
      
      if (existingZone) {
        throw ErrorFactory.conflict(`Delivery zone with name '${validatedData.name}' already exists`)
      }
      
      // Validate all postal code prefixes
      const invalidPrefixes = validatedData.postalCodePrefixes.filter(
        prefix => !this.validateBCPostalCodePrefix(prefix).isValid
      )
      
      if (invalidPrefixes.length > 0) {
        throw new DeliveryZoneError(
          invalidPrefixes.join(', '),
          `Invalid BC postal code prefixes: ${invalidPrefixes.join(', ')}`,
          { invalidPrefixes }
        )
      }
      
      // Create delivery zone
      const zone = await prisma.deliveryZone.create({
        data: {
          name: validatedData.name,
          postalCodePrefixes: validatedData.postalCodePrefixes,
          deliveryFee: validatedData.deliveryFee,
          isActive: validatedData.isActive,
          maxDeliveryDistance: validatedData.maxDeliveryDistance,
          estimatedDeliveryTime: validatedData.estimatedDeliveryTime
        }
      })
      
      return zone
    } catch (error) {
      if (error instanceof ConflictError || error instanceof DeliveryZoneError) {
        throw error
      }
      throw ErrorFactory.database('delivery zone creation', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Find zone by ID
   */
  static async findById(id: string): Promise<DeliveryZone | null> {
    return prisma.deliveryZone.findUnique({
      where: { id },
    })
  }

  /**
   * Find all active zones
   */
  static async findAllActive(): Promise<DeliveryZone[]> {
    return prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Find zone by postal code with proper BC validation
   * @param postalCode - Full postal code (e.g., 'V6B 1A1')
   * @returns Promise<DeliveryZone | null> - Found zone or null
   * @throws {ValidationError} - When postal code format is invalid
   */
  static findByPostalCode = asyncErrorHandler(async (postalCode: string): Promise<DeliveryZone | null> => {
    // Validate BC postal code format
    const validation = safeValidate(CommonSchemas.bcPostalCode, postalCode)
    if (!validation.success) {
      throw new ValidationError('Invalid BC postal code format', { postalCode })
    }
    
    try {
      // Extract first 3 characters for Forward Sortation Area (FSA)
      const fsa = validation.data.slice(0, 3)
      
      const zone = await prisma.deliveryZone.findFirst({
        where: {
          postalCodePrefixes: { has: fsa },
          isActive: true
        },
        orderBy: { createdAt: 'desc' } // Prefer newer zones if multiple matches
      })
      
      return zone
    } catch (error) {
      throw ErrorFactory.database('zone lookup by postal code', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Check if postal code is serviceable with comprehensive business logic
   * @param postalCode - Full postal code to check
   * @returns Promise<ServiceabilityResult> - Serviceability details
   * @throws {ValidationError} - When postal code format is invalid
   */
  static isServiceable = asyncErrorHandler(async (postalCode: string): Promise<ServiceabilityResult> => {
    // Validate postal code format
    const validation = safeValidate(CommonSchemas.bcPostalCode, postalCode)
    if (!validation.success) {
      throw new ValidationError('Invalid BC postal code format', { postalCode })
    }
    
    try {
      const zone = await this.findByPostalCode(validation.data)
      
      if (!zone) {
        return {
          isServiceable: false,
          reason: 'Postal code not in service area',
          suggestedAlternatives: await this.findNearbyZones(validation.data)
        }
      }
      
      // Additional business logic checks
      const businessRules = this.validateBusinessRules(zone, new Date())
      
      return {
        isServiceable: businessRules.isValid,
        zone,
        deliveryFee: zone.deliveryFee.toNumber(),
        deliveryDays: this.getAvailableDeliveryDays(zone),
        estimatedDeliveryTime: zone.estimatedDeliveryTime,
        reason: businessRules.reason,
        restrictions: businessRules.restrictions
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw ErrorFactory.database('serviceability check', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Update zone
   */
  static async update(
    id: string,
    updateData: Partial<Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<DeliveryZone> {
    return prisma.deliveryZone.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Add postal code prefixes to zone with validation
   * @param id - Zone ID
   * @param postalCodePrefixes - Array of 3-character postal code prefixes
   * @returns Promise<DeliveryZone> - Updated zone
   * @throws {ValidationError} - When prefixes are invalid
   * @throws {NotFoundError} - When zone doesn't exist
   */
  static addPostalCodePrefixes = asyncErrorHandler(async (
    id: string,
    postalCodePrefixes: string[]
  ): Promise<DeliveryZone> => {
    // Validate zone exists
    const zone = await prisma.deliveryZone.findUnique({
      where: { id },
      select: { id: true, postalCodePrefixes: true }
    })
    
    if (!zone) {
      throw ErrorFactory.notFound('Delivery zone', id)
    }
    
    // Validate all postal code prefixes
    const invalidPrefixes = postalCodePrefixes.filter(
      prefix => !this.validateBCPostalCodePrefix(prefix).isValid
    )
    
    if (invalidPrefixes.length > 0) {
      throw new ValidationError(
        `Invalid BC postal code prefixes: ${invalidPrefixes.join(', ')}`,
        { invalidPrefixes }
      )
    }
    
    try {
      // Merge with existing prefixes and remove duplicates
      const updatedPrefixes = [...new Set([...zone.postalCodePrefixes, ...postalCodePrefixes])]
      
      const updatedZone = await prisma.deliveryZone.update({
        where: { id },
        data: { postalCodePrefixes: updatedPrefixes }
      })
      
      return updatedZone
    } catch (error) {
      throw ErrorFactory.database('postal code prefix addition', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Remove postal code prefixes from zone
   * @param id - Zone ID
   * @param postalCodePrefixes - Array of prefixes to remove
   * @returns Promise<DeliveryZone> - Updated zone
   * @throws {NotFoundError} - When zone doesn't exist
   * @throws {ValidationError} - When removal would leave zone empty
   */
  static removePostalCodePrefixes = asyncErrorHandler(async (
    id: string,
    postalCodePrefixes: string[]
  ): Promise<DeliveryZone> => {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id },
      select: { id: true, postalCodePrefixes: true }
    })
    
    if (!zone) {
      throw ErrorFactory.notFound('Delivery zone', id)
    }
    
    try {
      const updatedPrefixes = zone.postalCodePrefixes.filter(
        prefix => !postalCodePrefixes.includes(prefix)
      )
      
      if (updatedPrefixes.length === 0) {
        throw new ValidationError(
          'Cannot remove all postal code prefixes from delivery zone',
          { remainingPrefixes: updatedPrefixes.length }
        )
      }
      
      const updatedZone = await prisma.deliveryZone.update({
        where: { id },
        data: { postalCodePrefixes: updatedPrefixes }
      })
      
      return updatedZone
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw ErrorFactory.database('postal code prefix removal', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Activate/deactivate zone
   */
  static async setActive(id: string, isActive: boolean): Promise<DeliveryZone> {
    return prisma.deliveryZone.update({
      where: { id },
      data: { isActive },
    })
  }

  /**
   * Delete zone
   */
  static async delete(id: string): Promise<DeliveryZone> {
    return prisma.deliveryZone.delete({
      where: { id },
    })
  }

  /**
   * Get zone statistics
   */
  static async getStatistics(): Promise<{
    total: number
    active: number
    totalPostalCodes: number
    averageDeliveryFee: number
  }> {
    const [zones, aggregates] = await Promise.all([
      prisma.deliveryZone.findMany(),
      prisma.deliveryZone.aggregate({
        _avg: { deliveryFee: true },
        where: { isActive: true },
      }),
    ])

    const total = zones.length
    const active = zones.filter((zone) => zone.isActive).length
    const totalPostalCodes = zones.reduce(
      (sum, zone) => sum + zone.postalCodeList.length,
      0
    )
    const averageDeliveryFee = Number(aggregates._avg.deliveryFee) || 0

    return {
      total,
      active,
      totalPostalCodes,
      averageDeliveryFee,
    }
  }

  /**
   * Validate BC postal code format specifically
   * @param postalCode - Postal code to validate
   * @returns PostalCodeValidationResult - Validation result with BC-specific rules
   */
  static validateBCPostalCode(postalCode: string): PostalCodeValidationResult {
    const cleaned = postalCode.replace(/\s/g, '').toUpperCase()
    
    // BC postal codes start with 'V'
    const bcPattern = /^V\d[A-Z]\s?\d[A-Z]\d$/
    
    if (!bcPattern.test(postalCode.toUpperCase())) {
      return {
        isValid: false,
        error: 'Invalid BC postal code format. BC postal codes must start with "V" (e.g., V6B 1A1)',
        originalInput: postalCode
      }
    }
    
    const formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    const prefix = cleaned.slice(0, 3)
    
    return {
      isValid: true,
      formatted,
      prefix,
      originalInput: postalCode
    }
  }
  
  /**
   * Validate BC postal code prefix (FSA)
   * @param prefix - 3-character postal code prefix
   * @returns Validation result
   */
  static validateBCPostalCodePrefix(prefix: string): { isValid: boolean; error?: string } {
    const cleaned = prefix.replace(/\s/g, '').toUpperCase()
    
    if (cleaned.length !== 3) {
      return { isValid: false, error: 'Postal code prefix must be 3 characters' }
    }
    
    if (!/^V\d[A-Z]$/.test(cleaned)) {
      return { isValid: false, error: 'BC postal code prefix must follow V#L format (e.g., V6B)' }
    }
    
    return { isValid: true }
  }

  /**
   * Get delivery schedule for a zone
   */
  /**
   * Get delivery schedule for FitBox business rules (Sunday/Wednesday delivery)
   * @param zoneId - Zone ID to check
   * @param requestedDate - Date to check
   * @returns Promise<DeliveryScheduleResult> - Delivery schedule information
   * @throws {NotFoundError} - When zone doesn't exist
   */
  static getDeliverySchedule = asyncErrorHandler(async (
    zoneId: string,
    requestedDate: Date
  ): Promise<DeliveryScheduleResult> => {
    const zone = await this.findById(zoneId)
    
    if (!zone) {
      throw ErrorFactory.notFound('Delivery zone', zoneId)
    }
    
    try {
      // FitBox delivers on Sundays (0) and Wednesdays (3)
      const dayOfWeek = requestedDate.getDay()
      const isDeliveryDay = dayOfWeek === 0 || dayOfWeek === 3
      
      // Calculate next delivery date if requested date is not a delivery day
      let nextDeliveryDate: Date | undefined
      if (!isDeliveryDay) {
        nextDeliveryDate = this.calculateNextDeliveryDate(requestedDate)
      }
      
      // Check if we're past the order deadline
      const orderDeadline = this.calculateOrderDeadline(requestedDate)
      const now = new Date()
      const isPastDeadline = now > orderDeadline
      
      // Available time slots for FitBox (fixed)
      const availableTimeSlots = ['5:30 PM - 10:00 PM']
      
      return {
        isDeliveryDay,
        nextDeliveryDate,
        availableTimeSlots,
        orderDeadline,
        isPastDeadline,
        zone,
        deliveryFee: zone.deliveryFee.toNumber()
      }
    } catch (error) {
      throw ErrorFactory.database('delivery schedule calculation', error instanceof Error ? error.message : 'Unknown error')
    }
  })
  
  /**
   * Calculate next delivery date based on FitBox schedule
   * @param fromDate - Date to calculate from
   * @returns Next Sunday or Wednesday
   */
  private static calculateNextDeliveryDate(fromDate: Date): Date {
    const date = new Date(fromDate)
    const currentDay = date.getDay()
    
    let daysToAdd: number
    
    if (currentDay < 3) {
      // Before Wednesday - next delivery is Wednesday
      daysToAdd = 3 - currentDay
    } else if (currentDay === 3) {
      // Wednesday - next delivery is Sunday (4 days)
      daysToAdd = 4
    } else if (currentDay < 7) {
      // After Wednesday, before Sunday - next delivery is Sunday
      daysToAdd = 7 - currentDay
    } else {
      // Sunday - next delivery is Wednesday (3 days)
      daysToAdd = 3
    }
    
    date.setDate(date.getDate() + daysToAdd)
    return date
  }
  
  /**
   * Calculate order deadline based on delivery date
   * @param deliveryDate - Intended delivery date
   * @returns Order deadline date
   */
  private static calculateOrderDeadline(deliveryDate: Date): Date {
    const deadline = new Date(deliveryDate)
    const dayOfWeek = deliveryDate.getDay()
    
    if (dayOfWeek === 0) {
      // Sunday delivery - deadline is Tuesday 6:00 PM (5 days before)
      deadline.setDate(deadline.getDate() - 5)
    } else if (dayOfWeek === 3) {
      // Wednesday delivery - deadline is Saturday 6:00 PM (4 days before)
      deadline.setDate(deadline.getDate() - 4)
    }
    
    deadline.setHours(18, 0, 0, 0) // 6:00 PM
    return deadline
  }
}

  /**
   * Business logic validation for delivery zones
   * @param zone - Delivery zone to validate
   * @param date - Date to validate against
   * @returns Business rule validation result
   */
  private static validateBusinessRules(
    zone: DeliveryZone,
    date: Date
  ): { isValid: boolean; reason?: string; restrictions?: string[] } {
    const restrictions: string[] = []
    
    // Check if zone is active
    if (!zone.isActive) {
      return {
        isValid: false,
        reason: 'Delivery zone is currently inactive',
        restrictions: ['Zone temporarily suspended']
      }
    }
    
    // Check delivery days (Sundays and Wednesdays only)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 3) {
      restrictions.push('Delivery only available on Sundays and Wednesdays')
    }
    
    // Check order deadline
    const orderDeadline = this.calculateOrderDeadline(date)
    if (new Date() > orderDeadline) {
      restrictions.push('Order deadline has passed for this delivery date')
    }
    
    return {
      isValid: restrictions.length === 0,
      restrictions: restrictions.length > 0 ? restrictions : undefined
    }
  }
  
  /**
   * Get available delivery days for FitBox
   * @param zone - Delivery zone
   * @returns Array of available delivery days
   */
  private static getAvailableDeliveryDays(zone: DeliveryZone): string[] {
    // FitBox delivers on Sundays and Wednesdays
    return zone.isActive ? ['Sunday', 'Wednesday'] : []
  }
  
  /**
   * Find nearby zones for suggestions
   * @param postalCode - Original postal code
   * @returns Array of nearby zone suggestions
   */
  private static async findNearbyZones(postalCode: string): Promise<string[]> {
    try {
      const prefix = postalCode.slice(0, 2) // First two characters
      const nearbyZones = await prisma.deliveryZone.findMany({
        where: {
          postalCodePrefixes: {
            hasSome: []
          },
          isActive: true
        },
        select: {
          name: true,
          postalCodePrefixes: true
        },
        take: 3
      })
      
      return nearbyZones
        .filter(zone => 
          zone.postalCodePrefixes.some(zonePrefix => 
            zonePrefix.startsWith(prefix)
          )
        )
        .map(zone => zone.name)
    } catch (error) {
      return []
    }
  }
}

/**
 * Business logic helper methods for delivery zone operations
 */
export class DeliveryZoneBusinessLogic {
  /**
   * Calculate delivery fee with potential surcharges
   * @param zone - Delivery zone
   * @param orderValue - Order total value
   * @param itemCount - Number of items
   * @returns Calculated delivery fee
   */
  static calculateDeliveryFee(
    zone: DeliveryZone,
    orderValue: number,
    itemCount: number
  ): {
    baseFee: number
    surcharges: Array<{ type: string; amount: number; reason: string }>
    totalFee: number
  } {
    const baseFee = zone.deliveryFee.toNumber()
    const surcharges: Array<{ type: string; amount: number; reason: string }> = []
    
    // Free delivery threshold (business rule)
    if (orderValue >= 75) {
      return {
        baseFee: 0,
        surcharges: [{ type: 'discount', amount: -baseFee, reason: 'Free delivery over $75' }],
        totalFee: 0
      }
    }
    
    // Insulated bag requirement for 5+ meals
    if (itemCount >= 5) {
      // No additional charge, just note the requirement
      surcharges.push({ type: 'service', amount: 0, reason: 'Insulated bag included for 5+ meals' })
    }
    
    return {
      baseFee,
      surcharges,
      totalFee: baseFee + surcharges.reduce((sum, charge) => sum + charge.amount, 0)
    }
  }
  
  /**
   * Check if delivery zone can handle additional orders
   * @param zone - Delivery zone
   * @param date - Delivery date
   * @returns Capacity check result
   */
  static async checkCapacity(
    zone: DeliveryZone,
    date: Date
  ): Promise<{
    canAcceptOrders: boolean
    currentOrders: number
    maxCapacity: number
    remainingCapacity: number
  }> {
    // For MVP, assume unlimited capacity
    // In production, this would check actual order counts
    const maxCapacity = 100 // Default capacity
    const currentOrders = 0 // Would query actual orders
    
    return {
      canAcceptOrders: true,
      currentOrders,
      maxCapacity,
      remainingCapacity: maxCapacity - currentOrders
    }
  }
}

// Enhanced type definitions
export type CreateDeliveryZoneInput = z.infer<typeof DeliveryZoneSchemas.create>
export type UpdateDeliveryZoneInput = z.infer<typeof DeliveryZoneSchemas.update>

export type PostalCodeValidationResult = {
  isValid: boolean
  formatted?: string
  prefix?: string
  error?: string
  originalInput?: string
}

export type ServiceabilityResult = {
  isServiceable: boolean
  zone?: DeliveryZone
  deliveryFee?: number
  deliveryDays?: string[]
  estimatedDeliveryTime?: string | null
  reason?: string
  restrictions?: string[]
  suggestedAlternatives?: string[]
}

export type DeliveryScheduleResult = {
  isDeliveryDay: boolean
  nextDeliveryDate?: Date
  availableTimeSlots: string[]
  orderDeadline?: Date
  isPastDeadline?: boolean
  zone?: DeliveryZone
  deliveryFee?: number
}

export type DeliveryFeeCalculation = {
  baseFee: number
  surcharges: Array<{ type: string; amount: number; reason: string }>
  totalFee: number
}

export type CapacityResult = {
  canAcceptOrders: boolean
  currentOrders: number
  maxCapacity: number
  remainingCapacity: number
}