/**
 * Logger Utility
 * Structured logging for automation tests.
 * Use this instead of console.log() to maintain consistent log format.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, context: string, message: string): string {
  return `[${timestamp()}] [${level}] [${context}] ${message}`;
}

export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string): void {
    if (process.env['LOG_LEVEL'] === 'DEBUG') {
      process.stdout.write(formatMessage(LogLevel.DEBUG, this.context, message) + '\n');
    }
  }

  info(message: string): void {
    process.stdout.write(formatMessage(LogLevel.INFO, this.context, message) + '\n');
  }

  warn(message: string): void {
    process.stdout.write(formatMessage(LogLevel.WARN, this.context, message) + '\n');
  }

  error(message: string, error?: Error): void {
    const errorDetail = error ? ` | ${error.message}` : '';
    process.stderr.write(formatMessage(LogLevel.ERROR, this.context, message + errorDetail) + '\n');
  }

  action(action: string, locator: string): void {
    this.info(`Action: ${action} | Target: ${locator}`);
  }

  navigation(url: string): void {
    this.info(`Navigating to: ${url}`);
  }
}
