import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useAtom } from 'jotai';
import { RestaurantList } from '../src/components/restaurants/RestaurantList';
import { SearchBar } from '../src/components/restaurants/SearchBar';
import { FilterButton } from '../src/components/filters/FilterButton';
import { FilterModal } from '../src/components/filters/FilterModal';
import { useRestaurantsInfinite } from '../src/hooks/useRestaurants';
import { useDebounce } from '../src/hooks/useDebounce';
import { filterModalVisibleAtom } from '../src/store/atoms';
import { screen } from '../src/lib/tracking/index';
import {
    trackSearchPerformed,
    trackFilterApplied,
    trackRestaurantClicked,
} from '../src/lib/tracking/helpers';
import type {
    RestaurantFilters,
    SortOption,
    Restaurant,
    PaginatedResponse,
} from '../src/api/types';

type InfiniteData = {
    pages: PaginatedResponse<Restaurant>[];
    pageParams: unknown[];
};

/**
 * Home Screen - Restaurant Listing
 *
 * Features:
 * - Search with 500ms debounce
 * - Filters (category, price, rating, tags, openNow)
 * - Sorting (rating, distance, price)
 * - Infinite scroll pagination
 * - Tracking (SearchPerformed, FilterApplied, RestaurantViewed)
 *
 * State management:
 * - Search/filters/sort: Local state
 * - Server data: TanStack Query (infinite query)
 * - Filter modal visibility: Jotai atom
 */

function getSortLabel(sort: SortOption): string {
    switch (sort) {
        case 'rating_desc':
            return 'Rating';
        case 'distance_asc':
            return 'Distance';
        case 'price_asc':
            return 'Price';
        default:
            return 'Rating';
    }
}

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filters, setFilters] = React.useState<RestaurantFilters>({});
    const [sortOption, _setSortOption] = React.useState<SortOption>('rating_desc');

    const [filterModalVisible, setFilterModalVisible] = useAtom(filterModalVisibleAtom);

    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useRestaurantsInfinite({
            query: debouncedQuery || undefined,
            filters,
            sort: sortOption,
            pageSize: 12,
        });

    React.useEffect(() => {
        screen({
            screenName: 'RestaurantList',
            properties: {
                pageName: 'home',
            },
        });
    }, []);

    // Track search performed
    React.useEffect(() => {
        const infiniteData = data as unknown as InfiniteData | undefined;
        if (debouncedQuery && infiniteData?.pages?.[0]) {
            const totalResults = infiniteData.pages[0].total || 0;
            const hasFilters = Object.values(filters).some(
                (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
            );
            trackSearchPerformed(debouncedQuery, totalResults, hasFilters);
        }
    }, [debouncedQuery, data, filters]);

    const restaurants = React.useMemo(() => {
        const infiniteData = data as unknown as InfiniteData | undefined;
        return infiniteData?.pages?.flatMap((page) => page.items) || [];
    }, [data]);

    const activeFilterCount = React.useMemo(() => {
        let count = 0;
        if (filters.category && filters.category.length > 0) count++;
        if (filters.priceRange) count++;
        if (filters.minRating) count++;
        if (filters.tags && filters.tags.length > 0) count++;
        if (filters.openNow) count++;
        return count;
    }, [filters]);

    const handleSearchChange = React.useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    const handleSearchClear = React.useCallback(() => {
        setSearchQuery('');
    }, []);

    const handleOpenFilters = React.useCallback(() => {
        setFilterModalVisible(true);
    }, [setFilterModalVisible]);

    const handleCloseFilters = React.useCallback(() => {
        setFilterModalVisible(false);
    }, [setFilterModalVisible]);

    const handleApplyFilters = React.useCallback((newFilters: RestaurantFilters) => {
        setFilters(newFilters);

        // Count active filters
        let activeCount = 0;
        if (newFilters.category && newFilters.category.length > 0) {
            trackFilterApplied('category', newFilters.category.join(','), activeCount + 1);
            activeCount++;
        }
        if (newFilters.priceRange) {
            trackFilterApplied('price', newFilters.priceRange.join('-'), activeCount + 1);
            activeCount++;
        }
        if (newFilters.minRating) {
            trackFilterApplied('rating', newFilters.minRating, activeCount + 1);
            activeCount++;
        }
        if (newFilters.tags && newFilters.tags.length > 0) {
            trackFilterApplied('tags', newFilters.tags.join(','), activeCount + 1);
            activeCount++;
        }
        if (newFilters.openNow) {
            trackFilterApplied('openNow', true, activeCount + 1);
            activeCount++;
        }
    }, []);

    const handleLoadMore = React.useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleRestaurantPress = React.useCallback(
        (restaurant: Restaurant, position: number) => {
            trackRestaurantClicked(
                restaurant.id,
                restaurant.name,
                position,
                searchQuery ? 'search' : 'list'
            );
        },
        [searchQuery]
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Stack.Screen
                options={{
                    title: 'Mesa247',
                    headerLargeTitle: true,
                    headerShadowVisible: false,
                }}
            />
            <SearchBar
                value={searchQuery}
                onChangeText={handleSearchChange}
                onClear={handleSearchClear}
                placeholder="Search restaurants..."
            />
            <View style={styles.toolbar}>
                <FilterButton onPress={handleOpenFilters} activeCount={activeFilterCount} />
                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sort by: {getSortLabel(sortOption)}</Text>
                </View>
            </View>
            {!isLoading && restaurants.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>
                        {(data as unknown as InfiniteData | undefined)?.pages?.[0]?.total || 0}
                        {' restaurants found'}
                    </Text>
                </View>
            )}
            <RestaurantList
                restaurants={restaurants}
                isLoading={isLoading}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
                onLoadMore={handleLoadMore}
                onRestaurantPress={handleRestaurantPress}
                emptyMessage={
                    searchQuery
                        ? `No restaurants found for "${searchQuery}"`
                        : 'No restaurants available'
                }
            />
            <FilterModal
                visible={filterModalVisible}
                onClose={handleCloseFilters}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingLeft: 0,
        paddingRight: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    resultsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f9f9f9',
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});
