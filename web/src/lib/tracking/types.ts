/**
 * Tracking Types
 *
 * Type-safe event definitions for analytics tracking.
 * Designed to be provider-agnostic (Segment, Mixpanel, Amplitude, GA4).
 */

/**
 * Common metadata attached to all events
 */
export interface EventMetadata {
    tenantId?: string;
    platform: 'web' | 'mobile';
    timestamp: string;
    sessionId: string;
    userId?: string;
    version: string;
    environment: 'development' | 'production' | 'test';
}

export interface BaseEvent {
    name: string;
    properties: Record<string, unknown>;
}

export type TrackingEvent =
    | {
          name: 'SearchPerformed';
          properties: {
              query: string;
              resultsCount: number;
              queryLength: number;
              hasFilters: boolean;
          };
      }
    | {
          name: 'FilterApplied';
          properties: {
              filterType: 'category' | 'price' | 'rating' | 'tags' | 'openNow';
              filterValue: string | number | boolean;
              filterValueType: string;
              totalActiveFilters: number;
          };
      }
    | {
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
    | {
          name: 'RestaurantClicked';
          properties: {
              restaurantId: string;
              restaurantName: string;
              position: number;
              source: 'list' | 'search';
          };
      }
    | {
          name: 'SortChanged';
          properties: {
              sortBy: string;
              previousSort?: string;
          };
      }
    | {
          name: 'PageViewed';
          properties: {
              pageName: string;
              path: string;
              referrer?: string;
          };
      }
    | {
          name: 'LoadMoreClicked';
          properties: {
              currentPage: number;
              totalResults: number;
              resultsLoaded: number;
          };
      };

export interface UserIdentity {
    userId: string;
    traits?: {
        email?: string;
        name?: string;
        tenantId?: string;
        plan?: string;
        [key: string]: unknown;
    };
}

export interface ScreenView {
    screenName: string;
    properties?: Record<string, unknown>;
}

export interface TrackedEvent {
    event: TrackingEvent;
    metadata: EventMetadata;
}
