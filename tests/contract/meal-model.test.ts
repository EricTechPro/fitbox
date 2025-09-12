import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Meal and WeeklyMenu Model Contract Tests', () => {
  // Setup and teardown
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    // Clean up in reverse order due to foreign key constraints
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.weeklyMenuItem.deleteMany()
    await prisma.weeklyMenu.deleteMany()
    await prisma.meal.deleteMany()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up data before each test
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.weeklyMenuItem.deleteMany()
    await prisma.weeklyMenu.deleteMany()
    await prisma.meal.deleteMany()
  })

  describe('Meal Model Tests', () => {
    test('should create a meal with all required fields', async () => {
      const mealData = {
        name: 'Teriyaki Chicken Bowl',
        nameZh: '照燒雞肉飯',
        description: 'Grilled chicken with teriyaki sauce over steamed rice',
        category: 'RICE_BASED' as const,
        imageUrl: 'https://example.com/teriyaki-chicken.jpg',
        imageAlt: 'Teriyaki chicken bowl with vegetables',
        price: 17.99,
        calories: 520,
        protein: 35.5,
        carbs: 45.2,
        fat: 12.8,
        fiber: 3.5,
        sugar: 8.2,
        sodium: 680.0,
        allergens: ['soy', 'gluten'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: true,
        chefName: 'Chef Wang',
        chefInfo: 'Former Four Seasons Hotel chef with 15 years experience',
        isActive: true,
        inventory: 50
      }

      const meal = await prisma.meal.create({
        data: mealData
      })

      expect(meal.id).toBeDefined()
      expect(meal.name).toBe(mealData.name)
      expect(meal.nameZh).toBe(mealData.nameZh)
      expect(meal.description).toBe(mealData.description)
      expect(meal.category).toBe('RICE_BASED')
      expect(meal.price.toString()).toBe('17.99')
      expect(meal.calories).toBe(520)
      expect(meal.protein).toBe(35.5)
      expect(meal.allergens).toEqual(['soy', 'gluten'])
      expect(meal.isVegetarian).toBe(false)
      expect(meal.isVegan).toBe(false)
      expect(meal.chefName).toBe('Chef Wang')
      expect(meal.isActive).toBe(true)
      expect(meal.inventory).toBe(50)
      expect(meal.createdAt).toBeDefined()
      expect(meal.updatedAt).toBeDefined()
    })

    test('should create meal with minimal required data', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Simple Noodle Soup',
          description: 'Basic noodle soup',
          category: 'NOODLE_SOUPS',
          price: 15.99
        }
      })

      expect(meal.name).toBe('Simple Noodle Soup')
      expect(meal.category).toBe('NOODLE_SOUPS')
      expect(meal.price.toString()).toBe('15.99')
      expect(meal.isActive).toBe(true) // Default
      expect(meal.inventory).toBe(0) // Default
      expect(meal.isVegetarian).toBe(false) // Default
      expect(meal.isVegan).toBe(false) // Default
    })

    test('should validate meal categories', async () => {
      const categories = ['RICE_BASED', 'NOODLE_SOUPS', 'PASTA_FUSION', 'PROTEIN_SIDES']
      
      for (const category of categories) {
        const meal = await prisma.meal.create({
          data: {
            name: `Test ${category} Meal`,
            description: 'Test meal for category validation',
            category: category as any,
            price: 16.99
          }
        })
        expect(meal.category).toBe(category)
      }
    })

    test('should handle bilingual support correctly', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Kung Pao Chicken',
          nameZh: '宮保雞丁',
          description: 'Spicy chicken with peanuts and vegetables',
          category: 'PROTEIN_SIDES',
          price: 18.99
        }
      })

      expect(meal.name).toBe('Kung Pao Chicken')
      expect(meal.nameZh).toBe('宮保雞丁')
    })

    test('should allow meals without Chinese name', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Western Style Pasta',
          description: 'Italian-inspired pasta dish',
          category: 'PASTA_FUSION',
          price: 16.99
        }
      })

      expect(meal.name).toBe('Western Style Pasta')
      expect(meal.nameZh).toBeNull()
    })

    test('should handle allergen arrays correctly', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Allergen Test Meal',
          description: 'Test meal for allergen handling',
          category: 'RICE_BASED',
          price: 17.99,
          allergens: ['nuts', 'dairy', 'gluten', 'eggs', 'soy']
        }
      })

      expect(meal.allergens).toEqual(['nuts', 'dairy', 'gluten', 'eggs', 'soy'])
      expect(Array.isArray(meal.allergens)).toBe(true)
    })

    test('should handle empty allergen array', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'No Allergen Meal',
          description: 'Meal with no allergens',
          category: 'RICE_BASED',
          price: 17.99,
          allergens: []
        }
      })

      expect(meal.allergens).toEqual([])
    })

    test('should update inventory correctly', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Inventory Test',
          description: 'Test inventory tracking',
          category: 'RICE_BASED',
          price: 17.99,
          inventory: 100
        }
      })

      expect(meal.inventory).toBe(100)

      const updated = await prisma.meal.update({
        where: { id: meal.id },
        data: { inventory: 75 }
      })

      expect(updated.inventory).toBe(75)
    })
  })

  describe('WeeklyMenu Model Tests', () => {
    test('should create weekly menu with all fields', async () => {
      const weekStart = new Date('2024-01-15T00:00:00Z') // Monday
      const weekEnd = new Date('2024-01-21T23:59:59Z') // Sunday
      const publishedAt = new Date('2024-01-11T22:00:00Z') // Thursday 5:00 PM EST

      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Week of Jan 15-21, 2024',
          weekStart,
          weekEnd,
          isActive: true,
          isPublished: true,
          publishedAt
        }
      })

      expect(menu.id).toBeDefined()
      expect(menu.name).toBe('Week of Jan 15-21, 2024')
      expect(menu.weekStart).toEqual(weekStart)
      expect(menu.weekEnd).toEqual(weekEnd)
      expect(menu.isActive).toBe(true)
      expect(menu.isPublished).toBe(true)
      expect(menu.publishedAt).toEqual(publishedAt)
      expect(menu.createdAt).toBeDefined()
      expect(menu.updatedAt).toBeDefined()
    })

    test('should create unpublished menu by default', async () => {
      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Draft Menu',
          weekStart: new Date('2024-01-22T00:00:00Z'),
          weekEnd: new Date('2024-01-28T23:59:59Z')
        }
      })

      expect(menu.isActive).toBe(false) // Default
      expect(menu.isPublished).toBe(false) // Default
      expect(menu.publishedAt).toBeNull()
    })

    test('should handle menu publishing workflow', async () => {
      // Create draft menu
      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Publishing Test Menu',
          weekStart: new Date('2024-02-05T00:00:00Z'),
          weekEnd: new Date('2024-02-11T23:59:59Z')
        }
      })

      expect(menu.isPublished).toBe(false)
      expect(menu.publishedAt).toBeNull()

      // Publish the menu
      const publishedMenu = await prisma.weeklyMenu.update({
        where: { id: menu.id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
          isActive: true
        }
      })

      expect(publishedMenu.isPublished).toBe(true)
      expect(publishedMenu.publishedAt).toBeDefined()
      expect(publishedMenu.isActive).toBe(true)
    })
  })

  describe('WeeklyMenuItem Model Tests', () => {
    test('should create weekly menu items with meal relationships', async () => {
      // Create a meal first
      const meal = await prisma.meal.create({
        data: {
          name: 'Weekly Special',
          description: 'This week\'s special meal',
          category: 'RICE_BASED',
          price: 19.99
        }
      })

      // Create a weekly menu
      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Test Week Menu',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z')
        }
      })

      // Create weekly menu item
      const menuItem = await prisma.weeklyMenuItem.create({
        data: {
          weeklyMenuId: menu.id,
          mealId: meal.id,
          isAvailable: true,
          inventoryLimit: 25,
          specialPrice: 18.99
        }
      })

      expect(menuItem.weeklyMenuId).toBe(menu.id)
      expect(menuItem.mealId).toBe(meal.id)
      expect(menuItem.isAvailable).toBe(true)
      expect(menuItem.inventoryLimit).toBe(25)
      expect(menuItem.specialPrice?.toString()).toBe('18.99')
    })

    test('should enforce unique constraint on weeklyMenuId and mealId', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Duplicate Test Meal',
          description: 'Test for unique constraint',
          category: 'RICE_BASED',
          price: 17.99
        }
      })

      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Unique Test Menu',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z')
        }
      })

      // Create first menu item
      await prisma.weeklyMenuItem.create({
        data: {
          weeklyMenuId: menu.id,
          mealId: meal.id
        }
      })

      // Attempt to create duplicate - should fail
      await expect(
        prisma.weeklyMenuItem.create({
          data: {
            weeklyMenuId: menu.id,
            mealId: meal.id
          }
        })
      ).rejects.toThrow()
    })

    test('should handle availability toggle', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Availability Test',
          description: 'Test availability toggle',
          category: 'NOODLE_SOUPS',
          price: 16.99
        }
      })

      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Availability Menu',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z')
        }
      })

      const menuItem = await prisma.weeklyMenuItem.create({
        data: {
          weeklyMenuId: menu.id,
          mealId: meal.id,
          isAvailable: true
        }
      })

      expect(menuItem.isAvailable).toBe(true)

      // Toggle availability
      const updated = await prisma.weeklyMenuItem.update({
        where: { id: menuItem.id },
        data: { isAvailable: false }
      })

      expect(updated.isAvailable).toBe(false)
    })

    test('should handle special pricing override', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Premium Meal',
          description: 'Expensive premium meal',
          category: 'PROTEIN_SIDES',
          price: 22.99 // Regular price
        }
      })

      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Special Price Menu',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z')
        }
      })

      // Add to menu with special price
      const menuItem = await prisma.weeklyMenuItem.create({
        data: {
          weeklyMenuId: menu.id,
          mealId: meal.id,
          specialPrice: 19.99 // Special discounted price
        }
      })

      expect(menuItem.specialPrice?.toString()).toBe('19.99')
    })
  })

  describe('Menu and Meal Relations', () => {
    test('should retrieve menu with all meals', async () => {
      // Create meals
      const meal1 = await prisma.meal.create({
        data: {
          name: 'Meal One',
          description: 'First meal',
          category: 'RICE_BASED',
          price: 17.99
        }
      })

      const meal2 = await prisma.meal.create({
        data: {
          name: 'Meal Two',
          description: 'Second meal',
          category: 'NOODLE_SOUPS',
          price: 18.99
        }
      })

      // Create menu
      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Relations Test Menu',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z')
        }
      })

      // Add meals to menu
      await prisma.weeklyMenuItem.create({
        data: { weeklyMenuId: menu.id, mealId: meal1.id }
      })

      await prisma.weeklyMenuItem.create({
        data: { weeklyMenuId: menu.id, mealId: meal2.id }
      })

      // Retrieve menu with meals
      const menuWithMeals = await prisma.weeklyMenu.findUnique({
        where: { id: menu.id },
        include: {
          menuItems: {
            include: {
              meal: true
            }
          }
        }
      })

      expect(menuWithMeals?.menuItems).toHaveLength(2)
      expect(menuWithMeals?.menuItems[0].meal.name).toBeDefined()
      expect(menuWithMeals?.menuItems[1].meal.name).toBeDefined()
    })

    test('should cascade delete menu items when menu is deleted', async () => {
      const meal = await prisma.meal.create({
        data: {
          name: 'Cascade Test Meal',
          description: 'Test cascade delete',
          category: 'RICE_BASED',
          price: 17.99
        }
      })

      const menu = await prisma.weeklyMenu.create({
        data: {
          name: 'Delete Test Menu',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z')
        }
      })

      const menuItem = await prisma.weeklyMenuItem.create({
        data: { weeklyMenuId: menu.id, mealId: meal.id }
      })

      // Delete the menu
      await prisma.weeklyMenu.delete({
        where: { id: menu.id }
      })

      // Menu item should be automatically deleted
      const deletedMenuItem = await prisma.weeklyMenuItem.findUnique({
        where: { id: menuItem.id }
      })

      expect(deletedMenuItem).toBeNull()

      // But meal should still exist
      const mealStillExists = await prisma.meal.findUnique({
        where: { id: meal.id }
      })

      expect(mealStillExists).not.toBeNull()
    })
  })

  describe('Menu Rotation Logic', () => {
    test('should support menu rotation by date ranges', async () => {
      // Create meals
      const meal1 = await prisma.meal.create({
        data: { name: 'Rotating Meal 1', description: 'First meal', category: 'RICE_BASED', price: 17.99 }
      })
      
      const meal2 = await prisma.meal.create({
        data: { name: 'Rotating Meal 2', description: 'Second meal', category: 'NOODLE_SOUPS', price: 18.99 }
      })

      // Create current week menu
      const currentMenu = await prisma.weeklyMenu.create({
        data: {
          name: 'Current Week',
          weekStart: new Date('2024-01-15T00:00:00Z'),
          weekEnd: new Date('2024-01-21T23:59:59Z'),
          isActive: true,
          isPublished: true
        }
      })

      // Create next week menu
      const nextMenu = await prisma.weeklyMenu.create({
        data: {
          name: 'Next Week',
          weekStart: new Date('2024-01-22T00:00:00Z'),
          weekEnd: new Date('2024-01-28T23:59:59Z'),
          isActive: false,
          isPublished: false
        }
      })

      // Add different meals to each menu
      await prisma.weeklyMenuItem.create({
        data: { weeklyMenuId: currentMenu.id, mealId: meal1.id }
      })

      await prisma.weeklyMenuItem.create({
        data: { weeklyMenuId: nextMenu.id, mealId: meal2.id }
      })

      // Query for current active menu
      const activeMenus = await prisma.weeklyMenu.findMany({
        where: { isActive: true },
        include: { menuItems: { include: { meal: true } } }
      })

      expect(activeMenus).toHaveLength(1)
      expect(activeMenus[0].name).toBe('Current Week')
      expect(activeMenus[0].menuItems[0].meal.name).toBe('Rotating Meal 1')
    })
  })
})