import { Meal, MealCategory, Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { MealSchemas, validateInput, safeValidate } from '@/lib/validations'
import { ErrorFactory, ValidationError, NotFoundError, ConflictError, DatabaseError, InventoryError, BusinessLogicError, asyncErrorHandler } from '@/lib/errors'

/**
 * Meal model service layer with comprehensive validation and inventory management
 * Handles meal CRUD operations, inventory tracking, and business logic validation
 */
export class MealModel {
  /**
   * Create a new meal
   */
  static async create(mealData: {
    name: string
    nameZh?: string
    description: string
    category: MealCategory
    imageUrl?: string
    imageAlt?: string
    price: number
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
    allergens?: string[]
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    isDairyFree?: boolean
    chefName?: string
    chefInfo?: string
    isActive?: boolean
    inventory?: number
  }): Promise<Meal> {
    return prisma.meal.create({
      data: {
        name: mealData.name,
        nameZh: mealData.nameZh,
        description: mealData.description,
        category: mealData.category,
        imageUrl: mealData.imageUrl,
        imageAlt: mealData.imageAlt,
        price: mealData.price,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        fiber: mealData.fiber,
        sugar: mealData.sugar,
        sodium: mealData.sodium,
        allergens: mealData.allergens || [],
        isVegetarian: mealData.isVegetarian || false,
        isVegan: mealData.isVegan || false,
        isGlutenFree: mealData.isGlutenFree || false,
        isDairyFree: mealData.isDairyFree || false,
        chefName: mealData.chefName,
        chefInfo: mealData.chefInfo,
        isActive: mealData.isActive !== undefined ? mealData.isActive : true,
        inventory: mealData.inventory || 0,
      },
    })
  }

  /**
   * Find meal by ID
   */
  static async findById(id: string): Promise<Meal | null> {
    return prisma.meal.findUnique({
      where: { id },
    })
  }

  /**
   * Find all active meals
   */
  static async findAllActive(options?: {
    skip?: number
    take?: number
    orderBy?: Prisma.MealOrderByWithRelationInput
  }): Promise<Meal[]> {
    return prisma.meal.findMany({
      where: { isActive: true },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    })
  }

  /**
   * Find meals by category
   */
  static async findByCategory(
    category: MealCategory,
    activeOnly: boolean = true
  ): Promise<Meal[]> {
    return prisma.meal.findMany({
      where: {
        category,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Search meals by name
   */
  static async searchByName(
    searchTerm: string,
    activeOnly: boolean = true
  ): Promise<Meal[]> {
    return prisma.meal.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { nameZh: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find meals with dietary filters
   */
  static async findWithDietaryFilters(filters: {
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    isDairyFree?: boolean
    excludeAllergens?: string[]
  }): Promise<Meal[]> {
    const whereConditions: any = { isActive: true }

    if (filters.isVegetarian) whereConditions.isVegetarian = true
    if (filters.isVegan) whereConditions.isVegan = true
    if (filters.isGlutenFree) whereConditions.isGlutenFree = true
    if (filters.isDairyFree) whereConditions.isDairyFree = true

    if (filters.excludeAllergens && filters.excludeAllergens.length > 0) {
      whereConditions.allergens = {
        hasEvery: [], // No allergens that match the excluded list
      }
    }

    return prisma.meal.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Update meal
   */
  static async update(
    id: string,
    updateData: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Meal> {
    return prisma.meal.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Update meal inventory with validation and business logic
   * @param id - Meal ID
   * @param operation - Inventory operation type
   * @param amount - Amount to add, subtract, or set
   * @returns Promise<Meal> - Updated meal
   * @throws {ValidationError} - When input is invalid
   * @throws {NotFoundError} - When meal doesn't exist
   * @throws {InventoryError} - When inventory operation is invalid
   */
  static updateInventory = asyncErrorHandler(async (
    id: string,
    operation: 'SET' | 'ADD' | 'SUBTRACT',
    amount: number
  ): Promise<Meal> => {
    // Validate inputs
    const validation = safeValidate(
      z.object({
        id: z.string().uuid(),
        operation: z.enum(['SET', 'ADD', 'SUBTRACT']),
        amount: z.number().int().min(0)
      }),
      { id, operation, amount }
    )
    
    if (!validation.success) {
      throw new ValidationError('Invalid inventory update parameters', { errors: validation.errors.errors })
    }
    
    try {
      // Get current meal and inventory
      const meal = await prisma.meal.findUnique({
        where: { id },
        select: { id: true, name: true, inventoryCount: true, lowStockThreshold: true }
      })
      
      if (!meal) {
        throw ErrorFactory.notFound('Meal', id)
      }
      
      // Calculate new inventory based on operation
      let newInventory: number
      
      switch (operation) {
        case 'SET':
          newInventory = amount
          break
        case 'ADD':
          newInventory = meal.inventoryCount + amount
          break
        case 'SUBTRACT':
          newInventory = meal.inventoryCount - amount
          if (newInventory < 0) {
            throw new InventoryError(
              meal.name,
              amount,
              meal.inventoryCount,
              { operation, requestedAmount: amount, currentInventory: meal.inventoryCount }
            )
          }
          break
      }
      
      // Update inventory
      const updatedMeal = await prisma.meal.update({
        where: { id },
        data: { inventoryCount: newInventory }
      })
      
      // Log low stock warning if applicable
      if (newInventory <= meal.lowStockThreshold) {
        console.warn(`Low stock alert: ${meal.name} has ${newInventory} units remaining (threshold: ${meal.lowStockThreshold})`)
      }
      
      return updatedMeal
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InventoryError) {
        throw error
      }
      throw ErrorFactory.database('inventory update', error instanceof Error ? error.message : 'Unknown error')
    }
  })

  /**
   * Reserve inventory for an order
   * @param items - Array of meal items to reserve
   * @returns Promise<ReservationResult> - Reservation result
   * @throws {InventoryError} - When insufficient inventory
   */
  static reserveInventory = asyncErrorHandler(async (
    items: Array<{ mealId: string; quantity: number }>
  ): Promise<ReservationResult> => {
    try {
      return await prisma.$transaction(async (tx) => {
        const reservations: Array<{ mealId: string; quantity: number; mealName: string }> = []
        const insufficientItems: Array<{ mealId: string; requested: number; available: number; mealName: string }> = []
        
        // Check availability for all items first
        for (const item of items) {
          const meal = await tx.meal.findUnique({
            where: { id: item.mealId },
            select: { id: true, name: true, inventoryCount: true, isActive: true }
          })
          
          if (!meal) {
            throw ErrorFactory.notFound('Meal', item.mealId)
          }
          
          if (!meal.isActive) {
            throw new BusinessLogicError(`Meal '${meal.name}' is no longer available`)
          }
          
          if (meal.inventoryCount < item.quantity) {
            insufficientItems.push({
              mealId: item.mealId,
              requested: item.quantity,
              available: meal.inventoryCount,
              mealName: meal.name
            })
          } else {
            reservations.push({
              mealId: item.mealId,
              quantity: item.quantity,
              mealName: meal.name
            })
          }
        }
        
        // If any items have insufficient inventory, throw error
        if (insufficientItems.length > 0) {
          const firstInsufficient = insufficientItems[0]
          throw new InventoryError(
            firstInsufficient.mealName,
            firstInsufficient.requested,
            firstInsufficient.available,
            { insufficientItems }
          )
        }
        
        // Reserve all items
        const updatedMeals = await Promise.all(
          reservations.map(reservation =>
            tx.meal.update({
              where: { id: reservation.mealId },
              data: {
                inventoryCount: {
                  decrement: reservation.quantity
                }
              },
              select: {
                id: true,
                name: true,
                inventoryCount: true,
                lowStockThreshold: true
              }
            })
          )
        )
        
        // Check for low stock warnings
        const lowStockWarnings = updatedMeals.filter(
          meal => meal.inventoryCount <= meal.lowStockThreshold
        )
        
        return {
          success: true,
          reservations,
          lowStockWarnings: lowStockWarnings.map(meal => ({
            mealId: meal.id,
            mealName: meal.name,
            currentInventory: meal.inventoryCount,
            threshold: meal.lowStockThreshold
          }))
        }
      })
    } catch (error) {
      if (error instanceof InventoryError || error instanceof BusinessLogicError || error instanceof NotFoundError) {
        throw error
      }
      throw ErrorFactory.database('inventory reservation', error instanceof Error ? error.message : 'Unknown error')
    }
  })
  
  /**
   * Release reserved inventory (e.g., when order is cancelled)
   * @param items - Array of meal items to release
   * @returns Promise<void>
   */
  static releaseInventory = asyncErrorHandler(async (
    items: Array<{ mealId: string; quantity: number }>
  ): Promise<void> => {
    try {
      await prisma.$transaction(async (tx) => {
        await Promise.all(
          items.map(item =>
            tx.meal.update({
              where: { id: item.mealId },
              data: {
                inventoryCount: {
                  increment: item.quantity
                }
              }
            })
          )
        )
      })
    } catch (error) {
      throw ErrorFactory.database('inventory release', error instanceof Error ? error.message : 'Unknown error')
    }
  })
  
  /**
   * Deactivate meal (soft delete)
   */
  static async deactivate(id: string): Promise<Meal> {
    return prisma.meal.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * Delete meal (hard delete)
   */
  static async delete(id: string): Promise<Meal> {
    return prisma.meal.delete({
      where: { id },
    })
  }

  /**
   * Get meal statistics
   */
  static async getStatistics(): Promise<{
    total: number
    active: number
    byCategory: Record<MealCategory, number>
  }> {
    const [total, active, categoryStats] = await Promise.all([
      prisma.meal.count(),
      prisma.meal.count({ where: { isActive: true } }),
      prisma.meal.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { isActive: true },
      }),
    ])

    const byCategory = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = stat._count.category
      return acc
    }, {} as Record<MealCategory, number>)

    return { total, active, byCategory }
  }
}

/**
 * Business logic helper methods for meal operations
 */
export class MealBusinessLogic {
  /**
   * Check if meal is available for ordering
   * @param meal - Meal to check
   * @param requestedQuantity - Quantity requested
   * @returns Availability result
   */
  static checkAvailability(
    meal: Meal,
    requestedQuantity: number
  ): {
    isAvailable: boolean
    reason?: string
    maxQuantity?: number
  } {
    if (!meal.isActive) {
      return {
        isAvailable: false,
        reason: 'Meal is no longer available'
      }
    }
    
    if (meal.inventoryCount < requestedQuantity) {
      return {
        isAvailable: false,
        reason: 'Insufficient inventory',
        maxQuantity: meal.inventoryCount
      }
    }
    
    return { isAvailable: true }
  }
  
  /**
   * Calculate nutritional score for meal recommendation
   * @param meal - Meal to score
   * @returns Nutritional score (0-100)
   */
  static calculateNutritionalScore(meal: Meal): number {
    if (!meal.calories || !meal.protein || !meal.carbs || !meal.fat) {
      return 50 // Default score if nutrition info is incomplete
    }
    
    let score = 50 // Base score
    
    // Protein scoring (higher is better, up to 30g)
    const proteinScore = Math.min((meal.protein / 30) * 25, 25)
    score += proteinScore
    
    // Fiber scoring (higher is better, up to 10g)
    const fiberScore = meal.fiber ? Math.min((meal.fiber / 10) * 15, 15) : 0
    score += fiberScore
    
    // Calorie scoring (optimal range 400-600 calories)
    const calorieScore = meal.calories >= 400 && meal.calories <= 600 ? 10 : 
                        Math.max(0, 10 - Math.abs(meal.calories - 500) / 50)
    score += calorieScore
    
    return Math.round(Math.min(score, 100))
  }
  
  /**
   * Check if meal meets dietary restrictions
   * @param meal - Meal to check
   * @param restrictions - Required dietary restrictions
   * @param excludeAllergens - Allergens to exclude
   * @returns Whether meal meets requirements
   */
  static meetsDietaryRequirements(
    meal: Meal,
    restrictions: string[],
    excludeAllergens: string[] = []
  ): {
    meets: boolean
    issues?: string[]
  } {
    const issues: string[] = []
    
    // Check required dietary restrictions
    const mealRestrictions = meal.dietaryRestrictions || []
    const missingRestrictions = restrictions.filter(
      restriction => !mealRestrictions.includes(restriction)
    )
    
    if (missingRestrictions.length > 0) {
      issues.push(`Missing dietary restrictions: ${missingRestrictions.join(', ')}`)
    }
    
    // Check allergens
    const mealAllergens = meal.allergens || []
    const conflictingAllergens = excludeAllergens.filter(
      allergen => mealAllergens.includes(allergen)
    )
    
    if (conflictingAllergens.length > 0) {
      issues.push(`Contains allergens: ${conflictingAllergens.join(', ')}`)
    }
    
    return {
      meets: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    }
  }
}

// Enhanced type definitions
export type CreateMealInput = z.infer<typeof MealSchemas.create>
export type UpdateMealInput = z.infer<typeof MealSchemas.update>
export type InventoryUpdateInput = z.infer<typeof MealSchemas.inventoryUpdate>

export type ReservationResult = {
  success: boolean
  reservations: Array<{ mealId: string; quantity: number; mealName: string }>
  lowStockWarnings: Array<{
    mealId: string
    mealName: string
    currentInventory: number
    threshold: number
  }>
}

export type MealStatistics = {
  total: number
  active: number
  byCategory: Record<MealCategory, number>
  inventory: {
    totalItems: number
    averagePerMeal: number
    lowestStock: number
    highestStock: number
    lowStockCount: number
  }
  pricing: {
    averagePrice: number
  }
}

export type LowStockMeal = {
  id: string
  name: string
  nameZh?: string | null
  currentInventory: number
  threshold: number
  category: MealCategory
  isActive: boolean
}

export type AvailabilityCheck = {
  isAvailable: boolean
  reason?: string
  maxQuantity?: number
}

export type DietaryCheck = {
  meets: boolean
  issues?: string[]
}

// Legacy type exports maintained for backward compatibility
export type CreateMealData = CreateMealInput
export type UpdateMealData = UpdateMealInput