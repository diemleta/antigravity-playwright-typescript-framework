/**
 * Login Security Test Suite — M5: Security
 * Covers: TC_025, TC_026, TC_027, TC_028, TC_029, TC_030
 */

import { test, expect } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';

test.describe('Login Security — TC_025~TC_030', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_025 — SQL Injection vào trường Email
  // ──────────────────────────────────────────────────────────────────────
  test("TC_025: SQL Injection vào trường Email — hệ thống không bị bypass", async ({ loginPage, page }) => {
    // Arrange
    const sqlInjection = "' OR 1=1 --";

    // Act
    await loginPage.enterEmail(sqlInjection);
    await loginPage.enterPassword('anything');
    await loginPage.clickLoginButton();

    const currentUrl = page.url();

    // Assert — KHÔNG đăng nhập thành công
    expect(
      currentUrl.includes('/admin/') && !currentUrl.includes('authentication'),
      `[TC_025] SQL Injection KHÔNG được phép đăng nhập. URL: ${currentUrl}`
    ).toBeFalsy();

    // Assert — KHÔNG lỗi 500
    const title = await page.title();
    expect(
      currentUrl.includes('500') || title.includes('500'),
      `[TC_025] Hệ thống KHÔNG được trả về lỗi 500. URL: ${currentUrl}`
    ).toBeFalsy();

    // Assert — Vẫn ở trang Login hoặc có error message
    const staysOnLoginOrShowsError =
      currentUrl.includes('authentication') || (await loginPage.isErrorDisplayed());
    expect(
      staysOnLoginOrShowsError,
      '[TC_025] Hệ thống phải ở lại trang Login hoặc hiển thị lỗi với SQL injection'
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_026 — XSS Script Injection vào trường Email
  // ──────────────────────────────────────────────────────────────────────
  test("TC_026: XSS Script Injection vào trường Email — script không được execute", async ({ loginPage, page }) => {
    // Arrange
    const xssPayload = "<script>alert('XSS')</script>";

    // Theo dõi JS alert nếu có
    let alertDetected = false;
    page.on('dialog', async (dialog) => {
      alertDetected = true;
      await dialog.dismiss();
    });

    // Act
    await loginPage.enterEmail(xssPayload);
    await loginPage.enterPassword('123456');
    await loginPage.clickLoginButton();
    await page.waitForTimeout(1000); // Chờ alert xuất hiện nếu có

    // Assert — Không có JS alert popup
    expect(
      alertDetected,
      '[TC_026] XSS script KHÔNG được execute — không có alert popup'
    ).toBeFalsy();

    // Assert — KHÔNG lỗi 500
    const currentUrl = page.url();
    const title = await page.title();
    expect(
      currentUrl.includes('500') || title.includes('500'),
      `[TC_026] Hệ thống KHÔNG được trả về lỗi 500. URL: ${currentUrl}`
    ).toBeFalsy();

    // Assert — KHÔNG đăng nhập thành công
    expect(
      currentUrl.includes('/admin/') && !currentUrl.includes('authentication'),
      `[TC_026] XSS KHÔNG được phép đăng nhập. URL: ${currentUrl}`
    ).toBeFalsy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_027 — SQL Injection vào trường Password
  // ──────────────────────────────────────────────────────────────────────
  test("TC_027: SQL Injection vào trường Password — không được bypass", async ({ loginPage, page }) => {
    // Arrange
    const sqlInjectionPassword = "' OR '1'='1";

    // Act
    await loginPage.enterEmail('admin@example.com');
    await loginPage.enterPassword(sqlInjectionPassword);
    await loginPage.clickLoginButton();

    const currentUrl = page.url();

    // Assert — KHÔNG đăng nhập thành công
    expect(
      currentUrl.includes('/admin/') && !currentUrl.includes('authentication'),
      `[TC_027] SQL Injection password KHÔNG được phép đăng nhập. URL: ${currentUrl}`
    ).toBeFalsy();

    // Assert — KHÔNG lỗi 500
    const title = await page.title();
    expect(
      currentUrl.includes('500') || title.includes('500'),
      `[TC_027] Hệ thống KHÔNG được trả về lỗi 500. URL: ${currentUrl}`
    ).toBeFalsy();

    // Assert — hiển thị error message
    expect(
      await loginPage.isErrorDisplayed(),
      '[TC_027] Phải hiển thị error message với SQL injection password'
    ).toBeTruthy();

    const errorMsg = await loginPage.getErrorMessage();
    expect(
      errorMsg.includes('Invalid email or password'),
      `[TC_027] Error phải là 'Invalid email or password'. Actual: '${errorMsg}'`
    ).toBeTruthy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_028 — CSRF token bị thay đổi → form submit bị từ chối
  // ──────────────────────────────────────────────────────────────────────
  test('TC_028: CSRF token thay đổi → request bị từ chối', async ({ loginPage, dashboardPage, page }) => {
    // Arrange
    const fakeToken = `invalid_csrf_token_${TestDataGenerator.timestamp()}`;

    // Act
    await loginPage.tamperCsrfToken(fakeToken);
    await loginPage.enterEmail('admin@example.com');
    await loginPage.enterPassword('123456');
    await loginPage.clickLoginButton();
    await page.waitForTimeout(1500);

    // Assert — KHÔNG đăng nhập thành công
    expect(
      await dashboardPage.isDashboardDisplayed(),
      `[TC_028] CSRF protection: KHÔNG được login thành công khi token bị thay đổi. URL: ${page.url()}`
    ).toBeFalsy();
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_029 — Brute-force: đăng nhập sai 10 lần liên tiếp
  // ──────────────────────────────────────────────────────────────────────
  test('TC_029: Đăng nhập sai 10 lần liên tiếp — hệ thống không crash', async ({ loginPage, page }) => {
    // Act — thử sai 10 lần
    for (let i = 1; i <= 10; i++) {
      const wrongPassword = `SaiPass_${i}`;

      await loginPage.enterEmail('admin@example.com');
      await loginPage.enterPassword(wrongPassword);
      await loginPage.clickLoginButton();

      // Assert sau mỗi lần thử — KHÔNG crash
      const currentUrl = page.url();
      const title = await page.title();
      expect(
        currentUrl.includes('500') || title.includes('500'),
        `[TC_029] Hệ thống KHÔNG được crash sau lần thử ${i}. URL: ${currentUrl}`
      ).toBeFalsy();

      // Nếu bị redirect hoặc cần reload, quay lại login
      if (!currentUrl.includes('authentication')) {
        await loginPage.goto();
      } else {
        // Reload trang để clear form
        await page.goto(`https://crm.anhtester.com/admin/authentication`);
        await page.waitForLoadState('domcontentloaded');
      }
    }
    // NOTE: Không có account lockout (ghi nhận risk AMB-01)
  });

  // ──────────────────────────────────────────────────────────────────────
  // TC_030 — Error message giống nhau cho email tồn tại và không tồn tại
  // ──────────────────────────────────────────────────────────────────────
  test('TC_030: Error message giống nhau cho email tồn tại và không tồn tại', async ({ loginPage, page }) => {
    // Arrange
    const wrongPassword = `WrongP@ss${TestDataGenerator.timestamp()}`;

    // Act 1 — login với email TỒN TẠI + password sai
    await loginPage.enterEmail('admin@example.com');
    await loginPage.enterPassword(wrongPassword);
    await loginPage.clickLoginButton();
    const errorForExistingEmail = (await loginPage.getErrorMessage()).trim();

    // Act 2 — login với email KHÔNG TỒN TẠI + password sai
    await page.goto(`https://crm.anhtester.com/admin/authentication`);
    await page.waitForLoadState('domcontentloaded');
    await loginPage.enterEmail(`khongtontai_${TestDataGenerator.timestamp()}@example.com`);
    await loginPage.enterPassword(wrongPassword);
    await loginPage.clickLoginButton();
    const errorForNonExistingEmail = (await loginPage.getErrorMessage()).trim();

    // Assert — cả 2 thông báo PHẢI GIỐNG NHAU (no user enumeration)
    expect(
      errorForExistingEmail,
      `[TC_030] Error message phải GIỐNG NHAU. Existing: '${errorForExistingEmail}' | Non-existing: '${errorForNonExistingEmail}'`
    ).toBe(errorForNonExistingEmail);

    // Assert — thông báo là "Invalid email or password"
    expect(
      errorForExistingEmail.includes('Invalid email or password'),
      `[TC_030] Error message phải là 'Invalid email or password'. Actual: '${errorForExistingEmail}'`
    ).toBeTruthy();
  });
});
