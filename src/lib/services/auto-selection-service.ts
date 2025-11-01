import { prisma } from '@/lib/prisma'
import { Meal, MealCategory } from '@prisma/client'
import { DeadlineService } from './deadline-service'

export interface AutoSelectionStrategy {
  name: string
  description: string
  selectMeals: (
    availableMeals: Meal[],
    requiredCount: number,
    userHistory?: any
  ) => Meal[]
}

export class AutoSelectionService {
  /**
   * Default meal selection strategy - balanced variety across categories
   */
  static balancedVarietyStrategy: AutoSelectionStrategy = {
    name: 'Balanced Variety',
    description:
      'Selects meals across different categories for balanced nutrition',
    selectMeals: (availableMeals: Meal[], requiredCount: number) => {
      const categories = Object.values(MealCategory)
      const selected: Meal[] = []

      // Group meals by category
      const mealsByCategory = categories.reduce(
        (acc, category) => {
          acc[category] = availableMeals.filter(
            meal => meal.category === category
          )
          return acc
        },
        {} as Record<MealCategory, Meal[]>
      )

      // Calculate meals per category (round-robin approach)
      const mealsPerCategory = Math.floor(requiredCount / categories.length)
      const remainder = requiredCount % categories.length

      // Select meals from each category
      categories.forEach((category, index) => {
        const categoryMeals = mealsByCategory[category]
        const countForThisCategory =
          mealsPerCategory + (index < remainder ? 1 : 0)

        // Sort by availability and then by popularity (using inventory as proxy)
        const sortedMeals = categoryMeals
          .filter(meal => meal.isActive && meal.inventory > 0)
          .sort((a, b) => b.inventory - a.inventory)

        selected.push(...sortedMeals.slice(0, countForThisCategory))
      })

      // If we still need more meals, fill from remaining available meals
      if (selected.length < requiredCount) {
        const remaining = availableMeals
          .filter(
            meal =>
              !selected.includes(meal) && meal.isActive && meal.inventory > 0
          )
          .sort((a, b) => b.inventory - a.inventory)

        selected.push(...remaining.slice(0, requiredCount - selected.length))
      }

      return selected.slice(0, requiredCount)
    },
  }

  /**
   * Popular meals strategy - select most popular meals
   */
  static popularMealsStrategy: AutoSelectionStrategy = {
    name: 'Popular Choices',
    description: 'Selects the most popular meals based on order history',
    selectMeals: (availableMeals: Meal[], requiredCount: number) => {
      return availableMeals
        .filter(meal => meal.isActive && meal.inventory > 0)
        .sort((a, b) => b.inventory - a.inventory) // Higher inventory indicates popularity
        .slice(0, requiredCount)
    },
  }

  /**
   * User preference strategy - based on previous selections
   */
  static userPreferenceStrategy: AutoSelectionStrategy = {
    name: 'Your Preferences',
    description: 'Selects meals similar to your previous choices',
    selectMeals: (
      availableMeals: Meal[],
      requiredCount: number,
      userHistory?: any
    ) => {
      if (!userHistory || !userHistory.preferredCategories) {
        // Fallback to balanced variety if no history
        return AutoSelectionService.balancedVarietyStrategy.selectMeals(
          availableMeals,
          requiredCount
        )
      }

      const preferredCategories =
        userHistory.preferredCategories as MealCategory[]
      const selected: Meal[] = []

      // First, select from preferred categories
      for (const category of preferredCategories) {
        const categoryMeals = availableMeals
          .filter(
            meal =>
              meal.category === category && meal.isActive && meal.inventory > 0
          )
          .sort((a, b) => b.inventory - a.inventory)

        if (categoryMeals.length > 0 && selected.length < requiredCount) {
          selected.push(categoryMeals[0])
        }
      }

      // Fill remaining slots with balanced variety
      if (selected.length < requiredCount) {
        const remaining = availableMeals.filter(
          meal =>
            !selected.includes(meal) && meal.isActive && meal.inventory > 0
        )

        const additionalMeals =
          AutoSelectionService.balancedVarietyStrategy.selectMeals(
            remaining,
            requiredCount - selected.length
          )

        selected.push(...additionalMeals)
      }

      return selected.slice(0, requiredCount)
    },
  }

