import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Switch,
    Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { RestaurantFilters, RestaurantCategory } from '../../api/types';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: RestaurantFilters) => void;
    initialFilters?: RestaurantFilters;
}

type FilterFormData = {
    categories: RestaurantCategory[];
    minPrice: number;
    maxPrice: number;
    minRating: number;
    tags: string[];
    openNow: boolean;
};

const CATEGORIES: RestaurantCategory[] = [
    'italian',
    'mexican',
    'pizza',
    'asian',
    'burgers',
    'seafood',
    'vegetarian',
    'steakhouse',
    'cafe',
    'bakery',
    'sushi',
    'bbq',
];

const POPULAR_TAGS = [
    'Family Friendly',
    'Romantic',
    'Outdoor Seating',
    'Vegan Options',
    'Gluten Free',
    'Delivery',
    'Takeout',
    'WiFi',
];

const RATING_OPTIONS = [
    { label: 'Any', value: 0 },
    { label: '3.0+', value: 3 },
    { label: '3.5+', value: 3.5 },
    { label: '4.0+', value: 4 },
    { label: '4.5+', value: 4.5 },
];

/**
 * Filter Modal Component
 *
 * Full-screen modal with React Hook Form for filters:
 * - Categories (multi-select)
 * - Price range (1-4)
 * - Minimum rating
 * - Tags (multi-select)
 * - Open now (toggle)
 *
 * Features:
 * - Form validation
 * - Reset to defaults
 * - Apply and close
 * - Cancel without applying
 */
