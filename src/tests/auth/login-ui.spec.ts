/**
 * Login UI Test Suite — M1: Login Form UI
 * Covers: TC_001, TC_002, TC_003
 * Skip: TC_004 (responsive — requires manual viewport toggle)
 */

import { test, expect } from '../../fixtures/base.fixture';

test.describe('Login Form UI — TC_001~TC_003', () => {
  // Tests không cần auth state
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_001 — Verify trang Login hiển thị đầy đủ
  // ──────────────────────────────────────────────────────────────────────
  test('TC_001: Verify trang Login hiển thị đầy đủ các thành phần', async ({ loginPage, page }) => {
    // Assert — Email & Password field
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_001] Trang Login phải hiển thị Email và Password field'
    ).toBeTruthy();

    // Assert — Forgot Password link
    expect(
      await loginPage.isForgotPasswordLinkDisplayed(),
      "[TC_001] Link 'Forgot Password?' phải hiển thị trên trang Login"
    ).toBeTruthy();

    // Assert — URL đúng
    expect(
      page.url(),
      '[TC_001] URL phải chứa "authentication"'
    ).toContain('authentication');
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_002 — Password field hiển thị dạng masked
  // ──────────────────────────────────────────────────────────────────────
  test('TC_002: Verify trường Password hiển thị dạng masked (type=password)', async ({ loginPage }) => {
    // Act
    await loginPage.enterPassword('TestPassword123');

    // Assert
    expect(
      await loginPage.isPasswordMasked(),
      "[TC_002] Trường Password phải có type='password' (hiển thị dạng masked ●●●)"
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_003 — CSRF token tồn tại trong form
  // ──────────────────────────────────────────────────────────────────────
  test('TC_003: Verify CSRF token hidden field tồn tại trong form Login', async ({ loginPage }) => {
    // Assert — CSRF token tồn tại
    expect(
      await loginPage.isCsrfTokenPresent(),
      "[TC_003] CSRF hidden field (name='csrf_token_name') phải tồn tại với value không rỗng"
    ).toBeTruthy();

    // Assert — token value không rỗng
    const tokenValue = await loginPage.getCsrfTokenValue();
    expect(
      tokenValue && tokenValue.trim() !== '',
      `[TC_003] CSRF token value không được rỗng. Giá trị: '${tokenValue}'`
    ).toBeTruthy();
  });
});
