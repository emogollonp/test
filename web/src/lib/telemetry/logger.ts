/**
 * Logger Implementation (Web)
 *
 * Structured logging with levels and context.
 * In production, logs would be sent to a service like Datadog, CloudWatch, or Logtail.
 */

import type { Logger, LogEntry, LogLevel } from './types';

class ConsoleLogger implements Logger {
    private sessionId: string;
    private userId?: string;

    constructor() {
        this.sessionId = this.getOrCreateSessionId();
    }

    private getOrCreateSessionId(): string {
        const SESSION_KEY = 'mesa247_session_id';
        let sessionId = sessionStorage.getItem(SESSION_KEY);

        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem(SESSION_KEY, sessionId);
        }

        return sessionId;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            userId: this.userId,
            sessionId: this.sessionId,
        };

        if (import.meta.env?.MODE === 'development') {
            const colors = {
                debug: 'color: gray',
                info: 'color: blue',
                warn: 'color: orange',
                error: 'color: red',
            };

            console.log(`%c[${level.toUpperCase()}] ${message}`, colors[level], context || '');
        } else {
            console.log(JSON.stringify(entry));
        }
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log('error', message, context);
    }

    setUser(userId: string): void {
        this.userId = userId;
    }
}

export const logger = new ConsoleLogger();
