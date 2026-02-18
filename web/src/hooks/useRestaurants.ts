import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { searchRestaurants, getRestaurantById } from '@/api/fake-api';
import type { SearchParams, Restaurant, PaginatedResponse } from '@/api/types';

/**
 * Custom hook for fetching restaurants with TanStack Query
 *
 * Features:
 * - Automatic caching (staleTime: 5min, gcTime: 10min)
 * - Automatic refetch on mount if stale
 * - Error handling
 * - Loading states
 *
 * @param params - Search parameters (filters, sort, pagination)
 * @returns Query result with data, loading, and error states
 */
export function useRestaurants(params: SearchParams) {
    return useQuery<PaginatedResponse<Restaurant>, Error>({
        queryKey: ['restaurants', 'list', params],
        queryFn: () => searchRestaurants(params),
        // Cache for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep in memory for 10 minutes after last use
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Hook for infinite scrolling with "Load More" pattern
 *
 * @param params - Search parameters (without page, handled automatically)
 * @returns Infinite query result with data, loading, hasNextPage, fetchNextPage
 */
export function useRestaurantsInfinite(params: Omit<SearchParams, 'page'>) {
    return useInfiniteQuery<PaginatedResponse<Restaurant>, Error>({
        queryKey: ['restaurants', 'infinite', params],
        queryFn: ({ pageParam = 1 }) =>
            searchRestaurants({
                ...params,
                page: pageParam as number,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

/**
 * Hook for fetching a single restaurant by ID
 *
 * @param id - Restaurant ID
 * @returns Query result with restaurant data
 */
export function useRestaurant(id: string) {
    return useQuery<Restaurant, Error>({
        queryKey: ['restaurants', 'detail', id],
        queryFn: () => getRestaurantById(id),
        // Cache longer for detail pages (10 minutes)
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        enabled: !!id, // Only fetch if ID is provided
    });
}

/**
 * Hook for prefetching restaurant details
 * Useful for hover/focus states to improve UX
 */
export function usePrefetchRestaurant() {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: ['restaurants', 'detail', id],
            queryFn: () => getRestaurantById(id),
        });
    };
}
