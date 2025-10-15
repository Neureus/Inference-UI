/**
 * Event Tracking Examples
 * Demonstrates how to use event tracking hooks
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import {
  EventProvider,
  useEventTracker,
  useComponentTracking,
  useScreenTracking,
  useButtonTracking,
  useFormTracking,
  useErrorTracking,
  useCustomEvent,
  usePerformanceTracking,
  useEventStats,
} from '@velvet/events';

/**
 * Example 1: Event Provider Setup
 * Wrap your app with EventProvider to enable tracking
 */
export function EventProviderExample({ children }: { children: React.ReactNode }) {
  return (
    <EventProvider
      config={{
        batchSize: 10,
        batchInterval: 20000, // 20 seconds
        endpoint: 'https://your-worker.workers.dev/events',
      }}
    >
      {children}
    </EventProvider>
  );
}

/**
 * Example 2: Basic Event Tracking
 * Track custom events in your components
 */
export function BasicEventTrackingExample() {
  const track = useEventTracker();

  const handleClick = () => {
    track('button_clicked', {
      buttonName: 'example_button',
      timestamp: Date.now(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Event Tracking</Text>
      <Button title="Track Event" onPress={handleClick} />
    </View>
  );
}

/**
 * Example 3: Component Lifecycle Tracking
 * Automatically track component mount/unmount/updates
 */
export function ComponentTrackingExample() {
  useComponentTracking('ExampleComponent', true); // true = track updates

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Component Lifecycle Tracking</Text>
      <Text>This component tracks mount, unmount, and updates</Text>
    </View>
  );
}

/**
 * Example 4: Screen View Tracking
 * Track screen views and time spent
 */
export function ScreenTrackingExample() {
  useScreenTracking('HomeScreen', {
    source: 'deep_link',
    campaign: 'summer_sale',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen Tracking</Text>
      <Text>Screen view and duration automatically tracked</Text>
    </View>
  );
}

/**
 * Example 5: Button Press Tracking
 * Track button interactions with context
 */
export function ButtonTrackingExample() {
  const trackPress = useButtonTracking('subscribe_button');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Button Tracking</Text>
      <Button
        title="Subscribe"
        onPress={trackPress(() => {
          console.log('User subscribed!');
        })}
      />
    </View>
  );
}

/**
 * Example 6: Form Interaction Tracking
 * Track form field interactions and submissions
 */
export function FormTrackingExample() {
  const { trackFieldFocus, trackFieldBlur, trackSubmit } = useFormTracking('signup_form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    const isValid = email && password;
    trackSubmit(isValid, isValid ? undefined : { email: 'Required', password: 'Required' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Form Tracking</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        onFocus={() => trackFieldFocus('email')}
        onBlur={() => trackFieldBlur('email', email)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onFocus={() => trackFieldFocus('password')}
        onBlur={() => trackFieldBlur('password', password)}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

/**
 * Example 7: Error Tracking
 * Track errors with context
 */
export function ErrorTrackingExample() {
  const trackError = useErrorTracking();

  const simulateError = () => {
    try {
      throw new Error('Example error occurred');
    } catch (error) {
      trackError(error as Error, {
        component: 'ErrorTrackingExample',
        action: 'simulate_error',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Tracking</Text>
      <Button title="Simulate Error" onPress={simulateError} />
    </View>
  );
}

/**
 * Example 8: Custom Event Tracking
 * Track custom business events
 */
export function CustomEventExample() {
  const trackCustom = useCustomEvent();

  const trackPurchase = () => {
    trackCustom('purchase_completed', {
      itemId: '123',
      price: 29.99,
      currency: 'USD',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Event Tracking</Text>
      <Button title="Track Purchase" onPress={trackPurchase} />
    </View>
  );
}

/**
 * Example 9: Performance Tracking
 * Track operation performance
 */
export function PerformanceTrackingExample() {
  const { start, end } = usePerformanceTracking('data_fetch');

  const fetchData = async () => {
    start();
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    end({ success: true, itemCount: 50 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Tracking</Text>
      <Button title="Fetch Data" onPress={fetchData} />
    </View>
  );
}

/**
 * Example 10: Event Queue Statistics
 * Monitor event queue status
 */
export function EventStatsExample() {
  const stats = useEventStats();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Queue Stats</Text>
      <View style={styles.result}>
        <Text>Queue Size: {stats.queueSize}</Text>
        <Text>Last Flush: {new Date(stats.lastFlush).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
}

/**
 * Complete Event Tracking Demo
 * Shows all event tracking features
 */
export function CompleteEventTrackingDemo() {
  return (
    <EventProvider
      config={{
        batchSize: 10,
        batchInterval: 20000,
        endpoint: 'https://your-worker.workers.dev/events',
      }}
    >
      <ScrollView style={styles.scrollContainer}>
        <BasicEventTrackingExample />
        <ComponentTrackingExample />
        <ScreenTrackingExample />
        <ButtonTrackingExample />
        <FormTrackingExample />
        <ErrorTrackingExample />
        <CustomEventExample />
        <PerformanceTrackingExample />
        <EventStatsExample />
      </ScrollView>
    </EventProvider>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  result: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
  },
});
