/**
 * Environment Configuration Reader
 * Reads from .env file and provides typed config object.
 * Never hardcode credentials or URLs in test code!
 */

import * as dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export interface EnvConfig {
  baseUrl: string;
  username: string;
  password: string;
  defaultTimeout: number;
  navigationTimeout: number;
}

/**
 * Singleton config object — import this in fixtures and tests
 */
export const ENV: EnvConfig = {
  baseUrl: requireEnv('BASE_URL', 'http://localhost:3000'),
  username: requireEnv('TEST_USERNAME', 'admin@example.com'),
  password: requireEnv('TEST_PASSWORD', 'changeme'),
  defaultTimeout: parseInt(process.env['DEFAULT_TIMEOUT'] ?? '60000', 10),
  navigationTimeout: parseInt(process.env['NAVIGATION_TIMEOUT'] ?? '30000', 10),
};
