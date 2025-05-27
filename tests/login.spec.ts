/**
 * login.spec.ts
 * Tests login functionality:
 * - Valid and invalid logins
 * - Error messages
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
// Ensure the path is correct relative to the execution directory (project root)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;
const baseUrl = process.env.BASE_URL; // Store base URL
const lockedOutUser = 'locked_out_user';
const wrongPassword = 'wrong_password';

// Ensure BASE_URL is defined
if (!baseUrl) {
  throw new Error('BASE_URL environment variable is not set');
}

test.describe('Login Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Ensure environment variables are loaded
    expect(username, 'SAUCE_USERNAME environment variable is not set').toBeDefined();
    expect(password, 'SAUCE_PASSWORD environment variable is not set').toBeDefined();

    await loginPage.login(username!, password!);
    // Verify navigation to the inventory page
    await inventoryPage.expectInventoryPageLoaded();
  });

  test('should show error message with invalid password', async ({ page }) => {
    expect(username).toBeDefined();
    await loginPage.login(username!, wrongPassword);
    // Verify error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Username and password do not match any user in this service');
    // Verify URL hasn't changed
    await expect(page).toHaveURL(baseUrl); // Use stored baseUrl
  });

  test('should show error message for locked out user', async ({ page }) => {
    expect(password).toBeDefined();
    await loginPage.login(lockedOutUser, password!);
    // Verify error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Sorry, this user has been locked out.');
     // Verify URL hasn't changed
    await expect(page).toHaveURL(baseUrl); // Use stored baseUrl
  });

   test('should show error message for missing password', async ({ page }) => {
    expect(username).toBeDefined();
    // Attempt login without providing a password in the input field
    await loginPage.usernameInput.fill(username!);
    await loginPage.loginButton.click(); // Click login without filling password
    // Verify error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Password is required');
     // Verify URL hasn't changed
    await expect(page).toHaveURL(baseUrl); // Use stored baseUrl
  });

   test('should show error message for missing username', async ({ page }) => {
    expect(password).toBeDefined();
    // Attempt login without providing a username
    await loginPage.passwordInput.fill(password!);
    await loginPage.loginButton.click(); // Click login without filling username
    // Verify error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Username is required');
     // Verify URL hasn't changed
    await expect(page).toHaveURL(baseUrl); // Use stored baseUrl
  });

});

