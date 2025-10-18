/**
 * Funnel Analysis Service
 * Tracks conversion funnels and identifies drop-off points
 */

import { D1DatabaseAdapter } from '../adapters/d1-database';
import { CacheAdapter } from '@inference-ui/api';

export interface FunnelStep {
  id: string;
  name: string;
  event?: string;      // Event name to track
  component?: string;  // Component to track
  orderIndex: number;
}

export interface FunnelDefinition {
  id: string;
  name: string;
  description?: string;
  steps: FunnelStep[];
  flowId?: string;     // Link to a specific flow (optional)
  createdAt: string;
  updatedAt: string;
}

export interface FunnelStepAnalysis {
  stepId: string;
  stepName: string;
  orderIndex: number;
  totalUsers: number;
  conversionFromPrevious: number;  // Percentage (0-100)
  conversionFromStart: number;     // Percentage (0-100)
  dropoffCount: number;
  dropoffRate: number;             // Percentage (0-100)
  averageTimeFromPrevious: number; // Milliseconds
  averageTimeFromStart: number;    // Milliseconds
}

export interface FunnelAnalysisResult {
  funnelId: string;
  funnelName: string;
  timeRange: { start: string; end: string };
  totalEntered: number;
  totalCompleted: number;
  overallConversion: number;       // Percentage (0-100)
  averageCompletionTime: number;   // Milliseconds
  steps: FunnelStepAnalysis[];
  bottleneckStepId?: string;       // Step with highest drop-off
}

export interface TimeRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export class FunnelAnalyzer {
  constructor(
    private database: D1DatabaseAdapter,
    private cache?: CacheAdapter
  ) {}

