/**
 * Cloudflare D1 Database Adapter
 * Implements DatabaseAdapter interface for D1
 */

import type {
  DatabaseAdapter,
  User,
  CreateUserInput,
  Flow,
  CreateFlowInput,
  UpdateFlowInput,
  EventRecord,
  FlowAnalytics,
  TimeRange,
  Usage,
} from '@inference-ui/api';

export class D1DatabaseAdapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!result) {
      return null;
    }

    return this.mapUser(result);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!result) {
      return null;
    }

    return this.mapUser(result);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO users (id, email, tier, stripe_customer_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        input.email,
        input.tier || 'free',
        input.stripeCustomerId || null,
        now,
        now
      )
      .run();

    const tier = input.tier || 'free';
    return {
      id,
      email: input.email,
      tier: tier as any,
      stripeCustomerId: input.stripeCustomerId,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const now = Math.floor(Date.now() / 1000);
    const sets: string[] = [];
    const values: any[] = [];

    if (updates.email !== undefined) {
      sets.push('email = ?');
      values.push(updates.email);
    }
    if (updates.tier !== undefined) {
      sets.push('tier = ?');
      values.push(updates.tier);
    }
    if (updates.stripeCustomerId !== undefined) {
      sets.push('stripe_customer_id = ?');
      values.push(updates.stripeCustomerId);
    }

    sets.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db
      .prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found after update');
    }

    return user;
  }

  async getFlows(userId: string, limit: number, offset: number): Promise<Flow[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM flows WHERE user_id = ? AND active = 1
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .bind(userId, limit, offset)
      .all();

    return result.results.map((row: any) => this.mapFlow(row));
  }

  async getFlowById(id: string): Promise<Flow | null> {
    const result = await this.db
      .prepare('SELECT * FROM flows WHERE id = ?')
      .bind(id)
      .first();

    if (!result) {
      return null;
    }

    return this.mapFlow(result);
  }

  async createFlow(userId: string, input: CreateFlowInput): Promise<Flow> {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO flows (id, user_id, name, steps, ai_config, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId,
        input.name,
        JSON.stringify(input.steps),
        input.aiConfig ? JSON.stringify(input.aiConfig) : null,
        now,
        now
      )
      .run();

    return {
      id,
      userId,
      name: input.name,
      steps: input.steps,
      aiConfig: input.aiConfig,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateFlow(id: string, userId: string, input: UpdateFlowInput): Promise<Flow> {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }

    if (input.steps !== undefined) {
      updates.push('steps = ?');
      values.push(JSON.stringify(input.steps));
    }

    if (input.aiConfig !== undefined) {
      updates.push('ai_config = ?');
      values.push(JSON.stringify(input.aiConfig));
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    values.push(userId);

    await this.db
      .prepare(`UPDATE flows SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`)
      .bind(...values)
      .run();

    const flow = await this.getFlowById(id);
    if (!flow) {
      throw new Error('Flow not found');
    }

    return flow;
  }

  async deleteFlow(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE flows SET active = 0 WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .run();

    return result.meta.changes > 0;
  }

  async createEvent(event: EventRecord): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO events (id, user_id, session_id, event, component, properties, intent, sentiment, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        event.id,
        event.userId || null,
        event.sessionId,
        event.event,
        event.component || null,
        JSON.stringify(event.properties || {}),
        event.intent || null,
        event.sentiment || null,
        event.timestamp
      )
      .run();
  }

  async getEvents(userId: string, limit: number, offset: number): Promise<EventRecord[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM events WHERE user_id = ?
         ORDER BY timestamp DESC LIMIT ? OFFSET ?`
      )
      .bind(userId, limit, offset)
      .all();

    return result.results.map((row: any) => this.mapEvent(row));
  }

  async getFlowAnalytics(flowId: string, _timeRange: TimeRange): Promise<FlowAnalytics> {
    // TODO: Implement actual analytics queries
    return {
      flowId,
      completionRate: 0.75,
      averageDuration: 120000,
      dropoffPoints: [],
      totalSessions: 0,
    };
  }

  async getUserUsage(userId: string): Promise<Usage> {
    // Count events this month
    const startOfMonth = Math.floor(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000
    );

    const eventsResult = await this.db
      .prepare('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND created_at >= ?')
      .bind(userId, startOfMonth)
      .first();

    const flowsResult = await this.db
      .prepare('SELECT COUNT(*) as count FROM flows WHERE user_id = ? AND active = 1')
      .bind(userId)
      .first();

    return {
      eventsThisMonth: (eventsResult as any)?.count || 0,
      flowsCount: (flowsResult as any)?.count || 0,
      aiRequestsThisMonth: 0, // TODO: Track AI requests
    };
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      tier: row.tier,
      stripeCustomerId: row.stripe_customer_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapFlow(row: any): Flow {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      steps: JSON.parse(row.steps),
      aiConfig: row.ai_config ? JSON.parse(row.ai_config) : undefined,
      active: row.active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapEvent(row: any): EventRecord {
    return {
      id: row.id,
      userId: row.user_id || undefined,
      sessionId: row.session_id,
      event: row.event,
      component: row.component || undefined,
      properties: row.properties ? JSON.parse(row.properties) : undefined,
      intent: row.intent || undefined,
      sentiment: row.sentiment || undefined,
      timestamp: row.timestamp,
    };
  }
}
