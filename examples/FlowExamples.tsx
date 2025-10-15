/**
 * Flow Engine Examples
 * Demonstrates how to use flow hooks for multi-step UX flows
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import {
  FlowProvider,
  useFlow,
  useWizard,
  useOnboarding,
  useCheckoutFlow,
  useFlowTracking,
  type Flow,
} from '@liquid-ui/flows';

/**
 * Example Flow Definitions
 */

const simpleFlow: Flow = {
  id: 'simple_flow',
  name: 'Simple Flow',
  initialStep: 'step1',
  steps: [
    { id: 'step1', component: 'Step1', next: 'step2' },
    { id: 'step2', component: 'Step2', next: 'step3' },
    { id: 'step3', component: 'Step3' },
  ],
};

const conditionalFlow: Flow = {
  id: 'conditional_flow',
  name: 'Conditional Flow',
  initialStep: 'question',
  steps: [
    {
      id: 'question',
      component: 'Question',
      next: (data) => (data.answer === 'yes' ? 'yes_path' : 'no_path'),
    },
    { id: 'yes_path', component: 'YesPath', next: 'end' },
    { id: 'no_path', component: 'NoPath', next: 'end' },
    { id: 'end', component: 'End' },
  ],
};

const onboardingFlow: Flow = {
  id: 'onboarding',
  name: 'User Onboarding',
  initialStep: 'welcome',
  steps: [
    { id: 'welcome', component: 'Welcome', next: 'permissions' },
    { id: 'permissions', component: 'Permissions', next: 'profile' },
    { id: 'profile', component: 'Profile', next: 'preferences' },
    { id: 'preferences', component: 'Preferences' },
  ],
};

const checkoutFlow: Flow = {
  id: 'checkout',
  name: 'Checkout',
  initialStep: 'cart',
  steps: [
    { id: 'cart', component: 'Cart', next: 'shipping' },
    { id: 'shipping', component: 'Shipping', next: 'payment' },
    { id: 'payment', component: 'Payment', next: 'confirmation' },
    { id: 'confirmation', component: 'Confirmation' },
  ],
};

/**
 * Example 1: Basic Flow Usage
 * Simple linear flow with navigation
 */
export function BasicFlowExample() {
  const { currentStep, progress, canGoBack, start, next, back, complete } = useFlow();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Flow</Text>
      {!currentStep ? (
        <Button title="Start Flow" onPress={() => start(simpleFlow)} />
      ) : (
        <>
          <View style={styles.progress}>
            <Text>Progress: {progress}%</Text>
            <Text>Current Step: {currentStep.id}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Button title="Back" onPress={back} disabled={!canGoBack} />
            <Button
              title={currentStep.next ? 'Next' : 'Finish'}
              onPress={() => (currentStep.next ? next() : complete())}
            />
          </View>
        </>
      )}
    </View>
  );
}

/**
 * Example 2: Wizard Flow
 * Step-by-step wizard with data collection
 */
export function WizardFlowExample() {
  const {
    currentStep,
    progress,
    canGoBack,
    stepData,
    updateStepData,
    nextStep,
    previousStep,
    start,
    complete,
  } = useWizard();

  if (!currentStep) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Wizard Flow</Text>
        <Button title="Start Wizard" onPress={() => start(simpleFlow)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wizard Flow - Step {currentStep.id}</Text>
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Example step content */}
      <TextInput
        style={styles.input}
        placeholder={`Enter data for ${currentStep.id}`}
        value={(stepData[currentStep.id] as string) || ''}
        onChangeText={(value) => updateStepData({ [currentStep.id]: value })}
      />

      <View style={styles.buttonRow}>
        <Button title="Back" onPress={previousStep} disabled={!canGoBack} />
        <Button
          title={currentStep.next ? 'Next' : 'Finish'}
          onPress={() => (currentStep.next ? nextStep() : complete())}
        />
      </View>
    </View>
  );
}

/**
 * Example 3: Conditional Flow
 * Flow with dynamic routing based on user input
 */
