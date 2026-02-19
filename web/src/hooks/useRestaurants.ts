import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { searchRestaurants, getRestaurantById } from '@/api/fake-api';
import type { SearchParams, Restaurant, PaginatedResponse } from '@/api/types';

/**
 * Query Key Factory
 *
 * Centralized query key management for consistency and type safety.
 *
 * Benefits:
 * - Single source of truth for query keys
 * - Easy to invalidate related queries
 * - Includes tenant context for multi-tenant scenarios
 *
 * Future: Add tenant/country/currency context from app state
 */
export const restaurantKeys = {
    all: ['restaurants'] as const,
    lists: () => [...restaurantKeys.all, 'list'] as const,
    list: (params: SearchParams) => [...restaurantKeys.lists(), params] as const,
    infinites: () => [...restaurantKeys.all, 'infinite'] as const,
    infinite: (params: Omit<SearchParams, 'page'>) =>
        [...restaurantKeys.infinites(), params] as const,
    details: () => [...restaurantKeys.all, 'detail'] as const,
    detail: (id: string) => [...restaurantKeys.details(), id] as const,
};

/**
 * Custom hook for fetching restaurants with TanStack Query
 *
 * Features:
 * - Automatic caching (staleTime: 5min, gcTime: 10min)
 * - Automatic refetch on mount if stale
 * - Error handling
 * - Loading states
 * - Optimized query keys
 *
 * @param params - Search parameters (filters, sort, pagination)
 * @returns Query result with data, loading, and error states
 */
export function useRestaurants(params: SearchParams) {
    return useQuery<PaginatedResponse<Restaurant>, Error>({
        queryKey: restaurantKeys.list(params),
        queryFn: () => searchRestaurants(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Hook for infinite scrolling with "Load More" pattern
 *
 * Features:
 * - Optimized for list pagination
 * - Longer cache times (list data is append-only)
 * - Automatic page management
 *
 * @param params - Search parameters (without page, handled automatically)
 * @returns Infinite query result with data, loading, hasNextPage, fetchNextPage
 */
export function useRestaurantsInfinite(params: Omit<SearchParams, 'page'>) {
    return useInfiniteQuery<PaginatedResponse<Restaurant>, Error>({
        queryKey: restaurantKeys.infinite(params),
        queryFn: ({ pageParam = 1 }) =>
            searchRestaurants({
                ...params,
                page: pageParam as number,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    });
}

/**
 * Hook for fetching a single restaurant by ID
 *
 * Features:
 * - Longest cache time (detail data rarely changes)
 * - Optimized query key
 * - Conditional fetching
 *
 * Performance: Detail data is cached longest because:
 * - Restaurant details change infrequently
 * - Users often revisit same restaurants
 * - Reduces API calls significantly
 *
 * @param id - Restaurant ID
 * @returns Query result with restaurant data
 */
export function useRestaurant(id: string) {
    return useQuery<Restaurant, Error>({
        queryKey: restaurantKeys.detail(id),
        queryFn: () => getRestaurantById(id),
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        enabled: !!id,
    });
}

/**
 * Hook for prefetching restaurant details
 *
 * Use cases:
 * - Prefetch on hover (improves perceived performance)
 * - Prefetch on focus (keyboard navigation)
 * - Prefetch visible cards (intersection observer)
 *
 * Optimization: Only prefetches if data is not already cached and fresh.
 * This prevents unnecessary network requests.
 *
 * @returns Function to prefetch restaurant by ID
 */
export function usePrefetchRestaurant() {
    const queryClient = useQueryClient();

    return (id: string) => {
        const existingData = queryClient.getQueryData(restaurantKeys.detail(id));
        const queryState = queryClient.getQueryState(restaurantKeys.detail(id));

        if (
            existingData &&
            queryState &&
            !queryState.isInvalidated &&
            queryState.dataUpdatedAt &&
            Date.now() - queryState.dataUpdatedAt < 15 * 60 * 1000
        ) {
            return;
        }

        queryClient.prefetchQuery({
            queryKey: restaurantKeys.detail(id),
            queryFn: () => getRestaurantById(id),
            staleTime: 15 * 60 * 1000,
        });
    };
}

/**
 * Hook to invalidate restaurant queries
 *
 * Use cases:
 * - After mutation (create/update/delete restaurant)
 * - After tenant switch
 * - Manual refresh
 *
 * @returns Object with invalidation functions
 */
export function useInvalidateRestaurants() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: restaurantKeys.all }),

        invalidateLists: () => queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() }),

        invalidateDetails: () =>
            queryClient.invalidateQueries({ queryKey: restaurantKeys.details() }),

        invalidateDetail: (id: string) =>
            queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(id) }),
    };
}
