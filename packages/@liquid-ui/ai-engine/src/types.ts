/**
 * AI Engine types
 */

export interface AITask {
  type: 'classification' | 'validation' | 'autocomplete' | 'accessibility';
  input: unknown;
  requiresPrivacy?: boolean;
  isOffline?: boolean;
  needsUnder100ms?: boolean;
  needsAdvancedModel?: boolean;
  needsLatestData?: boolean;
}

export interface AIResult {
  output: unknown;
  confidence?: number;
  executedAt: 'local' | 'edge';
  latency: number;
}
