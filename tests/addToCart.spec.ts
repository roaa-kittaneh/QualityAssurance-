/**
 * addToCart.spec.ts
 * Tests adding items to cart:
 * - Single and multiple items
 * - Cart badge count
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/sortPage';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;

// Ensure credentials are loaded
if (!username || !password) {
  throw new Error('Username or password not defined in .env file');
}

test.describe('Add to Cart Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  // Hook to login before each test in this describe block
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.expectInventoryPageLoaded(); // Ensure login was successful
  });

  test('should add a single item to the cart', async ({ page }) => {
    const itemName = 'Sauce Labs Backpack'; // Example item
    const initialCartCount = await inventoryPage.getCartBadgeCount();
    expect(initialCartCount).toBe(0); // Assuming cart is empty initially

    await inventoryPage.addItemToCart(itemName);

    // Verify cart badge count increased by 1
    const newCartCount = await inventoryPage.getCartBadgeCount();
    expect(newCartCount).toBe(1);

    // Optional: Verify the button text changed to 'Remove'
    await expect(inventoryPage.removeFromCartButton(itemName)).toBeVisible();
    await expect(inventoryPage.addToCartButton(itemName)).not.toBeVisible();
  });

  test('should add multiple items to the cart', async ({ page }) => {
    const item1 = 'Sauce Labs Backpack';
    const item2 = 'Sauce Labs Bike Light';
    const initialCartCount = await inventoryPage.getCartBadgeCount();
    expect(initialCartCount).toBe(0);

    await inventoryPage.addItemToCart(item1);
    await inventoryPage.addItemToCart(item2);

    // Verify cart badge count increased by 2
    const newCartCount = await inventoryPage.getCartBadgeCount();
    expect(newCartCount).toBe(2);

    // Optional: Verify button texts changed
    await expect(inventoryPage.removeFromCartButton(item1)).toBeVisible();
    await expect(inventoryPage.removeFromCartButton(item2)).toBeVisible();
  });

  // Test adding an item, navigating away, and checking if it persists (optional but good)
  test('should keep items in cart after navigating away and back', async ({ page }) => {
    const itemName = 'Sauce Labs Fleece Jacket';
    await inventoryPage.addItemToCart(itemName);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    // Navigate to cart and back to inventory
    await inventoryPage.goToCart();
    // Assuming CartPage POM exists and has a method to go back or just use page.goBack()
    await page.goBack(); // Or use a specific method if available in InventoryPage/CartPage
    await inventoryPage.expectInventoryPageLoaded();

    // Verify item is still marked as added and badge count is correct
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    await expect(inventoryPage.removeFromCartButton(itemName)).toBeVisible();
  });
});