export function ConditionalFlowExample() {
  const { currentStep, start, next, flowData, updateData } = useFlow();
  const [answer, setAnswer] = useState('');

  const handleStart = () => {
    start(conditionalFlow);
  };

  const handleNext = () => {
    if (currentStep?.id === 'question') {
      updateData({ answer });
    }
    next();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conditional Flow</Text>
      {!currentStep ? (
        <Button title="Start" onPress={handleStart} />
      ) : (
        <>
          <Text style={styles.subtitle}>Current: {currentStep.id}</Text>
          {currentStep.id === 'question' && (
            <>
              <Text>Do you want to proceed? (yes/no)</Text>
              <TextInput
                style={styles.input}
                value={answer}
                onChangeText={setAnswer}
                placeholder="yes or no"
              />
            </>
          )}
          {currentStep.id !== 'question' && (
            <Text>You chose: {flowData.answer as string}</Text>
          )}
          <Button title="Next" onPress={handleNext} disabled={!currentStep.next} />
        </>
      )}
    </View>
  );
}

/**
 * Example 4: Onboarding Flow
 * User onboarding with skip option
 */
export function OnboardingFlowExample() {
  const {
    currentStep,
    progress,
    isCompleted,
    start,
    next,
    skip,
  } = useOnboarding(onboardingFlow, () => {
    console.log('Onboarding completed!');
  });

  if (isCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✓ Onboarding Complete!</Text>
      </View>
    );
  }

  if (!currentStep) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
        <Button title="Start Onboarding" onPress={() => start()} />
        <Button title="Skip" onPress={skip} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding - {currentStep.component}</Text>
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text>{progress}% Complete</Text>
      </View>
      <View style={styles.buttonRow}>
        <Button title="Skip All" onPress={skip} />
        <Button title="Next" onPress={() => next()} />
      </View>
    </View>
  );
}

/**
 * Example 5: Checkout Flow with Validation
 * E-commerce checkout with validation
 */
export function CheckoutFlowExample() {
  const {
    currentStep,
    progress,
    errors,
    isProcessing,
    start,
    next,
    complete,
  } = useCheckoutFlow(checkoutFlow, (data) => {
    console.log('Order completed:', data);
  });

  const validateStep = async (data: Record<string, unknown>) => {
    // Example validation
    const errors: Record<string, string> = {};
    if (currentStep?.id === 'shipping' && !data.address) {
      errors.address = 'Address is required';
    }
    return errors;
  };

  if (!currentStep) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <Button title="Start Checkout" onPress={() => start(checkoutFlow)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout - {currentStep.component}</Text>
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Example step content */}
      <Text style={styles.subtitle}>Step: {currentStep.id}</Text>

      {/* Show errors */}
      {Object.entries(errors).map(([field, message]) => (
        <Text key={field} style={styles.error}>
          {field}: {message}
        </Text>
      ))}

      <View style={styles.buttonRow}>
        {currentStep.next ? (
          <Button
            title={isProcessing ? 'Processing...' : 'Continue'}
            onPress={() => next({}, validateStep)}
            disabled={isProcessing}
          />
        ) : (
          <Button title="Complete Order" onPress={() => complete()} />
        )}
      </View>
    </View>
  );
}

/**
 * Example 6: Flow with Analytics Tracking
 * Automatically track flow events
 */
export function FlowWithTrackingExample() {
  const track = (event: string, properties?: Record<string, unknown>) => {
    console.log('Event:', event, properties);
  };

  useFlowTracking('example_flow', track);

  const { currentStep, start, next } = useFlow();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flow with Tracking</Text>
      <Text style={styles.subtitle}>All steps are automatically tracked</Text>
      {!currentStep ? (
        <Button title="Start" onPress={() => start(simpleFlow)} />
      ) : (
        <>
          <Text>Current: {currentStep.id}</Text>
          <Button title="Next" onPress={() => next()} disabled={!currentStep.next} />
        </>
      )}
    </View>
  );
}

/**
 * Complete Flow Demo
 * Shows all flow features
 */
export function CompleteFlowDemo() {
  return (
    <FlowProvider>
      <ScrollView style={styles.scrollContainer}>
        <BasicFlowExample />
        <WizardFlowExample />
        <ConditionalFlowExample />
        <OnboardingFlowExample />
        <CheckoutFlowExample />
        <FlowWithTrackingExample />
      </ScrollView>
    </FlowProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  progress: {
    marginVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  error: {
    color: '#ef4444',
    marginBottom: 8,
  },
});
