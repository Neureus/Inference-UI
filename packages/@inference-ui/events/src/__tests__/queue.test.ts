/**
 * EventQueue Tests
 */

import { EventQueue } from '../queue';
import { Event, EventConfig } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('EventQueue', () => {
  let queue: EventQueue;
  const mockConfig: EventConfig = {
    batchSize: 5,
    batchInterval: 10000,
    endpoint: 'https://test.workers.dev/events',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queue = new EventQueue(mockConfig);
  });

  describe('add', () => {
    it('should add event to queue', async () => {
      const event: Event = {
        id: 'test-1',
        timestamp: Date.now(),
        sessionId: 'session-1',
        event: 'test_event',
      };

      await queue.add(event);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@inference-ui/events/queue',
        JSON.stringify([event])
      );
    });

    it('should trim queue if exceeds max size', async () => {
      // Mock existing queue with 1000 events
      const existingEvents = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        timestamp: Date.now(),
        sessionId: 'session-1',
        event: 'test',
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(existingEvents)
      );

      const newEvent: Event = {
        id: 'new-event',
        timestamp: Date.now(),
        sessionId: 'session-1',
        event: 'test',
      };

      await queue.add(newEvent);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedQueue = JSON.parse(savedData);

      expect(savedQueue.length).toBe(1000);
      expect(savedQueue[savedQueue.length - 1].id).toBe('new-event');
    });
  });

  describe('flush', () => {
    it('should send events to server', async () => {
      const events: Event[] = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          sessionId: 'session-1',
          event: 'test1',
        },
        {
          id: 'test-2',
          timestamp: Date.now(),
          sessionId: 'session-1',
          event: 'test2',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(events));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await queue.flush();

      expect(global.fetch).toHaveBeenCalledWith(
        mockConfig.endpoint,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@inference-ui/events/queue');
    });

    it('should retry on failure', async () => {
      const events: Event[] = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          sessionId: 'session-1',
          event: 'test',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      await queue.flush();

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('get', () => {
    it('should return queued events', async () => {
      const events: Event[] = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          sessionId: 'session-1',
          event: 'test',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(events));

      const result = await queue.get();

      expect(result).toEqual(events);
    });

    it('should return empty array if no events', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await queue.get();

      expect(result).toEqual([]);
    });
  });

  describe('size', () => {
    it('should return queue size', async () => {
      const events: Event[] = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          sessionId: 'session-1',
          event: 'test',
        },
        {
          id: 'test-2',
          timestamp: Date.now(),
          sessionId: 'session-1',
          event: 'test',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(events));

      const size = await queue.size();

      expect(size).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all events', async () => {
      await queue.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@inference-ui/events/queue');
    });
  });
});
