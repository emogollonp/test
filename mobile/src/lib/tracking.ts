import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Tracking Event Types
 *
 * Events tracked for analytics and experimentation:
 * - SearchPerformed: User searches for restaurants
 * - FilterApplied: User applies filters
 * - RestaurantViewed: User views restaurant detail
 */
export type TrackingEvent =
    | {
          type: 'SearchPerformed';
          properties: {
              query: string;
              resultsCount: number;
          };
      }
    | {
          type: 'FilterApplied';
          properties: {
              filterType: string;
              filterValue: string | number | boolean | string[];
          };
      }
    | {
          type: 'RestaurantViewed';
          properties: {
              restaurantId: string;
              restaurantName: string;
              category: string;
              source: 'list' | 'search' | 'direct';
          };
      };

export type StoredTrackingEvent = TrackingEvent & {
    timestamp: string;
    sessionId: string;
    platform: string;
    version: string;
};

const TRACKING_STORAGE_KEY = '@mesa247:tracking_events';
const SESSION_ID_KEY = '@mesa247:session_id';

let sessionId: string | null = null;

async function getSessionId(): Promise<string> {
    if (sessionId) return sessionId;

    try {
        const stored = await AsyncStorage.getItem(SESSION_ID_KEY);
        if (stored) {
            sessionId = stored;
            return stored;
        }

        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await AsyncStorage.setItem(SESSION_ID_KEY, newSessionId);
        sessionId = newSessionId;
        return newSessionId;
    } catch (error) {
        console.error('[Tracking] Failed to get session ID:', error);
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return sessionId;
    }
}

async function storeEvent(event: StoredTrackingEvent) {
    try {
        const stored = await AsyncStorage.getItem(TRACKING_STORAGE_KEY);
        const events: StoredTrackingEvent[] = stored ? JSON.parse(stored) : [];
        events.push(event);

        const recentEvents = events.slice(-100);
        await AsyncStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(recentEvents));
    } catch (error) {
        console.error('[Tracking] Failed to store event:', error);
    }
}

/**
 * Core tracking function
 *
 * In development: Logs to console
 * In production: Would send to analytics service (Mixpanel, Amplitude, etc.)
 * Also stores in AsyncStorage for debugging
 */
async function track(event: TrackingEvent): Promise<void> {
    const timestamp = new Date().toISOString();
    const sid = await getSessionId();

    const eventData = {
        ...event,
        timestamp,
        sessionId: sid,
        platform: Platform.OS,
        version: '1.0.0',
    };

    if (__DEV__) console.log('[Tracking]', JSON.stringify(eventData, null, 2));

    await storeEvent(eventData);

    // Production: Send to analytics service
    // Example: await analytics.track(eventData);
}

export async function trackSearchPerformed(query: string, resultsCount: number): Promise<void> {
    await track({
        type: 'SearchPerformed',
        properties: {
            query,
            resultsCount,
        },
    });
}

export async function trackFilterApplied(
    filterType: string,
    filterValue: string | number | boolean | string[]
): Promise<void> {
    await track({
        type: 'FilterApplied',
        properties: {
            filterType,
            filterValue,
        },
    });
}

export async function trackRestaurantViewed(
    restaurantId: string,
    restaurantName: string,
    category: string,
    source: 'list' | 'search' | 'direct' = 'list'
): Promise<void> {
    await track({
        type: 'RestaurantViewed',
        properties: {
            restaurantId,
            restaurantName,
            category,
            source,
        },
    });
}

export async function getTrackedEvents(): Promise<StoredTrackingEvent[]> {
    try {
        const stored = await AsyncStorage.getItem(TRACKING_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('[Tracking] Failed to get events:', error);
        return [];
    }
}

export async function clearTrackedEvents(): Promise<void> {
    try {
        await AsyncStorage.removeItem(TRACKING_STORAGE_KEY);
    } catch (error) {
        console.error('[Tracking] Failed to clear events:', error);
    }
}
