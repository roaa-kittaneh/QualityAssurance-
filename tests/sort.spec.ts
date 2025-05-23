import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import * as dotenv from 'dotenv';
import path from 'path';

// تحميل ملف .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;

// تحقق من وجود بيانات تسجيل الدخول
if (!username || !password) {
  throw new Error('Username or password not defined in .env file');
}

test.describe('Sort Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  // Hook قبل كل اختبار لتسجيل الدخول
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    // الانتقال إلى الصفحة الرئيسية وتسجيل الدخول
    await loginPage.goto();
    await loginPage.login(username, password);

    // تحقق من أن صفحة المخزون جاهزة
    await inventoryPage.expectInventoryPageLoaded();
  });

  test('should sort items by Name (A to Z)', async () => {
    await inventoryPage.sortItems('az');
    const itemNames = await inventoryPage.getItemNames();

    // تحقق من أن الأسماء مرتبة تصاعديًا
    const sortedItemNames = [...itemNames].sort();
    expect(itemNames).toEqual(sortedItemNames);
  });

  test('should sort items by Name (Z to A)', async () => {
    await inventoryPage.sortItems('za');
    const itemNames = await inventoryPage.getItemNames();

    // تحقق من أن الأسماء مرتبة تنازليًا
    const sortedItemNames = [...itemNames].sort().reverse();
    expect(itemNames).toEqual(sortedItemNames);
  });

  test('should sort items by Price (low to high)', async () => {
    await inventoryPage.sortItems('lohi');
    const itemPrices = await inventoryPage.getItemPrices();

    // تحقق من أن الأسعار مرتبة تصاعديًا
    const sortedItemPrices = [...itemPrices].sort((a, b) => a - b);
    expect(itemPrices).toEqual(sortedItemPrices);
  });

  test('should sort items by Price (high to low)', async () => {
    await inventoryPage.sortItems('hilo');
    const itemPrices = await inventoryPage.getItemPrices();

    // تحقق من أن الأسعار مرتبة تنازليًا
    const sortedItemPrices = [...itemPrices].sort((a, b) => b - a);
    expect(itemPrices).toEqual(sortedItemPrices);
  });
});
