import { type Locator, type Page, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly inventoryList: Locator;
  readonly sortDropdown: Locator;
  readonly addToCartButton: (itemName: string) => Locator;
  readonly removeFromCartButton: (itemName: string) => Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly inventoryItemName: Locator;
  readonly inventoryItemPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryList = page.locator('.inventory_list');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    // Function to locate add to cart button for a specific item
    this.addToCartButton = (itemName: string) => 
        page.locator(`.inventory_item:has-text("${itemName}") button[data-test^="add-to-cart-"]`);
    // Function to locate remove from cart button for a specific item
    this.removeFromCartButton = (itemName: string) => 
        page.locator(`.inventory_item:has-text("${itemName}") button[data-test^="remove-"]`);
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.inventoryItemName = page.locator('.inventory_item_name');
    this.inventoryItemPrice = page.locator('.inventory_item_price');
  }

  async addItemToCart(itemName: string) {
    await this.addToCartButton(itemName).click();
  }

  async removeItemFromCart(itemName: string) {
    await this.removeFromCartButton(itemName).click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (await this.shoppingCartBadge.isVisible()) {
      const text = await this.shoppingCartBadge.textContent();
      return text ? parseInt(text, 10) : 0;
    }
    return 0;
  }

  async goToCart() {
    await this.shoppingCartLink.click();
  }

async sortItems(optionValue: 'az' | 'za' | 'lohi' | 'hilo') {
  console.log('Waiting for sort dropdown...');

  // تأكد من أن العنصر جاهز ومرئي
  await this.page.waitForSelector('[data-test="product-sort-container"]', { state: 'visible', timeout: 60000 });

  console.log('Sort dropdown is visible, selecting option...');

  // اختر الخيار المطلوب من القائمة
  await this.sortDropdown.selectOption(optionValue);

  console.log(`Selected option: ${optionValue}`);

  // تحقق أن الخيار تم تطبيقه بنجاح
  await expect(this.sortDropdown).toHaveValue(optionValue);
}



  async getItemNames(): Promise<string[]> {
    return this.inventoryItemName.allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItemPrice.allTextContents();
    // Remove '$' and convert to number
    return priceTexts.map(price => parseFloat(price.replace('$', '')));
  }

  async expectInventoryPageLoaded() {
    // Check if the inventory list is visible as a sign the page loaded
    await expect(this.inventoryList).toBeVisible();
    // Also check if the URL is correct
    await expect(this.page).toHaveURL(/.*inventory.html/);
  }
}

