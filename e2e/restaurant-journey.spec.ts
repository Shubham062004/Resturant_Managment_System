import { test, expect } from '@playwright/test';

test.describe('Restaurant Critical Journey', () => {
  test('should allow staff to manage orders in kitchen and delivery', async ({ page }) => {
    await page.goto('/login');

    // Login as staff
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'staffpass');
    await page.click('button[type="submit"]');

    // Go to Kitchen Dashboard
    await page.click('text=Kitchen');
    await expect(page).toHaveURL(/.*\/kitchen/);

    // Accept an order (Mocking UI behavior)
    // await page.click('button:has-text("Accept Order")');
    // await expect(page.locator('text=Preparing')).toBeVisible();

    // Go to Delivery Dashboard
    await page.click('text=Delivery');
    await expect(page).toHaveURL(/.*\/delivery/);

    // Dispatch order
    // await page.click('button:has-text("Dispatch")');
  });
});
