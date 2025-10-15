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
    console.log('Flow started:', this.currentStep?.id);
  }

  next(_data?: Record<string, unknown>): void {
    // TODO: Move to next step
    console.log('Moving to next step from:', this.currentStep?.id);
  }

  back(): void {
    // TODO: Go back to previous step
    console.log('Going back from:', this.currentStep?.id);
  }
}
