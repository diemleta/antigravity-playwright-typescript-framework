/**
 * Login Page Object — CRM anhtester.com
 * URL: https://crm.anhtester.com/admin/authentication
 * Locators verified từ DOM inspection thực tế.
 */

import { type Page, expect, test } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // ─── Locators (verified on actual DOM) ─────────────────────────────────
  /** <input id="email" type="email" name="email"> */
  readonly emailInput = this.page.locator('#email');

  /** <input id="password" type="password" name="password"> */
  readonly passwordInput = this.page.locator('#password');

  /** <button type="submit"> */
  readonly loginButton = this.page.locator('button[type="submit"]');

  /** <input id="remember" type="checkbox" name="remember"> */
  readonly rememberMeCheckbox = this.page.locator('#remember');

  /** <a href="...forgot_password"> */
  readonly forgotPasswordLink = this.page.locator('a[href*="forgot_password"]');

  /** <div class="alert alert-danger text-center"> — dùng .first() để tránh strict mode khi có nhiều alerts */
  readonly errorAlert = this.page.locator('.alert.alert-danger').first();

  /** <input type="hidden" name="csrf_token_name"> */
  readonly csrfHiddenField = this.page.locator('input[name="csrf_token_name"]');

  // ─── Constants ─────────────────────────────────────────────────────────
  static readonly LOGIN_PATH = '/admin/authentication';

  constructor(page: Page) {
    super(page, 'LoginPage');
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await test.step('Navigate to CRM Login Page', async () => {
      await this.navigate(LoginPage.LOGIN_PATH);
      await expect(this.emailInput).toBeVisible({ timeout: 15_000 });
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────

  async enterEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email, 'Email input');
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password, 'Password input');
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.loginButton, 'Login button');
  }

  /**
   * Đăng nhập hoàn chỉnh — điền credentials + click submit + chờ redirect.
   */
  async login(email: string, password: string): Promise<void> {
    await test.step(`Login to CRM with email: "${email}" and password: "********"`, async () => {
      this.logger.info(`Logging in as: ${email}`);
      await this.enterEmail(email);
      await this.enterPassword(password);
      await this.clickLoginButton();
      // Chờ URL thay đổi hoặc error hiện ra
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Đăng nhập và expect thành công (redirect về /admin/).
   */
  async loginSuccessfully(email: string, password: string): Promise<void> {
    await test.step(`Login to CRM successfully with email: "${email}" and password: "********"`, async () => {
      await this.login(email, password);
      await expect(this.page).toHaveURL(/\/admin\//, { timeout: 15_000 });
    });
  }

  /**
   * Tamper CSRF token bằng JavaScript (dùng cho TC_028).
   */
  async tamperCsrfToken(fakeToken: string): Promise<void> {
    await test.step(`Tamper CSRF token to value: "${fakeToken}"`, async () => {
      this.logger.info(`Tampering CSRF token: ${fakeToken}`);
      await this.page.evaluate((token: string) => {
        const el = document.querySelector<HTMLInputElement>('input[name="csrf_token_name"]');
        if (el) el.value = token;
      }, fakeToken);
    });
  }

  // ─── Verifications ─────────────────────────────────────────────────────

  async isLoginPageDisplayed(): Promise<boolean> {
    return await test.step('Check if Login Page is displayed', async () => {
      return (await this.emailInput.isVisible()) && (await this.passwordInput.isVisible());
    });
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await test.step('Check if Error Alert is displayed', async () => {
      return this.errorAlert.isVisible();
    });
  }

  async getErrorMessage(): Promise<string> {
    return await test.step('Get error message text from page', async () => {
      const visible = await this.errorAlert.isVisible();
      if (!visible) return '';
      return (await this.errorAlert.textContent()) ?? '';
    });
  }

  async isPasswordMasked(): Promise<boolean> {
    return await test.step('Check if Password field is masked (type="password")', async () => {
      const type = await this.passwordInput.getAttribute('type');
      return type === 'password';
    });
  }

  async isCsrfTokenPresent(): Promise<boolean> {
    return await test.step('Check if CSRF token is present in the form', async () => {
      const count = await this.csrfHiddenField.count();
      if (count === 0) return false;
      const value = await this.csrfHiddenField.getAttribute('value');
      return !!value && value.trim() !== '';
    });
  }

  async getCsrfTokenValue(): Promise<string> {
    return await test.step('Get CSRF token value', async () => {
      return (await this.csrfHiddenField.getAttribute('value')) ?? '';
    });
  }

  async isForgotPasswordLinkDisplayed(): Promise<boolean> {
    return await test.step('Check if Forgot Password link is displayed', async () => {
      return this.forgotPasswordLink.isVisible();
    });
  }

  async isAlertPresent(): Promise<boolean> {
    return await test.step('Check if alert dialog is present', async () => {
      try {
        await this.page.waitForEvent('dialog', { timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    });
  }

  async assertOnLoginPage(): Promise<void> {
    await test.step('Verify that user is on the Login Page', async () => {
      await expect(this.emailInput).toBeVisible({ timeout: 10_000 });
    });
  }

  async assertErrorContains(text: string): Promise<void> {
    await test.step(`Verify that error message contains: "${text}"`, async () => {
      await expect(this.errorAlert).toBeVisible({ timeout: 10_000 });
      await expect(this.errorAlert).toContainText(text);
    });
  }

  async assertLoginFailed(): Promise<void> {
    await test.step('Verify that login has failed', async () => {
      const onLogin = await this.isLoginPageDisplayed();
      const hasError = await this.isErrorDisplayed();
      expect(
        onLogin || hasError,
        'Expected to remain on login page or see error message'
      ).toBeTruthy();
    });
  }
}
