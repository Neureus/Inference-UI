/**
 * Flow execution engine
 * Manages step-by-step UX flows with navigation and state
 */

import type { Flow, FlowStep } from './types';

export class FlowEngine {
  private flow?: Flow;
  private currentStep?: FlowStep;
  private stepHistory: string[] = [];
  private flowData: Record<string, unknown> = {};
  private listeners: Array<(step: FlowStep | undefined) => void> = [];

  /**
   * Start a flow
   */
  start(flow: Flow, initialData?: Record<string, unknown>): void {
    this.flow = flow;
    this.flowData = initialData || {};
    this.stepHistory = [];

    const initialStep = flow.steps.find((s) => s.id === flow.initialStep);

    if (!initialStep) {
      throw new Error(`Initial step "${flow.initialStep}" not found in flow "${flow.name}"`);
    }

    this.currentStep = initialStep;
    this.stepHistory.push(initialStep.id);

    console.log(`[FlowEngine] Flow started: ${flow.name} (${initialStep.id})`);
    this.notifyListeners();
  }

  /**
   * Move to next step
   */
  next(data?: Record<string, unknown>): void {
    if (!this.currentStep) {
      throw new Error('No flow in progress');
    }

    // Merge step data into flow data
    if (data) {
      this.flowData = { ...this.flowData, ...data };
    }

    // Determine next step
    const nextStepId = this.getNextStepId(this.currentStep, this.flowData);

    if (!nextStepId) {
      console.log('[FlowEngine] Flow completed');
      this.complete();
      return;
    }

    const nextStep = this.flow?.steps.find((s) => s.id === nextStepId);

    if (!nextStep) {
      throw new Error(`Next step "${nextStepId}" not found in flow`);
    }

    this.currentStep = nextStep;
    this.stepHistory.push(nextStep.id);

    console.log(`[FlowEngine] Moving to step: ${nextStep.id}`);
    this.notifyListeners();
  }

  /**
   * Go back to previous step
   */
  back(): void {
    if (this.stepHistory.length <= 1) {
      console.warn('[FlowEngine] Already at first step, cannot go back');
      return;
    }

    // Remove current step
    this.stepHistory.pop();

    // Get previous step
    const previousStepId = this.stepHistory[this.stepHistory.length - 1];
    const previousStep = this.flow?.steps.find((s) => s.id === previousStepId);

    if (!previousStep) {
      throw new Error(`Previous step "${previousStepId}" not found`);
    }

    this.currentStep = previousStep;

    console.log(`[FlowEngine] Going back to step: ${previousStep.id}`);
    this.notifyListeners();
  }

  /**
   * Jump to specific step
   */
  jumpTo(stepId: string, clearHistory = false): void {
    const step = this.flow?.steps.find((s) => s.id === stepId);

    if (!step) {
      throw new Error(`Step "${stepId}" not found in flow`);
    }

    this.currentStep = step;

    if (clearHistory) {
      this.stepHistory = [stepId];
    } else {
      this.stepHistory.push(stepId);
    }

    console.log(`[FlowEngine] Jumped to step: ${stepId}`);
    this.notifyListeners();
  }

  /**
   * Complete the flow
   */
  complete(): void {
    console.log(`[FlowEngine] Flow completed: ${this.flow?.name}`);
    this.currentStep = undefined;
    this.notifyListeners();
  }

  /**
   * Cancel the flow
   */
  cancel(): void {
    console.log(`[FlowEngine] Flow cancelled: ${this.flow?.name}`);
    this.flow = undefined;
    this.currentStep = undefined;
    this.stepHistory = [];
    this.flowData = {};
    this.notifyListeners();
  }

  /**
   * Get current step
   */
  getCurrentStep(): FlowStep | undefined {
    return this.currentStep;
  }

  /**
   * Get flow data
   */
  getData(): Record<string, unknown> {
    return { ...this.flowData };
  }

  /**
   * Update flow data
   */
  setData(data: Record<string, unknown>): void {
    this.flowData = { ...this.flowData, ...data };
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.stepHistory.length > 1;
  }

  /**
   * Get step history
   */
  getHistory(): string[] {
    return [...this.stepHistory];
  }

  /**
   * Get current progress (0-100)
   */
  getProgress(): number {
    if (!this.flow || !this.currentStep) {
      return 0;
    }

    const currentIndex = this.flow.steps.findIndex((s) => s.id === this.currentStep?.id);
    return Math.round(((currentIndex + 1) / this.flow.steps.length) * 100);
  }

  /**
   * Subscribe to step changes
   */
  subscribe(listener: (step: FlowStep | undefined) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Determine next step ID based on current step configuration
   */
  private getNextStepId(step: FlowStep, data: Record<string, unknown>): string | undefined {
    if (!step.next) {
      return undefined;
    }

    if (typeof step.next === 'string') {
      return step.next;
    }

    // Dynamic next step based on data
    return step.next(data);
  }

  /**
   * Notify all listeners of step change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentStep);
      } catch (error) {
        console.error('[FlowEngine] Listener error:', error);
      }
    });
  }
}
