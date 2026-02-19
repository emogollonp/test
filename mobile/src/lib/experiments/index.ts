/**
 * Feature Flags / Experiments - Core (Mobile)
 *
 * Provides experiment assignment, variant retrieval, and exposure tracking.
 *
 * Usage:
 *   const variant = await getExperiment('restaurant_card_variant');
 *   // Returns 'compact' or 'extended', tracks exposure automatically
 *
 * Architecture:
 * - Random assignment on first access
 * - Persistent via AsyncStorage
 * - Automatic exposure tracking
 * - Strongly typed variants
 */

import { track, type TrackingEvent } from '../tracking';
import type {
    ExperimentName,
    ExperimentVariants,
    ExperimentAssignment,
    ExperimentConfig,
} from './types';
import { loadAssignments, saveAssignment, getAssignment } from './storage';

const EXPERIMENT_CONFIGS: Record<ExperimentName, ExperimentConfig> = {
    restaurant_card_variant: {
        name: 'restaurant_card_variant',
        variants: ['compact', 'extended'],
        weights: [0.5, 0.5], // 50/50 split
    },
};

const exposedInSession = new Set<string>();

function assignVariant<T extends ExperimentName>(
    config: ExperimentConfig<T>
): ExperimentVariants[T] {
    const { variants, weights } = config;

    if (!weights || weights.length !== variants.length) {
        const randomIndex = Math.floor(Math.random() * variants.length);
        return variants[randomIndex];
    }

    const random = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights[i];
        if (random <= cumulativeWeight) {
            return variants[i];
        }
    }

    return variants[0];
}

async function trackExposure<T extends ExperimentName>(
    experimentName: T,
    variant: ExperimentVariants[T]
): Promise<void> {
    const key = `${experimentName}:${variant}`;

    if (exposedInSession.has(key)) return;

    exposedInSession.add(key);

    const event: TrackingEvent = {
        type: 'ExperimentExposed',
        properties: {
            experimentName,
            variant: String(variant),
            exposedAt: new Date().toISOString(),
        },
    };

    await track(event);
}

/**
 * Get experiment variant
 *
 * Returns the assigned variant for the experiment.
 * If no assignment exists, randomly assigns one and persists it.
 * Automatically tracks exposure on first access per session.
 *
 * @example
 * const cardVariant = await getExperiment('restaurant_card_variant');
 * // Returns 'compact' or 'extended'
 *
 * @param experimentName - Name of the experiment
 * @returns The assigned variant
 */
export async function getExperiment<T extends ExperimentName>(
    experimentName: T
): Promise<ExperimentVariants[T]> {
    const existing = await getAssignment(experimentName);

    if (existing) {
        await trackExposure(experimentName, existing.variant as ExperimentVariants[T]);
        return existing.variant as ExperimentVariants[T];
    }

    const config = EXPERIMENT_CONFIGS[experimentName];

    if (!config) {
        console.error(`[Experiments] Unknown experiment: ${experimentName}`);
        return (
            EXPERIMENT_CONFIGS[experimentName]?.variants[0] || ('compact' as ExperimentVariants[T])
        );
    }

    const variant = assignVariant(config);

    const assignment: ExperimentAssignment<T> = {
        name: experimentName,
        variant,
        assignedAt: new Date().toISOString(),
    };

    await saveAssignment(assignment);

    await trackExposure(experimentName, variant);

    return variant;
}

/**
 * Force set experiment variant (for testing/debugging)
 *
 * @example
 * await setExperimentVariant('restaurant_card_variant', 'extended');
 */
export async function setExperimentVariant<T extends ExperimentName>(
    experimentName: T,
    variant: ExperimentVariants[T]
): Promise<void> {
    const assignment: ExperimentAssignment<T> = {
        name: experimentName,
        variant,
        assignedAt: new Date().toISOString(),
    };

    await saveAssignment(assignment);
    console.log(`[Experiments] Forced ${experimentName} = ${variant}`);
}

export async function getAllExperiments(): Promise<Record<string, ExperimentAssignment>> {
    return loadAssignments();
}

export { clearAssignments } from './storage';

export type {
    ExperimentName,
    ExperimentVariants,
    ExperimentAssignment,
    RestaurantCardVariant,
} from './types';
