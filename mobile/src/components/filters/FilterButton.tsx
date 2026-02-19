import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';

interface FilterButtonProps {
    onPress: () => void;
    activeCount?: number;
}

/**
 * Filter Button Component
 *
 * Simple button to open filter modal with:
 * - Filter icon
 * - Active count badge
 * - Platform-specific styling
 */
export const FilterButton = React.memo<FilterButtonProps>(({ onPress, activeCount = 0 }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.icon}>⚙️</Text>
            <Text style={styles.text}>Filters</Text>
            {activeCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
});

FilterButton.displayName = 'FilterButton';

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    icon: {
        fontSize: 16,
        marginRight: 6,
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    badge: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
});
