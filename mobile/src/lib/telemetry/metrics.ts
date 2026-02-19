/**
 * Metrics Tracking Implementation (Mobile)
 *
 * Tracks performance metrics and business metrics.
 * Designed to integrate with Firebase Performance Monitoring.
 */

import type { MetricsTracker, Metric, PerceivedLatencyMetric } from './types';
import { logger } from './logger';

class FirebaseMetricsTracker implements MetricsTracker {
    private latencyTracking: Map<string, PerceivedLatencyMetric> = new Map();
    private enabled: boolean = true;

    constructor() {
        // In production, initialize Firebase Performance:
        // import perf from '@react-native-firebase/perf';
        // Performance monitoring is automatically enabled in Firebase
        // perf().setPerformanceCollectionEnabled(true);
    }

    private sendMetric(metric: Metric): void {
        if (!this.enabled) return;

        // In production with Firebase Performance:
        // import analytics from '@react-native-firebase/analytics';
        //
        // analytics().logEvent('custom_metric', {
        //   metric_name: metric.name,
        //   metric_type: metric.type,
        //   metric_value: metric.value,
        //   ...metric.tags,
        // });

        if (__DEV__) logger.debug('Metric sent', { ...metric } as Record<string, unknown>);
    }

    increment(name: string, value: number = 1, tags?: Record<string, string>): void {
        this.sendMetric({
            name,
            type: 'counter',
            value,
            timestamp: new Date().toISOString(),
            tags,
        });
    }

    gauge(name: string, value: number, tags?: Record<string, string>): void {
        this.sendMetric({
            name,
            type: 'gauge',
            value,
            timestamp: new Date().toISOString(),
            tags,
        });
    }

    timing(name: string, value: number, tags?: Record<string, string>): void {
        this.sendMetric({
            name,
            type: 'timing',
            value,
            timestamp: new Date().toISOString(),
            tags,
            unit: 'ms',
        });
    }

    histogram(name: string, value: number, tags?: Record<string, string>): void {
        this.sendMetric({
            name,
            type: 'histogram',
            value,
            timestamp: new Date().toISOString(),
            tags,
        });
    }

    startPerceivedLatency(queryKey: string): void {
        this.latencyTracking.set(queryKey, {
            queryKey,
            startTime: Date.now(),
        });
    }

    markFetchComplete(queryKey: string): void {
        const tracking = this.latencyTracking.get(queryKey);
        if (!tracking) return;

        tracking.fetchTime = Date.now() - tracking.startTime;

        this.timing('api.fetch_time', tracking.fetchTime, {
            query: queryKey,
        });
    }

    markRenderComplete(queryKey: string): void {
        const tracking = this.latencyTracking.get(queryKey);
        if (!tracking) return;

        tracking.renderTime = Date.now() - tracking.startTime;
        tracking.totalLatency = tracking.renderTime;

        this.histogram('api.perceived_latency', tracking.totalLatency, {
            query: queryKey,
        });

        logger.debug('Perceived latency measured', {
            queryKey,
            fetchTime: tracking.fetchTime,
            totalLatency: tracking.totalLatency,
        });

        this.latencyTracking.delete(queryKey);
    }

    trackScreenView(screenName: string): void {
        this.increment('screen_view', 1, {
            screen: screenName,
        });
    }
}

export const metrics = new FirebaseMetricsTracker();

export function usePerceivedLatency(queryKey: string | readonly unknown[]) {
    const key = Array.isArray(queryKey) ? queryKey.join('.') : queryKey;

    return {
        onFetchStart: () => metrics.startPerceivedLatency(key as string),
        onFetchSuccess: () => metrics.markFetchComplete(key as string),
        onRenderComplete: () => metrics.markRenderComplete(key as string),
    };
}
