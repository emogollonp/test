/**
 * Metrics Tracking Implementation (Web)
 *
 * Tracks performance metrics and business metrics.
 * Designed to integrate with Datadog, CloudWatch, or similar.
 */

import type { MetricsTracker, Metric, PerceivedLatencyMetric } from './types';
import { logger } from './logger';

class DatadogMetricsTracker implements MetricsTracker {
    private latencyTracking: Map<string, PerceivedLatencyMetric> = new Map();
    private enabled: boolean = true;

    constructor() {
        // In production, initialize Datadog RUM:
        // datadogRum.init({
        //   applicationId: import.meta.env.VITE_DATADOG_APP_ID,
        //   clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
        //   site: 'datadoghq.com',
        //   service: 'mesa247-web',
        //   env: import.meta.env.MODE,
        //   version: import.meta.env.VITE_APP_VERSION,
        //   sessionSampleRate: 100,
        //   sessionReplaySampleRate: 20,
        //   trackUserInteractions: true,
        //   trackResources: true,
        //   trackLongTasks: true,
        //   defaultPrivacyLevel: 'mask-user-input',
        // });
    }

    private sendMetric(metric: Metric): void {
        if (!this.enabled) return;

        // In production with Datadog:
        // datadogRum.addAction(metric.name, {
        //   type: metric.type,
        //   value: metric.value,
        //   tags: metric.tags,
        //   unit: metric.unit,
        // });

        if (import.meta.env?.MODE === 'development') {
            logger.debug('Metric sent', metric as unknown as Record<string, unknown>);
        }
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
            startTime: performance.now(),
        });
    }

    markFetchComplete(queryKey: string): void {
        const tracking = this.latencyTracking.get(queryKey);
        if (!tracking) return;

        tracking.fetchTime = performance.now() - tracking.startTime;

        this.timing('api.fetch_time', tracking.fetchTime, {
            query: queryKey,
        });
    }

    markRenderComplete(queryKey: string): void {
        const tracking = this.latencyTracking.get(queryKey);
        if (!tracking) return;

        tracking.renderTime = performance.now() - tracking.startTime;
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

    trackWebVitals(): void {
        if (typeof window === 'undefined') return;

        if ('web-vital' in window) {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
                    renderTime?: number;
                    loadTime?: number;
                };
                this.timing('web_vitals.lcp', lastEntry.renderTime || lastEntry.loadTime || 0);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    const fidEntry = entry as PerformanceEntry & { processingStart: number };
                    this.timing('web_vitals.fid', fidEntry.processingStart - fidEntry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            let clsValue = 0;
            new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    const clsEntry = entry as PerformanceEntry & {
                        hadRecentInput?: boolean;
                        value: number;
                    };
                    if (!clsEntry.hadRecentInput) {
                        clsValue += clsEntry.value;
                        this.gauge('web_vitals.cls', clsValue);
                    }
                });
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }
}

export const metrics = new DatadogMetricsTracker();

export function usePerceivedLatency(queryKey: string | readonly unknown[]) {
    const key = Array.isArray(queryKey) ? queryKey.join('.') : queryKey;

    return {
        onFetchStart: () => metrics.startPerceivedLatency(key as string),
        onFetchSuccess: () => metrics.markFetchComplete(key as string),
        onRenderComplete: () => metrics.markRenderComplete(key as string),
    };
}
