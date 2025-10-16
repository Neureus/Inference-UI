/**
 * API Types and Interfaces
 * Platform-agnostic types for the API layer
 */

// Database Abstraction
export interface DatabaseAdapter {
  // User operations
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: CreateUserInput): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Flow operations
  getFlows(userId: string, limit: number, offset: number): Promise<Flow[]>;
  getFlowById(id: string): Promise<Flow | null>;
  createFlow(userId: string, input: CreateFlowInput): Promise<Flow>;
  updateFlow(id: string, userId: string, input: UpdateFlowInput): Promise<Flow>;
  deleteFlow(id: string, userId: string): Promise<boolean>;

  // Event operations
  createEvent(event: EventRecord): Promise<void>;
  getEvents(userId: string, limit: number, offset: number): Promise<EventRecord[]>;

  // Analytics operations
  getFlowAnalytics(flowId: string, timeRange: TimeRange): Promise<FlowAnalytics>;
  getUserUsage(userId: string): Promise<Usage>;
}

// Storage Abstraction (for R2/S3/etc)
export interface StorageAdapter {
  put(key: string, value: ArrayBuffer | ReadableStream): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

// Cache Abstraction (for KV/Redis/etc)
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Analytics Abstraction (for Analytics Engine/ClickHouse/etc)
export interface AnalyticsAdapter {
  writeDataPoint(data: AnalyticsDataPoint): Promise<void>;
  query(query: string): Promise<any>;
}

// AI Abstraction (for Workers AI/OpenAI/etc)
export interface AIAdapter {
  run(model: string, options: AIOptions): Promise<AIResult>;
}

// Context for GraphQL resolvers
export interface APIContext {
  database: DatabaseAdapter;
  storage?: StorageAdapter;
  cache?: CacheAdapter;
  analytics?: AnalyticsAdapter;
  ai?: AIAdapter;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
}

// Domain Models
export interface User {
  id: string;
  email: string;
  tier: UserTier;
  stripeCustomerId?: string;
  createdAt: number;
  updatedAt: number;
}

export enum UserTier {
  FREE = 'free',
  DEVELOPER = 'developer',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

export interface Flow {
  id: string;
  userId: string;
  name: string;
  steps: FlowStep[];
  aiConfig?: AIConfig;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FlowStep {
  id: string;
  component: string;
  props?: Record<string, unknown>;
  next?: string;
}

export interface AIConfig {
  enabled: boolean;
  models: string[];
  features: string[];
}

export interface EventRecord {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  component?: string;
  properties?: Record<string, unknown>;
  intent?: string;
  sentiment?: string;
  timestamp: number;
}

export interface FlowAnalytics {
  flowId: string;
  completionRate: number;
  averageDuration: number;
  dropoffPoints: DropoffPoint[];
  totalSessions: number;
}

export interface DropoffPoint {
  stepId: string;
  stepName: string;
  dropoffRate: number;
}

export interface Usage {
  eventsThisMonth: number;
  flowsCount: number;
  aiRequestsThisMonth: number;
}

// Input Types
export interface CreateUserInput {
  email: string;
  tier?: UserTier;
  stripeCustomerId?: string;
}

export interface CreateFlowInput {
  name: string;
  steps: FlowStep[];
  aiConfig?: AIConfig;
}

export interface UpdateFlowInput {
  name?: string;
  steps?: FlowStep[];
  aiConfig?: AIConfig;
}

export interface EventInput {
  event: string;
  component?: string;
  properties?: Record<string, unknown>;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface AnalyticsDataPoint {
  indexes: string[];
  blobs: string[];
  doubles: number[];
}

export interface AIOptions {
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResult {
  response?: string;
  text?: string;
  [key: string]: unknown;
}
