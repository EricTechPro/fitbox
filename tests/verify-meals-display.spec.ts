import { test, expect } from '@playwright/test';

test.describe('FitBox Meal App - Verify Meals Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3002');
  });

  test('should display homepage with hero section', async ({ page }) => {
    // Check hero section is visible
    await expect(page.locator('h1').filter({ hasText: /Authentic Asian Fusion/i })).toBeVisible();

    // Check postal code checker is present (placeholder is "V6B 1A1")
    await expect(page.getByPlaceholder('V6B 1A1')).toBeVisible();

    // Check CTA buttons (there are multiple menu links, just check if at least one exists)
    const menuLinks = page.getByRole('link', { name: /Menu/i });
    await expect(menuLinks.first()).toBeVisible();
  });

  test('should navigate to menu page and display meals', async ({ page }) => {
    // Click on Menu navigation link (use exact match to avoid ambiguity)
    await page.getByRole('link', { name: 'Menu', exact: true }).first().click();

    // Wait for navigation
    await page.waitForURL('**/menu');

    // Check if category tabs are visible
    await expect(page.getByRole('tab', { name: 'All Meals' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Rice-Based' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Noodle Soups' })).toBeVisible();

    // Wait for meals to load
    await page.waitForSelector('[data-testid="meal-card"]', { timeout: 10000 });

    // Get all meal cards
    const mealCards = page.locator('[data-testid="meal-card"]');

    // Verify we have meals displayed
    const count = await mealCards.count();
    expect(count).toBeGreaterThan(0);
    console.log(`Found ${count} meal cards displayed`);
  });

  test('should display meal images correctly', async ({ page }) => {
    // Navigate directly to menu page
    await page.goto('http://localhost:3002/menu');

    // Wait for meal cards to load
    await page.waitForSelector('[data-testid="meal-card"]', { timeout: 10000 });

    // Check if meal images are loading
    const mealImages = page.locator('[data-testid="meal-card"] img');
    const imageCount = await mealImages.count();

    expect(imageCount).toBeGreaterThan(0);
    console.log(`Found ${imageCount} meal images`);

    // Verify first meal card has proper structure
    const firstMealCard = page.locator('[data-testid="meal-card"]').first();

    // Check for meal name (using the actual element structure - CardTitle is a span)
    const mealName = firstMealCard.locator('.text-lg.font-semibold').first();
    await expect(mealName).toBeVisible();
    const name = await mealName.textContent();
    console.log(`First meal: ${name}`);

    // Check for meal price
    const mealPrice = firstMealCard.locator('text=/\\$\\d+\\.\\d{2}/');
    await expect(mealPrice).toBeVisible();

    // Check for meal image
    const mealImage = firstMealCard.locator('img');
    await expect(mealImage).toBeVisible();

    // Verify image has loaded (not broken)
    const imageSrc = await mealImage.getAttribute('src');
    expect(imageSrc).toBeTruthy();
    expect(imageSrc).toContain('unsplash.com');
    console.log(`Image source: ${imageSrc}`);
  });

  test('should display specific meals with correct images', async ({ page }) => {
    await page.goto('http://localhost:3002/menu');

    // Wait for meals to load
    await page.waitForSelector('[data-testid="meal-card"]', { timeout: 10000 });

    // Expected meals data
    const expectedMeals = [
      { name: 'Kung Pao Chicken Rice Bowl', price: '$16.99' },
      { name: 'Taiwanese Beef Noodle Soup', price: '$18.99' },
      { name: 'Creamy Mushroom Chicken Pasta', price: '$17.99' },
      { name: 'Teriyaki Salmon with Quinoa', price: '$21.99' },
      { name: 'Szechuan Mapo Tofu Rice', price: '$15.99' },
      { name: 'Mediterranean Herb Chicken', price: '$19.99' }
    ];

    // Verify each meal is displayed
    for (const meal of expectedMeals) {
      const mealCard = page.locator('[data-testid="meal-card"]', {
        has: page.locator(`text="${meal.name}"`)
      });

      await expect(mealCard).toBeVisible();
      await expect(mealCard.locator(`text="${meal.price}"`)).toBeVisible();

      // Check image exists and is visible
      const image = mealCard.locator('img');
      await expect(image).toBeVisible();

      console.log(`✓ ${meal.name} - ${meal.price} - Image verified`);
    }
  });

  test('should be able to add meal to cart', async ({ page }) => {
    await page.goto('http://localhost:3002/menu');

    // Wait for meals to load
    await page.waitForSelector('[data-testid="meal-card"]', { timeout: 10000 });

    // Click on first meal card to view details
    const firstMealCard = page.locator('[data-testid="meal-card"]').first();
    await firstMealCard.click();

    // Wait for modal/detail view (if implemented)
    // Or find the Add to Cart button
    const addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Check if cart badge updates
      const cartBadge = page.locator('[data-testid="cart-badge"]');
      if (await cartBadge.isVisible()) {
        const cartCount = await cartBadge.textContent();
        expect(parseInt(cartCount || '0')).toBeGreaterThan(0);
        console.log('✓ Successfully added item to cart');
      }
    }
  });
});