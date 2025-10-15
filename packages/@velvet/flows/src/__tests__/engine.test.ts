/**
 * FlowEngine Tests
 */

import { FlowEngine } from '../engine';
import { Flow, FlowStep } from '../types';

describe('FlowEngine', () => {
  let engine: FlowEngine;

  const simpleFlow: Flow = {
    id: 'test-flow',
    name: 'Test Flow',
    initialStep: 'step1',
    steps: [
      { id: 'step1', component: 'Step1', next: 'step2' },
      { id: 'step2', component: 'Step2', next: 'step3' },
      { id: 'step3', component: 'Step3' },
    ],
  };

  const conditionalFlow: Flow = {
    id: 'conditional-flow',
    name: 'Conditional Flow',
    initialStep: 'question',
    steps: [
      {
        id: 'question',
        component: 'Question',
        next: (data) => (data.answer === 'yes' ? 'yes_path' : 'no_path'),
      },
      { id: 'yes_path', component: 'YesPath' },
      { id: 'no_path', component: 'NoPath' },
    ],
  };

  beforeEach(() => {
    engine = new FlowEngine();
  });

  describe('start', () => {
    it('should start a flow at the initial step', () => {
      engine.start(simpleFlow);

      const currentStep = engine.getCurrentStep();
      expect(currentStep?.id).toBe('step1');
    });

    it('should throw error if initial step not found', () => {
      const invalidFlow: Flow = {
        ...simpleFlow,
        initialStep: 'nonexistent',
      };

      expect(() => engine.start(invalidFlow)).toThrow();
    });

    it('should notify listeners on start', () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      engine.start(simpleFlow);

      expect(listener).toHaveBeenCalledWith(simpleFlow.steps[0]);
    });
  });

  describe('next', () => {
    it('should move to next step', () => {
      engine.start(simpleFlow);
      engine.next();

      const currentStep = engine.getCurrentStep();
      expect(currentStep?.id).toBe('step2');
    });

    it('should merge data', () => {
      engine.start(simpleFlow);
      engine.next({ key: 'value' });

      const data = engine.getData();
      expect(data).toEqual({ key: 'value' });
    });

    it('should complete flow when no next step', () => {
      engine.start(simpleFlow);
      engine.next(); // step2
      engine.next(); // step3
      engine.next(); // complete

      const currentStep = engine.getCurrentStep();
      expect(currentStep).toBeUndefined();
    });

    it('should handle dynamic next step', () => {
      engine.start(conditionalFlow);
      engine.next({ answer: 'yes' });

      const currentStep = engine.getCurrentStep();
      expect(currentStep?.id).toBe('yes_path');
    });
  });

  describe('back', () => {
    it('should go back to previous step', () => {
      engine.start(simpleFlow);
      engine.next();
      engine.back();

      const currentStep = engine.getCurrentStep();
      expect(currentStep?.id).toBe('step1');
    });

    it('should not go back from first step', () => {
      engine.start(simpleFlow);
      engine.back();

      const currentStep = engine.getCurrentStep();
      expect(currentStep?.id).toBe('step1');
    });
  });

  describe('jumpTo', () => {
    it('should jump to specific step', () => {
      engine.start(simpleFlow);
      engine.jumpTo('step3');

      const currentStep = engine.getCurrentStep();
      expect(currentStep?.id).toBe('step3');
    });

    it('should throw error if step not found', () => {
      engine.start(simpleFlow);
      expect(() => engine.jumpTo('nonexistent')).toThrow();
    });

    it('should clear history if requested', () => {
      engine.start(simpleFlow);
      engine.next();
      engine.jumpTo('step3', true);

      const history = engine.getHistory();
      expect(history).toEqual(['step3']);
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage', () => {
      engine.start(simpleFlow);
      expect(engine.getProgress()).toBe(33); // 1/3 = 33%

      engine.next();
      expect(engine.getProgress()).toBe(67); // 2/3 = 67%

      engine.next();
      expect(engine.getProgress()).toBe(100); // 3/3 = 100%
    });
  });

  describe('canGoBack', () => {
    it('should return true if can go back', () => {
      engine.start(simpleFlow);
      expect(engine.canGoBack()).toBe(false);

      engine.next();
      expect(engine.canGoBack()).toBe(true);
    });
  });

  describe('getData', () => {
    it('should return flow data', () => {
      engine.start(simpleFlow, { initial: 'data' });
      engine.next({ next: 'data' });

      const data = engine.getData();
      expect(data).toEqual({ initial: 'data', next: 'data' });
    });
  });

  describe('subscribe', () => {
    it('should notify listeners of step changes', () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      engine.start(simpleFlow);
      engine.next();

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should allow unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = engine.subscribe(listener);

      engine.start(simpleFlow);
      unsubscribe();
      engine.next();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('complete', () => {
    it('should complete the flow', () => {
      engine.start(simpleFlow);
      engine.complete();

      const currentStep = engine.getCurrentStep();
      expect(currentStep).toBeUndefined();
    });
  });

  describe('cancel', () => {
    it('should cancel the flow', () => {
      engine.start(simpleFlow);
      engine.next({ key: 'value' });
      engine.cancel();

      const currentStep = engine.getCurrentStep();
      const data = engine.getData();

      expect(currentStep).toBeUndefined();
      expect(data).toEqual({});
    });
  });
});
