/**
 * Telemetry / Observability - Types (Web)
 *
 * Type definitions for logging, error tracking, and metrics.
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
}

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export interface ErrorContext {
    userId?: string;
    sessionId?: string;
    route?: string;
    component?: string;
    action?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
}

export interface CapturedError {
    error: Error;
    severity: ErrorSeverity;
    context?: ErrorContext;
    timestamp: string;
}

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timing';

export interface Metric {
    name: string;
    type: MetricType;
    value: number;
    timestamp: string;
    tags?: Record<string, string>;
    unit?: string;
}

export interface PerceivedLatencyMetric {
    queryKey: string;
    startTime: number;
    fetchTime?: number;
    renderTime?: number;
    totalLatency?: number;
}

export interface Logger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
}

export interface ErrorTracker {
    captureException(error: Error, context?: ErrorContext): void;
    captureMessage(message: string, severity: ErrorSeverity, context?: ErrorContext): void;
    setUser(userId: string, userData?: Record<string, unknown>): void;
    setContext(key: string, value: Record<string, unknown>): void;
}

export interface MetricsTracker {
    increment(name: string, value?: number, tags?: Record<string, string>): void;
    gauge(name: string, value: number, tags?: Record<string, string>): void;
    timing(name: string, value: number, tags?: Record<string, string>): void;
    histogram(name: string, value: number, tags?: Record<string, string>): void;

    // Perceived latency tracking
    startPerceivedLatency(queryKey: string): void;
    markFetchComplete(queryKey: string): void;
    markRenderComplete(queryKey: string): void;
}
