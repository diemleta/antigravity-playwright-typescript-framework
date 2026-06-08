/**
 * Login Authentication Test Suite — M2: Login Authentication
 * Covers: TC_005~TC_012, TC_015~TC_017
 * Skip: TC_013 (Remember me session), TC_014 (No Remember me session expiry)
 *       — không thể verify trong single browser session
 */

import { test, expect } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';

test.describe('Login Authentication — TC_005~TC_017', () => {
  // Tất cả tests trong file này không dùng stored auth state
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_005 — Đăng nhập thành công (CRITICAL)
  // ──────────────────────────────────────────────────────────────────────
  test('TC_005: Đăng nhập thành công với Email và Password hợp lệ', async ({ loginPage, dashboardPage, page }) => {
    // Act
    await loginPage.login('admin@example.com', '123456');

    // Assert — redirect Dashboard
    await expect(page).toHaveURL(/\/admin\//, { timeout: 15_000 });

    expect(
      await dashboardPage.isDashboardDisplayed(),
      `[TC_005] Sau đăng nhập thành công phải redirect đến Dashboard. URL: ${page.url()}`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_006 — Email trống → lỗi
  // ──────────────────────────────────────────────────────────────────────
  test('TC_006: Đăng nhập thất bại — để trống trường Email', async ({ loginPage, page }) => {
    // Act
    await loginPage.enterEmail('');
    await loginPage.enterPassword('123456');
    await loginPage.clickLoginButton();

    // Assert — vẫn ở trang Login
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_006] Hệ thống phải ở lại trang Login khi Email trống'
    ).toBeTruthy();

    // Assert — có error message
    expect(
      await loginPage.isErrorDisplayed(),
      '[TC_006] Phải hiển thị thông báo lỗi khi Email trống'
    ).toBeTruthy();

    // Assert — nội dung error
    const errorMsg = await loginPage.getErrorMessage();
    expect(
      errorMsg.includes('Email Address field is required') || errorMsg.includes('required'),
      `[TC_006] Error phải chứa 'Email Address field is required'. Actual: '${errorMsg}'`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_007 — Password trống → lỗi
  // ──────────────────────────────────────────────────────────────────────
  test('TC_007: Đăng nhập thất bại — để trống trường Password', async ({ loginPage }) => {
    // Act
    await loginPage.enterEmail('admin@example.com');
    await loginPage.enterPassword('');
    await loginPage.clickLoginButton();

    // Assert
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_007] Hệ thống phải ở lại trang Login khi Password trống'
    ).toBeTruthy();

    expect(
      await loginPage.isErrorDisplayed(),
      '[TC_007] Phải hiển thị thông báo lỗi khi Password trống'
    ).toBeTruthy();

    const errorMsg = await loginPage.getErrorMessage();
    expect(
      errorMsg.includes('Password field is required') || errorMsg.includes('required'),
      `[TC_007] Error phải chứa 'Password field is required'. Actual: '${errorMsg}'`
    ).toBeTruthy();
  });

  // ────────────────────────────────────────────────────────────────────
  // TC_008 — Cả Email + Password trống
  // ────────────────────────────────────────────────────────────────────
  test('TC_008: Đăng nhập thất bại — để trống cả Email và Password', async ({ loginPage, page }) => {
    // Act
    await loginPage.enterEmail('');
    await loginPage.enterPassword('');
    await loginPage.clickLoginButton();

    // Assert
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_008] Phải ở lại trang Login khi cả hai trường trống'
    ).toBeTruthy();

    // CRM hiển thị 2 alert riêng biệt (Email + Password) — dùng count() để check
    const alertCount = await page.locator('.alert.alert-danger').count();
    expect(
      alertCount > 0,
      '[TC_008] Phải hiển thị thông báo lỗi khi cả Email và Password trống'
    ).toBeTruthy();

    // Lấy tất cả error texts và gộp lại
    const allErrors = await page.locator('.alert.alert-danger').allTextContents();
    const combinedError = allErrors.join(' ');
    expect(
      combinedError.includes('required'),
      `[TC_008] Error message phải chứa 'required'. Actual: '${combinedError}'`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_009 — Email sai định dạng (HTML5 client-side validation)
  // ──────────────────────────────────────────────────────────────────────
  test('TC_009: Đăng nhập thất bại — Email sai định dạng (thiếu @)', async ({ loginPage, page }) => {
    // Act
    await loginPage.enterEmail('invalidemail');
    await loginPage.enterPassword('123456');
    await loginPage.clickLoginButton();

    // Assert — form bị chặn bởi HTML5 validation (không navigate)
    expect(
      page.url(),
      '[TC_009] URL phải vẫn là trang authentication — form không được gửi lên server'
    ).toContain('authentication');
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_010 — Email đúng định dạng nhưng không tồn tại
  // ──────────────────────────────────────────────────────────────────────
  test('TC_010: Đăng nhập thất bại — Email hợp lệ nhưng không tồn tại', async ({ loginPage }) => {
    // Arrange — email unique để tránh trùng lặp
    const nonExistentEmail = `notexist_${TestDataGenerator.timestamp()}@example.com`;

    // Act
    await loginPage.enterEmail(nonExistentEmail);
    await loginPage.enterPassword('WrongPass!456');
    await loginPage.clickLoginButton();

    // Assert
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_010] Phải ở lại trang Login khi email không tồn tại'
    ).toBeTruthy();

    expect(
      await loginPage.isErrorDisplayed(),
      '[TC_010] Phải hiển thị thông báo lỗi với email không tồn tại'
    ).toBeTruthy();

    const errorMsg = await loginPage.getErrorMessage();
    expect(
      errorMsg.includes('Invalid email or password'),
      `[TC_010] Error phải là 'Invalid email or password'. Actual: '${errorMsg}'`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_011 — Email đúng + Password sai
  // ──────────────────────────────────────────────────────────────────────
  test('TC_011: Đăng nhập thất bại — Email đúng + Password sai', async ({ loginPage }) => {
    // Act
    await loginPage.enterEmail('admin@example.com');
    await loginPage.enterPassword('SaiMatKhau!789');
    await loginPage.clickLoginButton();

    // Assert
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_011] Phải ở lại trang Login khi password sai'
    ).toBeTruthy();

    const errorMsg = await loginPage.getErrorMessage();
    expect(
      errorMsg.includes('Invalid email or password'),
      `[TC_011] Error phải là 'Invalid email or password'. Actual: '${errorMsg}'`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_012 — Email sai + Password đúng
  // ──────────────────────────────────────────────────────────────────────
  test('TC_012: Đăng nhập thất bại — Email sai + Password đúng', async ({ loginPage }) => {
    // Act
    await loginPage.enterEmail('wrong_admin@example.com');
    await loginPage.enterPassword('123456');
    await loginPage.clickLoginButton();

    // Assert
    expect(
      await loginPage.isLoginPageDisplayed(),
      '[TC_012] Phải ở lại trang Login khi email sai'
    ).toBeTruthy();

    const errorMsg = await loginPage.getErrorMessage();
    expect(
      errorMsg.includes('Invalid email or password'),
      `[TC_012] Error phải là 'Invalid email or password'. Actual: '${errorMsg}'`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_015 — BVA: Email cực dài (1001 ký tự)
  // ──────────────────────────────────────────────────────────────────────
  test('TC_015: BVA — Nhập Email cực dài (1001 ký tự) không gây crash', async ({ loginPage, page }) => {
    // Arrange — 989 'a' + '@example.com' = 1001 ký tự
    const longEmail = 'a'.repeat(989) + '@example.com';
    expect(longEmail.length, 'Email phải có đúng 1001 ký tự').toBe(1001);

    // Act
    await loginPage.enterEmail(longEmail);
    await loginPage.enterPassword('123456');
    await loginPage.clickLoginButton();

    // Assert — không crash (không phải lỗi 500)
    const currentUrl = page.url();
    expect(
      currentUrl.includes('500') || currentUrl.includes('/error'),
      `[TC_015] Hệ thống KHÔNG được crash/lỗi 500. URL: ${currentUrl}`
    ).toBeFalsy();

    const title = await page.title();
    expect(
      title.toLowerCase().includes('500'),
      '[TC_015] Trang KHÔNG được hiển thị lỗi 500'
    ).toBeFalsy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_016 — BVA: Password cực dài (1001 ký tự)
  // ──────────────────────────────────────────────────────────────────────
  test('TC_016: BVA — Nhập Password cực dài (1001 ký tự) không gây crash', async ({ loginPage, page }) => {
    // Arrange — 'Aa1!' + 997 'x' = 1001 ký tự
    const longPassword = 'Aa1!' + 'x'.repeat(997);
    expect(longPassword.length, 'Password phải có đúng 1001 ký tự').toBe(1001);

    // Act
    await loginPage.enterEmail('admin@example.com');
    await loginPage.enterPassword(longPassword);
    await loginPage.clickLoginButton();

    // Assert — không crash
    const currentUrl = page.url();
    expect(
      currentUrl.includes('500') || currentUrl.includes('/error'),
      `[TC_016] Hệ thống KHÔNG được crash/lỗi 500. URL: ${currentUrl}`
    ).toBeFalsy();

    // Kỳ vọng: vẫn ở login page hoặc có error
    const isLoginPage = currentUrl.includes('authentication');
    const hasErrorMsg = await loginPage.isErrorDisplayed();
    expect(
      isLoginPage || hasErrorMsg,
      '[TC_016] Hệ thống phải ở lại trang Login hoặc hiển thị lỗi'
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_017 — Đã đăng nhập → truy cập login URL → redirect Dashboard
  // ──────────────────────────────────────────────────────────────────────
  test('TC_017: Truy cập login URL khi đã authenticated → redirect Dashboard', async ({ loginPage, page }) => {
    // Arrange — Đăng nhập trước
    await loginPage.login('admin@example.com', '123456');
    await expect(page).toHaveURL(/\/admin\//, { timeout: 15_000 });

    // Act — cố tình truy cập lại trang Login
    await page.goto(`https://crm.anhtester.com${LoginPage.LOGIN_PATH}`);
    await page.waitForTimeout(2000);

    // Assert — redirect về Dashboard (không hiển thị form Login)
    const urlAfterNavigate = page.url();
    expect(
      urlAfterNavigate.includes('authentication'),
      `[TC_017] Hệ thống phải redirect về Dashboard khi đã authenticated. URL: ${urlAfterNavigate}`
    ).toBeFalsy();
  });
});

// Import LoginPage để dùng LOGIN_PATH constant
import { LoginPage } from '../../pages/login.page';