  /**
   * Create a new funnel definition
   */
  async createFunnel(
    userId: string,
    name: string,
    steps: Omit<FunnelStep, 'id'>[],
    options?: {
      description?: string;
      flowId?: string;
    }
  ): Promise<FunnelDefinition> {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Assign IDs to steps
    const stepsWithIds: FunnelStep[] = steps.map((step, index) => ({
      ...step,
      id: crypto.randomUUID(),
      orderIndex: index,
    }));

    await this.database['db']
      .prepare(
        `INSERT INTO funnels (id, user_id, name, description, steps, flow_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId,
        name,
        options?.description || null,
        JSON.stringify(stepsWithIds),
        options?.flowId || null,
        now,
        now
      )
      .run();

    return {
      id,
      name,
      description: options?.description,
      steps: stepsWithIds,
      flowId: options?.flowId,
      createdAt: new Date(now * 1000).toISOString(),
      updatedAt: new Date(now * 1000).toISOString(),
    };
  }

  /**
   * Get funnel definition by ID
   */
  async getFunnel(funnelId: string): Promise<FunnelDefinition | null> {
    const result = await this.database['db']
      .prepare(`SELECT * FROM funnels WHERE id = ?`)
      .bind(funnelId)
      .first();

    if (!result) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      description: result.description as string | undefined,
      steps: JSON.parse(result.steps as string),
      flowId: result.flow_id as string | undefined,
      createdAt: new Date((result.created_at as number) * 1000).toISOString(),
      updatedAt: new Date((result.updated_at as number) * 1000).toISOString(),
    };
  }

  /**
   * Get all funnels for a user
   */
  async getUserFunnels(userId: string): Promise<FunnelDefinition[]> {
    const result = await this.database['db']
      .prepare(`SELECT * FROM funnels WHERE user_id = ? ORDER BY created_at DESC`)
      .bind(userId)
      .all();

    return (result.results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps),
      flowId: row.flow_id,
      createdAt: new Date(row.created_at * 1000).toISOString(),
      updatedAt: new Date(row.updated_at * 1000).toISOString(),
    }));
  }

  /**
   * Analyze a funnel for a given time range
   */
  async analyzeFunnel(
    funnelId: string,
    timeRange: TimeRange
  ): Promise<FunnelAnalysisResult> {
    const cacheKey = `funnel:${funnelId}:${timeRange.start}:${timeRange.end}`;

    // Check cache
    if (this.cache) {
      const cached = await this.cache.get<FunnelAnalysisResult>(cacheKey);
      if (cached) return cached;
    }

    const funnel = await this.getFunnel(funnelId);
    if (!funnel) {
      throw new Error('Funnel not found');
    }

    const startTs = Math.floor(new Date(timeRange.start).getTime() / 1000);
    const endTs = Math.floor(new Date(timeRange.end).getTime() / 1000);

    const steps = funnel.steps.sort((a, b) => a.orderIndex - b.orderIndex);
    const stepAnalyses: FunnelStepAnalysis[] = [];

    // Get users who entered the funnel (completed first step)
    const firstStep = steps[0];
    const enteredUsersResult = await this.database['db']
      .prepare(
        `SELECT DISTINCT user_id, MIN(timestamp) as entry_time
         FROM events
         WHERE ${this.buildStepCondition(firstStep)}
         AND timestamp >= ? AND timestamp <= ?
         GROUP BY user_id`
      )
      .bind(startTs * 1000, endTs * 1000)
      .all();

    const totalEntered = enteredUsersResult.results?.length || 0;
    const enteredUsers = new Map<string, number>(
      (enteredUsersResult.results || []).map((row: any) => [
        row.user_id,
        row.entry_time,
      ])
    );

    // Analyze each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const prevStep = i > 0 ? steps[i - 1] : null;

      // Get users who completed this step
      const stepUsersResult = await this.database['db']
        .prepare(
          `SELECT DISTINCT user_id, MIN(timestamp) as step_time
           FROM events
           WHERE ${this.buildStepCondition(step)}
           AND timestamp >= ? AND timestamp <= ?
           GROUP BY user_id`
        )
        .bind(startTs * 1000, endTs * 1000)
        .all();

      const stepUsers = new Map<string, number>(
        (stepUsersResult.results || []).map((row: any) => [
          row.user_id,
          row.step_time,
        ])
      );

      const totalUsers = stepUsers.size;
      const conversionFromStart =
        totalEntered > 0 ? (totalUsers / totalEntered) * 100 : 0;

      // Calculate conversion from previous step
      let conversionFromPrevious = 100;
      let averageTimeFromPrevious = 0;

      if (prevStep) {
        const prevStepUsersResult = await this.database['db']
          .prepare(
            `SELECT DISTINCT user_id, MIN(timestamp) as step_time
             FROM events
             WHERE ${this.buildStepCondition(prevStep)}
             AND timestamp >= ? AND timestamp <= ?
             GROUP BY user_id`
          )
          .bind(startTs * 1000, endTs * 1000)
          .all();

        const prevStepUsers = new Map<string, number>(
          (prevStepUsersResult.results || []).map((row: any) => [
            row.user_id,
            row.step_time,
          ])
        );

        const prevTotal = prevStepUsers.size;
        conversionFromPrevious = prevTotal > 0 ? (totalUsers / prevTotal) * 100 : 0;

        // Calculate average time from previous step
        const times: number[] = [];
        for (const [userId, stepTime] of stepUsers.entries()) {
          const prevTime = prevStepUsers.get(userId);
          if (prevTime) {
            times.push(stepTime - prevTime);
          }
        }
        averageTimeFromPrevious =
          times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      }

      // Calculate average time from start
      const timesFromStart: number[] = [];
      for (const [userId, stepTime] of stepUsers.entries()) {
        const entryTime = enteredUsers.get(userId);
        if (entryTime) {
          timesFromStart.push(stepTime - entryTime);
        }
      }
      const averageTimeFromStart =
        timesFromStart.length > 0
          ? timesFromStart.reduce((a, b) => a + b, 0) / timesFromStart.length
          : 0;

      // Calculate dropoff
      const dropoffCount = i === 0 ? 0 : totalEntered - totalUsers;
      const dropoffRate =
        i === 0 ? 0 : totalEntered > 0 ? (dropoffCount / totalEntered) * 100 : 0;

      stepAnalyses.push({
        stepId: step.id,
        stepName: step.name,
        orderIndex: step.orderIndex,
        totalUsers,
        conversionFromPrevious,
        conversionFromStart,
        dropoffCount,
        dropoffRate,
        averageTimeFromPrevious,
        averageTimeFromStart,
      });
    }

    // Find bottleneck (step with highest drop-off rate)
    const bottleneck = stepAnalyses.reduce((max, step) =>
      step.dropoffRate > max.dropoffRate ? step : max
    );

    // Calculate completed count (users who finished all steps)
    const lastStep = steps[steps.length - 1];
    const completedResult = await this.database['db']
      .prepare(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM events
         WHERE ${this.buildStepCondition(lastStep)}
         AND timestamp >= ? AND timestamp <= ?`
      )
      .bind(startTs * 1000, endTs * 1000)
      .first();

    const totalCompleted = (completedResult as any)?.count || 0;
    const overallConversion =
      totalEntered > 0 ? (totalCompleted / totalEntered) * 100 : 0;

    // Calculate average completion time
    const completedUsersResult = await this.database['db']
      .prepare(
        `SELECT user_id, MIN(timestamp) as completion_time
         FROM events
         WHERE ${this.buildStepCondition(lastStep)}
         AND timestamp >= ? AND timestamp <= ?
         GROUP BY user_id`
      )
      .bind(startTs * 1000, endTs * 1000)
      .all();

    const completionTimes: number[] = [];
    for (const row of completedUsersResult.results || []) {
      const userId = (row as any).user_id;
      const completionTime = (row as any).completion_time;
      const entryTime = enteredUsers.get(userId);
      if (entryTime) {
        completionTimes.push(completionTime - entryTime);
      }
    }

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    const result: FunnelAnalysisResult = {
      funnelId,
      funnelName: funnel.name,
      timeRange,
      totalEntered,
      totalCompleted,
      overallConversion,
      averageCompletionTime,
      steps: stepAnalyses,
      bottleneckStepId: bottleneck.dropoffRate > 0 ? bottleneck.stepId : undefined,
    };

    // Cache for 10 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, result, 600);
    }

