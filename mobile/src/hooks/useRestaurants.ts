import * as React from 'react';
import {
    useQuery,
    useInfiniteQuery,
    useQueryClient,
    type UseQueryResult,
    type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { searchRestaurants, getRestaurantById } from '../api/fake-api';
import type {
    Restaurant,
    SearchParams,
    PaginatedResponse,
    RestaurantFilters,
    SortOption,
} from '../api/types';

export const restaurantKeys = {
    all: ['restaurants'] as const,
    lists: () => [...restaurantKeys.all, 'list'] as const,
    list: (params: SearchParams) => [...restaurantKeys.lists(), params] as const,
    details: () => [...restaurantKeys.all, 'detail'] as const,
    detail: (id: string) => [...restaurantKeys.details(), id] as const,
};

export interface UseRestaurantsParams {
    query?: string;
    filters?: RestaurantFilters;
    sort?: SortOption;
    page?: number;
    pageSize?: number;
}

export function useRestaurants(
    params: UseRestaurantsParams
): UseQueryResult<PaginatedResponse<Restaurant>> {
    return useQuery({
        queryKey: restaurantKeys.list(params),
        queryFn: () => searchRestaurants(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useRestaurantsInfinite(
    params: Omit<UseRestaurantsParams, 'page'>
): UseInfiniteQueryResult<PaginatedResponse<Restaurant>, Error> {
    return useInfiniteQuery({
        queryKey: restaurantKeys.list({ ...params, page: undefined }),
        queryFn: ({ pageParam = 1 }) => searchRestaurants({ ...params, page: pageParam }),
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    });
}

export function useRestaurant(restaurantId: string): UseQueryResult<Restaurant> {
    return useQuery({
        queryKey: restaurantKeys.detail(restaurantId),
        queryFn: () => getRestaurantById(restaurantId),
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

export function usePrefetchRestaurant() {
    const queryClient = useQueryClient();

    return React.useCallback(
        (restaurantId: string) => {
            const existingData = queryClient.getQueryData(restaurantKeys.detail(restaurantId));
            const queryState = queryClient.getQueryState(restaurantKeys.detail(restaurantId));

            if (existingData && !queryState?.isInvalidated) return;

            queryClient.prefetchQuery({
                queryKey: restaurantKeys.detail(restaurantId),
                queryFn: () => getRestaurantById(restaurantId),
                staleTime: 15 * 60 * 1000,
            });
        },
        [queryClient]
    );
}

export function useInvalidateRestaurants() {
    const queryClient = useQueryClient();

    return React.useMemo(
        () => ({
            invalidateAll: () =>
                queryClient.invalidateQueries({
                    queryKey: restaurantKeys.all,
                }),

            invalidateLists: () =>
                queryClient.invalidateQueries({
                    queryKey: restaurantKeys.lists(),
                }),

            invalidateDetails: () =>
                queryClient.invalidateQueries({
                    queryKey: restaurantKeys.details(),
                }),

            invalidateDetail: (id: string) =>
                queryClient.invalidateQueries({
                    queryKey: restaurantKeys.detail(id),
                }),
        }),
        [queryClient]
    );
}
