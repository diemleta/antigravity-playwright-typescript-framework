/**
 * ForgotPasswordPage — Page Object
 * URL: https://crm.anhtester.com/admin/authentication/forgot_password
 * Locators verified từ DOM inspection thực tế.
 */

import { type Page, expect, test } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  // ─── Locators ──────────────────────────────────────────────────────────
  /** <input id="email" type="email" required> */
  readonly emailInput = this.page.locator('#email');

  /** <button type="submit"> */
  readonly confirmButton = this.page.locator('button[type="submit"]');

  /** Success/info message after submit */
  readonly successAlert = this.page.locator('.alert-success, .alert-info');

  /** Error message */
  readonly errorAlert = this.page.locator('.alert-danger');

  static readonly FORGOT_PASSWORD_PATH = '/admin/authentication/forgot_password';

  constructor(page: Page) {
    super(page, 'ForgotPasswordPage');
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await test.step('Navigate to CRM Forgot Password Page', async () => {
      await this.navigate(ForgotPasswordPage.FORGOT_PASSWORD_PATH);
      await expect(this.emailInput).toBeVisible({ timeout: 15_000 });
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────

  async enterEmail(email: string): Promise<ForgotPasswordPage> {
    await this.fill(this.emailInput, email, 'Forgot Password Email input');
    return this;
  }

  async clickConfirm(): Promise<ForgotPasswordPage> {
    await this.click(this.confirmButton, 'Confirm button');
    return this;
  }

  async submitForgotPassword(email: string): Promise<void> {
    await test.step(`Submit Forgot Password request for email: "${email}"`, async () => {
      await this.enterEmail(email);
      await this.clickConfirm();
      // Chờ response từ server
      await this.page.waitForTimeout(1500);
    });
  }

  // ─── Verifications ─────────────────────────────────────────────────────

  async isForgotPasswordPageDisplayed(): Promise<boolean> {
    return await test.step('Check if Forgot Password Page is displayed', async () => {
      const url = this.page.url();
      const emailVisible = await this.emailInput.isVisible();
      return url.includes('forgot_password') && emailVisible;
    });
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await test.step('Check if Success Message is displayed', async () => {
      return this.successAlert.isVisible();
    });
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await test.step('Check if Error Alert is displayed', async () => {
      return this.errorAlert.isVisible();
    });
  }

  async getErrorMessage(): Promise<string> {
    return await test.step('Get forgot password error message', async () => {
      const visible = await this.errorAlert.isVisible();
      if (!visible) return '';
      return (await this.errorAlert.textContent()) ?? '';
    });
  }

  async getSuccessMessage(): Promise<string> {
    return await test.step('Get forgot password success message', async () => {
      const visible = await this.successAlert.isVisible();
      if (!visible) return '';
      return (await this.successAlert.textContent()) ?? '';
    });
  }

  async isConfirmButtonDisplayed(): Promise<boolean> {
    return await test.step('Check if Confirm Button is displayed', async () => {
      return this.confirmButton.isVisible();
    });
  }

  async isEmailFieldTypeEmail(): Promise<boolean> {
    return await test.step('Check if Email Field has type="email"', async () => {
      const type = await this.emailInput.getAttribute('type');
      return type === 'email';
    });
  }
}