  /**
   * Perform auto-selection for a subscription
   */
  static async performAutoSelection(
    subscriptionId: string,
    weekStart: Date,
    strategy: AutoSelectionStrategy = this.balancedVarietyStrategy
  ): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        bundlePrice: true,
        user: true,
      },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Check if deadline has passed
    const deadlineInfo = DeadlineService.getDeadlineInfo(
      subscription.deliveryDay,
      weekStart
    )
    if (!deadlineInfo.isAfterDeadline) {
      throw new Error('Selection deadline has not passed yet')
    }

    // Check if already has selections for this week
    const existingSelections = await prisma.mealSelection.findMany({
      where: {
        subscriptionId,
        weekStart,
      },
    })

    if (existingSelections.length > 0) {
      throw new Error('Meals already selected for this week')
    }

    // Get available meals for this week
    const weeklyMenu = await prisma.weeklyMenu.findFirst({
      where: {
        weekStart,
        isActive: true,
        isPublished: true,
      },
      include: {
        menuItems: {
          include: {
            meal: true,
          },
          where: {
            isAvailable: true,
          },
        },
      },
    })

    if (!weeklyMenu) {
      throw new Error('No weekly menu available for this week')
    }

    const availableMeals = weeklyMenu.menuItems.map(item => item.meal)

    // Get user history for preference-based selection
    const userHistory = await this.getUserSelectionHistory(subscription.userId)

    // Select meals using the specified strategy
    const selectedMeals = strategy.selectMeals(
      availableMeals,
      subscription.bundlePrice.mealCount,
      userHistory
    )

    if (selectedMeals.length === 0) {
      throw new Error('No available meals to select')
    }

    // Create meal selections
    const mealSelections = selectedMeals.map(meal => ({
      subscriptionId,
      weekStart,
      mealId: meal.id,
      quantity: 1,
      isAutoSelected: true,
      selectedAt: new Date(),
    }))

    await prisma.mealSelection.createMany({
      data: mealSelections,
    })

    // Log the auto-selection for audit purposes
    console.log(
      `Auto-selected ${selectedMeals.length} meals for subscription ${subscriptionId} using ${strategy.name} strategy`
    )
  }

  /**
   * Get user's meal selection history to inform preferences
   */
  private static async getUserSelectionHistory(userId: string) {
    const recentSelections = await prisma.mealSelection.findMany({
      where: {
        subscription: {
          userId,
        },
        selectedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        meal: true,
      },
      orderBy: {
        selectedAt: 'desc',
      },
    })

    // Analyze preferred categories
    const categoryCount = recentSelections.reduce(
      (acc, selection) => {
        const category = selection.meal.category
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<MealCategory, number>
    )

    const preferredCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category as MealCategory)

    return {
      preferredCategories,
      totalSelections: recentSelections.length,
      recentMeals: recentSelections.slice(0, 10).map(s => s.meal),
    }
  }

  /**
   * Process all subscriptions that need auto-selection
   */
  static async processAutoSelections(weekStart: Date): Promise<void> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        bundlePrice: true,
        user: true,
      },
    })

    const processedCount = { success: 0, failed: 0 }

    for (const subscription of subscriptions) {
      try {
        const deadlineInfo = DeadlineService.getDeadlineInfo(
          subscription.deliveryDay,
          weekStart
        )

        // Only process if deadline has passed and no selections exist
        if (deadlineInfo.isAfterDeadline) {
          const existingSelections = await prisma.mealSelection.findMany({
            where: {
              subscriptionId: subscription.id,
              weekStart,
            },
          })

          if (existingSelections.length === 0) {
            await this.performAutoSelection(subscription.id, weekStart)
            processedCount.success++
          }
        }
      } catch (error) {
        console.error(
          `Failed to auto-select for subscription ${subscription.id}:`,
          error
        )
        processedCount.failed++
      }
    }

    console.log(
      `Auto-selection completed: ${processedCount.success} success, ${processedCount.failed} failed`
    )
  }

  /**
   * Get available auto-selection strategies
   */
  static getAvailableStrategies(): AutoSelectionStrategy[] {
    return [
      this.balancedVarietyStrategy,
      this.popularMealsStrategy,
      this.userPreferenceStrategy,
    ]
  }
}
