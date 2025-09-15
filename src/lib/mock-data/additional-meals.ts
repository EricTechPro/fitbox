import type { Meal } from '@/types/common'

// Additional meal options for expanding the menu
// These use high-quality food photography from Unsplash
export const additionalMeals: Meal[] = [
  {
    id: '7',
    name: 'Thai Green Curry with Rice',
    nameZh: '泰式绿咖喱饭',
    description: 'Fragrant green curry with vegetables and your choice of protein, served with jasmine rice',
    descriptionZh: '香浓绿咖喱配蔬菜和您选择的蛋白质，配茉莉香米',
    category: 'RICE_BASED',
    price: 17.99,
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop&q=80',
    allergens: ['shellfish'],
    isActive: true,
    inventory: 20,
    calories: 560,
    protein: 30,
    carbs: 70,
    fat: 15,
    ingredients: 'Green curry paste, coconut milk, Thai basil, bamboo shoots, bell peppers, chicken or tofu, jasmine rice',
    isSpicy: true,
    featured: false
  },
  {
    id: '8',
    name: 'Japanese Ramen Bowl',
    nameZh: '日式拉面',
    description: 'Rich tonkotsu broth with chashu pork, soft-boiled egg, and fresh ramen noodles',
    descriptionZh: '浓郁豚骨汤配叉烧肉、溏心蛋和新鲜拉面',
    category: 'NOODLE_SOUPS',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop&q=80',
    allergens: ['gluten', 'egg', 'soy'],
    isActive: true,
    inventory: 15,
    calories: 680,
    protein: 35,
    carbs: 80,
    fat: 20,
    ingredients: 'Tonkotsu broth, ramen noodles, chashu pork, soft-boiled egg, green onions, nori, bamboo shoots',
    isSpicy: false,
    featured: true
  },
  {
    id: '9',
    name: 'Spaghetti Carbonara',
    nameZh: '意式培根蛋面',
    description: 'Classic Italian pasta with crispy pancetta, egg, and parmesan cheese',
    descriptionZh: '经典意大利面配脆培根、鸡蛋和帕玛森芝士',
    category: 'PASTA_FUSION',
    price: 16.99,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop&q=80',
    allergens: ['gluten', 'egg', 'dairy'],
    isActive: true,
    inventory: 25,
    calories: 590,
    protein: 28,
    carbs: 65,
    fat: 24,
    ingredients: 'Spaghetti, pancetta, eggs, parmesan cheese, black pepper, garlic',
    isSpicy: false,
    featured: false
  },
  {
    id: '10',
    name: 'Grilled Steak with Vegetables',
    nameZh: '烤牛排配蔬菜',
    description: 'Perfectly grilled sirloin steak with roasted seasonal vegetables and herb butter',
    descriptionZh: '完美烤制的西冷牛排配烤时令蔬菜和香草黄油',
    category: 'PROTEIN_SIDES',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&q=80',
    allergens: ['dairy'],
    isActive: true,
    inventory: 12,
    calories: 650,
    protein: 48,
    carbs: 30,
    fat: 28,
    ingredients: 'Sirloin steak, asparagus, cherry tomatoes, mushrooms, herb butter, rosemary, thyme',
    isSpicy: false,
    featured: false
  },
  {
    id: '11',
    name: 'Korean Bibimbap',
    nameZh: '韩式石锅拌饭',
    description: 'Mixed rice bowl with assorted vegetables, beef, and fried egg with gochujang sauce',
    descriptionZh: '混合米饭配各种蔬菜、牛肉和煎蛋，配韩式辣酱',
    category: 'RICE_BASED',
    price: 18.99,
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop&q=80',
    allergens: ['egg', 'soy'],
    isActive: true,
    inventory: 18,
    calories: 620,
    protein: 32,
    carbs: 72,
    fat: 18,
    ingredients: 'Rice, marinated beef, spinach, bean sprouts, mushrooms, carrots, zucchini, fried egg, gochujang sauce',
    isSpicy: true,
    featured: false
  },
  {
    id: '12',
    name: 'Vietnamese Pho',
    nameZh: '越南河粉',
    description: 'Traditional beef pho with rice noodles in aromatic broth, served with fresh herbs',
    descriptionZh: '传统牛肉河粉配香浓汤底和新鲜香草',
    category: 'NOODLE_SOUPS',
    price: 17.99,
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop&q=80',
    allergens: ['gluten'],
    isActive: true,
    inventory: 22,
    calories: 580,
    protein: 35,
    carbs: 70,
    fat: 12,
    ingredients: 'Rice noodles, beef slices, beef broth, Thai basil, cilantro, lime, bean sprouts, hoisin sauce',
    isSpicy: false,
    featured: false
  }
]

// Function to get random meals for featured section
export function getRandomFeaturedMeals(count: number = 3): Meal[] {
  const allMeals = [...additionalMeals]
  const shuffled = allMeals.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// High-quality placeholder images for different meal categories
export const mealImagePlaceholders = {
  RICE_BASED: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop&q=80', // Chicken rice bowl
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop&q=80', // Bibimbap
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop&q=80', // Thai curry rice
  ],
  NOODLE_SOUPS: [
    'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop&q=80', // Ramen
    'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop&q=80', // Pho
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop&q=80', // Beef noodle soup
  ],
  PASTA_FUSION: [
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop&q=80', // Carbonara
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80', // Creamy pasta
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop&q=80', // Pasta dish
  ],
  PROTEIN_SIDES: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&q=80', // Steak
    'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=600&h=400&fit=crop&q=80', // Salmon
    'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop&q=80', // Herb chicken
  ]
}