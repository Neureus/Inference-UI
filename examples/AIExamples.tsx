/**
 * AI Engine Examples
 * Demonstrates how to use AI hooks in React Native components
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import {
  useAIInitialization,
  useTextClassification,
  useFormValidation,
  useAutocomplete,
  useAccessibilityCheck,
  useAIMetrics,
} from '@velvet/ai-engine';

/**
 * Example 1: AI Initialization
 * Shows how to initialize the AI engine at app startup
 */
export function AIInitializationExample() {
  const { initialized, loading, error } = useAIInitialization({
    enableLocalAI: true,
    enableEdgeAI: true,
    edgeEndpoint: 'https://your-worker.workers.dev',
    edgeApiKey: 'your-api-key',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Engine Status</Text>
      {loading && <Text>Initializing AI engines...</Text>}
      {error && <Text style={styles.error}>Error: {error.message}</Text>}
      {initialized && <Text style={styles.success}>✓ AI engines ready</Text>}
    </View>
  );
}

/**
 * Example 2: Text Classification
 * Demonstrates sentiment analysis or intent detection
 */
export function TextClassificationExample() {
  const [text, setText] = useState('');
  const { classify, loading, result, error } = useTextClassification();

  const handleClassify = async () => {
    if (text.trim()) {
      await classify(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text Classification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text to analyze..."
        value={text}
        onChangeText={setText}
        multiline
      />
      <Button title="Classify" onPress={handleClassify} disabled={loading} />
      {loading && <Text>Analyzing...</Text>}
      {result && (
        <View style={styles.result}>
          <Text>Label: {result.label}</Text>
          <Text>Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

/**
 * Example 3: Form Validation with AI
 * Smart form validation using AI
 */
export function AIFormValidationExample() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });
  const { validate, loading, result, error } = useFormValidation();

  const handleValidate = async () => {
    await validate(formData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Form Validation</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(phone) => setFormData({ ...formData, phone })}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(address) => setFormData({ ...formData, address })}
      />
      <Button title="Validate" onPress={handleValidate} disabled={loading} />
      {loading && <Text>Validating...</Text>}
      {result && (
        <View style={styles.result}>
          {Object.entries(result).map(([field, validation]) => (
            <Text key={field}>
              {field}: {validation.valid ? '✓' : `✗ ${validation.message}`}
            </Text>
          ))}
        </View>
      )}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

/**
 * Example 4: Autocomplete
 * AI-powered autocomplete suggestions
 */
export function AutocompleteExample() {
  const [input, setInput] = useState('');
  const { getSuggestions, loading, suggestions, error } = useAutocomplete();

  const handleInputChange = async (text: string) => {
    setInput(text);
    if (text.length > 2) {
      await getSuggestions(text, 300); // 300ms debounce
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Autocomplete</Text>
      <TextInput
        style={styles.input}
        placeholder="Start typing..."
        value={input}
        onChangeText={handleInputChange}
      />
      {loading && <Text>Loading suggestions...</Text>}
      {suggestions && suggestions.length > 0 && (
        <View style={styles.result}>
          <Text style={styles.subtitle}>Suggestions:</Text>
          {suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.suggestion}>
              • {suggestion}
            </Text>
          ))}
        </View>
      )}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

/**
 * Example 5: Accessibility Check
 * AI-powered accessibility validation
 */
export function AccessibilityCheckExample() {
  const { check, loading, result, error } = useAccessibilityCheck();

  const handleCheck = async () => {
    // Example component structure
    const component = {
      type: 'Button',
      label: 'Submit',
      hasAccessibilityLabel: true,
      hasMinimumSize: true,
      hasContrast: true,
    };
    await check(component);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Check</Text>
      <Button title="Check Component" onPress={handleCheck} disabled={loading} />
      {loading && <Text>Checking accessibility...</Text>}
      {result && (
        <View style={styles.result}>
          <Text>Score: {result.score}/100</Text>
          {result.issues.length > 0 && (
            <>
              <Text style={styles.subtitle}>Issues:</Text>
              {result.issues.map((issue, index) => (
                <Text key={index} style={styles.issue}>
                  [{issue.severity}] {issue.message}
                </Text>
              ))}
            </>
          )}
        </View>
      )}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

/**
 * Example 6: AI Metrics Monitoring
 * Display real-time AI performance metrics
 */
export function AIMetricsExample() {
  const { metrics, refresh } = useAIMetrics();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Metrics</Text>
      <Button title="Refresh" onPress={refresh} />
      {metrics && (
        <View style={styles.result}>
          <Text>Local Inferences: {metrics.localInferences.toFixed(0)}</Text>
          <Text>Edge Inferences: {metrics.edgeInferences.toFixed(0)}</Text>
          <Text>Fallbacks: {metrics.fallbacks.toFixed(0)}</Text>
          <Text>Avg Local Latency: {metrics.averageLocalLatency.toFixed(0)}ms</Text>
          <Text>Avg Edge Latency: {metrics.averageEdgeLatency.toFixed(0)}ms</Text>
          <Text>Errors: {metrics.errors.toFixed(0)}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Complete AI Demo
 * Shows all AI features in one component
 */
export function CompleteAIDemo() {
  return (
    <ScrollView style={styles.scrollContainer}>
      <AIInitializationExample />
      <TextClassificationExample />
      <AIFormValidationExample />
      <AutocompleteExample />
      <AccessibilityCheckExample />
      <AIMetricsExample />
    </ScrollView>
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
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  result: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
  },
  success: {
    color: '#10b981',
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginTop: 8,
  },
  suggestion: {
    paddingVertical: 4,
  },
  issue: {
    paddingVertical: 2,
    color: '#f59e0b',
  },
});
