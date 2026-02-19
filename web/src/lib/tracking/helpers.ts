/**
 * Tracking Helper Functions - Web
 *
 * Convenience functions for common tracking patterns.
 * These wrap the core track() function with pre-defined event structures.
 */

import { track } from './index';

export function trackSearchPerformed(
    query: string,
    resultsCount: number,
    hasFilters: boolean = false
): void {
    track({
        name: 'SearchPerformed',
        properties: {
            query,
            resultsCount,
            queryLength: query.length,
            hasFilters,
        },
    });
}

export function trackFilterApplied(
    filterType: 'category' | 'price' | 'rating' | 'tags' | 'openNow',
    filterValue: string | number | boolean,
    totalActiveFilters: number
): void {
    track({
        name: 'FilterApplied',
        properties: {
            filterType,
            filterValue,
            filterValueType: typeof filterValue,
            totalActiveFilters,
        },
    });
}

export function trackSortChanged(sortBy: string, previousSort?: string): void {
    track({
        name: 'SortChanged',
        properties: {
            sortBy,
            previousSort,
        },
    });
}

export function trackRestaurantClicked(
    restaurantId: string,
    restaurantName: string,
    position: number,
    source: 'list' | 'search'
): void {
    track({
        name: 'RestaurantClicked',
        properties: {
            restaurantId,
            restaurantName,
            position,
            source,
        },
    });
}

export function trackRestaurantViewed(
    restaurantId: string,
    restaurantName: string,
    category: string,
    rating: number,
    priceLevel: number,
    source: 'list' | 'search' | 'direct'
): void {
    track({
        name: 'RestaurantViewed',
        properties: {
            restaurantId,
            restaurantName,
            category,
            rating,
            priceLevel,
            source,
        },
    });
}

export function trackPageViewed(pageName: string, path: string, referrer?: string): void {
    track({
        name: 'PageViewed',
        properties: {
            pageName,
            path,
            referrer,
        },
    });
}

export function trackLoadMoreClicked(
    currentPage: number,
    totalResults: number,
    resultsLoaded: number
): void {
    track({
        name: 'LoadMoreClicked',
        properties: {
            currentPage,
            totalResults,
            resultsLoaded,
        },
    });
}
