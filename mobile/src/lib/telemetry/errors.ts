/**
 * Error Tracking Implementation (Mobile)
 *
 * Captures and reports errors with context.
 * Designed to integrate with Firebase Crashlytics in production.
 */

import type { ErrorTracker, ErrorContext, ErrorSeverity } from './types';
import { logger } from './logger';

class CrashlyticsErrorTracker implements ErrorTracker {
    private userId?: string;
    private contexts: Map<string, Record<string, unknown>> = new Map();
    private enabled: boolean = true;

    constructor() {
        // In production, Firebase Crashlytics is initialized here:
        // import crashlytics from '@react-native-firebase/crashlytics';
        // Enable crash collection in production
        // if (!__DEV__) {
        //   crashlytics().setCrashlyticsCollectionEnabled(true);
        // }
    }

    captureException(error: Error, context?: ErrorContext): void {
        if (!this.enabled) return;

        logger.error(error.message, {
            stack: error.stack,
            ...context,
        });

        // In production with Crashlytics:
        // import crashlytics from '@react-native-firebase/crashlytics';
        //
        // crashlytics().recordError(error, {
        //   attributes: {
        //     screen: context?.screen,
        //     component: context?.component,
        //     action: context?.action,
        //     ...context?.tags,
        //   },
        // });
        //
        // Custom keys for additional context:
        // if (context?.extra) {
        //   Object.entries(context.extra).forEach(([key, value]) => {
        //     crashlytics().setAttribute(key, String(value));
        //   });
        // }

        // Store for debugging
        if (__DEV__) {
            console.error('[ErrorTracker] Exception captured:', {
                error,
                context,
                userId: this.userId,
            });
        }
    }

    captureMessage(message: string, severity: ErrorSeverity, context?: ErrorContext): void {
        if (!this.enabled) return;

        logger.warn(message, { severity, ...context });

        // In production with Crashlytics:
        // import crashlytics from '@react-native-firebase/crashlytics';
        //
        // crashlytics().log(`[${severity.toUpperCase()}] ${message}`);
        //
        // For non-fatal errors:
        // if (severity === 'error' || severity === 'fatal') {
        //   crashlytics().recordError(new Error(message));
        // }

        if (__DEV__) {
            console.warn('[ErrorTracker] Message captured:', {
                message,
                severity,
                context,
            });
        }
    }

    setUser(userId: string, userData?: Record<string, unknown>): void {
        this.userId = userId;

        // In production with Crashlytics:
        // import crashlytics from '@react-native-firebase/crashlytics';
        //
        // crashlytics().setUserId(userId);
        //
        // if (userData) {
        //   Object.entries(userData).forEach(([key, value]) => {
        //     crashlytics().setAttribute(key, String(value));
        //   });
        // }

        logger.info('User identified', { userId });
    }

    setContext(key: string, value: Record<string, unknown>): void {
        this.contexts.set(key, value);

        // In production with Crashlytics:
        // import crashlytics from '@react-native-firebase/crashlytics';
        //
        // Object.entries(value).forEach(([k, v]) => {
        //   crashlytics().setAttribute(`${key}.${k}`, String(v));
        // });
    }

    disable(): void {
        this.enabled = false;
        // Opt user out of crash reporting:
        // crashlytics().setCrashlyticsCollectionEnabled(false);
    }

    enable(): void {
        this.enabled = true;
        // Opt user in to crash reporting:
        // crashlytics().setCrashlyticsCollectionEnabled(true);
    }
}

// Singleton instance
export const errorTracker = new CrashlyticsErrorTracker();

/**
 * Global error handler
 *
 * Set up global error handlers for React Native.
 * Call this early in app initialization.
 */
export function setupGlobalErrorHandlers(): void {
    // React Native already has built-in error handling,
    // but we can enhance it with our error tracker

    const previousHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
        errorTracker.captureException(error, {
            component: 'Global',
            tags: {
                fatal: String(isFatal),
            },
        });

        // Call the previous handler
        if (previousHandler) {
            previousHandler(error, isFatal);
        }
    });
}
