/**
 * Tracking Types - Mobile (React Native)
 *
 * Type-safe event definitions for analytics tracking.
 * All events include automatic metadata (platform, timestamp, sessionId, etc.)
 */

/**
 * Event metadata attached to all events
 */
export interface EventMetadata {
    tenantId?: string;
    platform: 'ios' | 'android';
    timestamp: string;
    sessionId: string;
    userId?: string;
    version: string;
    environment: 'development' | 'production';
}

export interface SearchPerformedEvent {
    name: 'SearchPerformed';
    properties: {
        query: string;
        resultsCount: number;
        queryLength: number;
        hasFilters: boolean;
    };
}

export interface FilterAppliedEvent {
    name: 'FilterApplied';
    properties: {
        filterType: 'category' | 'price' | 'rating' | 'tags' | 'openNow';
        filterValue: string | number | boolean;
        filterValueType: string;
        totalActiveFilters: number;
    };
}

export interface SortChangedEvent {
    name: 'SortChanged';
    properties: {
        sortBy: string;
        previousSort?: string;
    };
}

export interface RestaurantClickedEvent {
    name: 'RestaurantClicked';
    properties: {
        restaurantId: string;
        restaurantName: string;
        position: number;
        source: 'list' | 'search';
    };
}

export interface RestaurantViewedEvent {
    name: 'RestaurantViewed';
    properties: {
        restaurantId: string;
        restaurantName: string;
        category: string;
        rating: number;
        priceLevel: number;
        source: 'list' | 'search' | 'direct';
    };
}

export interface PageViewedEvent {
    name: 'PageViewed';
    properties: {
        pageName: string;
        path: string;
        referrer?: string;
    };
}

export interface LoadMoreClickedEvent {
    name: 'LoadMoreClicked';
    properties: {
        currentPage: number;
        totalResults: number;
        resultsLoaded: number;
    };
}

export interface ExperimentExposedEvent {
    name: 'ExperimentExposed';
    properties: {
        experimentName: string;
        variant: string;
        exposedAt: string;
    };
}

export type TrackingEvent =
    | SearchPerformedEvent
    | FilterAppliedEvent
    | SortChangedEvent
    | RestaurantClickedEvent
    | RestaurantViewedEvent
    | PageViewedEvent
    | LoadMoreClickedEvent
    | ExperimentExposedEvent;

export interface UserIdentity {
    userId: string;
    traits?: Record<string, unknown>;
}

export interface ScreenView {
    screenName: string;
    properties?: Record<string, unknown>;
}
