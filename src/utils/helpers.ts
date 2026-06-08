/**
 * Common Helper Functions
 * Reusable utilities shared across tests and pages.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Reads a JSON file and returns parsed content
 * @param relativePath - Path relative to project root
 */
export function readJsonFile<T>(relativePath: string): T {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Wait for a specified number of milliseconds.
 * Use sparingly — prefer Playwright's built-in auto-waiting.
 * Only for cases where no assertion-based wait is possible.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a Date object to readable string
 */
export function formatDate(date: Date, format: 'ISO' | 'VN' = 'ISO'): string {
  if (format === 'VN') {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return date.toISOString();
}

/**
 * Ensure a directory exists, create if not
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Mask sensitive string for logging (shows first 3 chars)
 * @example maskSecret('password123') → 'pas***'
 */
export function maskSecret(value: string): string {
  if (value.length <= 3) return '***';
  return value.slice(0, 3) + '***';
}
