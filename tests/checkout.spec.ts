/**
 * checkout.spec.ts
 * Tests full checkout flow:
 * - Adding items, filling form, completing order
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/checkoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/checkoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/checkoutCompletePage';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;
const itemToCheckout = 'Sauce Labs Onesie'; // Item to add for checkout test

// Ensure credentials are loaded
if (!username || !password) {
  throw new Error('Username or password not defined in .env file');
}

// Parameterized data for checkout information
const checkoutInfo = [
  { firstName: 'Test', lastName: 'User', postalCode: '12345' },
  // Add more data sets if needed for parameterization
];

test.describe('Checkout Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutStepOnePage: CheckoutStepOnePage;
  let checkoutStepTwoPage: CheckoutStepTwoPage;
  let checkoutCompletePage: CheckoutCompletePage;

  // Hook to login and add an item before each test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutStepOnePage = new CheckoutStepOnePage(page);
    checkoutStepTwoPage = new CheckoutStepTwoPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.expectInventoryPageLoaded();

    // Add item to cart
    await inventoryPage.addItemToCart(itemToCheckout);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    // Go to cart
    await inventoryPage.goToCart();
    await cartPage.expectCartPageLoaded();
    await cartPage.expectItemToBeInCart(itemToCheckout);
  });

  // Loop through parameterized data
  for (const info of checkoutInfo) {
    test(`should complete checkout process with data: ${info.firstName} ${info.lastName}`, async ({ page }) => {
      // Start checkout from Cart Page
      await cartPage.goToCheckout();
      await checkoutStepOnePage.expectCheckoutStepOnePageLoaded();

      // Fill checkout information (Step One)
      await checkoutStepOnePage.fillInformation(info.firstName, info.lastName, info.postalCode);
      await checkoutStepOnePage.continueCheckout();
      await checkoutStepTwoPage.expectCheckoutStepTwoPageLoaded();

      // Verify item is in the summary (Step Two)
      await checkoutStepTwoPage.expectItemInSummary(itemToCheckout);
      // Optional: Verify total price if needed
      // const totalPrice = await checkoutStepTwoPage.getTotalPrice();
      // expect(totalPrice).toBeGreaterThan(0); 

      // Finish checkout
      await checkoutStepTwoPage.finishCheckout();
      await checkoutCompletePage.expectCheckoutCompletePageLoaded();

      // Verify completion message
      const headerText = await checkoutCompletePage.getCompleteHeaderText();
      expect(headerText).toBe('Thank you for your order!');

      // Go back to inventory page
      await checkoutCompletePage.goBackHome();
      await inventoryPage.expectInventoryPageLoaded();
      // Verify cart is empty after successful checkout
      expect(await inventoryPage.getCartBadgeCount()).toBe(0);
    });
  }

  test('should show error message if checkout information is missing', async ({ page }) => {
      // Start checkout
      await cartPage.goToCheckout();
      await checkoutStepOnePage.expectCheckoutStepOnePageLoaded();

      // Attempt to continue without filling information
      await checkoutStepOnePage.continueCheckout();

      // Verify error message is displayed
      const errorMessage = await checkoutStepOnePage.getErrorMessage();
      expect(errorMessage).toContain('Error: First Name is required'); // Example error message

      // Verify still on the same page
      await checkoutStepOnePage.expectCheckoutStepOnePageLoaded();
  });

});

