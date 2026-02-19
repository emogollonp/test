/**
 * Feature Flags / Experiments - Storage (Mobile)
 *
 * Handles persistence of experiment assignments in AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExperimentsStorage, ExperimentAssignment } from './types';

const STORAGE_KEY = 'mesa247_experiments';
const STORAGE_VERSION = '1.0.0';

export async function loadAssignments(): Promise<Record<string, ExperimentAssignment>> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return {};

        const data: ExperimentsStorage = JSON.parse(stored);

        if (data.version !== STORAGE_VERSION) {
            console.warn('[Experiments] Storage version mismatch, clearing assignments');
            await clearAssignments();
            return {};
        }

        return data.assignments || {};
    } catch (error) {
        console.error('[Experiments] Failed to load assignments:', error);
        return {};
    }
}

export async function saveAssignment(assignment: ExperimentAssignment): Promise<void> {
    try {
        const assignments = await loadAssignments();
        assignments[assignment.name] = assignment;

        const data: ExperimentsStorage = {
            assignments,
            version: STORAGE_VERSION,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('[Experiments] Failed to save assignment:', error);
    }
}

export async function clearAssignments(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('[Experiments] Failed to clear assignments:', error);
    }
}

export async function getAssignment(experimentName: string): Promise<ExperimentAssignment | null> {
    const assignments = await loadAssignments();
    return assignments[experimentName] || null;
}
