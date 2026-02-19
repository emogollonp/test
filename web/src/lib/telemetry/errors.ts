/**
 * Error Tracking Implementation (Web)
 *
 * Captures and reports errors with context.
 * Designed to integrate with Sentry in production.
 */

import type { ErrorTracker, ErrorContext, ErrorSeverity } from './types';
import { logger } from './logger';

class SentryErrorTracker implements ErrorTracker {
    private userId?: string;
    private contexts: Map<string, Record<string, unknown>> = new Map();
    private enabled: boolean = true;

    constructor() {
        // In production, initialize Sentry here:
        // Sentry.init({
        //   dsn: import.meta.env.VITE_SENTRY_DSN,
        //   environment: import.meta.env.MODE,
        //   release: import.meta.env.VITE_APP_VERSION,
        //   tracesSampleRate: 0.1,
        //   integrations: [
        //     new Sentry.BrowserTracing(),
        //     new Sentry.Replay(),
        //   ],
        // });
    }

    captureException(error: Error, context?: ErrorContext): void {
        if (!this.enabled) return;

        logger.error(error.message, {
            stack: error.stack,
            ...context,
        });

        // In production with Sentry:
        // Sentry.captureException(error, {
        //   contexts: Object.fromEntries(this.contexts),
        //   user: this.userId ? { id: this.userId } : undefined,
        //   tags: context?.tags,
        //   extra: context?.extra,
        //   level: this.mapSeverity(context?.severity || 'error'),
        // });

        if (import.meta.env?.MODE === 'development') {
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

        // In production with Sentry:
        // Sentry.captureMessage(message, {
        //   level: this.mapSeverity(severity),
        //   contexts: Object.fromEntries(this.contexts),
        //   user: this.userId ? { id: this.userId } : undefined,
        //   tags: context?.tags,
        //   extra: context?.extra,
        // });

        if (import.meta.env?.MODE === 'development') {
            console.warn('[ErrorTracker] Message captured:', {
                message,
                severity,
                context,
            });
        }
    }

    setUser(userId: string, _userData?: Record<string, unknown>): void {
        this.userId = userId;

        // In production with Sentry:
        // Sentry.setUser({
        //   id: userId,
        //   ..._userData,
        // });

        logger.info('User identified', { userId });
    }

    setContext(key: string, value: Record<string, unknown>): void {
        this.contexts.set(key, value);

        // In production with Sentry:
        // Sentry.setContext(key, value);
    }

    // @ts-expect-error: Reserved for future Sentry integration
    private mapSeverity(severity: ErrorSeverity): 'fatal' | 'error' | 'warning' | 'info' {
        // For future Sentry integration
        return severity;
    }

    disable(): void {
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }
}

export const errorTracker = new SentryErrorTracker();

export function setupGlobalErrorHandlers(): void {
    window.addEventListener('error', (event) => {
        errorTracker.captureException(event.error || new Error(event.message), {
            component: 'Global',
            extra: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        errorTracker.captureException(
            event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
            {
                component: 'Global',
                tags: { type: 'unhandled_rejection' },
            }
        );
    });
}
