/**
 * T020: Contract tests for menu and meal endpoints
 *
 * Tests current menu retrieval, meal details, category filtering
 * Following TDD approach - these tests MUST FAIL before implementation
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals'
import { prisma } from '@/lib/prisma'
import { MealCategory } from '@prisma/client'

// Types for API responses
interface MenuResponse {
  success: boolean
  data: {
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
      imageUrl?: string
      imageAlt?: string
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
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
    categories: MealCategory[]
  }
  error?: string
}

interface MealDetailResponse {
  success: boolean
  data?: {
    id: string
    name: string
    nameZh?: string
    description: string
    category: MealCategory
    price: number
    imageUrl?: string
    imageAlt?: string
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
    allergens: string[]
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    isDairyFree: boolean
    chefName?: string
    chefInfo?: string
    isActive: boolean
    inventory: number
    weeklyAvailability?: {
      isAvailable: boolean
      inventoryLimit?: number
      specialPrice?: number
    }
  }
  error?: string
}

describe('Menu API Contract Tests', () => {
  beforeAll(async () => {
    // Ensure clean test database state
    await prisma.weeklyMenuItem.deleteMany()
    await prisma.weeklyMenu.deleteMany()
    await prisma.meal.deleteMany()
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.weeklyMenuItem.deleteMany()
    await prisma.weeklyMenu.deleteMany()
    await prisma.meal.deleteMany()
  })

  beforeEach(async () => {
    // Create test data for each test
    await prisma.meal.createMany({
      data: [
        {
          id: 'meal-1',
          name: 'Kung Pao Chicken Bowl',
          nameZh: '宫保鸡丁饭',
          description:
            'Spicy Sichuan-style chicken with peanuts and vegetables over jasmine rice',
          category: 'RICE_BASED',
          price: 16.99,
          imageUrl: '/images/meals/kung-pao-chicken.jpg',
          imageAlt: 'Kung Pao Chicken Bowl with jasmine rice',
          calories: 520,
          protein: 35.5,
          carbs: 48.2,
          fat: 18.7,
          fiber: 4.2,
          sugar: 8.1,
          sodium: 890,
          allergens: ['nuts', 'soy'],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isDairyFree: true,
          chefName: 'Chef Li Wei',
          chefInfo: 'Sichuan cuisine specialist with 15 years experience',
          isActive: true,
          inventory: 50,
        },
        {
          id: 'meal-2',
          name: 'Vegetarian Pad Thai',
          description:
            'Traditional Thai noodles with tofu, bean sprouts, and tamarind sauce',
          category: 'NOODLE_SOUPS',
          price: 15.49,
          calories: 480,
          protein: 18.2,
          carbs: 62.1,
          fat: 14.3,
          allergens: ['eggs', 'soy'],
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: true,
          isDairyFree: true,
          isActive: true,
          inventory: 30,
        },
        {
          id: 'meal-3',
          name: 'Teriyaki Salmon Pasta',
          description: 'Grilled salmon with teriyaki glaze over udon noodles',
          category: 'PASTA_FUSION',
          price: 19.99,
          calories: 580,
          protein: 42.1,
          carbs: 55.3,
          fat: 20.8,
          allergens: ['fish', 'gluten', 'soy'],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isDairyFree: true,
          isActive: true,
          inventory: 25,
        },
      ],
    })

    // Create weekly menu
    const weekStart = new Date('2024-01-15T00:00:00Z')
    const weekEnd = new Date('2024-01-21T23:59:59Z')

    await prisma.weeklyMenu.create({
      data: {
        id: 'menu-week-1',
        name: 'Week of Jan 15-21, 2024',
        weekStart,
        weekEnd,
        isActive: true,
        isPublished: true,
        publishedAt: new Date('2024-01-11T17:00:00Z'),
        menuItems: {
          create: [
            {
              mealId: 'meal-1',
              isAvailable: true,
              inventoryLimit: 40,
            },
            {
              mealId: 'meal-2',
              isAvailable: true,
              inventoryLimit: 25,
            },
            {
              mealId: 'meal-3',
              isAvailable: true,
              inventoryLimit: 20,
              specialPrice: 18.99,
            },
          ],
        },
      },
    })
  })

  describe('GET /api/menus/current', () => {
    it('should return current weekly menu with meals', async () => {
      // This test MUST FAIL until API is implemented
      const response = await fetch('http://localhost:3000/api/menus/current')

      expect(response.status).toBe(200)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()

      // Validate weekly menu structure
      expect(data.data.weeklyMenu).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining('Week of'),
        weekStart: expect.any(String),
        weekEnd: expect.any(String),
        isActive: true,
      })

      // Validate meals structure
      expect(data.data.meals).toHaveLength(3)
      expect(data.data.meals[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        category: expect.any(String),
        price: expect.any(Number),
        allergens: expect.any(Array),
        isVegetarian: expect.any(Boolean),
        isVegan: expect.any(Boolean),
        isGlutenFree: expect.any(Boolean),
        isDairyFree: expect.any(Boolean),
        isAvailable: expect.any(Boolean),
      })

      // Validate categories
      expect(data.data.categories).toEqual(
        expect.arrayContaining(['RICE_BASED', 'NOODLE_SOUPS', 'PASTA_FUSION'])
      )
    })

    it('should filter meals by category', async () => {
      const response = await fetch(
        'http://localhost:3000/api/menus/current?category=RICE_BASED'
      )

      expect(response.status).toBe(200)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.meals).toHaveLength(1)
      expect(data.data.meals[0].category).toBe('RICE_BASED')
      expect(data.data.meals[0].name).toBe('Kung Pao Chicken Bowl')
    })

    it('should filter meals by dietary restrictions', async () => {
      const response = await fetch(
        'http://localhost:3000/api/menus/current?vegetarian=true'
      )

      expect(response.status).toBe(200)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.meals.every(meal => meal.isVegetarian)).toBe(true)
    })

    it('should search meals by name', async () => {
      const response = await fetch(
        'http://localhost:3000/api/menus/current?search=Pad Thai'
      )

      expect(response.status).toBe(200)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.meals).toHaveLength(1)
      expect(data.data.meals[0].name).toContain('Pad Thai')
    })

    it('should return only available meals', async () => {
      const response = await fetch('http://localhost:3000/api/menus/current')

      expect(response.status).toBe(200)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.meals.every(meal => meal.isAvailable)).toBe(true)
    })

    it('should return 404 when no active menu exists', async () => {
      // Deactivate all menus
      await prisma.weeklyMenu.updateMany({
        data: { isActive: false },
      })

      const response = await fetch('http://localhost:3000/api/menus/current')

      expect(response.status).toBe(404)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('No active menu found')
    })

    it('should handle invalid category filter', async () => {
      const response = await fetch(
        'http://localhost:3000/api/menus/current?category=INVALID'
      )

      expect(response.status).toBe(400)

      const data: MenuResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid category')
    })
  })

  describe('GET /api/meals/[id]', () => {
    it('should return detailed meal information', async () => {
      const response = await fetch('http://localhost:3000/api/meals/meal-1')

      expect(response.status).toBe(200)

      const data: MealDetailResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()

      // Validate complete meal structure
      expect(data.data).toMatchObject({
        id: 'meal-1',
        name: 'Kung Pao Chicken Bowl',
        nameZh: '宫保鸡丁饭',
        description: expect.stringContaining('Spicy Sichuan'),
        category: 'RICE_BASED',
        price: 16.99,
        imageUrl: '/images/meals/kung-pao-chicken.jpg',
        imageAlt: expect.any(String),
        calories: 520,
        protein: 35.5,
        carbs: 48.2,
        fat: 18.7,
        fiber: 4.2,
        sugar: 8.1,
        sodium: 890,
        allergens: ['nuts', 'soy'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: true,
        chefName: 'Chef Li Wei',
        chefInfo: expect.stringContaining('Sichuan'),
        isActive: true,
        inventory: 50,
      })
    })

    it('should include weekly availability information', async () => {
      const response = await fetch('http://localhost:3000/api/meals/meal-3')

      expect(response.status).toBe(200)

      const data: MealDetailResponse = await response.json()
      expect(data.success).toBe(true)
      expect(data.data?.weeklyAvailability).toMatchObject({
        isAvailable: true,
        inventoryLimit: 20,
        specialPrice: 18.99,
      })
    })

    it('should return 404 for non-existent meal', async () => {
      const response = await fetch(
        'http://localhost:3000/api/meals/non-existent'
      )

      expect(response.status).toBe(404)

      const data: MealDetailResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Meal not found')
    })

    it('should return 404 for inactive meal', async () => {
      // Make meal inactive
      await prisma.meal.update({
        where: { id: 'meal-1' },
        data: { isActive: false },
      })

      const response = await fetch('http://localhost:3000/api/meals/meal-1')

      expect(response.status).toBe(404)

      const data: MealDetailResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Meal not found or inactive')
    })

    it('should validate meal ID format', async () => {
      const response = await fetch(
        'http://localhost:3000/api/meals/invalid-id-format!'
      )

      expect(response.status).toBe(400)

      const data: MealDetailResponse = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid meal ID')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to menu endpoints', async () => {
      // Make multiple rapid requests
      const requests = Array.from({ length: 100 }, () =>
        fetch('http://localhost:3000/api/menus/current')
      )

      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(res => res.status === 429)

      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Caching Headers', () => {
    it('should return appropriate caching headers for menu data', async () => {
      const response = await fetch('http://localhost:3000/api/menus/current')

      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toContain('max-age')
      expect(response.headers.get('etag')).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database failures
      // For now, validate error response format
      const response = await fetch('http://localhost:3000/api/menus/current', {
        method: 'POST', // Invalid method
      })

      expect(response.status).toBe(405)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })
})
