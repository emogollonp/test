/**
 * Telemetry / Observability Module (Web)
 *
 * Central export for all telemetry functionality.
 */

import { logger } from './logger';
import { errorTracker, setupGlobalErrorHandlers } from './errors';
import { metrics } from './metrics';

export { logger, errorTracker, setupGlobalErrorHandlers, metrics };
export { usePerceivedLatency } from './metrics';

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
    setupGlobalErrorHandlers();
    metrics.trackWebVitals();

    logger.info('Telemetry initialized', {
        environment: import.meta.env?.MODE || 'production',
        version: import.meta.env?.VITE_APP_VERSION || '1.0.0',
    });
}
