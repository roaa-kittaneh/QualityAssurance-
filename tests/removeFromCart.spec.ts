import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage'; // Import CartPage
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;
const itemToRemove = 'Sauce Labs Bolt T-Shirt'; // Item to add and then remove

// Ensure credentials are loaded
if (!username || !password) {
  throw new Error('Username or password not defined in .env file');
}

test.describe('Remove From Cart Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  // Hook to login and add an item before each test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page); // Initialize CartPage

    // Login
    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.expectInventoryPageLoaded();

    // Add item to cart
    await inventoryPage.addItemToCart(itemToRemove);
    // Verify item was added (badge count = 1)
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  test('should remove item from cart via Inventory Page', async ({ page }) => {
    // Remove item from inventory page
    await inventoryPage.removeItemFromCart(itemToRemove);

    // Verify cart badge count is 0
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);

    // Verify the button text changed back to 'Add to cart'
    await expect(inventoryPage.addToCartButton(itemToRemove)).toBeVisible();
    await expect(inventoryPage.removeFromCartButton(itemToRemove)).not.toBeVisible();

    // Optional: Go to cart and verify it's empty
    await inventoryPage.goToCart();
    await cartPage.expectCartPageLoaded();
    expect(await cartPage.getCartItemCount()).toBe(0);
  });

  test('should remove item from cart via Cart Page', async ({ page }) => {
    // Go to the cart page
    await inventoryPage.goToCart();
    await cartPage.expectCartPageLoaded();

    // Verify item is initially in the cart page
    await cartPage.expectItemToBeInCart(itemToRemove);
    expect(await cartPage.getCartItemCount()).toBe(1);

    // Remove item from cart page
    await cartPage.removeItem(itemToRemove);

    // Verify item is removed from the cart page
    await cartPage.expectItemToBeRemovedFromCart(itemToRemove);
    expect(await cartPage.getCartItemCount()).toBe(0);

    // Optional: Go back to inventory and verify badge/button state
    await cartPage.continueShopping();
    await inventoryPage.expectInventoryPageLoaded();
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);
    await expect(inventoryPage.addToCartButton(itemToRemove)).toBeVisible();
  });
});

