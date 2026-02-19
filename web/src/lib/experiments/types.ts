/**
 * Feature Flags / Experiments - Types
 *
 * Type definitions for the experiments system.
 * All experiments are strongly typed to prevent runtime errors.
 */

/**
 * Restaurant card variant experiment
 */
export type RestaurantCardVariant = 'compact' | 'extended';

export type ExperimentName = 'restaurant_card_variant';

export interface ExperimentVariants {
    restaurant_card_variant: RestaurantCardVariant;
    // Add more experiments here:
    // 'feature_x': 'on' | 'off';
    // 'pricing_test': 'v1' | 'v2' | 'v3';
}

export interface ExperimentAssignment<T extends ExperimentName = ExperimentName> {
    name: T;
    variant: ExperimentVariants[T];
    assignedAt: string; // ISO timestamp
}

export interface ExperimentConfig<T extends ExperimentName = ExperimentName> {
    name: T;
    variants: Array<ExperimentVariants[T]>;
    weights?: number[]; // Optional weights for each variant (must sum to 1.0)
}

export interface ExperimentsStorage {
    assignments: Record<string, ExperimentAssignment>;
    version: string;
}
