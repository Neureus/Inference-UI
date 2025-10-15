/**
 * Flow execution engine
 */

import type { Flow, FlowStep } from './types';

export class FlowEngine {
  private currentStep?: FlowStep;

  start(flow: Flow): void {
    // TODO: Start flow execution
    const initialStep = flow.steps.find((s) => s.id === flow.initialStep);
    this.currentStep = initialStep;
  }

  next(data?: Record<string, unknown>): void {
    // TODO: Move to next step
  }

  back(): void {
    // TODO: Go back to previous step
  }
}
