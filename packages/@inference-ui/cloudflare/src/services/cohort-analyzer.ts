/**
 * Cohort Analysis Service
 * User segmentation and retention analysis
 */

import { D1DatabaseAdapter } from '../adapters/d1-database';
import { CacheAdapter } from '@inference-ui/api';

export interface CohortDefinition {
  id: string;
  name: string;
  description?: string;
  criteria: CohortCriteria;
  createdAt: string;
  updatedAt: string;
}

export interface CohortCriteria {
  type: 'signup_date' | 'first_event' | 'custom';
  startDate?: string;    // ISO 8601
  endDate?: string;      // ISO 8601
  event?: string;        // For first_event cohorts
  component?: string;    // For event-based cohorts
  properties?: Record<string, any>; // Custom properties
}

export interface CohortSize {
  total: number;
  active: number;  // Active in the current period
  inactive: number;
}

export interface RetentionPeriod {
  periodIndex: number;    // 0 = cohort period, 1 = next period, etc.
  periodLabel: string;    // "Week 0", "Week 1", etc.
  retained: number;       // Count of users retained
  retentionRate: number;  // Percentage (0-100)
  churnedCount: number;
  churnRate: number;      // Percentage (0-100)
}

export interface CohortRetentionAnalysis {
  cohortId: string;
  cohortName: string;
  cohortSize: number;
  periodType: 'day' | 'week' | 'month';
  startDate: string;
  periods: RetentionPeriod[];
  averageRetention: number; // Average retention rate across all periods
  lifetimeValue?: number;   // If LTV data is available
}

export interface CohortComparison {
  cohorts: Array<{
    id: string;
    name: string;
    size: number;
    retentionRate: number; // Average retention
    churnRate: number;     // Average churn
  }>;
  bestPerforming: string;  // Cohort ID with best retention
  worstPerforming: string; // Cohort ID with worst retention
}

export interface TimeRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export class CohortAnalyzer {
  constructor(
    private database: D1DatabaseAdapter,
    private cache?: CacheAdapter
  ) {}

