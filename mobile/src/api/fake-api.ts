import type { Restaurant, SearchParams, PaginatedResponse, ApiError, SortOption } from './types';
import restaurantsData from './restaurants.json';

// Configuración de la API
const CONFIG = {
    MIN_LATENCY: 200,
    MAX_LATENCY: 600,
    ERROR_RATE: 0.05, // 5%
    DEFAULT_PAGE_SIZE: 10,
};

/**
 * Simula latencia de red
 */
async function simulateLatency(): Promise<void> {
    const delay = Math.random() * (CONFIG.MAX_LATENCY - CONFIG.MIN_LATENCY) + CONFIG.MIN_LATENCY;
    await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Simula errores aleatorios
 */
function shouldSimulateError(forceError?: boolean): boolean {
    if (forceError) return true;
    return Math.random() < CONFIG.ERROR_RATE;
}

/**
 * Crea un error de API
 */
function createApiError(message: string, code: string, status: number): ApiError {
    return { message, code, status };
}

/**
 * Busca restaurantes con filtros, ordenamiento y paginación
 */
export async function searchRestaurants(
    params: SearchParams = {},
    options?: { forceError?: boolean }
): Promise<PaginatedResponse<Restaurant>> {
    // Simular latencia
    await simulateLatency();

    // Simular error
    if (shouldSimulateError(options?.forceError)) {
        throw createApiError('Failed to fetch restaurants', 'FETCH_ERROR', 500);
    }

    const {
        q = '',
        filters = {},
        sort = 'rating_desc',
        page = 1,
        pageSize = CONFIG.DEFAULT_PAGE_SIZE,
    } = params;

    // Empezar con todos los restaurantes
    let results = [...(restaurantsData as Restaurant[])];

    // 1. Filtrar por búsqueda (q)
    if (q.trim()) {
        const searchLower = q.toLowerCase();
        results = results.filter(
            (r) =>
                r.name.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower) ||
                r.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
                r.category.toLowerCase().includes(searchLower)
        );
    }

    // 2. Filtrar por categoría
    if (filters.category && filters.category.length > 0) {
        results = results.filter((r) => filters.category!.includes(r.category));
    }

    // 3. Filtrar por rango de precio
    if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        results = results.filter((r) => r.priceLevel >= min && r.priceLevel <= max);
    }

    // 4. Filtrar por rating mínimo
    if (filters.minRating !== undefined) {
        results = results.filter((r) => r.rating >= filters.minRating!);
    }

    // 5. Filtrar por tags
    if (filters.tags && filters.tags.length > 0) {
        results = results.filter((r) => filters.tags!.some((tag) => r.tags.includes(tag)));
    }

    // 6. Filtrar por abierto ahora
    if (filters.openNow) {
        results = results.filter((r) => r.isOpenNow);
    }

    // 7. Ordenar
    results = sortRestaurants(results, sort);

    // 8. Paginar
    const total = results.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = results.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return {
        items,
        total,
        page,
        pageSize,
        hasMore,
    };
}

/**
 * Obtiene un restaurante por ID
 */
export async function getRestaurantById(
    id: string,
    options?: { forceError?: boolean }
): Promise<Restaurant> {
    // Simular latencia
    await simulateLatency();

    // Simular error
    if (shouldSimulateError(options?.forceError)) {
        throw createApiError('Failed to fetch restaurant', 'FETCH_ERROR', 500);
    }

    const restaurant = (restaurantsData as Restaurant[]).find((r) => r.id === id);

    if (!restaurant) {
        throw createApiError('Restaurant not found', 'NOT_FOUND', 404);
    }

    return restaurant;
}

/**
 * Ordena restaurantes según el criterio
 */
function sortRestaurants(restaurants: Restaurant[], sort: SortOption): Restaurant[] {
    const sorted = [...restaurants];

    switch (sort) {
        case 'rating_desc':
            return sorted.sort((a, b) => b.rating - a.rating);

        case 'distance_asc':
            return sorted.sort((a, b) => a.distanceKm - b.distanceKm);

        case 'price_asc':
            return sorted.sort((a, b) => a.priceLevel - b.priceLevel);

        default:
            return sorted;
    }
}

/**
 * Obtiene todas las categorías únicas
 */
export function getCategories(): string[] {
    const categories = new Set((restaurantsData as Restaurant[]).map((r) => r.category));
    return Array.from(categories).sort();
}

/**
 * Obtiene todos los tags únicos
 */
export function getTags(): string[] {
    const tags = new Set((restaurantsData as Restaurant[]).flatMap((r) => r.tags));
    return Array.from(tags).sort();
}

/**
 * Obtiene estadísticas de los restaurantes
 */
export function getStats() {
    const restaurants = restaurantsData as Restaurant[];

    return {
        total: restaurants.length,
        avgRating: restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length,
        byCountry: restaurants.reduce(
            (acc, r) => {
                acc[r.country] = (acc[r.country] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        ),
        byCategory: restaurants.reduce(
            (acc, r) => {
                acc[r.category] = (acc[r.category] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        ),
    };
}
