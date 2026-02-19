/**
 * Logger Implementation (Mobile)
 *
 * Structured logging with levels and context.
 * In production, logs would be sent to Firebase Analytics or Datadog.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Logger, LogEntry, LogLevel } from './types';

class ConsoleLogger implements Logger {
    private sessionId: string | null = null;
    private userId?: string;

    constructor() {
        this.initializeSessionId();
    }

    private async initializeSessionId(): Promise<void> {
        const SESSION_KEY = 'mesa247_session_id';

        try {
            let sessionId = await AsyncStorage.getItem(SESSION_KEY);

            if (!sessionId) {
                sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                await AsyncStorage.setItem(SESSION_KEY, sessionId);
            }

            this.sessionId = sessionId;
        } catch (error) {
            console.error('[Logger] Failed to initialize session ID:', error);
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            userId: this.userId,
            sessionId: this.sessionId || undefined,
        };

        if (__DEV__) {
            const emoji = {
                debug: '🐛',
                info: 'ℹ️',
                warn: '⚠️',
                error: '❌',
            };

            console.log(`${emoji[level]} [${level.toUpperCase()}] ${message}`, context || '');
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
