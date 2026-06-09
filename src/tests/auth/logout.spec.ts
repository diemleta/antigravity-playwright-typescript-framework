/**
 * Logout Test Suite — M4: Logout
 * Covers: TC_023, TC_024
 */

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

test.describe('Logout — TC_023~TC_024', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  // ──────────────────────────────────────────────────────────────────────
  // TC_023 — Đăng xuất từ Dashboard → quay về trang Login
  // ──────────────────────────────────────────────────────────────────────
  test('TC_023: Đăng xuất từ Dashboard → chuyển về trang Login', async ({ loginPage, dashboardPage, page }) => {
    // Arrange — Đăng nhập trước
    await loginPage.goto();
    await loginPage.login(ENV.username, ENV.password);
    await expect(page).toHaveURL(/\/admin\//, { timeout: 15_000 });

    expect(
      await dashboardPage.isDashboardDisplayed(),
      '[TC_023] Pre-condition: Phải đang ở Dashboard trước khi logout'
    ).toBeTruthy();

    // Act — Logout
    await dashboardPage.logout();

    // Assert — đang ở trang Login
    expect(
      page.url(),
      `[TC_023] Sau logout phải redirect về trang Login. URL: ${page.url()}`
    ).toContain('authentication');

    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_023] Form Login phải hiển thị sau khi logout'
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_024 — Sau logout, nhấn Back → không quay lại Dashboard
  // ──────────────────────────────────────────────────────────────────────
  test('TC_024: Sau logout, nhấn Back → không quay lại được Dashboard', async ({ loginPage, dashboardPage, page }) => {
    // Arrange — Đăng nhập và logout
    await loginPage.goto();
    await loginPage.login(ENV.username, ENV.password);
    await expect(page).toHaveURL(/\/admin\//, { timeout: 15_000 });

    expect(
      await dashboardPage.isDashboardDisplayed(),
      '[TC_024] Pre-condition: Phải đang ở Dashboard'
    ).toBeTruthy();

    // Act — Logout
    await dashboardPage.logout();
    expect(
      page.url(),
      '[TC_024] Pre-condition: Phải đang ở trang Login sau logout'
    ).toContain('authentication');

    // Act — Nhấn nút Back của trình duyệt
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    // Assert — Phải ở trang Login (session đã hủy, không thể quay lại Dashboard)
    const urlAfterBack = page.url();
    const isOnLoginPage = urlAfterBack.includes('authentication');
    const isRedirectedToLogin =
      !urlAfterBack.includes('/admin/') || urlAfterBack.includes('authentication');

    expect(
      isOnLoginPage || isRedirectedToLogin,
      `[TC_024] Sau logout, nhấn Back phải ở lại trang Login (session đã hủy). URL: ${urlAfterBack}`
    ).toBeTruthy();
  });
});
