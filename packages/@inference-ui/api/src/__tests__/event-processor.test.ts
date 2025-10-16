/**
 * EventProcessor Integration Tests
 */

import { EventProcessor } from '../services/event-processor';
import type { DatabaseAdapter, AnalyticsAdapter, AIAdapter, EventRecord } from '../types';

describe('EventProcessor', () => {
  let mockDatabase: DatabaseAdapter;
  let mockAnalytics: AnalyticsAdapter;
  let mockAI: AIAdapter;
  let processor: EventProcessor;

  beforeEach(() => {
    // Mock database adapter
    mockDatabase = {
      createEvent: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      getFlows: jest.fn(),
      getFlowById: jest.fn(),
      createFlow: jest.fn(),
      updateFlow: jest.fn(),
      deleteFlow: jest.fn(),
      getEvents: jest.fn(),
      getFlowAnalytics: jest.fn(),
      getUserUsage: jest.fn(),
    };

    // Mock analytics adapter
    mockAnalytics = {
      writeDataPoint: jest.fn(),
      query: jest.fn(),
    };

    // Mock AI adapter
    mockAI = {
      run: jest.fn(),
    };

    processor = new EventProcessor({
      database: mockDatabase,
      analytics: mockAnalytics,
      ai: mockAI,
      useAI: false, // Use rule-based by default
    });
  });

  describe('processEvent', () => {
    it('should process a single event with rule-based classification', async () => {
      await processor.processEvent({
        event: 'button_click',
        component: 'AIButton',
        properties: { label: 'Get Started' },
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'button_click',
          component: 'AIButton',
          intent: 'interact',
          sentiment: 'neutral',
        })
      );

      expect(mockAnalytics.writeDataPoint).toHaveBeenCalled();
    });

    it('should classify purchase intent correctly', async () => {
      await processor.processEvent({
        event: 'checkout_button_click',
        component: 'CheckoutButton',
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'purchase',
          sentiment: 'neutral',
        })
      );
    });

    it('should classify error sentiment correctly', async () => {
      await processor.processEvent({
        event: 'payment_failed',
        component: 'PaymentForm',
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'error',
          sentiment: 'negative',
        })
      );
    });

    it('should classify success sentiment correctly', async () => {
      await processor.processEvent({
        event: 'purchase_complete',
        component: 'SuccessPage',
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'unknown',
          sentiment: 'positive',
        })
      );
    });

    it('should generate IDs for events without them', async () => {
      await processor.processEvent({
        event: 'test_event',
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          sessionId: expect.any(String),
        })
      );
    });

    it('should continue processing if analytics fails', async () => {
      (mockAnalytics.writeDataPoint as jest.Mock).mockRejectedValue(
        new Error('Analytics error')
      );

      await expect(
        processor.processEvent({
          event: 'test_event',
        })
      ).resolves.not.toThrow();

      expect(mockDatabase.createEvent).toHaveBeenCalled();
    });

    it('should throw if database write fails', async () => {
      (mockDatabase.createEvent as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        processor.processEvent({
          event: 'test_event',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('processBatch', () => {
    it('should process multiple events in parallel', async () => {
      const events = [
        { event: 'event1' },
        { event: 'event2' },
        { event: 'event3' },
      ];

      const result = await processor.processBatch(events);

      expect(result.processed).toBe(3);
      expect(result.errors).toBe(0);
      expect(mockDatabase.createEvent).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      (mockDatabase.createEvent as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce(undefined);

      const events = [
        { event: 'event1' },
        { event: 'event2' },
        { event: 'event3' },
      ];

      const result = await processor.processBatch(events);

      expect(result.processed).toBe(2);
      expect(result.errors).toBe(1);
    });

    it('should return all errors if all fail', async () => {
      (mockDatabase.createEvent as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const events = [
        { event: 'event1' },
        { event: 'event2' },
      ];

      const result = await processor.processBatch(events);

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(2);
    });
  });

  describe('AI classification', () => {
    beforeEach(() => {
      processor = new EventProcessor({
        database: mockDatabase,
        analytics: mockAnalytics,
        ai: mockAI,
        useAI: true, // Enable AI
      });
    });

    it('should use AI classification when enabled', async () => {
      (mockAI.run as jest.Mock).mockResolvedValue({
        response: '{"intent": "purchase", "sentiment": "positive"}',
      });

      await processor.processEvent({
        event: 'test_event',
      });

      expect(mockAI.run).toHaveBeenCalled();
      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'purchase',
          sentiment: 'positive',
        })
      );
    });

    it('should fall back to rule-based if AI fails', async () => {
      (mockAI.run as jest.Mock).mockRejectedValue(new Error('AI error'));

      await processor.processEvent({
        event: 'button_click',
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'interact',
          sentiment: 'neutral',
        })
      );
    });

    it('should fall back if AI returns invalid JSON', async () => {
      (mockAI.run as jest.Mock).mockResolvedValue({
        response: 'invalid json',
      });

      await processor.processEvent({
        event: 'button_click',
      });

      expect(mockDatabase.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'interact',
          sentiment: 'neutral',
        })
      );
    });
  });

  describe('intent classification', () => {
    const testCases = [
      { event: 'buy_button_click', expectedIntent: 'purchase' },
      { event: 'checkout_tap', expectedIntent: 'purchase' },
      { event: 'help_button_press', expectedIntent: 'help' },
      { event: 'support_click', expectedIntent: 'help' },
      { event: 'settings_open', expectedIntent: 'configure' },
      { event: 'page_view', expectedIntent: 'explore' },
      { event: 'navigate_to_page', expectedIntent: 'explore' },
      { event: 'error_occurred', expectedIntent: 'error' },
      { event: 'form_submit', expectedIntent: 'submit' },
      { event: 'search_query', expectedIntent: 'search' },
      { event: 'unknown_action', expectedIntent: 'unknown' },
    ];

    testCases.forEach(({ event, expectedIntent }) => {
      it(`should classify "${event}" as "${expectedIntent}"`, async () => {
        await processor.processEvent({ event });

        expect(mockDatabase.createEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            intent: expectedIntent,
          })
        );
      });
    });
  });

  describe('sentiment classification', () => {
    const testCases = [
      { event: 'error_occurred', expectedSentiment: 'negative' },
      { event: 'failed_to_load', expectedSentiment: 'negative' },
      { event: 'app_crash', expectedSentiment: 'negative' },
      { event: 'success_message', expectedSentiment: 'positive' },
      { event: 'purchase_complete', expectedSentiment: 'positive' },
      { event: 'like_button_click', expectedSentiment: 'positive' },
      { event: 'page_view', expectedSentiment: 'neutral' },
      { event: 'button_click', expectedSentiment: 'neutral' },
    ];

    testCases.forEach(({ event, expectedSentiment }) => {
      it(`should classify "${event}" as "${expectedSentiment}"`, async () => {
        await processor.processEvent({ event });

        expect(mockDatabase.createEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            sentiment: expectedSentiment,
          })
        );
      });
    });
  });
});
