/**
 * Tracking Providers - Mobile (React Native)
 *
 * Provider abstraction layer for analytics services.
 * Easy to switch: Console → Segment → Mixpanel → Amplitude → GA4.
 *
 * Each provider implements the TrackingProvider interface.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrackingEvent, UserIdentity, ScreenView, EventMetadata } from './types';

/**
 * Provider interface
 */
export interface TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void;
    identify(identity: UserIdentity): void;
    screen(screenView: ScreenView, metadata: EventMetadata): void;
    flush?(): void;
}

/**
 * Console provider (development/fallback)
 * Logs events to console and stores in AsyncStorage
 */
export class ConsoleProvider implements TrackingProvider {
    private readonly maxStoredEvents = 100;
    private readonly storageKey = 'mesa247_tracking_events';

    track(event: TrackingEvent, metadata: EventMetadata): void {
        console.log('[Tracking] Event:', event.name, {
            properties: event.properties,
            metadata,
        });

        this.storeEvent({ type: 'track', event, metadata });
    }

    identify(identity: UserIdentity): void {
        console.log('[Tracking] Identify:', identity.userId, {
            traits: identity.traits,
        });

        this.storeEvent({ type: 'identify', identity });
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        console.log('[Tracking] Screen:', screenView.screenName, {
            properties: screenView.properties,
            metadata,
        });

        this.storeEvent({ type: 'screen', screenView, metadata });
    }

    private async storeEvent(event: unknown): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(this.storageKey);
            const events = stored ? JSON.parse(stored) : [];

            events.push({ ...(event as object), timestamp: new Date().toISOString() });

            // Keep only last N events
            const trimmed = events.slice(-this.maxStoredEvents);

            await AsyncStorage.setItem(this.storageKey, JSON.stringify(trimmed));
        } catch (error) {
            console.error('[Tracking] Failed to store event:', error);
        }
    }
}

/**
 * Segment provider (production)
 */
export class SegmentProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        // @ts-expect-error - Segment SDK types not available
        if (typeof global.analytics?.track === 'function') {
            // @ts-expect-error - Segment SDK types not available
            global.analytics.track(event.name, {
                ...event.properties,
                ...metadata,
            });
        } else {
            console.warn('[Tracking] Segment not initialized');
        }
    }

    identify(identity: UserIdentity): void {
        // @ts-expect-error - Segment SDK types not available
        if (typeof global.analytics?.identify === 'function') {
            // @ts-expect-error - Segment SDK types not available
            global.analytics.identify(identity.userId, identity.traits);
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        // @ts-expect-error - Segment SDK types not available
        if (typeof global.analytics?.screen === 'function') {
            // @ts-expect-error - Segment SDK types not available
            global.analytics.screen(screenView.screenName, {
                ...screenView.properties,
                ...metadata,
            });
        }
    }

    flush(): void {
        // @ts-expect-error - Segment SDK types not available
        if (typeof global.analytics?.flush === 'function') {
            // @ts-expect-error - Segment SDK types not available
            global.analytics.flush();
        }
    }
}

/**
 * Mixpanel provider (production)
 */
export class MixpanelProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        // @ts-expect-error - Mixpanel SDK types not available
        if (typeof global.mixpanel?.track === 'function') {
            // @ts-expect-error - Mixpanel SDK types not available
            global.mixpanel.track(event.name, {
                ...event.properties,
                ...metadata,
            });
        } else {
            console.warn('[Tracking] Mixpanel not initialized');
        }
    }

    identify(identity: UserIdentity): void {
        // @ts-expect-error - Mixpanel SDK types not available
        if (typeof global.mixpanel?.identify === 'function') {
            // @ts-expect-error - Mixpanel SDK types not available
            global.mixpanel.identify(identity.userId);
            if (identity.traits) {
                // @ts-expect-error - Mixpanel SDK types not available
                global.mixpanel.people.set(identity.traits);
            }
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        // Mixpanel doesn't have dedicated screen tracking, use regular track
        // @ts-expect-error - Mixpanel SDK types not available
        if (typeof global.mixpanel?.track === 'function') {
            // @ts-expect-error - Mixpanel SDK types not available
            global.mixpanel.track('Screen View', {
                screenName: screenView.screenName,
                ...screenView.properties,
                ...metadata,
            });
        }
    }

    flush(): void {
        // @ts-expect-error - Mixpanel SDK types not available
        if (typeof global.mixpanel?.flush === 'function') {
            // @ts-expect-error - Mixpanel SDK types not available
            global.mixpanel.flush();
        }
    }
}

