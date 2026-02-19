/**
 * Tracking Helper Functions - Mobile (React Native)
 *
 * Convenience functions for common tracking patterns.
 * These wrap the core track() function with pre-defined event structures.
 */

import { track } from './index';

export async function trackSearchPerformed(
    query: string,
    resultsCount: number,
    hasFilters = false
): Promise<void> {
    await track({
        name: 'SearchPerformed',
        properties: {
            query,
            resultsCount,
            queryLength: query.length,
            hasFilters,
        },
    });
}

export async function trackFilterApplied(
    filterType: 'category' | 'price' | 'rating' | 'tags' | 'openNow',
    filterValue: string | number | boolean,
    totalActiveFilters: number
): Promise<void> {
    await track({
        name: 'FilterApplied',
        properties: {
            filterType,
            filterValue,
            filterValueType: typeof filterValue,
            totalActiveFilters,
        },
    });
}

export async function trackSortChanged(sortBy: string, previousSort?: string): Promise<void> {
    await track({
        name: 'SortChanged',
        properties: {
            sortBy,
            previousSort,
        },
    });
}

export async function trackRestaurantClicked(
    restaurantId: string,
    restaurantName: string,
    position: number,
    source: 'list' | 'search'
): Promise<void> {
    await track({
        name: 'RestaurantClicked',
        properties: {
            restaurantId,
            restaurantName,
            position,
            source,
        },
    });
}

export async function trackRestaurantViewed(
    restaurantId: string,
    restaurantName: string,
    category: string,
    rating: number,
    priceLevel: number,
    source: 'list' | 'search' | 'direct'
): Promise<void> {
    await track({
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

export async function trackPageViewed(
    pageName: string,
    path: string,
    referrer?: string
): Promise<void> {
    await track({
        name: 'PageViewed',
        properties: {
            pageName,
            path,
            referrer,
        },
    });
}

export async function trackLoadMoreClicked(
    currentPage: number,
    totalResults: number,
    resultsLoaded: number
): Promise<void> {
    await track({
        name: 'LoadMoreClicked',
        properties: {
            currentPage,
            totalResults,
            resultsLoaded,
        },
    });
}
