import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { TrackingEvent, UserIdentity, ScreenView, EventMetadata } from './types';
import type { TrackingProvider } from './providers';
import { ConsoleProvider } from './providers';

const config = {
    platform: Platform.OS as 'ios' | 'android',
    version: Constants.expoConfig?.version || '1.0.0',
    environment: (__DEV__ ? 'development' : 'production') as 'development' | 'production',
    tenantId: undefined as string | undefined,
};

let provider: TrackingProvider = new ConsoleProvider();

export function setProvider(newProvider: TrackingProvider): void {
    provider = newProvider;
}

export function setTenantId(tenantId: string): void {
    config.tenantId = tenantId;
}

async function getCurrentUserId(): Promise<string | undefined> {
    try {
        return (await AsyncStorage.getItem('mesa247_user_id')) || undefined;
    } catch {
        return undefined;
    }
}

async function getSessionId(): Promise<string> {
    const SESSION_KEY = 'mesa247_session_id';

    try {
        let sessionId = await AsyncStorage.getItem(SESSION_KEY);

        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await AsyncStorage.setItem(SESSION_KEY, sessionId);
        }

        return sessionId;
    } catch {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}

async function buildMetadata(): Promise<EventMetadata> {
    const [userId, sessionId] = await Promise.all([getCurrentUserId(), getSessionId()]);

    return {
        tenantId: config.tenantId,
        platform: config.platform,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
        version: config.version,
        environment: config.environment,
    };
}

export async function track(event: TrackingEvent): Promise<void> {
    try {
        const metadata = await buildMetadata();
        provider.track(event, metadata);
    } catch (error) {
        console.error('[Tracking] Failed to track event:', error);
    }
}

export async function identify(identity: UserIdentity): Promise<void> {
    try {
        await AsyncStorage.setItem('mesa247_user_id', identity.userId);

        provider.identify(identity);
    } catch (error) {
        console.error('[Tracking] Failed to identify user:', error);
    }
}

export async function screen(screenView: ScreenView): Promise<void> {
    try {
        const metadata = await buildMetadata();
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
export {
    ConsoleProvider,
    SegmentProvider,
    MixpanelProvider,
    AmplitudeProvider,
    FirebaseProvider,
    MultiProvider,
} from './providers';
