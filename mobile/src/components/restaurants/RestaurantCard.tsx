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
import { getExperiment, type RestaurantCardVariant } from '../../lib/experiments';
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
 * Displays restaurant summary with A/B test variants:
 * - Variant A (compact): Original compact design
 * - Variant B (extended): Enhanced design with more details
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
        const [variant, setVariant] = React.useState<RestaurantCardVariant>('compact');

        React.useEffect(() => {
            getExperiment('restaurant_card_variant').then(setVariant);
        }, []);

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

        if (variant === 'compact') {
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
                                    <Text style={styles.statSubtext}>
                                        ({restaurant.reviewCount})
                                    </Text>
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

        return (
            <TouchableOpacity
                style={[
                    styles.container,
                    styles.containerExtended,
                    !restaurant.isOpenNow && styles.containerClosed,
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainerExtended}>
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
                    <View style={styles.openBadge}>
                        <Text
                            style={[
                                styles.openBadgeText,
                                !restaurant.isOpenNow && styles.openBadgeTextClosed,
                            ]}
                        >
                            {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>
                </View>
                <View style={styles.contentExtended}>
                    <View style={styles.header}>
                        <Text style={styles.nameExtended} numberOfLines={1}>
                            {restaurant.name}
                        </Text>
                        <Text style={styles.category}>{restaurant.category}</Text>
                    </View>

                    <Text style={styles.descriptionExtended} numberOfLines={3}>
                        {restaurant.description}
                    </Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statExtended}>
                            <Text style={styles.statIcon}>⭐</Text>
                            <View>
                                <Text style={styles.statTextExtended}>{displayRating}</Text>
                                <Text style={styles.statLabelExtended}>
                                    {restaurant.reviewCount} reviews
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statExtended}>
                            <Text style={styles.statIcon}>💵</Text>
                            <View>
                                <Text style={styles.statTextExtended}>{priceSymbols}</Text>
                                <Text style={styles.statLabelExtended}>Price</Text>
                            </View>
                        </View>
                        <View style={styles.statExtended}>
                            <Text style={styles.statIcon}>📍</Text>
                            <View>
                                <Text style={styles.statTextExtended}>{displayDistance} km</Text>
                                <Text style={styles.statLabelExtended}>Distance</Text>
                            </View>
                        </View>
                        <View style={styles.statExtended}>
                            <Text style={styles.statIcon}>👥</Text>
                            <View>
                                <Text style={styles.statTextExtended}>
                                    {restaurant.reviewCount}
                                </Text>
                                <Text style={styles.statLabelExtended}>Reviews</Text>
                            </View>
                        </View>
                    </View>
                    {restaurant.tags.length > 0 && (
                        <View style={styles.tagsExtended}>
                            {restaurant.tags.slice(0, 4).map((tag) => (
                                <View key={tag} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                            {restaurant.tags.length > 4 && (
                                <View style={[styles.tag, styles.tagMore]}>
                                    <Text style={styles.tagText}>
                                        +{restaurant.tags.length - 4} more
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                    <View style={styles.footerExtended}>
                        <View style={styles.localeExtended}>
                            <Text style={styles.localeIconExtended}>🌍</Text>
                            <Text style={styles.localeTextExtended}>
                                {restaurant.isOpenNow ? 'Open now' : 'Closed'}
                            </Text>
                        </View>
                        <View style={styles.localeExtended}>
                            <Text style={styles.localeTextExtended}>
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
    containerExtended: {
        // Extended variant has slightly more padding
    },
    containerClosed: {
        opacity: 0.7,
    },
    imageContainer: {
        position: 'relative',
        height: 180,
        width: '100%',
    },
    imageContainerExtended: {
        position: 'relative',
        height: 220,
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
    openBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    openBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    openBadgeTextClosed: {
        backgroundColor: '#666',
    },
    content: {
        padding: 16,
    },
    contentExtended: {
        padding: 20,
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
    nameExtended: {
        fontSize: 20,
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
    descriptionExtended: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 16,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 6,
    },
    tagsExtended: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8,
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
    footerExtended: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statExtended: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '45%',
    },
    statIcon: {
        fontSize: 14,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    statTextExtended: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    statLabelExtended: {
        fontSize: 12,
        color: '#666',
    },
    statSubtext: {
        fontSize: 12,
        color: '#999',
    },
    locale: {
        flexDirection: 'row',
    },
    localeExtended: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    localeIconExtended: {
        fontSize: 12,
    },
    localeText: {
        fontSize: 12,
        color: '#999',
    },
    localeTextExtended: {
        fontSize: 12,
        color: '#666',
    },
});
