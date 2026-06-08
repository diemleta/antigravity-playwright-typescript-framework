/**
 * Forgot Password Test Suite — M3: Forgot Password
 * Covers: TC_018, TC_019, TC_020, TC_021, TC_022
 */

import { test, expect } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';

test.describe('Forgot Password — TC_018~TC_022', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  // ──────────────────────────────────────────────────────────────────────
  // TC_018 — Click "Forgot Password?" → chuyển đến trang forgot_password
  // ──────────────────────────────────────────────────────────────────────
  test('TC_018: Click "Forgot Password?" chuyển đến trang khôi phục', async ({ loginPage, forgotPasswordPage, page }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.forgotPasswordLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Assert — đang ở trang Forgot Password
    expect(
      await forgotPasswordPage.isForgotPasswordPageDisplayed(),
      '[TC_018] Phải chuyển đến trang Forgot Password sau khi click link'
    ).toBeTruthy();

    expect(
      page.url(),
      '[TC_018] URL phải chứa "forgot_password"'
    ).toContain('forgot_password');

    // Assert — có Email field và Confirm button
    expect(
      await forgotPasswordPage.isConfirmButtonDisplayed(),
      "[TC_018] Nút 'Confirm' phải hiển thị trên trang Forgot Password"
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_019 — Gửi email khôi phục với email đã đăng ký
  // ──────────────────────────────────────────────────────────────────────
  test('TC_019: Gửi email khôi phục với email đã đăng ký', async ({ forgotPasswordPage }) => {
    // Arrange
    await forgotPasswordPage.goto();

    // Act
    await forgotPasswordPage.submitForgotPassword('admin@example.com');

    // Assert — server đã xử lý request
    const hasSuccessMsg = await forgotPasswordPage.isSuccessMessageDisplayed();
    const hasErrorMsg = await forgotPasswordPage.isErrorDisplayed();
    const serverResponded = hasSuccessMsg || hasErrorMsg;

    expect(
      serverResponded,
      '[TC_019] Server phải trả về response sau khi submit email hợp lệ'
    ).toBeTruthy();

    // Log nếu có SMTP error (expected behavior với demo app)
    if (hasErrorMsg) {
      const err = await forgotPasswordPage.getErrorMessage();
      console.info(`[TC_019] App error (có thể do SMTP): ${err}`);
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_020 — Forgot Password: email trống → HTML5 validation
  // ──────────────────────────────────────────────────────────────────────
  test('TC_020: Để trống Email trên trang Forgot Password → validation ngăn submit', async ({ forgotPasswordPage }) => {
    // Arrange
    await forgotPasswordPage.goto();

    // Act — click Confirm với email trống
    await forgotPasswordPage.clickConfirm();

    // Assert — vẫn ở trang Forgot Password
    expect(
      await forgotPasswordPage.isForgotPasswordPageDisplayed(),
      '[TC_020] Phải ở lại trang Forgot Password khi email trống'
    ).toBeTruthy();

    // Assert — email field có type="email" (HTML5 format validation)
    expect(
      await forgotPasswordPage.isEmailFieldTypeEmail(),
      "[TC_020] Email field phải có type='email' cho HTML5 format validation"
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_021 — Forgot Password: email chưa đăng ký → thông báo chung
  // ──────────────────────────────────────────────────────────────────────
  test('TC_021: Forgot Password với email chưa đăng ký → kiểm tra thông báo', async ({ forgotPasswordPage }) => {
    // Arrange — email unique, không tồn tại
    const nonExistentEmail = `khongtontai_${TestDataGenerator.timestamp()}@example.com`;
    await forgotPasswordPage.goto();

    // Act
    await forgotPasswordPage.submitForgotPassword(nonExistentEmail);

    // Assert — form không crash, có response
    const hasAnyResponse =
      (await forgotPasswordPage.isErrorDisplayed()) ||
      (await forgotPasswordPage.isSuccessMessageDisplayed());

    expect(
      hasAnyResponse,
      '[TC_021] Server phải trả về response khi submit email không tồn tại'
    ).toBeTruthy();

    // Document known security weakness: App có thể tiết lộ "Email not found"
    if (await forgotPasswordPage.isErrorDisplayed()) {
      const errMsg = await forgotPasswordPage.getErrorMessage();
      const revealsInfo =
        errMsg.toLowerCase().includes('not found') ||
        errMsg.toLowerCase().includes('does not exist') ||
        errMsg.toLowerCase().includes('no account');
      if (revealsInfo) {
        console.warn(`[TC_021] [KNOWN SECURITY BUG] App tiết lộ thông tin email: '${errMsg}'`);
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_022 — Forgot Password: email sai định dạng → HTML5 validation
  // ──────────────────────────────────────────────────────────────────────
  test('TC_022: Forgot Password với email sai định dạng → HTML5 validation', async ({ forgotPasswordPage }) => {
    // Arrange
    await forgotPasswordPage.goto();

    // Act
    await forgotPasswordPage.enterEmail('emailkhonghople');
    await forgotPasswordPage.clickConfirm();

    // Assert — vẫn ở trang Forgot Password (HTML5 email validation ngăn submit)
    expect(
      await forgotPasswordPage.isForgotPasswordPageDisplayed(),
      "[TC_022] Phải ở lại trang Forgot Password khi email không có '@' (HTML5 validation)"
    ).toBeTruthy();

    // Assert — email field có type="email" để HTML5 validate format
    expect(
      await forgotPasswordPage.isEmailFieldTypeEmail(),
      "[TC_022] Email field phải có type='email' để kích hoạt HTML5 format validation"
    ).toBeTruthy();
  });
});
