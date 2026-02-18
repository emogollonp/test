import { searchRestaurants, getRestaurantById, getCategories, getTags, getStats } from './fake-api';
import type { SearchParams, Restaurant } from './types';

/**
 * EJEMPLOS DE USO DE LA FAKE API (MOBILE)
 *
 * Esta guía muestra cómo usar la Fake API en React Native.
 */

// ============================================================================
// 1. BÚSQUEDA BÁSICA
// ============================================================================

export async function example1_basicSearch() {
    // Buscar todos los restaurantes (sin filtros)
    const allRestaurants = await searchRestaurants();

    console.log('Total restaurantes:', allRestaurants.total);
    console.log('Primera página:', allRestaurants.items.length);
    console.log('¿Hay más páginas?:', allRestaurants.hasMore);

    return allRestaurants;
}

// ============================================================================
// 2. BÚSQUEDA POR TEXTO (q)
// ============================================================================

export async function example2_textSearch() {
    // Buscar restaurantes que contengan "pizza"
    const pizzaResults = await searchRestaurants({ q: 'pizza' });

    console.log('Restaurantes con "pizza":', pizzaResults.total);

    return pizzaResults;
}

// ============================================================================
// 3. FILTROS COMBINADOS
// ============================================================================

export async function example3_combinedFilters() {
    // Pizza económica con buen rating y abierta ahora
    const results = await searchRestaurants({
        filters: {
            category: ['pizza', 'italian'],
            priceRange: [1, 2],
            minRating: 4.0,
            openNow: true,
        },
    });

    console.log('Pizzerías económicas, buenas y abiertas:', results.total);

    return results;
}

// ============================================================================
// 4. ORDENAMIENTO
// ============================================================================

export async function example4_sorting() {
    // Ordenar por rating (descendente)
    const byRating = await searchRestaurants({
        sort: 'rating_desc',
        pageSize: 5,
    });

    console.log('Top 5 por rating:');
    byRating.items.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} - ${r.rating}⭐`);
    });

    // Ordenar por distancia (ascendente)
    const byDistance = await searchRestaurants({
        sort: 'distance_asc',
        pageSize: 5,
    });

    console.log('\nMás cercanos:');
    byDistance.items.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} - ${r.distanceKm}km`);
    });

    return { byRating, byDistance };
}

// ============================================================================
// 5. PAGINACIÓN (LOAD MORE PATTERN)
// ============================================================================

export async function example5_loadMore(currentPage: number = 1) {
    const pageSize = 10;

    const results = await searchRestaurants({
        page: currentPage,
        pageSize,
    });

    console.log(`Página ${currentPage}: ${results.items.length} items`);
    console.log('Total:', results.total);
    console.log('¿Hay más?:', results.hasMore);

    return results;
}

// ============================================================================
// 6. DETALLE DE RESTAURANTE
// ============================================================================

export async function example6_getById(id: string) {
    try {
        const restaurant = await getRestaurantById(id);

        console.log('Nombre:', restaurant.name);
        console.log('Rating:', restaurant.rating);
        console.log('Precio:', '$'.repeat(restaurant.priceLevel));
        console.log('Distancia:', restaurant.distanceKm, 'km');
        console.log('Abierto ahora:', restaurant.isOpenNow ? 'Sí' : 'No');

        return restaurant;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ============================================================================
// 7. MANEJO DE ERRORES
// ============================================================================

export async function example7_errorHandling() {
    try {
        // Error 404: Restaurante no encontrado
        await getRestaurantById('999');
    } catch (error) {
        const apiError = error as any;
        console.error('Error:', apiError.message);
        console.error('Código:', apiError.code);
        console.error('Status:', apiError.status);
    }
}

// ============================================================================
// 8. USO CON REACT NATIVE - FlatList
// ============================================================================

/**
 * Este ejemplo muestra cómo integrar la API con un FlatList
 * típico de React Native con Load More
 */
export interface ListState {
    data: Restaurant[];
    loading: boolean;
    refreshing: boolean;
    hasMore: boolean;
    page: number;
    error: string | null;
}

export async function fetchInitialData(filters?: SearchParams['filters']) {
    try {
        const results = await searchRestaurants({
            filters,
            page: 1,
            pageSize: 10,
        });

        return {
            data: results.items,
            hasMore: results.hasMore,
            page: 1,
            error: null,
        };
    } catch (error) {
        return {
            data: [],
            hasMore: false,
            page: 1,
            error: (error as any).message,
        };
    }
}

export async function fetchMoreData(currentPage: number, filters?: SearchParams['filters']) {
    try {
        const results = await searchRestaurants({
            filters,
            page: currentPage + 1,
            pageSize: 10,
        });

        return {
            data: results.items,
            hasMore: results.hasMore,
            page: currentPage + 1,
            error: null,
        };
    } catch (error) {
        return {
            data: [],
            hasMore: false,
            page: currentPage,
            error: (error as any).message,
        };
    }
}

// ============================================================================
// 9. FUNCIONES AUXILIARES
// ============================================================================

export function getAvailableFilters() {
    return {
        categories: getCategories(),
        tags: getTags(),
        priceRange: [1, 2, 3, 4],
        ratings: [3.0, 3.5, 4.0, 4.5],
    };
}

export function getAppStats() {
    return getStats();
}

// ============================================================================
// 10. CASO REAL: BÚSQUEDA CON DEBOUNCE
// ============================================================================

/**
 * Ejemplo de búsqueda con debounce (usar con useDebounce hook)
 */
export async function searchWithQuery(query: string) {
    if (!query.trim()) {
        // Si no hay query, devolver todos
        return await searchRestaurants({
            pageSize: 20,
        });
    }

    return await searchRestaurants({
        q: query,
        pageSize: 20,
    });
}

// ============================================================================
// EJEMPLO COMPLETO: FLUJO DE PANTALLA
// ============================================================================

/**
 * Simula el flujo completo de una pantalla de listado:
 * 1. Carga inicial
 * 2. Usuario aplica filtros
 * 3. Usuario carga más resultados
 */
export async function exampleCompleteFlow() {
    console.log('=== FLUJO COMPLETO ===\n');

    // 1. Carga inicial
    console.log('1. Carga inicial...');
    const initial = await searchRestaurants({
        page: 1,
        pageSize: 10,
    });
    console.log(`Cargados: ${initial.items.length} de ${initial.total}`);

    // 2. Usuario aplica filtros
    console.log('\n2. Usuario filtra por "pizza" + económico + abierto...');
    const filtered = await searchRestaurants({
        q: 'pizza',
        filters: {
            priceRange: [1, 2],
            openNow: true,
        },
        page: 1,
        pageSize: 10,
    });
    console.log(`Resultados filtrados: ${filtered.total}`);

    // 3. Usuario carga más
    if (filtered.hasMore) {
        console.log('\n3. Usuario hace scroll y carga más...');
        const nextPage = await searchRestaurants({
            q: 'pizza',
            filters: {
                priceRange: [1, 2],
                openNow: true,
            },
            page: 2,
            pageSize: 10,
        });
        console.log(`Página 2 cargada: ${nextPage.items.length} items`);
    }

    // 4. Usuario selecciona un restaurante
    console.log('\n4. Usuario selecciona restaurante...');
    const detail = await getRestaurantById(filtered.items[0].id);
    console.log(`Detalle: ${detail.name}`);

    console.log('\n=== FIN DEL FLUJO ===');
}
