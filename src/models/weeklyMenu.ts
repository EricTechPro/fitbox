import { WeeklyMenu, WeeklyMenuItem, Meal } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// WeeklyMenu model service layer
export class WeeklyMenuModel {
  /**
   * Create a new weekly menu
   */
  static async create(menuData: {
    name: string
    weekStart: Date
    weekEnd: Date
    isActive?: boolean
    isPublished?: boolean
    publishedAt?: Date
  }): Promise<WeeklyMenu> {
    return prisma.weeklyMenu.create({
      data: {
        name: menuData.name,
        weekStart: menuData.weekStart,
        weekEnd: menuData.weekEnd,
        isActive: menuData.isActive || false,
        isPublished: menuData.isPublished || false,
        publishedAt: menuData.publishedAt,
      },
    })
  }

  /**
   * Find menu by ID
   */
  static async findById(id: string): Promise<WeeklyMenu | null> {
    return prisma.weeklyMenu.findUnique({
      where: { id },
    })
  }

  /**
   * Find menu by ID with meals
   */
  static async findByIdWithMeals(id: string): Promise<(WeeklyMenu & {
    menuItems: (WeeklyMenuItem & { meal: Meal })[]
  }) | null> {
    return prisma.weeklyMenu.findUnique({
      where: { id },
      include: {
        menuItems: {
          include: { meal: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  /**
   * Get current active menu
   */
  static async getCurrentActiveMenu(): Promise<(WeeklyMenu & {
    menuItems: (WeeklyMenuItem & { meal: Meal })[]
  }) | null> {
    return prisma.weeklyMenu.findFirst({
      where: { isActive: true },
      include: {
        menuItems: {
          where: { isAvailable: true },
          include: { meal: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { weekStart: 'desc' },
    })
  }

  /**
   * Get published menus within date range
   */
  static async getPublishedMenus(options?: {
    from?: Date
    to?: Date
    take?: number
  }): Promise<WeeklyMenu[]> {
    const whereConditions: any = { isPublished: true }

    if (options?.from || options?.to) {
      whereConditions.AND = []
      if (options.from) {
        whereConditions.AND.push({ weekStart: { gte: options.from } })
      }
      if (options.to) {
        whereConditions.AND.push({ weekEnd: { lte: options.to } })
      }
    }

    return prisma.weeklyMenu.findMany({
      where: whereConditions,
      orderBy: { weekStart: 'desc' },
      take: options?.take,
    })
  }

  /**
   * Update menu
   */
  static async update(
    id: string,
    updateData: Partial<Omit<WeeklyMenu, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<WeeklyMenu> {
    return prisma.weeklyMenu.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Publish menu
   */
  static async publish(id: string): Promise<WeeklyMenu> {
    return prisma.weeklyMenu.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    })
  }

  /**
   * Activate menu (deactivates others)
   */
  static async activate(id: string): Promise<WeeklyMenu> {
    // Deactivate all other menus first
    await prisma.weeklyMenu.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Activate the specified menu
    return prisma.weeklyMenu.update({
      where: { id },
      data: { isActive: true },
    })
  }

  /**
   * Delete menu
   */
  static async delete(id: string): Promise<WeeklyMenu> {
    return prisma.weeklyMenu.delete({
      where: { id },
    })
  }
}

// WeeklyMenuItem model service layer
export class WeeklyMenuItemModel {
  /**
   * Add meal to weekly menu
   */
  static async addMealToMenu(menuItemData: {
    weeklyMenuId: string
    mealId: string
    isAvailable?: boolean
    inventoryLimit?: number
    specialPrice?: number
  }): Promise<WeeklyMenuItem> {
    return prisma.weeklyMenuItem.create({
      data: {
        weeklyMenuId: menuItemData.weeklyMenuId,
        mealId: menuItemData.mealId,
        isAvailable: menuItemData.isAvailable !== undefined ? menuItemData.isAvailable : true,
        inventoryLimit: menuItemData.inventoryLimit,
        specialPrice: menuItemData.specialPrice,
      },
    })
  }

  /**
   * Remove meal from weekly menu
   */
  static async removeMealFromMenu(weeklyMenuId: string, mealId: string): Promise<WeeklyMenuItem> {
    return prisma.weeklyMenuItem.delete({
      where: {
        weeklyMenuId_mealId: {
          weeklyMenuId,
          mealId,
        },
      },
    })
  }

  /**
   * Update menu item availability
   */
  static async updateAvailability(
    weeklyMenuId: string,
    mealId: string,
    isAvailable: boolean
  ): Promise<WeeklyMenuItem> {
    return prisma.weeklyMenuItem.update({
      where: {
        weeklyMenuId_mealId: {
          weeklyMenuId,
          mealId,
        },
      },
      data: { isAvailable },
    })
  }

  /**
   * Update menu item inventory limit
   */
  static async updateInventoryLimit(
    weeklyMenuId: string,
    mealId: string,
    inventoryLimit: number | null
  ): Promise<WeeklyMenuItem> {
    return prisma.weeklyMenuItem.update({
      where: {
        weeklyMenuId_mealId: {
          weeklyMenuId,
          mealId,
        },
      },
      data: { inventoryLimit },
    })
  }

  /**
   * Update menu item special price
   */
  static async updateSpecialPrice(
    weeklyMenuId: string,
    mealId: string,
    specialPrice: number | null
  ): Promise<WeeklyMenuItem> {
    return prisma.weeklyMenuItem.update({
      where: {
        weeklyMenuId_mealId: {
          weeklyMenuId,
          mealId,
        },
      },
      data: { specialPrice },
    })
  }

  /**
   * Get all items for a menu
   */
  static async getMenuItems(weeklyMenuId: string): Promise<(WeeklyMenuItem & { meal: Meal })[]> {
    return prisma.weeklyMenuItem.findMany({
      where: { weeklyMenuId },
      include: { meal: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Get available items for a menu
   */
  static async getAvailableMenuItems(weeklyMenuId: string): Promise<(WeeklyMenuItem & { meal: Meal })[]> {
    return prisma.weeklyMenuItem.findMany({
      where: {
        weeklyMenuId,
        isAvailable: true,
      },
      include: { meal: true },
      orderBy: { createdAt: 'asc' },
    })
  }
}

// Type exports
export type CreateWeeklyMenuData = {
  name: string
  weekStart: Date
  weekEnd: Date
  isActive?: boolean
  isPublished?: boolean
  publishedAt?: Date
}

export type UpdateWeeklyMenuData = Partial<Omit<WeeklyMenu, 'id' | 'createdAt' | 'updatedAt'>>

export type WeeklyMenuWithItems = WeeklyMenu & {
  menuItems: (WeeklyMenuItem & { meal: Meal })[]
}

export type CreateWeeklyMenuItemData = {
  weeklyMenuId: string
  mealId: string
  isAvailable?: boolean
  inventoryLimit?: number
  specialPrice?: number
}