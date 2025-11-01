#!/usr/bin/env node

/**
 * FitBox Cart API Testing Script
 * Tests all cart endpoints with authentication
 */

const API_BASE = 'http://localhost:3000'

// Test credentials from seed data
const TEST_USER = {
  email: 'customer@fitbox.ca',
  password: 'customer123'
}

// Test meal IDs (we'll try to get these from the actual data)
let TEST_MEAL_ID = null
let session = null

/**
 * HTTP request helper
 */
async function makeRequest(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  if (session?.cookies) {
    defaultHeaders['Cookie'] = session.cookies
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    // Capture cookies from response
    if (response.headers.get('set-cookie')) {
      session = session || {}
      session.cookies = response.headers.get('set-cookie')
    }

    const data = await response.text()
    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch {
      jsonData = { rawResponse: data }
    }

    return {
      status: response.status,
      ok: response.ok,
      data: jsonData,
      headers: Object.fromEntries(response.headers.entries())
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Test authentication
 */
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...')

  // Try to get CSRF token first
  const csrfResponse = await makeRequest(`${API_BASE}/api/auth/csrf`)
  console.log('CSRF Token Response:', {
    status: csrfResponse.status,
    ok: csrfResponse.ok,
    data: csrfResponse.data
  })

  // Check current session
  const sessionResponse = await makeRequest(`${API_BASE}/api/auth/session`)
  console.log('Current Session:', {
    status: sessionResponse.status,
    ok: sessionResponse.ok,
    data: sessionResponse.data
  })

  if (sessionResponse.data?.user) {
    console.log('✅ Already authenticated as:', sessionResponse.data.user.email)
    return true
  }

  // Try to sign in (this depends on your auth implementation)
  console.log('⚠️ No active session found. Manual authentication may be required.')
  console.log('Please visit http://localhost:3000 and sign in with:', TEST_USER)

  return false
}

/**
 * Get available meals for testing
 */
async function getTestMeals() {
  console.log('\n📋 Getting available meals...')

  const response = await makeRequest(`${API_BASE}/api/menus/current`)
  console.log('Current Menu API Response:', {
    status: response.status,
    ok: response.ok,
    dataType: typeof response.data,
    hasData: !!response.data
  })

  if (response.ok && response.data?.data?.meals?.length > 0) {
    TEST_MEAL_ID = response.data.data.meals[0].id
    console.log('✅ Found test meal ID:', TEST_MEAL_ID)
    console.log('Available meals:', response.data.data.meals.map(m => ({ id: m.id, name: m.name, price: m.price })))
    return response.data.data.meals
  } else {
    console.log('⚠️ Could not fetch meals. Using fallback meal ID.')
    console.log('Response data:', response.data)
    // Try common UUIDs or use a fallback
    TEST_MEAL_ID = 'test-meal-1'
    return []
  }
}

/**
 * Test GET /api/cart - Retrieve current cart
 */
async function testGetCart() {
  console.log('\n📦 Testing GET /api/cart...')

  const response = await makeRequest(`${API_BASE}/api/cart`)
  console.log('GET Cart Response:', {
    status: response.status,
    ok: response.ok,
    data: response.data,
    hasItems: response.data?.data?.items?.length > 0
  })

  return response
}

/**
 * Test POST /api/cart - Add item to cart
 */
async function testAddToCart(mealId, quantity = 2) {
  console.log(`\n➕ Testing POST /api/cart (meal: ${mealId}, qty: ${quantity})...`)

  const response = await makeRequest(`${API_BASE}/api/cart`, {
    method: 'POST',
    body: JSON.stringify({
      mealId,
      quantity
    })
  })

  console.log('POST Cart Response:', {
    status: response.status,
    ok: response.ok,
    data: response.data
  })

  return response
}

/**
 * Test PUT /api/cart - Update cart item quantity
 */
async function testUpdateCart(mealId, quantity = 3) {
  console.log(`\n✏️ Testing PUT /api/cart (meal: ${mealId}, qty: ${quantity})...`)

  const response = await makeRequest(`${API_BASE}/api/cart`, {
    method: 'PUT',
    body: JSON.stringify({
      mealId,
      quantity
    })
  })

  console.log('PUT Cart Response:', {
    status: response.status,
    ok: response.ok,
    data: response.data
  })

  return response
}

/**
 * Test DELETE /api/cart/[mealId] - Remove specific item
 */
async function testRemoveCartItem(mealId) {
  console.log(`\n🗑️ Testing DELETE /api/cart/${mealId}...`)

  const response = await makeRequest(`${API_BASE}/api/cart/${mealId}`, {
    method: 'DELETE'
  })

  console.log('DELETE Cart Item Response:', {
    status: response.status,
    ok: response.ok,
    data: response.data
  })

  return response
}

/**
 * Test DELETE /api/cart - Clear entire cart
 */
async function testClearCart() {
  console.log('\n🧹 Testing DELETE /api/cart (clear entire cart)...')

  const response = await makeRequest(`${API_BASE}/api/cart`, {
    method: 'DELETE'
  })

  console.log('DELETE Cart Response:', {
    status: response.status,
    ok: response.ok,
    data: response.data
  })

  return response
}

/**
 * Test error conditions
 */
async function testErrorConditions() {
  console.log('\n🚨 Testing Error Conditions...')

  // Test invalid meal ID
  console.log('Testing invalid meal ID...')
  const invalidMealResponse = await testAddToCart('invalid-meal-id')

  // Test invalid quantity
  console.log('Testing invalid quantity...')
  const invalidQuantityResponse = await makeRequest(`${API_BASE}/api/cart`, {
    method: 'POST',
    body: JSON.stringify({
      mealId: TEST_MEAL_ID,
      quantity: -1
    })
  })
  console.log('Invalid Quantity Response:', {
    status: invalidQuantityResponse.status,
    data: invalidQuantityResponse.data
  })

  // Test missing data
  console.log('Testing missing data...')
  const missingDataResponse = await makeRequest(`${API_BASE}/api/cart`, {
    method: 'POST',
    body: JSON.stringify({})
  })
  console.log('Missing Data Response:', {
    status: missingDataResponse.status,
    data: missingDataResponse.data
  })
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting FitBox Cart API Tests')
  console.log('=====================================')

  try {
    // 1. Test authentication
    const isAuthenticated = await testAuthentication()
    if (!isAuthenticated) {
      console.log('\n⚠️ Authentication required. Please sign in manually and run the test again.')
      // Continue with tests anyway to see what we get
    }

    // 2. Get test meals
    await getTestMeals()

    // 3. Test initial cart state (should be empty)
    await testGetCart()

    // 4. Test adding item to cart
    if (TEST_MEAL_ID) {
      await testAddToCart(TEST_MEAL_ID, 2)

      // 5. Test cart after adding item
      await testGetCart()

      // 6. Test updating cart item quantity
      await testUpdateCart(TEST_MEAL_ID, 3)

      // 7. Test cart after updating
      await testGetCart()

      // 8. Test removing specific item
      await testRemoveCartItem(TEST_MEAL_ID)

      // 9. Test cart after removing item
      await testGetCart()

      // 10. Add item again for clear test
      await testAddToCart(TEST_MEAL_ID, 1)
      await testGetCart()
    }

    // 11. Test clearing entire cart
    await testClearCart()

    // 12. Test final cart state (should be empty)
    await testGetCart()

    // 13. Test error conditions
    await testErrorConditions()

    console.log('\n✅ Cart API testing completed!')

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message)
  }
}

// Run the tests
runTests()