    return result;
  }

  /**
   * Get quick funnel insights without full analysis
   */
  async getFunnelInsights(funnelId: string, timeRange: TimeRange) {
    const analysis = await this.analyzeFunnel(funnelId, timeRange);

    return {
      conversionRate: analysis.overallConversion,
      dropoffRate: 100 - analysis.overallConversion,
      bottleneckStep: analysis.steps.find(
        (s) => s.stepId === analysis.bottleneckStepId
      )?.stepName,
      averageTime: analysis.averageCompletionTime,
      totalUsers: analysis.totalEntered,
    };
  }

  /**
   * Delete a funnel
   */
  async deleteFunnel(funnelId: string, userId: string): Promise<boolean> {
    const result = await this.database['db']
      .prepare(`DELETE FROM funnels WHERE id = ? AND user_id = ?`)
      .bind(funnelId, userId)
      .run();

    // Clear cache
    if (this.cache) {
      // Note: This is a simplified cache invalidation
      // In production, you'd want a more sophisticated strategy
      await this.cache.delete(`funnel:${funnelId}:*`);
    }

    return (result.meta?.changes || 0) > 0;
  }

  /**
   * Build SQL condition for a funnel step
   */
  private buildStepCondition(step: FunnelStep): string {
    const conditions: string[] = [];

    if (step.event) {
      conditions.push(`event = '${step.event}'`);
    }

    if (step.component) {
      conditions.push(`component = '${step.component}'`);
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }
}
