import * as React from 'react';
import {
    FlatList,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    type ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { RestaurantCard } from './RestaurantCard';
import { usePrefetchRestaurant } from '../../hooks/useRestaurants';
import type { Restaurant } from '../../api/types';

interface RestaurantListProps {
    restaurants: Restaurant[];
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onRestaurantPress?: (restaurant: Restaurant) => void;
    emptyMessage?: string;
}

// Constants for FlatList optimization
const ITEM_HEIGHT = 380; // Approx: 180px image + 200px content

/**
 * Restaurant List Component
 *
 * Highly optimized FlatList for restaurant cards with:
 * - Efficient keyExtractor (stable, unique IDs)
 * - getItemLayout for predictable heights (enables instant scrolling)
 * - initialNumToRender optimized for viewport
 * - windowSize tuned for memory/performance balance
 * - removeClippedSubviews for native memory optimization
 * - onEndReached for infinite scroll
 * - Loading states (initial + load more)
 * - Empty state
 * - Prefetch on press for instant navigation
 *
 * Performance optimizations:
 * - React.memo on RestaurantCard prevents unnecessary re-renders
 * - useCallback for all render functions (prevents function recreation)
 * - getItemLayout enables instant scrolling to any position
 * - initialNumToRender: 8 (optimized for ~2 screens worth)
 * - maxToRenderPerBatch: 5 (smaller batches = smoother UI)
 * - windowSize: 7 (3.5 screens above/below = good balance)
 * - updateCellsBatchingPeriod: 100ms (balanced responsiveness)
 * - removeClippedSubviews: true (native optimization for offscreen views)
 */
export const RestaurantList = React.memo<RestaurantListProps>(
    ({
        restaurants,
        isLoading = false,
        isLoadingMore = false,
        hasMore = false,
        onLoadMore,
        onRestaurantPress,
        emptyMessage = 'No restaurants found',
    }) => {
        const router = useRouter();
        const prefetchRestaurant = usePrefetchRestaurant();

        const handleRestaurantPress = React.useCallback(
            (restaurant: Restaurant) => {
                onRestaurantPress?.(restaurant);
                router.push(`/restaurant/${restaurant.id}`);
            },
            [router, onRestaurantPress]
        );

        const handlePrefetch = React.useCallback(
            (id: string) => {
                prefetchRestaurant(id);
            },
            [prefetchRestaurant]
        );

        const renderItem: ListRenderItem<Restaurant> = React.useCallback(
            ({ item }) => (
                <RestaurantCard
                    restaurant={item}
                    onPress={() => handleRestaurantPress(item)}
                    onPrefetch={handlePrefetch}
                />
            ),
            [handleRestaurantPress, handlePrefetch]
        );

        const renderFooter = React.useCallback(() => {
            if (!isLoadingMore) return null;

            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.footerText}>Loading more...</Text>
                </View>
            );
        }, [isLoadingMore]);

        const renderEmpty = React.useCallback(() => {
            if (isLoading) {
                return (
                    <View style={styles.empty}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.emptyText}>Loading restaurants...</Text>
                    </View>
                );
            }

            return (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🍽️</Text>
                    <Text style={styles.emptyText}>{emptyMessage}</Text>
                </View>
            );
        }, [isLoading, emptyMessage]);

        const keyExtractor = React.useCallback((item: Restaurant) => item.id, []);

        const handleEndReached = React.useCallback(() => {
            if (hasMore && !isLoadingMore && onLoadMore) {
                onLoadMore();
            }
        }, [hasMore, isLoadingMore, onLoadMore]);

        const getItemLayout = React.useCallback(
            (_: any, index: number) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
            }),
            []
        );

        return (
            <FlatList
                data={restaurants}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                initialNumToRender={8}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={100}
                windowSize={7}
                removeClippedSubviews={true}
                disableVirtualization={false}
                maintainVisibleContentPosition={undefined}
            />
        );
    }
);

RestaurantList.displayName = 'RestaurantList';

const styles = StyleSheet.create({
    contentContainer: {
        paddingVertical: 8,
        flexGrow: 1,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
