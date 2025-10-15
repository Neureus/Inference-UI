/**
 * Event types
 */

export interface Event {
  id: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  event: string;
  component?: string;
  properties?: Record<string, unknown>;
}

export interface EventConfig {
  batchSize: number;
  batchInterval: number;
  endpoint: string;
}
