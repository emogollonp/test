import * as React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from 'react-native';
import type { Restaurant } from '../../api/types';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onPress: () => void;
    onPrefetch?: (id: string) => void;
}

// Placeholder image (can be replaced with actual placeholder asset)
const PLACEHOLDER_COLOR = '#e0e0e0';

/**
 * Restaurant Card Component
 *
 * Displays restaurant summary with:
 * - Image with progressive loading + error handling
 * - Name, category, description
 * - Rating, price level, distance
 * - Tags (first 3)
 * - Country and currency
 * - Open/Closed status
 *
 * Performance optimizations:
 * - React.memo prevents unnecessary re-renders
 * - useMemo for expensive calculations (price symbols, display strings)
 * - useCallback for event handlers
 * - Image with loading state and error fallback
 * - Progressive image loading (placeholder → full image)
 */
export const RestaurantCard = React.memo<RestaurantCardProps>(
    ({ restaurant, onPress, onPrefetch }) => {
        const [imageLoading, setImageLoading] = React.useState(true);
        const [imageError, setImageError] = React.useState(false);

        // Memoize expensive calculations
        const priceSymbols = React.useMemo(
            () => '$'.repeat(restaurant.priceLevel),
            [restaurant.priceLevel]
        );

        const displayDistance = React.useMemo(
            () => restaurant.distanceKm.toFixed(1),
            [restaurant.distanceKm]
        );

        const displayRating = React.useMemo(
            () => restaurant.rating.toFixed(1),
            [restaurant.rating]
        );

        const visibleTags = React.useMemo(() => restaurant.tags.slice(0, 3), [restaurant.tags]);

        const remainingTagsCount = React.useMemo(
            () => Math.max(0, restaurant.tags.length - 3),
            [restaurant.tags.length]
        );

        const handlePressIn = React.useCallback(() => {
            onPrefetch?.(restaurant.id);
        }, [onPrefetch, restaurant.id]);

        const handleImageLoadStart = React.useCallback(() => {
            setImageLoading(true);
            setImageError(false);
        }, []);

        const handleImageLoadEnd = React.useCallback(() => {
            setImageLoading(false);
        }, []);

        const handleImageError = React.useCallback(() => {
            setImageLoading(false);
            setImageError(true);
        }, []);

        return (
            <TouchableOpacity
                style={[styles.container, !restaurant.isOpenNow && styles.containerClosed]}
                onPress={onPress}
                onPressIn={handlePressIn}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {imageLoading && (
                        <View style={styles.imagePlaceholder}>
                            <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    )}
                    {imageError && (
                        <View style={styles.imageError}>
                            <Text style={styles.imageErrorIcon}>🍽️</Text>
                            <Text style={styles.imageErrorText}>Image unavailable</Text>
                        </View>
                    )}
                    {!imageError && (
                        <Image
                            source={{ uri: restaurant.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                            onLoadStart={handleImageLoadStart}
                            onLoadEnd={handleImageLoadEnd}
                            onError={handleImageError}
                            {...Platform.select({
                                ios: { cache: 'force-cache' as any },
                                android: { cache: 'force-cache' as any },
                            })}
                        />
                    )}

                    {!restaurant.isOpenNow && (
                        <View style={styles.closedBadge}>
                            <Text style={styles.closedBadgeText}>Closed</Text>
                        </View>
                    )}
                </View>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name} numberOfLines={1}>
                            {restaurant.name}
                        </Text>
                        <Text style={styles.category}>{restaurant.category}</Text>
                    </View>

                    <Text style={styles.description} numberOfLines={2}>
                        {restaurant.description}
                    </Text>

                    {restaurant.tags.length > 0 && (
                        <View style={styles.tags}>
                            {visibleTags.map((tag) => (
                                <View key={tag} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                            {remainingTagsCount > 0 && (
                                <View style={[styles.tag, styles.tagMore]}>
                                    <Text style={styles.tagText}>+{remainingTagsCount}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    <View style={styles.footer}>
                        <View style={styles.stats}>
                            <View style={styles.stat}>
                                <Text style={styles.statIcon}>⭐</Text>
                                <Text style={styles.statText}>{displayRating}</Text>
                                <Text style={styles.statSubtext}>({restaurant.reviewCount})</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statIcon}>💵</Text>
                                <Text style={styles.statText}>{priceSymbols}</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statIcon}>📍</Text>
                                <Text style={styles.statText}>{displayDistance} km</Text>
                            </View>
                        </View>
                        <View style={styles.locale}>
                            <Text style={styles.localeText}>
                                {restaurant.country} • {restaurant.currency}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
);

RestaurantCard.displayName = 'RestaurantCard';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    containerClosed: {
        opacity: 0.7,
    },
    imageContainer: {
        position: 'relative',
        height: 180,
        width: '100%',
    },
    image: {
        height: '100%',
        width: '100%',
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: PLACEHOLDER_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    imageError: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    imageErrorIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    imageErrorText: {
        fontSize: 12,
        color: '#999',
    },
    closedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    closedBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 6,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagMore: {
        backgroundColor: '#e0e0e0',
    },
    tagText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
        marginBottom: 8,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statIcon: {
        fontSize: 14,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    statSubtext: {
        fontSize: 12,
        color: '#999',
    },
    locale: {
        flexDirection: 'row',
    },
    localeText: {
        fontSize: 12,
        color: '#999',
    },
});
