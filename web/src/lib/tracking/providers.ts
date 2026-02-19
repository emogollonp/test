import type { TrackingEvent, UserIdentity, ScreenView, EventMetadata } from './types';

interface WindowWithAnalytics extends Window {
    analytics?: {
        track: (eventName: string, properties: Record<string, unknown>) => void;
        identify: (userId: string, traits?: Record<string, unknown>) => void;
        page: (pageName: string, properties?: Record<string, unknown>) => void;
    };
    mixpanel?: {
        track: (eventName: string, properties: Record<string, unknown>) => void;
        identify: (userId: string) => void;
        people: {
            set: (properties: Record<string, unknown>) => void;
        };
    };
    amplitude?: {
        track: (eventName: string, properties: Record<string, unknown>) => void;
        setUserId: (userId: string) => void;
        identify: (identifyObj: unknown) => void;
        Identify: new () => {
            set: (key: string, value: unknown) => void;
        };
    };
    gtag?: (command: string, ...args: unknown[]) => void;
}

declare const window: WindowWithAnalytics;

export interface TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void | Promise<void>;
    identify(identity: UserIdentity): void | Promise<void>;
    screen(screenView: ScreenView, metadata: EventMetadata): void | Promise<void>;
    flush?(): void | Promise<void>;
}

export class ConsoleProvider implements TrackingProvider {
    private readonly storageKey = 'mesa247_tracking_events';
    private readonly maxStoredEvents = 100;

    track(event: TrackingEvent, metadata: EventMetadata): void {
        const payload = {
            type: 'track',
            event: event.name,
            properties: event.properties,
            metadata,
        };

        console.log(`[Tracking] ${event.name}`, JSON.stringify(payload, null, 2));

        this.storeEvent(payload);
    }

    identify(identity: UserIdentity): void {
        const payload = {
            type: 'identify',
            userId: identity.userId,
            traits: identity.traits,
            timestamp: new Date().toISOString(),
        };

        console.log(
            `[Tracking] Identify User: ${identity.userId}`,
            JSON.stringify(payload, null, 2)
        );

        this.storeEvent(payload);
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        const payload = {
            type: 'screen',
            screenName: screenView.screenName,
            properties: screenView.properties,
            metadata,
        };

        console.log(
            `[Tracking] Screen: ${screenView.screenName}`,
            JSON.stringify(payload, null, 2)
        );

        this.storeEvent(payload);
    }

    private storeEvent(payload: unknown): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const events = stored ? JSON.parse(stored) : [];
            events.push(payload);

            const recentEvents = events.slice(-this.maxStoredEvents);
            localStorage.setItem(this.storageKey, JSON.stringify(recentEvents));
        } catch (error) {
            console.error('[Tracking] Failed to store event:', error);
        }
    }
}

export class SegmentProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.track(event.name, {
                ...event.properties,
                ...metadata,
            });
        }
    }

    identify(identity: UserIdentity): void {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.identify(identity.userId, identity.traits);
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.page(screenView.screenName, {
                ...screenView.properties,
                ...metadata,
            });
        }
    }

    flush(): void {}
}

export class MixpanelProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        if (typeof window !== 'undefined' && window.mixpanel) {
            window.mixpanel.track(event.name, {
                ...event.properties,
                ...metadata,
            });
        }
    }

    identify(identity: UserIdentity): void {
        if (typeof window !== 'undefined' && window.mixpanel) {
            window.mixpanel.identify(identity.userId);
            if (identity.traits) {
                window.mixpanel.people.set(identity.traits);
            }
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        this.track(
            {
                name: 'PageViewed',
                properties: {
                    pageName: screenView.screenName,
                    path: (screenView.properties?.path as string) || window.location.pathname,
                    referrer: screenView.properties?.referrer as string | undefined,
                    ...screenView.properties,
                },
            },
            metadata
        );
    }
}

export class AmplitudeProvider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        if (typeof window !== 'undefined' && window.amplitude) {
            window.amplitude.track(event.name, {
                ...event.properties,
                ...metadata,
            });
        }
    }

    identify(identity: UserIdentity): void {
        if (typeof window !== 'undefined' && window.amplitude) {
            window.amplitude.setUserId(identity.userId);
            if (identity.traits) {
                const identifyObj = new window.amplitude.Identify();
                Object.entries(identity.traits).forEach(([key, value]) => {
                    identifyObj.set(key, value);
                });
                window.amplitude.identify(identifyObj);
            }
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        this.track(
            {
                name: 'PageViewed',
                properties: {
                    pageName: screenView.screenName,
                    path: (screenView.properties?.path as string) || window.location.pathname,
                    referrer: screenView.properties?.referrer as string | undefined,
                    ...screenView.properties,
                },
            },
            metadata
        );
    }
}

export class GA4Provider implements TrackingProvider {
    track(event: TrackingEvent, metadata: EventMetadata): void {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', event.name, {
                ...event.properties,
                ...metadata,
            });
        }
    }

    identify(identity: UserIdentity): void {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('set', 'user_id', identity.userId);
            if (identity.traits) {
                window.gtag('set', 'user_properties', identity.traits);
            }
        }
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: screenView.screenName,
                ...screenView.properties,
                ...metadata,
            });
        }
    }
}

export class MultiProvider implements TrackingProvider {
    constructor(private providers: TrackingProvider[]) {}

    track(event: TrackingEvent, metadata: EventMetadata): void {
        this.providers.forEach((provider) => provider.track(event, metadata));
    }

    identify(identity: UserIdentity): void {
        this.providers.forEach((provider) => provider.identify(identity));
    }

    screen(screenView: ScreenView, metadata: EventMetadata): void {
        this.providers.forEach((provider) => provider.screen(screenView, metadata));
    }

    async flush(): Promise<void> {
        await Promise.all(this.providers.map((provider) => provider.flush?.()));
    }
}
