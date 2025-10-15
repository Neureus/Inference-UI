/**
 * React hooks for UX flows
 * Provides easy-to-use hooks for managing multi-step flows
 */

import React, { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';
import { FlowEngine } from './engine';
import type { Flow, FlowStep } from './types';

// Flow context
interface FlowContextValue {
  engine: FlowEngine;
}

const FlowContext = createContext<FlowContextValue | null>(null);

/**
 * Provider component for flow engine
 * Wrap your app with this to enable flows
 */
export function FlowProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef(new FlowEngine());

  const value: FlowContextValue = {
    engine: engineRef.current,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

/**
 * Hook to access flow engine
 */
function useFlowEngine(): FlowEngine {
  const context = useContext(FlowContext);

  if (!context) {
    throw new Error('useFlowEngine must be used within FlowProvider');
  }

  return context.engine;
}

/**
 * Hook to manage a flow
 * Returns current step, navigation functions, and flow state
 */
export function useFlow(flow?: Flow, autoStart = false) {
  const engine = useFlowEngine();
  const [currentStep, setCurrentStep] = useState<FlowStep | undefined>(
    engine.getCurrentStep()
  );
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [flowData, setFlowData] = useState<Record<string, unknown>>({});

  // Subscribe to engine changes
  useEffect(() => {
    const unsubscribe = engine.subscribe((step) => {
      setCurrentStep(step);
      setProgress(engine.getProgress());
      setCanGoBack(engine.canGoBack());
      setFlowData(engine.getData());
    });

    return unsubscribe;
  }, [engine]);

  // Auto-start flow if provided
  useEffect(() => {
    if (flow && autoStart && !currentStep) {
      engine.start(flow);
    }
  }, [flow, autoStart, currentStep, engine]);

  const start = useCallback(
    (flowToStart?: Flow, initialData?: Record<string, unknown>) => {
      const targetFlow = flowToStart || flow;
      if (!targetFlow) {
        throw new Error('No flow provided to start');
      }
      engine.start(targetFlow, initialData);
    },
    [engine, flow]
  );

  const next = useCallback(
    (data?: Record<string, unknown>) => {
      engine.next(data);
    },
    [engine]
  );

  const back = useCallback(() => {
    engine.back();
  }, [engine]);

  const jumpTo = useCallback(
    (stepId: string, clearHistory = false) => {
      engine.jumpTo(stepId, clearHistory);
    },
    [engine]
  );

  const complete = useCallback(() => {
    engine.complete();
  }, [engine]);

  const cancel = useCallback(() => {
    engine.cancel();
  }, [engine]);

  const updateData = useCallback(
    (data: Record<string, unknown>) => {
      engine.setData(data);
      setFlowData(engine.getData());
    },
    [engine]
  );

  return {
    currentStep,
    progress,
    canGoBack,
    flowData,
    start,
    next,
    back,
    jumpTo,
    complete,
    cancel,
    updateData,
    history: engine.getHistory(),
  };
}

/**
 * Hook for wizard-style flows
 * Simplified interface for linear step-by-step flows
 */
export function useWizard(flow?: Flow, autoStart = false) {
  const { currentStep, progress, canGoBack, flowData, next, back, start, complete, updateData } =
    useFlow(flow, autoStart);

  const [stepData, setStepData] = useState<Record<string, unknown>>({});

  const nextStep = useCallback(() => {
    next(stepData);
    setStepData({});
  }, [next, stepData]);

  const previousStep = useCallback(() => {
    back();
    setStepData({});
  }, [back]);

  const updateStepData = useCallback((data: Record<string, unknown>) => {
    setStepData((prev) => ({ ...prev, ...data }));
  }, []);

  return {
    currentStep,
    progress,
    canGoBack,
    stepData,
    allData: flowData,
    updateStepData,
    nextStep,
    previousStep,
    start,
    complete,
    updateData,
  };
}

/**
 * Hook for onboarding flows
 * Tracks completion and provides skip functionality
 */
export function useOnboarding(flow: Flow, onComplete?: () => void) {
  const {
    currentStep,
    progress,
    canGoBack,
    flowData,
    start,
    next,
    back,
    complete,
    updateData,
  } = useFlow();

  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const startOnboarding = useCallback(
    (initialData?: Record<string, unknown>) => {
      start(flow, initialData);
      setIsStarted(true);
      setIsCompleted(false);
    },
    [start, flow]
  );

  const completeOnboarding = useCallback(() => {
    complete();
    setIsCompleted(true);
    onComplete?.();
  }, [complete, onComplete]);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return {
    currentStep,
    progress,
    canGoBack,
    flowData,
    isStarted,
    isCompleted,
    start: startOnboarding,
    next,
    back,
    complete: completeOnboarding,
    skip: skipOnboarding,
    updateData,
  };
}

/**
 * Hook for checkout/purchase flows
 * Specialized for e-commerce flows with validation
 */
export function useCheckoutFlow(_flow: Flow, onComplete?: (data: Record<string, unknown>) => void) {
  const { currentStep, progress, canGoBack, flowData, start, next, back, complete, updateData } =
    useFlow(_flow);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAndNext = useCallback(
    async (
      data?: Record<string, unknown>,
      validator?: (data: Record<string, unknown>) => Promise<Record<string, string>>
    ) => {
      setErrors({});

      if (validator && data) {
        setIsProcessing(true);
        try {
          const validationErrors = await validator(data);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return false;
          }
        } catch (error) {
          console.error('[CheckoutFlow] Validation error:', error);
          return false;
        } finally {
          setIsProcessing(false);
        }
      }

      next(data);
      return true;
    },
    [next]
  );

  const completeCheckout = useCallback(() => {
    complete();
    onComplete?.(flowData);
  }, [complete, flowData, onComplete]);

  return {
    currentStep,
    progress,
    canGoBack,
    flowData,
    errors,
    isProcessing,
    start,
    next: validateAndNext,
    back,
    complete: completeCheckout,
    updateData,
  };
}

/**
 * Hook to track flow analytics
 * Automatically tracks flow events
 */
export function useFlowTracking(_flowName: string, trackEvent?: (event: string, properties?: Record<string, unknown>) => void) {
  const engine = useFlowEngine();

  useEffect(() => {
    const unsubscribe = engine.subscribe((step) => {
      if (step) {
        trackEvent?.('flow_step_viewed', {
          flow: _flowName,
          step: step.id,
          progress: engine.getProgress(),
        });
      } else {
        trackEvent?.('flow_completed', {
          flow: _flowName,
          data: engine.getData(),
        });
      }
    });

    return unsubscribe;
  }, [engine, _flowName, trackEvent]);
}
