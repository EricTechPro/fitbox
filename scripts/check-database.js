const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Check for meals
    const mealCount = await prisma.meal.count()
    console.log(`📊 Found ${mealCount} meals in database`)

    // Check for weekly menus
    const menuCount = await prisma.weeklyMenu.count()
    console.log(`📅 Found ${menuCount} weekly menus in database`)

    // Check for bundle prices
    const bundleCount = await prisma.bundlePrice.count()
    console.log(`💰 Found ${bundleCount} bundle prices in database`)

    if (mealCount > 0) {
      console.log('\n🍽️ Sample meals:')
      const meals = await prisma.meal.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          nameZh: true,
          category: true,
          price: true,
          isActive: true,
        },
      })
      console.table(meals)
    }

    await prisma.$disconnect()
    console.log('✅ Database check complete')
  } catch (error) {
    console.error('❌ Database error:', error.message)
    process.exit(1)
  }
}

checkDatabase()
