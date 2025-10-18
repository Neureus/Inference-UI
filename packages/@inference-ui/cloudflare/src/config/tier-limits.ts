/**
 * Tier Limits Configuration
 * Defines usage limits for each subscription tier
 */

import { UserTier } from '@inference-ui/api';

export interface TierLimits {
  eventsPerMonth: number;
  maxFlows: number;
  aiRequestsPerMonth: number;
  maxDashboards: number;
  dataRetentionDays: number;
  analyticsFeatures: {
    basicMetrics: boolean;
    advancedAnalytics: boolean;
    aiInsights: boolean;
    customDashboards: boolean;
    dataExport: boolean;
    realTimeAnalytics: boolean;
  };
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  [UserTier.FREE]: {
    eventsPerMonth: 1000,
    maxFlows: 10,
    aiRequestsPerMonth: 100,
    maxDashboards: 1,
    dataRetentionDays: 7,
    analyticsFeatures: {
      basicMetrics: true,
      advancedAnalytics: false,
      aiInsights: false,
      customDashboards: false,
      dataExport: false,
      realTimeAnalytics: false,
    },
  },
  [UserTier.DEVELOPER]: {
    eventsPerMonth: 50000,
    maxFlows: 100,
    aiRequestsPerMonth: 5000,
    maxDashboards: 5,
    dataRetentionDays: 90,
    analyticsFeatures: {
      basicMetrics: true,
      advancedAnalytics: true,
      aiInsights: false,
      customDashboards: true,
      dataExport: true,
      realTimeAnalytics: true,
    },
  },
  [UserTier.BUSINESS]: {
    eventsPerMonth: -1, // Unlimited
    maxFlows: 500,
    aiRequestsPerMonth: 50000,
    maxDashboards: 25,
    dataRetentionDays: 365,
    analyticsFeatures: {
      basicMetrics: true,
      advancedAnalytics: true,
      aiInsights: true,
      customDashboards: true,
      dataExport: true,
      realTimeAnalytics: true,
    },
  },
  [UserTier.ENTERPRISE]: {
    eventsPerMonth: -1, // Unlimited
    maxFlows: -1, // Unlimited
    aiRequestsPerMonth: -1, // Unlimited
    maxDashboards: -1, // Unlimited
    dataRetentionDays: -1, // Unlimited (custom retention)
    analyticsFeatures: {
      basicMetrics: true,
      advancedAnalytics: true,
      aiInsights: true,
      customDashboards: true,
      dataExport: true,
      realTimeAnalytics: true,
    },
  },
};

/**
 * Get tier limits for a user tier
 */
export function getTierLimits(tier: UserTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if usage is within tier limits
 */
export function isWithinLimit(current: number, limit: number): boolean {
  // -1 means unlimited
  if (limit === -1) return true;
  return current < limit;
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(current: number, limit: number): number {
  if (limit === -1) return 0; // Unlimited
  return Math.min(100, (current / limit) * 100);
}

/**
 * Get warning level for usage
 */
export function getWarningLevel(
  current: number,
  limit: number
): 'ok' | 'warning' | 'critical' | 'exceeded' {
  if (limit === -1) return 'ok'; // Unlimited

  const percentage = getUsagePercentage(current, limit);

  if (current >= limit) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'ok';
}
