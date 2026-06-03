import { test, expect } from '@playwright/test';

test.describe('Customer Critical Journey', () => {
  test('should allow a customer to login, add to cart, and checkout', async ({ page }) => {
    await page.goto('/');

    // Go to login page
    await page.click('text=Log In');
    await expect(page).toHaveURL(/.*\/login/);

    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to home or customer dashboard
    await expect(page).toHaveURL(/.*\//);

    // Browse Menu
    await page.click('text=Menu');
    await expect(page).toHaveURL(/.*\/menu/);

    // Add To Cart (Assuming there's a button with 'Add' text)
    await page.click('button:has-text("Add"):first-child');

    // Go to Cart
    await page.click('a[href="/cart"]');
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator('text=Checkout')).toBeVisible();

    // Checkout
    await page.click('text=Checkout');
    await expect(page).toHaveURL(/.*\/checkout/);

    // Complete Checkout
    await page.click('text=Place Order');
    
    // Track Order
    await expect(page).toHaveURL(/.*\/orders\//);
    await expect(page.locator('text=Order Placed')).toBeVisible();
  });
});
