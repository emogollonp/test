/**
 * Tracking System
 *
 * Central tracking module for analytics events.
 * In production, this would integrate with:
 * - Segment / Mixpanel / Amplitude
 * - Google Analytics 4
 * - Custom backend tracking endpoint
 *
 * For this demo, events are logged to console with structured format.
 */

export type TrackingEvent =
    | 'SearchPerformed'
    | 'FilterApplied'
    | 'SortChanged'
    | 'RestaurantViewed'
    | 'RestaurantClicked'
    | 'PageLoaded'
    | 'LoadMoreClicked'
    | 'ExperimentExposed';

export interface EventProperties {
    [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Track an analytics event
 */
export function track(event: TrackingEvent, properties?: EventProperties): void {
    const timestamp = new Date().toISOString();
    const eventData = {
        event,
        properties: properties || {},
        timestamp,
        sessionId: getSessionId(),
    };

    // Log to console in development
    if (import.meta.env.DEV) {
        console.log('📊 [Tracking]', eventData);
    }

    // In production, send to analytics service
    // Example integrations:
    // - window.analytics?.track(event, properties) // Segment
    // - window.gtag?.('event', event, properties) // GA4
    // - fetch('/api/tracking', { method: 'POST', body: JSON.stringify(eventData) })

    // Store events in localStorage for demo purposes
    try {
        const storedEvents = JSON.parse(localStorage.getItem('tracking_events') || '[]');
        storedEvents.push(eventData);
        // Keep only last 100 events
        if (storedEvents.length > 100) {
            storedEvents.shift();
        }
        localStorage.setItem('tracking_events', JSON.stringify(storedEvents));
    } catch (error) {
        console.error('Failed to store tracking event:', error);
    }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties?: EventProperties): void {
    track('PageLoaded', {
        page: pageName,
        ...properties,
    });
}

/**
 * Track search performed
 */
export function trackSearchPerformed(query: string, resultsCount: number): void {
    track('SearchPerformed', {
        query,
        results_count: resultsCount,
        query_length: query.length,
    });
}

/**
 * Track filter applied
 */
export function trackFilterApplied(
    filterType: string,
    filterValue: string | string[] | number | boolean
): void {
    track('FilterApplied', {
        filter_type: filterType,
        filter_value: Array.isArray(filterValue) ? filterValue.join(',') : String(filterValue),
    });
}

/**
 * Track sort changed
 */
export function trackSortChanged(sortBy: string): void {
    track('SortChanged', {
        sort_by: sortBy,
    });
}

/**
 * Track restaurant clicked
 */
export function trackRestaurantClicked(restaurantId: string, position: number): void {
    track('RestaurantClicked', {
        restaurant_id: restaurantId,
        position,
    });
}

/**
 * Track load more clicked
 */
export function trackLoadMoreClicked(currentPage: number, totalResults: number): void {
    track('LoadMoreClicked', {
        current_page: currentPage,
        total_results: totalResults,
    });
}

/**
 * Get or create a session ID
 */
function getSessionId(): string {
    const SESSION_KEY = 'tracking_session_id';

    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
}

/**
 * Get all tracked events (for debugging)
 */
export function getTrackedEvents(): unknown[] {
    try {
        return JSON.parse(localStorage.getItem('tracking_events') || '[]');
    } catch {
        return [];
    }
}

/**
 * Clear tracked events (for debugging)
 */
export function clearTrackedEvents(): void {
    localStorage.removeItem('tracking_events');
}
