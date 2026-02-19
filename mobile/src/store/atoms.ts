import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Jotai Atoms - Global State Management
 *
 * Keep this minimal - most state should be:
 * 1. URL params (web) or navigation state (mobile)
 * 2. TanStack Query (server state)
 * 3. Local component state (useState, useForm)
 *
 * Use Jotai only for truly global state that:
 * - Needs to persist across sessions
 * - Is shared across multiple screens
 * - Doesn't fit in other categories
 */

/**
 * AsyncStorage adapter for Jotai
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncStorageAdapter = createJSONStorage<any>(() => ({
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem: async (key: string, value: any) => {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
    },
}));

export const userPreferencesAtom = atomWithStorage(
    'user-preferences',
    {
        theme: 'light' as 'light' | 'dark',
        notificationsEnabled: true,
    },
    asyncStorageAdapter
);

export const recentlyViewedAtom = atomWithStorage<string[]>(
    'recently-viewed',
    [],
    asyncStorageAdapter
);

export const favoritesAtom = atomWithStorage<string[]>('favorites', [], asyncStorageAdapter);

export const filterModalVisibleAtom = atom<boolean>(false);

export const experimentVariantAtom = atomWithStorage<'A' | 'B'>(
    'experiment-variant',
    Math.random() > 0.5 ? 'A' : 'B',
    asyncStorageAdapter
);
