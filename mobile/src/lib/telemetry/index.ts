/**
 * Telemetry / Observability Module (Mobile)
 *
 * Central export for all telemetry functionality.
 */

import { logger as loggerInstance } from './logger';
import { setupGlobalErrorHandlers as setupErrorHandlers } from './errors';

export { logger } from './logger';
export { errorTracker, setupGlobalErrorHandlers } from './errors';
export { metrics, usePerceivedLatency } from './metrics';

export type {
    Logger,
    ErrorTracker,
    MetricsTracker,
    LogLevel,
    LogEntry,
    ErrorSeverity,
    ErrorContext,
    CapturedError,
    MetricType,
    Metric,
    PerceivedLatencyMetric,
} from './types';

export function initTelemetry(): void {
    setupErrorHandlers();

    loggerInstance.info('Telemetry initialized', {
        environment: __DEV__ ? 'development' : 'production',
        version: '1.0.0',
    });
}
