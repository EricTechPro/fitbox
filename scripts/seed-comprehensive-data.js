const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// High-quality Unsplash food images - Asian cuisine focused
const foodImages = {
  rice: [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563379091339-03246968d24c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80',
  ],
  noodles: [
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569505500082-ab1ce3a4e071?auto=format&fit=crop&w=800&q=80',
  ],
  pasta: [
    'https://images.unsplash.com/photo-1621996346565-e3dbc353d791?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611599922657-3cb98efe4e5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
  ],
  protein: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
  ],
}

// Comprehensive meal data with authentic Chinese names and descriptions
const mealsData = [
  // RICE_BASED meals
  {
    name: 'Cantonese Char Siu Rice',
    nameZh: '廣式叉燒飯',
    description:
      'Traditional Cantonese barbecued pork served over jasmine rice with steamed vegetables and sweet soy glaze.',
    category: 'RICE_BASED',
    price: 19.99,
    imageUrl: foodImages.rice[0],
    imageAlt: 'Cantonese char siu rice with barbecued pork',
    calories: 650,
    protein: 35,
    carbs: 68,
    fat: 18,
    fiber: 4,
    sugar: 12,
    sodium: 890,
    allergens: ['soy', 'gluten'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Wong',
    chefInfo: '20 years experience in Cantonese cuisine',
  },
  {
    name: 'Mapo Tofu Rice Bowl',
    nameZh: '麻婆豆腐飯',
    description:
      'Silky tofu in spicy Sichuan sauce with ground pork, served over steamed rice with scallions.',
    category: 'RICE_BASED',
    price: 17.99,
    imageUrl: foodImages.rice[1],
    imageAlt: 'Mapo tofu rice bowl with spicy Sichuan sauce',
    calories: 580,
    protein: 28,
    carbs: 62,
    fat: 22,
    fiber: 6,
    sugar: 8,
    sodium: 1120,
    allergens: ['soy'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    chefName: 'Chef Li',
    chefInfo: 'Sichuan cuisine specialist',
  },
  {
    name: 'Korean Bulgogi Rice',
    nameZh: '韓式烤肉飯',
    description:
      'Marinated Korean beef bulgogi with kimchi, pickled vegetables, and sesame rice.',
    category: 'RICE_BASED',
    price: 21.99,
    imageUrl: foodImages.rice[2],
    imageAlt: 'Korean bulgogi rice with marinated beef',
    calories: 720,
    protein: 42,
    carbs: 58,
    fat: 28,
    fiber: 5,
    sugar: 15,
    sodium: 980,
    allergens: ['soy', 'gluten', 'sesame'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Park',
    chefInfo: 'Korean fusion specialist',
  },
  {
    name: 'Thai Basil Chicken Rice',
    nameZh: '泰式九層塔雞肉飯',
    description:
      'Spicy Thai basil chicken stir-fry with bell peppers, served over fragrant jasmine rice.',
    category: 'RICE_BASED',
    price: 18.99,
    imageUrl: foodImages.rice[3],
    imageAlt: 'Thai basil chicken rice with fresh herbs',
    calories: 620,
    protein: 38,
    carbs: 55,
    fat: 20,
    fiber: 3,
    sugar: 10,
    sodium: 850,
    allergens: ['soy', 'fish sauce'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    chefName: 'Chef Somchai',
    chefInfo: 'Authentic Thai cuisine expert',
  },

  // NOODLE_SOUPS meals
  {
    name: 'Tonkotsu Ramen',
    nameZh: '豚骨拉麵',
    description:
      'Rich pork bone broth with fresh ramen noodles, chashu pork, soft-boiled egg, and nori.',
    category: 'NOODLE_SOUPS',
    price: 22.99,
    imageUrl: foodImages.noodles[0],
    imageAlt: 'Tonkotsu ramen with rich pork broth',
    calories: 780,
    protein: 45,
    carbs: 72,
    fat: 32,
    fiber: 8,
    sugar: 6,
    sodium: 1450,
    allergens: ['gluten', 'eggs', 'soy'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Tanaka',
    chefInfo: 'Ramen master with 15 years experience',
  },
  {
    name: 'Wonton Noodle Soup',
    nameZh: '雲吞麵',
    description:
      'Traditional Hong Kong-style wonton soup with fresh egg noodles and bok choy in clear broth.',
    category: 'NOODLE_SOUPS',
    price: 19.99,
    imageUrl: foodImages.noodles[1],
    imageAlt: 'Wonton noodle soup with dumplings',
    calories: 520,
    protein: 32,
    carbs: 68,
    fat: 12,
    fiber: 4,
    sugar: 5,
    sodium: 1180,
    allergens: ['gluten', 'eggs', 'shellfish'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Chan',
    chefInfo: 'Hong Kong dim sum specialist',
  },
  {
    name: 'Tom Yum Seafood Noodles',
    nameZh: '冬陰功海鮮麵',
    description:
      'Spicy and sour Thai tom yum soup with rice noodles, shrimp, squid, and fresh herbs.',
    category: 'NOODLE_SOUPS',
    price: 24.99,
    imageUrl: foodImages.noodles[2],
    imageAlt: 'Tom yum seafood noodles with shrimp',
    calories: 480,
    protein: 35,
    carbs: 58,
    fat: 8,
    fiber: 6,
    sugar: 12,
    sodium: 1320,
    allergens: ['shellfish', 'fish sauce'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    chefName: 'Chef Apinya',
    chefInfo: 'Thai soup specialist',
  },
  {
    name: 'Vegetarian Miso Ramen',
    nameZh: '素食味噌拉麵',
    description:
      'Rich miso broth with fresh ramen noodles, marinated tofu, corn, green onions, and bamboo shoots.',
    category: 'NOODLE_SOUPS',
    price: 20.99,
    imageUrl: foodImages.noodles[3],
    imageAlt: 'Vegetarian miso ramen with tofu',
    calories: 590,
    protein: 25,
    carbs: 78,
    fat: 18,
    fiber: 10,
    sugar: 8,
    sodium: 1250,
    allergens: ['gluten', 'soy'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Yamamoto',
    chefInfo: 'Vegetarian Japanese cuisine expert',
  },

  // PASTA_FUSION meals
  {
    name: 'Black Garlic Ramen Carbonara',
    nameZh: '黑蒜拉麵卡邦尼',
    description:
      'Fusion carbonara with ramen noodles, black garlic, pancetta, and creamy egg yolk sauce.',
    category: 'PASTA_FUSION',
    price: 23.99,
    imageUrl: foodImages.pasta[0],
    imageAlt: 'Black garlic ramen carbonara fusion',
    calories: 720,
    protein: 38,
    carbs: 65,
    fat: 35,
    fiber: 4,
    sugar: 6,
    sodium: 950,
    allergens: ['gluten', 'eggs', 'dairy'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    chefName: 'Chef Marco',
    chefInfo: 'Italian-Japanese fusion pioneer',
  },
  {
    name: 'Kimchi Mac and Cheese',
    nameZh: '泡菜芝士通粉',
    description:
      'Creamy mac and cheese elevated with spicy kimchi and Korean chili oil.',
    category: 'PASTA_FUSION',
    price: 19.99,
    imageUrl: foodImages.pasta[1],
    imageAlt: 'Kimchi mac and cheese fusion',
    calories: 680,
    protein: 28,
    carbs: 72,
    fat: 28,
    fiber: 6,
    sugar: 8,
    sodium: 1080,
    allergens: ['gluten', 'dairy'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    chefName: 'Chef Kim',
    chefInfo: 'Korean-Western fusion expert',
  },
  {
    name: 'Miso Butter Seafood Pasta',
    nameZh: '味噌牛油海鮮意粉',
    description:
      'Linguine in rich miso butter sauce with scallops, shrimp, and fresh herbs.',
    category: 'PASTA_FUSION',
    price: 26.99,
    imageUrl: foodImages.pasta[2],
    imageAlt: 'Miso butter seafood pasta',
    calories: 650,
    protein: 42,
    carbs: 58,
    fat: 24,
    fiber: 3,
    sugar: 5,
    sodium: 1150,
    allergens: ['gluten', 'dairy', 'shellfish', 'soy'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    chefName: 'Chef Suzuki',
    chefInfo: 'Japanese-Italian fusion specialist',
  },

  // PROTEIN_SIDES meals
  {
    name: 'Teriyaki Glazed Chicken',
    nameZh: '照燒雞腿',
    description:
      'Grilled chicken thigh with house teriyaki glaze, steamed broccoli, and sesame rice.',
    category: 'PROTEIN_SIDES',
    price: 21.99,
    imageUrl: foodImages.protein[0],
    imageAlt: 'Teriyaki glazed chicken with vegetables',
    calories: 590,
    protein: 45,
    carbs: 42,
    fat: 22,
    fiber: 5,
    sugar: 18,
    sodium: 890,
    allergens: ['soy', 'gluten', 'sesame'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Sato',
    chefInfo: 'Japanese grill specialist',
  },
  {
    name: 'Korean Fried Cauliflower',
    nameZh: '韓式炸花椰菜',
    description:
      'Crispy cauliflower in Korean chili glaze with pickled vegetables and quinoa.',
    category: 'PROTEIN_SIDES',
    price: 18.99,
    imageUrl: foodImages.protein[1],
    imageAlt: 'Korean fried cauliflower with quinoa',
    calories: 420,
    protein: 18,
    carbs: 58,
    fat: 14,
    fiber: 12,
    sugar: 16,
    sodium: 780,
    allergens: ['gluten', 'soy'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isDairyFree: true,
    chefName: 'Chef Lee',
    chefInfo: 'Korean vegetarian specialist',
  },
  {
    name: 'Miso Glazed Black Cod',
    nameZh: '味噌銀鱈魚',
    description:
      'Premium black cod marinated in sweet miso, served with baby bok choy and forbidden rice.',
    category: 'PROTEIN_SIDES',
    price: 32.99,
    imageUrl: foodImages.protein[2],
    imageAlt: 'Miso glazed black cod with bok choy',
    calories: 520,
    protein: 48,
    carbs: 35,
    fat: 20,
    fiber: 4,
    sugar: 12,
    sodium: 980,
    allergens: ['fish', 'soy'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    chefName: 'Chef Morimoto',
    chefInfo: 'Premium seafood specialist',
  },
  {
    name: 'Szechuan Tofu Steaks',
    nameZh: '四川豆腐排',
    description:
      'Pressed tofu steaks with numbing Szechuan peppercorns, served with garlic green beans.',
    category: 'PROTEIN_SIDES',
    price: 17.99,
    imageUrl: foodImages.protein[3],
    imageAlt: 'Szechuan tofu steaks with green beans',
    calories: 380,
    protein: 22,
    carbs: 28,
    fat: 20,
    fiber: 8,
    sugar: 6,
    sodium: 950,
    allergens: ['soy'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    chefName: 'Chef Zhang',
    chefInfo: 'Szechuan province native',
  },
]

// Bundle pricing data
const bundlePrices = [
  {
    mealCount: 6,
    oneTimePrice: 119.94, // 6 meals * avg $19.99
    subscriptionPrice: 113.94, // 5% discount
    description: 'Weekly Bundle - 6 Meals',
  },
  {
    mealCount: 8,
    oneTimePrice: 159.92, // 8 meals * avg $19.99
    subscriptionPrice: 151.92, // 5% discount
    description: 'Weekly Bundle - 8 Meals',
  },
  {
    mealCount: 10,
    oneTimePrice: 199.9, // 10 meals * avg $19.99
    subscriptionPrice: 189.9, // 5% discount
    description: 'Weekly Bundle - 10 Meals',
  },
  {
    mealCount: 12,
    oneTimePrice: 239.88, // 12 meals * avg $19.99
    subscriptionPrice: 227.88, // 5% discount
    description: 'Weekly Bundle - 12 Meals',
  },
]

async function seedComprehensiveData() {
  try {
    console.log('🌱 Starting comprehensive data seeding...')

    // Check existing meals
    const existingMeals = await prisma.meal.findMany()
    console.log(`📊 Found ${existingMeals.length} existing meals`)

    // Add new meals (skip existing ones)
    let newMealsCount = 0
    for (const mealData of mealsData) {
      const existingMeal = existingMeals.find(m => m.name === mealData.name)
      if (!existingMeal) {
        await prisma.meal.create({
          data: {
            ...mealData,
            inventory: 50, // Set initial inventory
          },
        })
        newMealsCount++
        console.log(`✅ Created meal: ${mealData.name} (${mealData.nameZh})`)
      } else {
        console.log(`⏭️  Skipped existing meal: ${mealData.name}`)
      }
    }

    console.log(`🍽️  Added ${newMealsCount} new meals`)

    // Create bundle prices
    console.log('💰 Creating bundle prices...')
    for (const bundleData of bundlePrices) {
      try {
        await prisma.bundlePrice.create({
          data: bundleData,
        })
        console.log(`✅ Created bundle: ${bundleData.description}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(
            `⏭️  Bundle for ${bundleData.mealCount} meals already exists`
          )
        } else {
          console.error(
            `❌ Error creating bundle for ${bundleData.mealCount} meals:`,
            error.message
          )
        }
      }
    }

    // Create a weekly menu for current week
    console.log('📅 Creating weekly menu...')
    const currentDate = new Date()
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Monday
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Sunday

    const weekName = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`

    let weeklyMenu
    try {
      weeklyMenu = await prisma.weeklyMenu.create({
        data: {
          name: weekName,
          weekStart: weekStart,
          weekEnd: weekEnd,
          isActive: true,
          isPublished: true,
          publishedAt: new Date(),
        },
      })
      console.log(`✅ Created weekly menu: ${weekName}`)
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⏭️  Weekly menu already exists, finding existing...')
        weeklyMenu = await prisma.weeklyMenu.findFirst({
          where: {
            weekStart: weekStart,
            weekEnd: weekEnd,
          },
        })
      } else {
        throw error
      }
    }

    // Add all meals to the weekly menu
    if (weeklyMenu) {
      const allMeals = await prisma.meal.findMany({
        where: { isActive: true },
      })

      console.log('📝 Adding meals to weekly menu...')
      for (const meal of allMeals) {
        try {
          await prisma.weeklyMenuItem.create({
            data: {
              weeklyMenuId: weeklyMenu.id,
              mealId: meal.id,
              isAvailable: true,
              inventoryLimit: 25,
            },
          })
          console.log(`✅ Added ${meal.name} to weekly menu`)
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`⏭️  ${meal.name} already in weekly menu`)
          } else {
            console.error(
              `❌ Error adding ${meal.name} to menu:`,
              error.message
            )
          }
        }
      }
    }

    // Final summary
    const finalMealCount = await prisma.meal.count()
    const finalBundleCount = await prisma.bundlePrice.count()
    const finalMenuCount = await prisma.weeklyMenu.count()

    console.log('\n🎉 Data seeding complete!')
    console.log(`📊 Total meals: ${finalMealCount}`)
    console.log(`💰 Total bundle prices: ${finalBundleCount}`)
    console.log(`📅 Total weekly menus: ${finalMenuCount}`)

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

seedComprehensiveData()
