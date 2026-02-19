import * as React from 'react';
import { View, TextInput, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

/**
 * Search Bar Component
 *
 * Native-style search input with:
 * - Search icon
 * - Clear button (when has text)
 * - Platform-specific styling
 * - Auto-capitalize disabled
 * - Auto-correct disabled
 */
export const SearchBar = React.memo<SearchBarProps>(
    ({ value, onChangeText, placeholder = 'Search restaurants...', onClear }) => {
        const handleClear = React.useCallback(() => {
            onChangeText('');
            onClear?.();
        }, [onChangeText, onClear]);

        return (
            <View style={styles.container}>
                <Text style={styles.icon}>🔍</Text>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="never"
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginVertical: 12,
        height: 44,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    icon: {
        fontSize: 18,
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingVertical: 8,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    clearIcon: {
        fontSize: 18,
        color: '#999',
        fontWeight: '600',
    },
});
