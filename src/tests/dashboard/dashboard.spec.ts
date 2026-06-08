/**
 * Dashboard Test Suite — TC_DASH-001, TC_DASH-002
 * (Dashboard smoke tests — requires authenticated state)
 */

import { test, expect } from '../../fixtures/base.fixture';

test.describe('Dashboard — Smoke Tests', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('TC_DASH_001: Dashboard hiển thị đúng sau khi đăng nhập', async ({ dashboardPage, page }) => {
    await dashboardPage.assertOnDashboard();
    const title = await page.title();
    expect(title, 'Page title should not be empty').not.toBe('');
  });
});
