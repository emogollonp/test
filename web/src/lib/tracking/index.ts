import type { TrackingEvent, UserIdentity, ScreenView, EventMetadata } from './types';
import type { TrackingProvider } from './providers';
import { ConsoleProvider } from './providers';

function getEnvironment(): 'development' | 'production' {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.MODE === 'production' ? 'production' : 'development';
    }
    return 'development';
}

const config = {
    platform: 'web' as const,
    version: '1.0.0',
    environment: getEnvironment(),
    tenantId: undefined as string | undefined,
};

let provider: TrackingProvider = new ConsoleProvider();

export function setProvider(newProvider: TrackingProvider): void {
    provider = newProvider;
}

export function setTenantId(tenantId: string): void {
    config.tenantId = tenantId;
}

function getCurrentUserId(): string | undefined {
    try {
        return localStorage.getItem('mesa247_user_id') || undefined;
    } catch {
        return undefined;
    }
}

function getSessionId(): string {
    const SESSION_KEY = 'mesa247_session_id';

    try {
        let sessionId = sessionStorage.getItem(SESSION_KEY);

        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem(SESSION_KEY, sessionId);
        }

        return sessionId;
    } catch {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}

function buildMetadata(): EventMetadata {
    return {
        tenantId: config.tenantId,
        platform: config.platform,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        userId: getCurrentUserId(),
        version: config.version,
        environment: config.environment,
    };
}

export function track(event: TrackingEvent): void {
    try {
        const metadata = buildMetadata();
        provider.track(event, metadata);
    } catch (error) {
        console.error('[Tracking] Failed to track event:', error);
    }
}

export function identify(identity: UserIdentity): void {
    try {
        localStorage.setItem('mesa247_user_id', identity.userId);

        provider.identify(identity);
    } catch (error) {
        console.error('[Tracking] Failed to identify user:', error);
    }
}

export function screen(screenView: ScreenView): void {
    try {
        const metadata = buildMetadata();
        provider.screen(screenView, metadata);
    } catch (error) {
        console.error('[Tracking] Failed to track screen:', error);
    }
}

export function flush(): void {
    try {
        provider.flush?.();
    } catch (error) {
        console.error('[Tracking] Failed to flush events:', error);
    }
}

export type { TrackingEvent, UserIdentity, ScreenView, EventMetadata } from './types';
export type { TrackingProvider } from './providers';
export { ConsoleProvider } from './providers';
export { SegmentProvider } from './providers';
export { MixpanelProvider } from './providers';
export { AmplitudeProvider } from './providers';
export { GA4Provider } from './providers';
export { MultiProvider } from './providers';
