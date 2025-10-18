/**
 * Usage Tracking Middleware
 * Enforces tier limits and tracks usage across all operations
 */

import { D1DatabaseAdapter } from '../adapters/d1-database';

export interface UsageLimitError {
  error: string;
  code: 'USAGE_LIMIT_EXCEEDED';
  type: string;
  current: number;
  limit: number;
  tier: string;
  upgradeUrl?: string;
}

/**
 * Check and enforce event tracking limits
 */
export async function enforceEventLimit(
  database: D1DatabaseAdapter,
  userId: string | undefined
): Promise<void> {
  if (!userId) {
    // Allow anonymous events (they don't count against limits)
    return;
  }

  const check = await database.checkTierLimits(userId, 'events');

  if (!check.allowed) {
    const error: UsageLimitError = {
      error: check.message || 'Event limit exceeded',
      code: 'USAGE_LIMIT_EXCEEDED',
      type: 'events',
      current: check.current,
      limit: check.limit,
      tier: 'upgrade_required',
      upgradeUrl: '/upgrade', // TODO: Replace with actual upgrade URL
    };
    throw new Error(JSON.stringify(error));
  }
}

/**
 * Check and enforce AI request limits
 */
export async function enforceAILimit(
  database: D1DatabaseAdapter,
  userId: string
): Promise<void> {
  const check = await database.checkTierLimits(userId, 'ai_requests');

  if (!check.allowed) {
    const error: UsageLimitError = {
      error: check.message || 'AI request limit exceeded',
      code: 'USAGE_LIMIT_EXCEEDED',
      type: 'ai_requests',
      current: check.current,
      limit: check.limit,
      tier: 'upgrade_required',
      upgradeUrl: '/upgrade',
    };
    throw new Error(JSON.stringify(error));
  }
}

/**
 * Check and enforce flow creation limits
 */
export async function enforceFlowLimit(
  database: D1DatabaseAdapter,
  userId: string
): Promise<void> {
  const check = await database.checkTierLimits(userId, 'flows');

  if (!check.allowed) {
    const error: UsageLimitError = {
      error: check.message || 'Flow limit exceeded',
      code: 'USAGE_LIMIT_EXCEEDED',
      type: 'flows',
      current: check.current,
      limit: check.limit,
      tier: 'upgrade_required',
      upgradeUrl: '/upgrade',
    };
    throw new Error(JSON.stringify(error));
  }
}

/**
 * Track event usage after successful event creation
 */
export async function trackEventUsage(
  database: D1DatabaseAdapter,
  userId: string | undefined,
  count: number = 1
): Promise<void> {
  if (!userId) {
    // Don't track anonymous events in usage table
    return;
  }

  await database.incrementUsage(userId, 'events', count);
}

/**
 * Track AI request usage after successful AI operation
 */
export async function trackAIUsage(
  database: D1DatabaseAdapter,
  userId: string,
  count: number = 1
): Promise<void> {
  await database.incrementUsage(userId, 'ai_requests', count);
}

/**
 * Helper to parse usage limit errors
 */
export function isUsageLimitError(error: unknown): error is UsageLimitError {
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      return parsed.code === 'USAGE_LIMIT_EXCEEDED';
    } catch {
      return false;
    }
  }

  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      return parsed.code === 'USAGE_LIMIT_EXCEEDED';
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Parse usage limit error from error object
 */
export function parseUsageLimitError(error: unknown): UsageLimitError | null {
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed.code === 'USAGE_LIMIT_EXCEEDED') {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.code === 'USAGE_LIMIT_EXCEEDED') {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}
