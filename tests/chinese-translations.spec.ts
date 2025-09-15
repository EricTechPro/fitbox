import { test, expect } from '@playwright/test';

test.describe('Chinese Translations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003');
  });

  test('should show Chinese allergen translations in cart', async ({ page }) => {
    // Switch to Chinese mode
    const languageToggle = page.getByRole('button', { name: /language/i });
    await languageToggle.click();

    // Navigate to menu page
    await page.goto('http://localhost:3003/menu');

    // Add a meal to cart that has allergens
    const mealCards = page.locator('[data-testid="meal-card"]');
    await expect(mealCards.first()).toBeVisible();

    // Click on the first meal to add it to cart
    const addToCartButton = mealCards.first().getByRole('button', { name: /加入购物车/i });
    await addToCartButton.click();

    // Open cart
    const cartButton = page.getByRole('button', { name: /shopping cart/i });
    await cartButton.click();

    // Wait for cart to open
    await page.waitForTimeout(1000);

    // Check for Chinese allergen translations
    const chineseAllergens = [
      '麸质', // gluten
      '大豆', // soy
      '乳制品', // dairy
      '鱼类', // fish
      '坚果', // nuts
      '鸡蛋'  // egg
    ];

    // Look for any Chinese allergen translations in the cart
    let foundChineseAllergen = false;
    for (const allergen of chineseAllergens) {
      try {
        const allergenElement = page.locator(`text="${allergen}"`);
        if (await allergenElement.isVisible()) {
          foundChineseAllergen = true;
          console.log(`✓ Found Chinese allergen translation: ${allergen}`);
          break;
        }
      } catch {
        // Continue checking other allergens
      }
    }

    // Verify at least one Chinese allergen translation is found
    expect(foundChineseAllergen).toBe(true);

    // Check that cart title is in Chinese
    const cartTitle = page.locator('text="购物车"');
    await expect(cartTitle).toBeVisible();
    console.log('✓ Cart title correctly shows in Chinese: 购物车');

    // Check that "每份" (each) appears in Chinese
    const eachText = page.locator('text="每份"');
    await expect(eachText).toBeVisible();
    console.log('✓ "Each" correctly shows in Chinese: 每份');
  });

  test('should show Chinese allergen translations on meal cards', async ({ page }) => {
    // Switch to Chinese mode
    const languageToggle = page.getByRole('button', { name: /language/i });
    await languageToggle.click();

    // Navigate to menu page
    await page.goto('http://localhost:3003/menu');

    // Wait for meal cards to load
    const mealCards = page.locator('[data-testid="meal-card"]');
    await expect(mealCards.first()).toBeVisible();

    // Check for Chinese allergen translations on meal cards
    const chineseAllergens = [
      '麸质', // gluten
      '大豆', // soy
      '乳制品', // dairy
      '鱼类', // fish
      '坚果', // nuts
      '鸡蛋'  // egg
    ];

    let foundChineseAllergen = false;
    for (const allergen of chineseAllergens) {
      try {
        const allergenBadge = page.locator(`[data-testid="meal-card"] .text-xs:has-text("${allergen}")`);
        if (await allergenBadge.isVisible()) {
          foundChineseAllergen = true;
          console.log(`✓ Found Chinese allergen translation on meal card: ${allergen}`);
          break;
        }
      } catch {
        // Continue checking other allergens
      }
    }

    expect(foundChineseAllergen).toBe(true);
  });

  test('should show Chinese meal names and descriptions', async ({ page }) => {
    // Switch to Chinese mode
    const languageToggle = page.getByRole('button', { name: /language/i });
    await languageToggle.click();

    // Navigate to menu page
    await page.goto('http://localhost:3003/menu');

    // Check for Chinese meal names
    const chineseMealNames = [
      '宫保鸡丁盖饭',      // Kung Pao Chicken Rice Bowl
      '台湾牛肉面',        // Taiwanese Beef Noodle Soup
      '奶油蘑菇鸡肉意面',  // Creamy Mushroom Chicken Pasta
      '照烧三文鱼配藜麦',  // Teriyaki Salmon with Quinoa
      '四川麻婆豆腐盖饭',  // Szechuan Mapo Tofu Rice
      '地中海香草鸡肉'     // Mediterranean Herb Chicken
    ];

    let foundChineseName = false;
    for (const name of chineseMealNames) {
      try {
        const mealNameElement = page.locator(`text="${name}"`);
        if (await mealNameElement.isVisible()) {
          foundChineseName = true;
          console.log(`✓ Found Chinese meal name: ${name}`);
          break;
        }
      } catch {
        // Continue checking other names
      }
    }

    expect(foundChineseName).toBe(true);
  });
});