export const FilterModal = React.memo<FilterModalProps>(
    ({ visible, onClose, onApply, initialFilters }) => {
        const { control, handleSubmit, reset } = useForm<FilterFormData>({
            defaultValues: {
                categories: initialFilters?.category || [],
                minPrice: initialFilters?.priceRange?.[0] || 1,
                maxPrice: initialFilters?.priceRange?.[1] || 4,
                minRating: initialFilters?.minRating || 0,
                tags: initialFilters?.tags || [],
                openNow: initialFilters?.openNow || false,
            },
        });

        React.useEffect(() => {
            if (visible && initialFilters) {
                reset({
                    categories: initialFilters.category || [],
                    minPrice: initialFilters.priceRange?.[0] || 1,
                    maxPrice: initialFilters.priceRange?.[1] || 4,
                    minRating: initialFilters.minRating || 0,
                    tags: initialFilters.tags || [],
                    openNow: initialFilters.openNow || false,
                });
            }
        }, [visible, initialFilters, reset]);

        const onSubmit = (data: FilterFormData) => {
            const filters: RestaurantFilters = {
                category: data.categories.length > 0 ? data.categories : undefined,
                priceRange:
                    data.minPrice !== 1 || data.maxPrice !== 4
                        ? [data.minPrice, data.maxPrice]
                        : undefined,
                minRating: data.minRating > 0 ? data.minRating : undefined,
                tags: data.tags.length > 0 ? data.tags : undefined,
                openNow: data.openNow || undefined,
            };

            onApply(filters);
            onClose();
        };

        const handleReset = () => {
            reset({
                categories: [],
                minPrice: 1,
                maxPrice: 4,
                minRating: 0,
                tags: [],
                openNow: false,
            });
        };

        const handleCancel = () => {
            reset();
            onClose();
        };

        return (
            <Modal
                visible={visible}
                animationType="slide"
                transparent={false}
                onRequestClose={handleCancel}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
                            <Text style={styles.resetText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            <Controller
                                control={control}
                                name="categories"
                                render={({ field: { value, onChange } }) => (
                                    <View style={styles.chipContainer}>
                                        {CATEGORIES.map((category) => {
                                            const isSelected = value.includes(category);
                                            return (
                                                <TouchableOpacity
                                                    key={category}
                                                    style={[
                                                        styles.chip,
                                                        isSelected && styles.chipSelected,
                                                    ]}
                                                    onPress={() => {
                                                        if (isSelected) {
                                                            onChange(
                                                                value.filter((c) => c !== category)
                                                            );
                                                        } else onChange([...value, category]);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            isSelected && styles.chipTextSelected,
                                                        ]}
                                                    >
                                                        {category}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Price Level</Text>
                            <Controller
                                control={control}
                                name="minPrice"
                                render={({ field: { value: minPrice, onChange: onMinChange } }) => (
                                    <Controller
                                        control={control}
                                        name="maxPrice"
                                        render={({
                                            field: { value: maxPrice, onChange: onMaxChange },
                                        }) => (
                                            <View style={styles.priceContainer}>
                                                {[1, 2, 3, 4].map((price) => {
                                                    const isInRange =
                                                        price >= minPrice && price <= maxPrice;
                                                    return (
                                                        <TouchableOpacity
                                                            key={price}
                                                            style={[
                                                                styles.priceButton,
                                                                isInRange &&
                                                                    styles.priceButtonSelected,
                                                            ]}
                                                            onPress={() => {
                                                                if (isInRange) {
                                                                    if (price === minPrice) {
                                                                        onMinChange(
                                                                            Math.min(
                                                                                price + 1,
                                                                                maxPrice
                                                                            )
                                                                        );
                                                                    } else if (price === maxPrice) {
                                                                        onMaxChange(
                                                                            Math.max(
                                                                                price - 1,
                                                                                minPrice
                                                                            )
                                                                        );
                                                                    }
                                                                } else {
                                                                    if (price < minPrice) {
                                                                        onMinChange(price);
                                                                    } else onMaxChange(price);
                                                                }
                                                            }}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.priceText,
                                                                    isInRange &&
                                                                        styles.priceTextSelected,
                                                                ]}
                                                            >
                                                                {'$'.repeat(price)}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    />
                                )}
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Minimum Rating</Text>
                            <Controller
                                control={control}
                                name="minRating"
                                render={({ field: { value, onChange } }) => (
                                    <View style={styles.ratingContainer}>
                                        {RATING_OPTIONS.map((option) => {
                                            const isSelected = value === option.value;
                                            return (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    style={[
                                                        styles.ratingButton,
                                                        isSelected && styles.ratingButtonSelected,
                                                    ]}
                                                    onPress={() => onChange(option.value)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.ratingText,
                                                            isSelected && styles.ratingTextSelected,
                                                        ]}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tags</Text>
                            <Controller
                                control={control}
                                name="tags"
                                render={({ field: { value, onChange } }) => (
                                    <View style={styles.chipContainer}>
                                        {POPULAR_TAGS.map((tag) => {
                                            const isSelected = value.includes(tag);
                                            return (
                                                <TouchableOpacity
                                                    key={tag}
                                                    style={[
                                                        styles.chip,
                                                        isSelected && styles.chipSelected,
                                                    ]}
                                                    onPress={() => {
                                                        if (isSelected) {
                                                            onChange(
                                                                value.filter((t) => t !== tag)
                                                            );
                                                        } else onChange([...value, tag]);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            isSelected && styles.chipTextSelected,
                                                        ]}
                                                    >
                                                        {tag}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            />
                        </View>
                        <View style={[styles.section, styles.sectionLast]}>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Open Now Only</Text>
                                <Controller
                                    control={control}
                                    name="openNow"
                                    render={({ field: { value, onChange } }) => (
                                        <Switch
                                            value={value}
                                            onValueChange={onChange}
                                            trackColor={{ false: '#e0e0e0', true: '#007AFF80' }}
                                            thumbColor={value ? '#007AFF' : '#f4f4f4'}
                                        />
                                    )}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleSubmit(onSubmit)}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
);

FilterModal.displayName = 'FilterModal';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        minWidth: 70,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
    },
    resetText: {
        fontSize: 16,
        color: '#007AFF',
        textAlign: 'right',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionLast: {
        borderBottomWidth: 0,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    chipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    chipText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    chipTextSelected: {
        color: '#fff',
    },
    priceContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    priceButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    priceButtonSelected: {
        backgroundColor: '#007AFF15',
        borderColor: '#007AFF',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    priceTextSelected: {
        color: '#007AFF',
    },
    ratingContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ratingButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    ratingButtonSelected: {
        backgroundColor: '#007AFF15',
        borderColor: '#007AFF',
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    ratingTextSelected: {
        color: '#007AFF',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    applyButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
});