/**
 * Amplitude provider (production)
 */
export class AmplitudeProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        // @ts-expect-error - Amplitude SDK types not available
        if (typeof global.amplitude?.logEvent === 'function') {
            // @ts-expect-error - Amplitude SDK types not available
            global.amplitude.logEvent(event.name, {
                ...event.properties,
                ...metadata,
            });
        } else {
            console.warn('[Tracking] Amplitude not initialized');
        }
    }

    identify(identity: UserIdentity): void {
        // @ts-expect-error - Amplitude SDK types not available
        if (typeof global.amplitude?.setUserId === 'function') {
            // @ts-expect-error - Amplitude SDK types not available
            global.amplitude.setUserId(identity.userId);
            if (identity.traits) {
                // @ts-expect-error - Amplitude SDK types not available
                const identify = new global.amplitude.Identify();
                Object.entries(identity.traits).forEach(([key, value]) => {
                    identify.set(key, value);
                });
                // @ts-expect-error - Amplitude SDK types not available
                global.amplitude.identify(identify);
            }
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        // @ts-expect-error - Amplitude SDK types not available
        if (typeof global.amplitude?.logEvent === 'function') {
            // @ts-expect-error - Amplitude SDK types not available
            global.amplitude.logEvent('Screen View', {
                screenName: screenView.screenName,
                ...screenView.properties,
                ...metadata,
            });
        }
    }

    flush(): void {
        // Amplitude auto-flushes, no manual flush needed
    }
}

/**
 * Firebase Analytics provider (production)
 */
export class FirebaseProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        // @ts-expect-error - Firebase SDK types not available
        if (typeof global.firebase?.analytics === 'function') {
            // @ts-expect-error - Firebase SDK types not available
            const analytics = global.firebase.analytics();
            analytics.logEvent(event.name, {
                ...event.properties,
                ...metadata,
            });
        } else {
            console.warn('[Tracking] Firebase not initialized');
        }
    }

    identify(identity: UserIdentity): void {
        // @ts-expect-error - Firebase SDK types not available
        if (typeof global.firebase?.analytics === 'function') {
            // @ts-expect-error - Firebase SDK types not available
            const analytics = global.firebase.analytics();
            analytics.setUserId(identity.userId);
            if (identity.traits) {
                Object.entries(identity.traits).forEach(([key, value]) => {
                    analytics.setUserProperty(key, String(value));
                });
            }
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        // @ts-expect-error - Firebase SDK types not available
        if (typeof global.firebase?.analytics === 'function') {
            // @ts-expect-error - Firebase SDK types not available
            const analytics = global.firebase.analytics();
            analytics.logEvent('screen_view', {
                screen_name: screenView.screenName,
                ...screenView.properties,
                ...metadata,
            });
        }
    }

    flush(): void {
        // Firebase auto-flushes
    }
}

/**
 * Multi-provider (send to multiple services)
 */
export class MultiProvider implements TrackingProvider {
    constructor(private providers: TrackingProvider[]) {}

    track(event: TrackingEvent, metadata: EventMetadata): void {
        this.providers.forEach((provider) => {
            try {
                provider.track(event, metadata);
            } catch (error) {
                console.error('[Tracking] Provider failed:', error);
            }
        });
    }

    identify(identity: UserIdentity): void {
        this.providers.forEach((provider) => {
            try {
                provider.identify(identity);
            } catch (error) {
                console.error('[Tracking] Provider failed:', error);
            }
        });
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        this.providers.forEach((provider) => {
            try {
                provider.screen(screenView, metadata);
            } catch (error) {
                console.error('[Tracking] Provider failed:', error);
            }
        });
    }

    flush(): void {
        this.providers.forEach((provider) => {
            try {
                provider.flush?.();
            } catch (error) {
                console.error('[Tracking] Provider failed:', error);
            }
        });
    }
}
