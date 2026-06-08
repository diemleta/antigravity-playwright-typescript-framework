/**
 * Base Page Class
 * All Page Objects extend this class to inherit common UI interaction methods.
 *
 * Design Principles:
 * - NEVER use waitForTimeout (hard sleep) — use smart waits only
 * - Log every action for debugging
 * - Screenshot on error (handled by Playwright config)
 */

import { type Page, type Locator, expect, test } from '@playwright/test';
import { Logger } from '../utils/logger';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: Logger;

  constructor(page: Page, pageName: string) {
    this.page = page;
    this.logger = new Logger(pageName);
  }

  // ───────────────────────────────────────────────
  // Navigation
  // ───────────────────────────────────────────────

  /**
   * Navigate to a URL relative to baseURL
   */
  async navigate(path: string = '/'): Promise<void> {
    await test.step(`Navigate to path "${path}"`, async () => {
      this.logger.navigation(path);
      await this.page.goto(path);
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get current page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  // ───────────────────────────────────────────────
  // Interaction Methods (Smart Waits — No Hard Sleep)
  // ───────────────────────────────────────────────

  /**
   * Click on a locator — waits for visibility automatically
   */
  async click(locator: Locator, description: string = 'element'): Promise<void> {
    await test.step(`Click on "${description}" [Locator: ${locator}]`, async () => {
      this.logger.action('click', description);
      await expect(locator).toBeVisible({ timeout: 15_000 });
      await locator.click();
    });
  }

  /**
   * Fill a text input field
   */
  async fill(locator: Locator, value: string, description: string = 'input'): Promise<void> {
    const isPassword = description.toLowerCase().includes('password') || locator.toString().toLowerCase().includes('password');
    const maskedValue = isPassword ? '********' : value;
    await test.step(`Fill "${maskedValue}" into "${description}" [Locator: ${locator}]`, async () => {
      this.logger.action(`fill "${maskedValue}"`, description);
      await expect(locator).toBeVisible({ timeout: 15_000 });
      await locator.clear();
      await locator.fill(value);
    });
  }

  /**
   * Select option from a dropdown by visible text
   */
  async selectOption(locator: Locator, value: string, description: string = 'select'): Promise<void> {
    await test.step(`Select "${value}" from "${description}" [Locator: ${locator}]`, async () => {
      this.logger.action(`select "${value}"`, description);
      await expect(locator).toBeVisible({ timeout: 15_000 });
      await locator.selectOption({ label: value });
    });
  }

  /**
   * Get text content of a locator
   */
  async getText(locator: Locator): Promise<string> {
    return await test.step(`Get text content from element [Locator: ${locator}]`, async () => {
      await expect(locator).toBeVisible({ timeout: 10_000 });
      return (await locator.textContent()) ?? '';
    });
  }

  /**
   * Check if an element is visible on page
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Wait for an element to be visible
   */
  async waitForVisible(locator: Locator, timeout: number = 15_000): Promise<void> {
    await test.step(`Wait for element to be visible [Locator: ${locator}]`, async () => {
      await expect(locator).toBeVisible({ timeout });
    });
  }

  /**
   * Wait for an element to be hidden
   */
  async waitForHidden(locator: Locator, timeout: number = 15_000): Promise<void> {
    await test.step(`Wait for element to be hidden [Locator: ${locator}]`, async () => {
      await expect(locator).toBeHidden({ timeout });
    });
  }

  /**
   * Wait for navigation to complete after an action
   */
  async waitForNavigation(): Promise<void> {
    await test.step('Wait for network to be idle', async () => {
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Scroll element into view
   */
  async scrollTo(locator: Locator): Promise<void> {
    await test.step(`Scroll to element [Locator: ${locator}]`, async () => {
      await locator.scrollIntoViewIfNeeded();
    });
  }

  /**
   * Check a checkbox
   */
  async check(locator: Locator, description: string = 'checkbox'): Promise<void> {
    await test.step(`Check "${description}" [Locator: ${locator}]`, async () => {
      this.logger.action('check', description);
      await expect(locator).toBeVisible({ timeout: 10_000 });
      await locator.check();
    });
  }

  /**
   * Uncheck a checkbox
   */
  async uncheck(locator: Locator, description: string = 'checkbox'): Promise<void> {
    await test.step(`Uncheck "${description}" [Locator: ${locator}]`, async () => {
      this.logger.action('uncheck', description);
      await expect(locator).toBeVisible({ timeout: 10_000 });
      await locator.uncheck();
    });
  }

  // ───────────────────────────────────────────────
  // Assertions (use in Page methods if needed)
  // ───────────────────────────────────────────────

  /**
   * Assert page contains specific text
   */
  async assertContainsText(text: string): Promise<void> {
    await test.step(`Assert page contains text: "${text}"`, async () => {
      await expect(this.page.getByText(text)).toBeVisible({
        timeout: 10_000,
      });
    });
  }

  /**
   * Assert current URL contains a substring
   */
  async assertUrlContains(substring: string): Promise<void> {
    await test.step(`Assert current URL contains: "${substring}"`, async () => {
      await expect(this.page).toHaveURL(new RegExp(substring));
    });
  }
}
