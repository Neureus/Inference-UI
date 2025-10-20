/**
 * Core utilities for Velvet
 */

export function noop() {}

export function identity<T>(value: T): T {
  return value;
}
