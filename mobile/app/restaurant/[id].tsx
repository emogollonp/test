import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RestaurantSchedule } from '../../src/components/restaurants/RestaurantSchedule';
import { useRestaurant } from '../../src/hooks/useRestaurants';
import { screen } from '../../src/lib/tracking/index';
import { trackRestaurantViewed } from '../../src/lib/tracking/helpers';

/**
 * Restaurant Detail Screen
 *
 * Features:
 * - Dynamic route parameter [id]
 * - Full restaurant information
 * - Schedule with timezone
 * - Loading skeleton
 * - Error state
 * - Back navigation
 * - Tracking (RestaurantViewed)
 *
 * State management:
 * - Server data: TanStack Query (single detail query)
 */
export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: restaurant, isLoading, error } = useRestaurant(id!);

    React.useEffect(() => {
        if (restaurant) {
            screen({
                screenName: 'RestaurantDetail',
                properties: {
                    restaurantId: restaurant.id,
                },
            });
            trackRestaurantViewed(
                restaurant.id,
                restaurant.name,
                restaurant.category,
                restaurant.rating,
                restaurant.priceLevel,
                'direct'
            );
        }
    }, [restaurant]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <Stack.Screen options={{ title: 'Loading...' }} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading restaurant...</Text>
                </View>
            </View>
        );
    }

    if (error || !restaurant) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <Stack.Screen options={{ title: 'Error' }} />
                <View style={styles.centered}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorTitle}>
                        {error ? 'Failed to load' : 'Restaurant not found'}
                    </Text>
                    <Text style={styles.errorText}>
                        {error
                            ? 'There was an error loading this restaurant.'
                            : `No restaurant found with ID: ${id}`}
                    </Text>
                    <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const priceSymbols = '$'.repeat(restaurant.priceLevel);

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Stack.Screen
                options={{
                    title: restaurant.name,
                    headerBackTitle: 'Back',
                }}
            />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: restaurant.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    {!restaurant.isOpenNow && (
                        <View style={styles.closedBadge}>
                            <Text style={styles.closedBadgeText}>Closed</Text>
                        </View>
                    )}
                </View>
                <View style={styles.header}>
                    <Text style={styles.name}>{restaurant.name}</Text>
                    <Text style={styles.category}>{restaurant.category}</Text>
                    <View style={styles.stats}>
                        <View style={styles.stat}>
                            <Text style={styles.statIcon}>⭐</Text>
                            <Text style={styles.statText}>{restaurant.rating.toFixed(1)}</Text>
                            <Text style={styles.statSubtext}>
                                ({restaurant.reviewCount} reviews)
                            </Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statIcon}>💵</Text>
                            <Text style={styles.statText}>{priceSymbols}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statIcon}>📍</Text>
                            <Text style={styles.statText}>
                                {restaurant.distanceKm.toFixed(1)} km
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>{restaurant.description}</Text>
                </View>
                {restaurant.tags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Features</Text>
                        <View style={styles.tags}>
                            {restaurant.tags.map((tag) => (
                                <View key={tag} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                <View style={styles.section}>
                    <RestaurantSchedule
                        schedule={restaurant.schedule}
                        timezone={restaurant.timezone}
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactRow}>
                        <Text style={styles.contactIcon}>📍</Text>
                        <Text style={styles.contactText}>{restaurant.address}</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Text style={styles.contactIcon}>📞</Text>
                        <Text style={styles.contactText}>{restaurant.phone}</Text>
                    </View>
                </View>
                <View style={[styles.section, styles.sectionLast]}>
                    <Text style={styles.sectionTitle}>Location Details</Text>
                    <View style={styles.localeInfo}>
                        <View style={styles.localeRow}>
                            <Text style={styles.localeLabel}>Country:</Text>
                            <Text style={styles.localeValue}>{restaurant.country}</Text>
                        </View>
                        <View style={styles.localeRow}>
                            <Text style={styles.localeLabel}>Currency:</Text>
                            <Text style={styles.localeValue}>{restaurant.currency}</Text>
                        </View>
                        <View style={styles.localeRow}>
                            <Text style={styles.localeLabel}>Timezone:</Text>
                            <Text style={styles.localeValue}>{restaurant.timezone}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    errorButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    imageContainer: {
        position: 'relative',
        height: 280,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closedBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    closedBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 12,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6,
    },
    category: {
        fontSize: 16,
        color: '#666',
        textTransform: 'capitalize',
        marginBottom: 16,
    },
    stats: {
        flexDirection: 'row',
        gap: 20,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statIcon: {
        fontSize: 18,
    },
    statText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    statSubtext: {
        fontSize: 14,
        color: '#999',
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 12,
    },
    sectionLast: {
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 28,
    },
    contactText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    localeInfo: {
        gap: 12,
    },
    localeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    localeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    localeValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
});
