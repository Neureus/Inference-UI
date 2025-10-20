/**
 * Flow types
 */

export interface FlowStep {
  id: string;
  component: string;
  props?: Record<string, unknown>;
  next?: string | ((data: Record<string, unknown>) => string);
}

export interface Flow {
  id: string;
  name: string;
  steps: FlowStep[];
  initialStep: string;
}
