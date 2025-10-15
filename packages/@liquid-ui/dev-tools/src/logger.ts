/**
 * Enhanced logger for development
 */

export class Logger {
  private enabled = __DEV__;

  log(...args: unknown[]): void {
    if (this.enabled) {
      console.log('[Liquid UI]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.enabled) {
      console.warn('[Liquid UI]', ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.enabled) {
      console.error('[Liquid UI]', ...args);
    }
  }
}

declare const __DEV__: boolean;
