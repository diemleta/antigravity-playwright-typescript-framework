import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory where tests are located
  testDir: './src/tests',

  // Maximum time per test (ms)
  timeout: 60_000,

  // Expect timeout for assertions
  expect: {
    timeout: 10_000,
  },

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build if test.only is left in the code
  forbidOnly: !!process.env['CI'],

  // Retry on CI only
  retries: process.env['CI'] ? 2 : 0,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ...(process.env['CI'] ? [['github'] as [string]] : []),
  ],

  // Global test settings
  use: {
    // Base URL for all tests
    baseURL: process.env['BASE_URL'] || 'http://localhost:3000',

    // Viewport: 1920x1080 (desktop standard per GEMINI rules)
    viewport: { width: 1920, height: 1080 },

    // Collect traces on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'on',

    // Navigation timeout
    navigationTimeout: 30_000,

    // Action timeout
    actionTimeout: 15_000,
  },

  // Test projects (browsers)
  projects: [
    // Setup project: handles authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Main Chromium project
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Reuse authenticated state
        storageState: 'test-results/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results',
});
