/**
 * Auth Setup — chạy 1 lần trước tất cả tests.
 * Lưu authenticated state để tests trong chromium project dùng lại.
 */

import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { ENV } from '../../utils/env.config';
import * as path from 'path';

const authFile = path.join('test-results', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(ENV.username, ENV.password);

  // Verify login thành công
  await expect(page).toHaveURL(/\/admin\//, { timeout: 15_000 });

  // Lưu state
  await page.context().storageState({ path: authFile });
});
