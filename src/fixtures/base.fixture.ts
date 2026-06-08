/**
 * Base Fixture — mở rộng Playwright test với tất cả page objects.
 * Import 'test' từ file này thay vì '@playwright/test'.
 */

import { test as base, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';

export type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
};

export const test = base.extend<PageFixtures>({
  // Auto-attach screenshot on successful (passed) test cases
  page: async ({ page }, use, testInfo) => {
    await use(page);
    
    // Check if test passed (status is 'passed' or no errors)
    if (testInfo.status === 'passed' && testInfo.errors.length === 0) {
      const screenshot = await page.screenshot({ fullPage: false });
      await testInfo.attach('Passed Test Screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
    }
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
});

export { expect } from '@playwright/test';
