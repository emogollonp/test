/**
 * Feature Flags / Experiments - Storage (Web)
 *
 * Handles persistence of experiment assignments in localStorage.
 */

import type { ExperimentsStorage, ExperimentAssignment } from './types';

const STORAGE_KEY = 'mesa247_experiments';
const STORAGE_VERSION = '1.0.0';

export function loadAssignments(): Record<string, ExperimentAssignment> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};

        const data: ExperimentsStorage = JSON.parse(stored);

        if (data.version !== STORAGE_VERSION) {
            console.warn('[Experiments] Storage version mismatch, clearing assignments');
            clearAssignments();
            return {};
        }

        return data.assignments || {};
    } catch (error) {
        console.error('[Experiments] Failed to load assignments:', error);
        return {};
    }
}

export function saveAssignment(assignment: ExperimentAssignment): void {
    try {
        const assignments = loadAssignments();
        assignments[assignment.name] = assignment;

        const data: ExperimentsStorage = {
            assignments,
            version: STORAGE_VERSION,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('[Experiments] Failed to save assignment:', error);
    }
}

export function clearAssignments(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('[Experiments] Failed to clear assignments:', error);
    }
}

export function getAssignment(experimentName: string): ExperimentAssignment | null {
    const assignments = loadAssignments();
    return assignments[experimentName] || null;
}
