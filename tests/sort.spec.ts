/**
 * sort.spec.ts
 * Tests sorting items:
 * - By name (A-Z)
 * - By price (High to Low)
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;

// Check if login credentials exist
if (!username || !password) {
  throw new Error('Username or password not defined in .env file');
}

test.describe('Sort Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  // Hook before each test to login
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    // Navigate to the main page and login
    await loginPage.goto();
    await loginPage.login(username, password);

    // Verify the inventory page is loaded
    await inventoryPage.expectInventoryPageLoaded();
  });

  test('should sort items by Name (A to Z)', async () => {
    await inventoryPage.sortItems('az');
    const itemNames = await inventoryPage.getItemNames();

    // Verify that names are sorted ascending
    const sortedItemNames = [...itemNames].sort();
    expect(itemNames).toEqual(sortedItemNames);
  });

  test('should sort items by Name (Z to A)', async () => {
    await inventoryPage.sortItems('za');
    const itemNames = await inventoryPage.getItemNames();

    // Verify that names are sorted descending
    const sortedItemNames = [...itemNames].sort().reverse();
    expect(itemNames).toEqual(sortedItemNames);
  });

  test('should sort items by Price (low to high)', async () => {
    await inventoryPage.sortItems('lohi');
    const itemPrices = await inventoryPage.getItemPrices();

    // Verify that prices are sorted ascending
    const sortedItemPrices = [...itemPrices].sort((a, b) => a - b);
    expect(itemPrices).toEqual(sortedItemPrices);
  });

  test('should sort items by Price (high to low)', async () => {
    await inventoryPage.sortItems('hilo');
    const itemPrices = await inventoryPage.getItemPrices();

    // Verify that prices are sorted descending
    const sortedItemPrices = [...itemPrices].sort((a, b) => b - a);
    expect(itemPrices).toEqual(sortedItemPrices);
  });
});
