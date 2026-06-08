/**
 * Authentication Fixture
 * Handles global authentication setup for tests that require a logged-in state.
 *
 * How it works:
 * 1. The 'setup' project runs auth.setup.ts once before all tests
 * 2. Authenticated state is saved to test-results/.auth/user.json
 * 3. Tests in 'chromium' project reuse this state via storageState
 *
 * This pattern avoids repeating login on every test — much faster!
 */

import { test as base } from './base.fixture';
import { expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ENV } from '../utils/env.config';

// Authenticated fixture type
export type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Fixture that provides a pre-authenticated page.
 * Use when you need to test features that require login.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }: { page: Page }, use: (r: Page) => Promise<void>) => {
    // Navigate and login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ENV.username, ENV.password);

    // Verify logged in
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Provide the authenticated page to the test
    await use(page);
  },
});

export { expect } from '@playwright/test';
