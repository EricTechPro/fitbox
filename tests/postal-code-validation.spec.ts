import { test, expect } from '@playwright/test';

test.describe('Postal Code Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003');
  });

  test('should show free delivery for V4N 6L4 (North Surrey)', async ({ page }) => {
    // Find the postal code input field
    const postalCodeInput = page.getByPlaceholder('V6B 1A1');
    await expect(postalCodeInput).toBeVisible();

    // Enter the postal code V4N 6L4
    await postalCodeInput.fill('V4N 6L4');

    // Click the Check button
    const checkButton = page.getByRole('button', { name: /Check/i });
    await checkButton.click();

    // Wait for validation result
    await page.waitForTimeout(1000);

    // Should show free delivery message
    const freeDeliveryMessage = page.locator('text=/free delivery/i');
    await expect(freeDeliveryMessage).toBeVisible();

    console.log('✓ V4N 6L4 correctly shows free delivery');
  });

  test('should show free delivery for V7G 1A1 (North Vancouver)', async ({ page }) => {
    const postalCodeInput = page.getByPlaceholder('V6B 1A1');
    await postalCodeInput.fill('V7G 1A1');

    const checkButton = page.getByRole('button', { name: /Check/i });
    await checkButton.click();

    await page.waitForTimeout(1000);

    const freeDeliveryMessage = page.locator('text=/free delivery/i');
    await expect(freeDeliveryMessage).toBeVisible();

    console.log('✓ V7G 1A1 correctly shows free delivery');
  });

  test('should show FREE delivery for V3L 1A1 (New Westminster)', async ({ page }) => {
    const postalCodeInput = page.getByPlaceholder('V6B 1A1');
    await postalCodeInput.fill('V3L 1A1');

    const checkButton = page.getByRole('button', { name: /Check/i });
    await checkButton.click();

    await page.waitForTimeout(1000);

    // Should now show FREE delivery
    const freeDeliveryMessage = page.locator('text=/free delivery/i');
    await expect(freeDeliveryMessage).toBeVisible();

    console.log('✓ V3L 1A1 now correctly shows FREE delivery');
  });

  test('should show invalid message for non-served areas', async ({ page }) => {
    const postalCodeInput = page.getByPlaceholder('V6B 1A1');
    await postalCodeInput.fill('T2N 1A1'); // Calgary postal code

    const checkButton = page.getByRole('button', { name: /Check/i });
    await checkButton.click();

    await page.waitForTimeout(1000);

    // Should show error message
    const errorMessage = page.locator('text=/sorry.*only deliver.*greater vancouver/i');
    await expect(errorMessage).toBeVisible();

    console.log('✓ T2N 1A1 correctly shows out of area message');
  });
});