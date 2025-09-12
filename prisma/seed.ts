import { PrismaClient, UserRole, MealCategory, OrderStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (for development only)
  console.log('🧹 Cleaning existing data...')
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.weeklyMenuItem.deleteMany()
  await prisma.weeklyMenu.deleteMany()
  await prisma.meal.deleteMany()
  await prisma.deliveryZone.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('👥 Creating users...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fitbox.ca',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-604-555-0001',
      role: UserRole.ADMIN,
    },
  })

  const testUser = await prisma.user.create({
    data: {
      email: 'customer@fitbox.ca',
      password: await bcrypt.hash('customer123', 12),
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+1-604-555-0002',
      role: UserRole.CUSTOMER,
    },
  })

  console.log('✅ Created users:', { adminUser: adminUser.email, testUser: testUser.email })

  // Create delivery zones for Greater Vancouver Area
  console.log('🚚 Creating delivery zones...')
  const deliveryZones = await Promise.all([
    prisma.deliveryZone.create({
      data: {
        name: 'Downtown Vancouver',
        postalCodeList: ['V6B', 'V6C', 'V6E', 'V6G', 'V6H', 'V6J', 'V6K'],
        deliveryFee: 5.99,
        deliveryDays: ['SUNDAY', 'WEDNESDAY'],
        isActive: true,
        maxOrders: 50,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'Richmond',
        postalCodeList: ['V6V', 'V6W', 'V6X', 'V6Y', 'V7A', 'V7C', 'V7E'],
        deliveryFee: 7.99,
        deliveryDays: ['SUNDAY', 'WEDNESDAY'],
        isActive: true,
        maxOrders: 40,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'Burnaby',
        postalCodeList: ['V3J', 'V3N', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H'],
        deliveryFee: 6.99,
        deliveryDays: ['SUNDAY', 'WEDNESDAY'],
        isActive: true,
        maxOrders: 35,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'Surrey',
        postalCodeList: ['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V4A', 'V4B'],
        deliveryFee: 9.99,
        deliveryDays: ['SUNDAY', 'WEDNESDAY'],
        isActive: true,
        maxOrders: 30,
      },
    }),
  ])

  console.log('✅ Created delivery zones:', deliveryZones.map(z => z.name))

  // Create test address
  console.log('🏠 Creating test address...')
  const testAddress = await prisma.address.create({
    data: {
      userId: testUser.id,
      name: 'Home',
      streetLine1: '1234 Main Street',
      streetLine2: 'Apt 101',
      city: 'Vancouver',
      province: 'BC',
      postalCode: 'V6B 1A1',
      instructions: 'Ring doorbell twice',
      deliveryZone: 'Downtown Vancouver',
    },
  })

  console.log('✅ Created address:', testAddress.name)

  // Create meals
  console.log('🍽️ Creating meals...')
  const meals = await Promise.all([
    // Rice-based meals
    prisma.meal.create({
      data: {
        name: 'Teriyaki Chicken Bowl',
        nameZh: '照燒雞肉飯',
        description: 'Grilled chicken thigh with teriyaki glaze, steamed jasmine rice, broccoli, and edamame',
        category: MealCategory.RICE_BASED,
        price: 17.99,
        imageUrl: '/images/meals/teriyaki-chicken-bowl.jpg',
        imageAlt: 'Teriyaki chicken bowl with rice and vegetables',
        calories: 580,
        protein: 35.5,
        carbs: 62.3,
        fat: 18.2,
        fiber: 4.5,
        allergens: ['soy', 'gluten'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: true,
        chefName: 'Chef Wang',
        chefInfo: 'Authentic Asian fusion specialist',
        isActive: true,
        inventory: 50,
      },
    }),
    prisma.meal.create({
      data: {
        name: 'Korean BBQ Beef Bowl',
        nameZh: '韓式烤牛肉飯',
        description: 'Marinated bulgogi beef with sesame rice, kimchi, pickled vegetables, and gochujang sauce',
        category: MealCategory.RICE_BASED,
        price: 19.99,
        imageUrl: '/images/meals/korean-bbq-beef-bowl.jpg',
        imageAlt: 'Korean BBQ beef bowl with kimchi and vegetables',
        calories: 640,
        protein: 42.1,
        carbs: 58.7,
        fat: 24.3,
        fiber: 3.8,
        allergens: ['soy', 'sesame'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isDairyFree: true,
        chefName: 'Chef Kim',
        chefInfo: 'Korean cuisine master chef',
        isActive: true,
        inventory: 45,
      },
    }),

    // Noodle soups
    prisma.meal.create({
      data: {
        name: 'Spicy Ramen with Pork Belly',
        nameZh: '辣味豚骨拉麵',
        description: 'Rich tonkotsu broth with handmade ramen noodles, braised pork belly, soft-boiled egg, and vegetables',
        category: MealCategory.NOODLE_SOUPS,
        price: 18.99,
        imageUrl: '/images/meals/spicy-ramen-pork-belly.jpg',
        imageAlt: 'Spicy ramen bowl with pork belly and egg',
        calories: 720,
        protein: 38.9,
        carbs: 65.4,
        fat: 32.7,
        fiber: 5.2,
        allergens: ['gluten', 'eggs', 'soy'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: true,
        chefName: 'Chef Tanaka',
        chefInfo: 'Traditional ramen specialist',
        isActive: true,
        inventory: 40,
      },
    }),
    prisma.meal.create({
      data: {
        name: 'Vegetarian Pho',
        nameZh: '素食越南河粉',
        description: 'Clear vegetable broth with rice noodles, tofu, mushrooms, bean sprouts, herbs, and lime',
        category: MealCategory.NOODLE_SOUPS,
        price: 16.99,
        imageUrl: '/images/meals/vegetarian-pho.jpg',
        imageAlt: 'Vegetarian pho with tofu and fresh herbs',
        calories: 480,
        protein: 18.3,
        carbs: 72.1,
        fat: 12.4,
        fiber: 6.8,
        allergens: ['soy'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isDairyFree: true,
        chefName: 'Chef Nguyen',
        chefInfo: 'Vietnamese cuisine specialist',
        isActive: true,
        inventory: 35,
      },
    }),

    // Pasta fusion
    prisma.meal.create({
      data: {
        name: 'Miso Carbonara',
        nameZh: '味噌卡邦尼意粉',
        description: 'East-meets-West fusion pasta with miso cream sauce, pancetta, parmesan, and black pepper',
        category: MealCategory.PASTA_FUSION,
        price: 18.99,
        imageUrl: '/images/meals/miso-carbonara.jpg',
        imageAlt: 'Miso carbonara pasta with pancetta and parmesan',
        calories: 650,
        protein: 28.7,
        carbs: 68.9,
        fat: 28.4,
        fiber: 3.1,
        allergens: ['gluten', 'dairy', 'eggs', 'soy'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: false,
        chefName: 'Chef Rossi',
        chefInfo: 'Italian-Asian fusion expert',
        isActive: true,
        inventory: 30,
      },
    }),
    prisma.meal.create({
      data: {
        name: 'Laksa Mac & Cheese',
        nameZh: '叻沙芝士通粉',
        description: 'Creamy macaroni with laksa-spiced cheese sauce, prawns, bean sprouts, and crispy shallots',
        category: MealCategory.PASTA_FUSION,
        price: 17.99,
        imageUrl: '/images/meals/laksa-mac-cheese.jpg',
        imageAlt: 'Laksa-flavored mac and cheese with prawns',
        calories: 590,
        protein: 26.5,
        carbs: 54.3,
        fat: 29.8,
        fiber: 2.9,
        allergens: ['gluten', 'dairy', 'shellfish'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: false,
        chefName: 'Chef Lee',
        chefInfo: 'Southeast Asian fusion specialist',
        isActive: true,
        inventory: 28,
      },
    }),

    // Protein & sides
    prisma.meal.create({
      data: {
        name: 'Honey Glazed Salmon',
        nameZh: '蜂蜜烤三文魚',
        description: 'Atlantic salmon with honey soy glaze, quinoa pilaf, roasted vegetables, and citrus aioli',
        category: MealCategory.PROTEIN_SIDES,
        price: 22.99,
        imageUrl: '/images/meals/honey-glazed-salmon.jpg',
        imageAlt: 'Honey glazed salmon with quinoa and vegetables',
        calories: 520,
        protein: 44.2,
        carbs: 38.6,
        fat: 21.8,
        fiber: 7.4,
        allergens: ['fish', 'soy', 'eggs'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isDairyFree: true,
        chefName: 'Chef Anderson',
        chefInfo: 'Seafood and healthy eating specialist',
        isActive: true,
        inventory: 25,
      },
    }),
    prisma.meal.create({
      data: {
        name: 'Crispy Tofu Buddha Bowl',
        nameZh: '脆皮豆腐佛缽',
        description: 'Crispy sesame tofu with brown rice, roasted sweet potato, avocado, and tahini dressing',
        category: MealCategory.PROTEIN_SIDES,
        price: 16.99,
        imageUrl: '/images/meals/crispy-tofu-buddha-bowl.jpg',
        imageAlt: 'Crispy tofu buddha bowl with vegetables and tahini',
        calories: 450,
        protein: 20.8,
        carbs: 52.4,
        fat: 18.9,
        fiber: 9.2,
        allergens: ['soy', 'sesame', 'nuts'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isDairyFree: true,
        chefName: 'Chef Patel',
        chefInfo: 'Plant-based nutrition specialist',
        isActive: true,
        inventory: 40,
      },
    }),
  ])

  console.log('✅ Created meals:', meals.length)

  // Create weekly menu
  console.log('📅 Creating weekly menu...')
  const weekStart = new Date('2024-01-15') // Monday
  const weekEnd = new Date('2024-01-21')   // Sunday
  
  const weeklyMenu = await prisma.weeklyMenu.create({
    data: {
      name: 'Week of January 15-21, 2024',
      weekStart,
      weekEnd,
      isActive: true,
      isPublished: true,
      publishedAt: new Date('2024-01-11T17:00:00Z'), // Published Thursday 5PM
    },
  })

  // Add all meals to the weekly menu
  console.log('🍽️ Adding meals to weekly menu...')
  await Promise.all(
    meals.map((meal) =>
      prisma.weeklyMenuItem.create({
        data: {
          weeklyMenuId: weeklyMenu.id,
          mealId: meal.id,
          isAvailable: true,
          inventoryLimit: Math.floor(meal.inventory * 0.8), // 80% of total inventory
        },
      })
    )
  )

  // Create a test order
  console.log('📦 Creating test order...')
  const orderNumber = 'FB24011500001'
  
  const testOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId: testUser.id,
      status: OrderStatus.CONFIRMED,
      orderType: 'ONE_TIME',
      totalAmount: 54.97,
      deliveryFee: 5.99,
      tax: 7.79,
      finalAmount: 68.75,
      addressId: testAddress.id,
      deliveryDate: new Date('2024-01-21T17:30:00Z'), // Sunday delivery
      deliveryWindow: '5:30-10:00 PM',
      deliveryNotes: 'Please leave at the front door if no answer',
      needsInsulatedBag: true,
      specialInstructions: 'First order - please call if any issues',
    },
  })

  // Create order items
  console.log('🛒 Creating order items...')
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        mealId: meals[0].id, // Teriyaki Chicken Bowl
        quantity: 2,
        unitPrice: 17.99,
        totalPrice: 35.98,
        mealName: meals[0].name,
        mealNameZh: meals[0].nameZh,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        mealId: meals[6].id, // Honey Glazed Salmon
        quantity: 1,
        unitPrice: 22.99,
        totalPrice: 22.99,
        mealName: meals[6].name,
        mealNameZh: meals[6].nameZh,
      },
    }),
  ])

  // Create payment record
  console.log('💳 Creating payment record...')
  await prisma.payment.create({
    data: {
      orderId: testOrder.id,
      amount: 68.75,
      currency: 'CAD',
      status: PaymentStatus.PAID,
      paymentMethod: 'card',
      stripePaymentIntentId: 'pi_test_1234567890',
      stripeClientSecret: 'pi_test_1234567890_secret',
      metadata: {
        cardLast4: '4242',
        cardBrand: 'visa',
        receiptEmail: testUser.email,
      },
    },
  })

  console.log('✅ Created test order:', testOrder.orderNumber)

  console.log('🎉 Database seeding completed successfully!')
  
  // Print summary
  console.log('\n📊 Seed Summary:')
  console.log('- Users: 2 (1 admin, 1 customer)')
  console.log('- Delivery Zones: 4 (Vancouver, Richmond, Burnaby, Surrey)')
  console.log('- Meals: 8 (2 per category)')
  console.log('- Weekly Menu: 1 (active and published)')
  console.log('- Test Order: 1 (confirmed with payment)')
  console.log('\n🔐 Test Credentials:')
  console.log('- Admin: admin@fitbox.ca / admin123')
  console.log('- Customer: customer@fitbox.ca / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })