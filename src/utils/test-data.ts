/**
 * Test Data Generator
 * Generates unique, traceable test data using timestamps.
 * All generated data is deterministic and traceable for debugging.
 *
 * Format: <prefix>_<timestamp>
 * Example: auto_user_1712049200
 */

export class TestDataGenerator {
  /**
   * Returns current epoch timestamp (seconds)
   */
  static timestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Generates a unique email address
   * @param prefix - Optional prefix (default: 'auto')
   * @example auto_1712049200@test.local
   */
  static email(prefix: string = 'auto'): string {
    return `${prefix}_${this.timestamp()}@test.local`;
  }

  /**
   * Generates a unique username
   * @param prefix - Optional prefix (default: 'user')
   * @example user_1712049200
   */
  static username(prefix: string = 'user'): string {
    return `${prefix}_${this.timestamp()}`;
  }

  /**
   * Generates a unique phone number (VN format)
   * @example 0901712049
   */
  static phone(): string {
    const ts = this.timestamp().toString().slice(-7);
    return `090${ts}`;
  }

  /**
   * Generates a unique ID / code
   * @param prefix - Module prefix (default: 'TC')
   * @example TC_1712049200
   */
  static id(prefix: string = 'TC'): string {
    return `${prefix}_${this.timestamp()}`;
  }

  /**
   * Generates a random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random string of given length
   */
  static randomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /**
   * Generates a full name for testing
   */
  static fullName(): string {
    const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang'];
    const lastNames = ['An', 'Binh', 'Cuong', 'Dung', 'Em'];
    return `${firstNames[this.randomInt(0, 4)]} ${lastNames[this.randomInt(0, 4)]}`;
  }

  /**
   * Returns current date in YYYY-MM-DD format
   */
  static today(): string {
    return new Date().toISOString().split('T')[0]!;
  }

  /**
   * Returns a future date offset by n days
   */
  static futureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]!;
  }
}
