/**
 * Enhanced logger for development
 */

export class Logger {
  private enabled = __DEV__;

  log(...args: unknown[]): void {
    if (this.enabled) {
      console.log('[Velvet]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.enabled) {
      console.warn('[Velvet]', ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.enabled) {
      console.error('[Velvet]', ...args);
    }
  }
}

declare const __DEV__: boolean;
