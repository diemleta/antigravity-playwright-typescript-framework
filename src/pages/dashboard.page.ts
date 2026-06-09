/**
 * Dashboard Page Object — CRM anhtester.com
 * URL sau login: https://crm.anhtester.com/admin/
 * Locators verified từ DOM inspection thực tế.
 */

import { type Page, expect, test } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // ─── Locators (verified on actual DOM after login) ──────────────────────
  /** li.menu-item-dashboard trong sidebar */
  readonly dashboardMenuItem = this.page.locator('li.menu-item-dashboard');

  /** <a class="profile"> — góc trên phải */
  readonly userProfileLink = this.page.locator('a.profile');

  /** <li class="header-logout"><a ...>Logout</a></li> — visible desktop header only */
  readonly logoutLink = this.page.locator('li.header-logout > a:visible');

  /** H1 heading */
  readonly pageHeading = this.page.getByRole('heading', { level: 1 });

  constructor(page: Page) {
    super(page, 'DashboardPage');
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await test.step('Navigate to CRM Dashboard Page', async () => {
      await this.navigate('/admin/');
      await expect(this.dashboardMenuItem).toBeVisible({ timeout: 15_000 });
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────

  /**
   * Logout bằng JavaScript (CRM dùng onclick="logout()").
   */
  async logout(): Promise<void> {
    await test.step('Logout from the CRM system', async () => {
      this.logger.info('Navigating to logout URL directly...');
      // Navigate directly to the logout endpoint (same URL as logout() JS function)
      // More reliable than UI click on dropdown in headless CI mode
      await this.page.goto('/admin/authentication/logout');
      // Wait for redirect to login page
      await expect(this.page).toHaveURL(/authentication/, { timeout: 15_000 });
      this.logger.info(`After logout URL: ${this.page.url()}`);
    });
  }

  // ─── Verifications ─────────────────────────────────────────────────────

  async isDashboardDisplayed(): Promise<boolean> {
    return await test.step('Check if CRM Dashboard is displayed', async () => {
      const url = this.page.url();
      const urlCorrect = url.includes('/admin/') &&
        !url.includes('authentication') &&
        !url.includes('/login');

      if (!urlCorrect) return false;

      const menuVisible = await this.dashboardMenuItem.isVisible();
      this.logger.info(`Dashboard check — URL: '${url}', Menu visible: ${menuVisible}`);
      return menuVisible;
    });
  }

  async assertOnDashboard(): Promise<void> {
    await test.step('Verify that user is on the CRM Dashboard', async () => {
      await expect(this.page).toHaveURL(/\/admin\//, { timeout: 15_000 });
      await expect(this.dashboardMenuItem).toBeVisible({ timeout: 10_000 });
      this.logger.info('✅ Dashboard verified');
    });
  }

  getDashboardUrl(): string {
    return this.page.url();
  }
}