  /**
   * Create a new cohort definition
   */
  async createCohort(
    userId: string,
    name: string,
    criteria: CohortCriteria,
    description?: string
  ): Promise<CohortDefinition> {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await this.database['db']
      .prepare(
        `INSERT INTO cohorts (id, user_id, name, description, criteria, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId,
        name,
        description || null,
        JSON.stringify(criteria),
        now,
        now
      )
      .run();

    return {
      id,
      name,
      description,
      criteria,
      createdAt: new Date(now * 1000).toISOString(),
      updatedAt: new Date(now * 1000).toISOString(),
    };
  }

  /**
   * Get cohort definition by ID
   */
  async getCohort(cohortId: string): Promise<CohortDefinition | null> {
    const result = await this.database['db']
      .prepare(`SELECT * FROM cohorts WHERE id = ?`)
      .bind(cohortId)
      .first();

    if (!result) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      description: result.description as string | undefined,
      criteria: JSON.parse(result.criteria as string),
      createdAt: new Date((result.created_at as number) * 1000).toISOString(),
      updatedAt: new Date((result.updated_at as number) * 1000).toISOString(),
    };
  }

  /**
   * Get all cohorts for a user
   */
  async getUserCohorts(userId: string): Promise<CohortDefinition[]> {
    const result = await this.database['db']
      .prepare(`SELECT * FROM cohorts WHERE user_id = ? ORDER BY created_at DESC`)
      .bind(userId)
      .all();

    return (result.results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      criteria: JSON.parse(row.criteria),
      createdAt: new Date(row.created_at * 1000).toISOString(),
      updatedAt: new Date(row.updated_at * 1000).toISOString(),
    }));
  }

  /**
   * Get cohort size (total users in cohort)
   */
  async getCohortSize(
    cohortId: string,
    timeRange?: TimeRange
  ): Promise<CohortSize> {
    const cohort = await this.getCohort(cohortId);
    if (!cohort) {
      throw new Error('Cohort not found');
    }

    const { criteria } = cohort;
    const usersInCohort = await this.getUsersInCohort(criteria, timeRange);

    // Get active users (users with events in the last 30 days)
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const activeResult = await this.database['db']
      .prepare(
        `SELECT COUNT(DISTINCT user_id) as count FROM events
         WHERE user_id IN (${usersInCohort.map(() => '?').join(',')})
         AND timestamp >= ?`
      )
      .bind(...usersInCohort, thirtyDaysAgo * 1000)
      .first();

    const active = (activeResult as any)?.count || 0;
    const total = usersInCohort.length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }

  /**
   * Analyze cohort retention over time
   */
  async analyzeRetention(
    cohortId: string,
    periodType: 'day' | 'week' | 'month' = 'week',
    maxPeriods: number = 12
  ): Promise<CohortRetentionAnalysis> {
    const cacheKey = `cohort-retention:${cohortId}:${periodType}:${maxPeriods}`;

    // Check cache
    if (this.cache) {
      const cached = await this.cache.get<CohortRetentionAnalysis>(cacheKey);
      if (cached) return cached;
    }

    const cohort = await this.getCohort(cohortId);
    if (!cohort) {
      throw new Error('Cohort not found');
    }

    const { criteria } = cohort;
    const usersInCohort = await this.getUsersInCohort(criteria);
    const cohortSize = usersInCohort.length;

    if (cohortSize === 0) {
      return {
        cohortId,
        cohortName: cohort.name,
        cohortSize: 0,
        periodType,
        startDate: criteria.startDate || new Date().toISOString(),
        periods: [],
        averageRetention: 0,
      };
    }

    // Get cohort start date (earliest user signup or event)
    const startDate = await this.getCohortStartDate(criteria, usersInCohort);
    const periods: RetentionPeriod[] = [];

    // Analyze each period
    for (let i = 0; i < maxPeriods; i++) {
      const periodStart = this.getPeriodStart(startDate, periodType, i);
      const periodEnd = this.getPeriodEnd(periodStart, periodType);

      // Count users with events in this period
      const retainedResult = await this.database['db']
        .prepare(
          `SELECT COUNT(DISTINCT user_id) as count FROM events
           WHERE user_id IN (${usersInCohort.map(() => '?').join(',')})
           AND timestamp >= ? AND timestamp < ?`
        )
        .bind(...usersInCohort, periodStart, periodEnd)
        .first();

      const retained = (retainedResult as any)?.count || 0;
      const retentionRate = cohortSize > 0 ? (retained / cohortSize) * 100 : 0;
      const churnedCount = cohortSize - retained;
      const churnRate = cohortSize > 0 ? (churnedCount / cohortSize) * 100 : 0;

      periods.push({
        periodIndex: i,
        periodLabel: this.getPeriodLabel(periodType, i),
        retained,
        retentionRate,
        churnedCount,
        churnRate,
      });
    }

    // Calculate average retention across all periods
    const averageRetention =
      periods.length > 0
        ? periods.reduce((sum, p) => sum + p.retentionRate, 0) / periods.length
        : 0;

    const result: CohortRetentionAnalysis = {
      cohortId,
      cohortName: cohort.name,
      cohortSize,
      periodType,
      startDate: new Date(startDate).toISOString(),
      periods,
      averageRetention,
    };

    // Cache for 1 hour
    if (this.cache) {
      await this.cache.set(cacheKey, result, 3600);
    }

    return result;
  }

  /**
   * Compare multiple cohorts
   */
  async compareCohorts(
    cohortIds: string[],
    periodType: 'day' | 'week' | 'month' = 'week'
  ): Promise<CohortComparison> {
    const analyses = await Promise.all(
      cohortIds.map((id) => this.analyzeRetention(id, periodType, 12))
    );

    const cohorts = analyses.map((analysis) => ({
      id: analysis.cohortId,
      name: analysis.cohortName,
      size: analysis.cohortSize,
      retentionRate: analysis.averageRetention,
      churnRate: 100 - analysis.averageRetention,
    }));

    // Find best and worst performing cohorts
    const bestPerforming = cohorts.reduce((best, cohort) =>
      cohort.retentionRate > best.retentionRate ? cohort : best
    );

    const worstPerforming = cohorts.reduce((worst, cohort) =>
      cohort.retentionRate < worst.retentionRate ? cohort : worst
    );

    return {
      cohorts,
      bestPerforming: bestPerforming.id,
      worstPerforming: worstPerforming.id,
    };
  }

  /**
   * Delete a cohort
   */
  async deleteCohort(cohortId: string, userId: string): Promise<boolean> {
    const result = await this.database['db']
      .prepare(`DELETE FROM cohorts WHERE id = ? AND user_id = ?`)
      .bind(cohortId, userId)
      .run();

    // Clear cache
    if (this.cache) {
      await this.cache.delete(`cohort-retention:${cohortId}:*`);
    }

    return (result.meta?.changes || 0) > 0;
  }

  /**
   * Get users in a cohort based on criteria
   */
  private async getUsersInCohort(
    criteria: CohortCriteria,
    _timeRange?: TimeRange // Reserved for future time-based filtering
  ): Promise<string[]> {
    let query = '';
    let bindings: any[] = [];

    switch (criteria.type) {
      case 'signup_date':
        query = `SELECT id FROM users WHERE created_at >= ? AND created_at <= ?`;
        bindings = [
          Math.floor(new Date(criteria.startDate!).getTime() / 1000),
          Math.floor(new Date(criteria.endDate!).getTime() / 1000),
        ];
        break;

      case 'first_event':
        query = `
          SELECT DISTINCT user_id FROM events
          WHERE event = ?
          ${criteria.startDate ? 'AND timestamp >= ?' : ''}
          ${criteria.endDate ? 'AND timestamp <= ?' : ''}
        `;
        bindings = [criteria.event!];
        if (criteria.startDate) {
          bindings.push(Math.floor(new Date(criteria.startDate).getTime()));
        }
        if (criteria.endDate) {
          bindings.push(Math.floor(new Date(criteria.endDate).getTime()));
        }
        break;

      case 'custom':
        // Custom logic based on properties
        // For now, return all users (this would be extended based on requirements)
        query = `SELECT id FROM users`;
        break;
    }

    const result = await this.database['db']
      .prepare(query)
      .bind(...bindings)
      .all();

    return (result.results || []).map((row: any) => row.id || row.user_id);
  }

  /**
   * Get cohort start date
   */
  private async getCohortStartDate(
    criteria: CohortCriteria,
    users: string[]
  ): Promise<number> {
    if (criteria.startDate) {
      return new Date(criteria.startDate).getTime();
    }

    // Get earliest event/signup for users in cohort
    let query = '';
    let bindings: any[] = [];

    switch (criteria.type) {
      case 'signup_date':
        query = `SELECT MIN(created_at) as min_date FROM users WHERE id IN (${users.map(() => '?').join(',')})`;
        bindings = users;
        break;

      case 'first_event':
      case 'custom':
        query = `SELECT MIN(timestamp) as min_date FROM events WHERE user_id IN (${users.map(() => '?').join(',')})`;
        bindings = users;
        break;
    }

    const result = await this.database['db']
      .prepare(query)
      .bind(...bindings)
      .first();

    const minDate = (result as any)?.min_date;
    return minDate ? (typeof minDate === 'number' ? minDate * 1000 : minDate) : Date.now();
  }

  /**
   * Get period start timestamp
   */
  private getPeriodStart(
    cohortStart: number,
    periodType: 'day' | 'week' | 'month',
    periodIndex: number
  ): number {
    const date = new Date(cohortStart);

    switch (periodType) {
      case 'day':
        date.setDate(date.getDate() + periodIndex);
        break;
      case 'week':
        date.setDate(date.getDate() + periodIndex * 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() + periodIndex);
        break;
    }

    return date.getTime();
  }

  /**
   * Get period end timestamp
   */
  private getPeriodEnd(periodStart: number, periodType: 'day' | 'week' | 'month'): number {
    const date = new Date(periodStart);

    switch (periodType) {
      case 'day':
        date.setDate(date.getDate() + 1);
        break;
      case 'week':
        date.setDate(date.getDate() + 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
    }

    return date.getTime();
  }

  /**
   * Get period label
   */
  private getPeriodLabel(periodType: 'day' | 'week' | 'month', index: number): string {
    const typeLabel =
      periodType === 'day' ? 'Day' : periodType === 'week' ? 'Week' : 'Month';
    return `${typeLabel} ${index}`;
  }
}
