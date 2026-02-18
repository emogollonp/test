import { searchRestaurants, getRestaurantById, getCategories, getTags, getStats } from './fake-api';
import type { SearchParams, RestaurantCategory } from './types';

/**
 * EJEMPLOS DE USO DE LA FAKE API
 *
 * Esta guía muestra cómo usar la Fake API en diferentes escenarios.
 */

// ============================================================================
// 1. BÚSQUEDA BÁSICA
// ============================================================================

async function example1_basicSearch() {
    // Buscar todos los restaurantes (sin filtros)
    const allRestaurants = await searchRestaurants();

    console.log('Total restaurantes:', allRestaurants.total);
    console.log('Primera página:', allRestaurants.items.length);
    console.log('¿Hay más páginas?:', allRestaurants.hasMore);
}

// ============================================================================
// 2. BÚSQUEDA POR TEXTO (q)
// ============================================================================

async function example2_textSearch() {
    // Buscar restaurantes que contengan "pizza"
    const pizzaResults = await searchRestaurants({
        q: 'pizza',
    });

    console.log('Restaurantes con "pizza":', pizzaResults.total);

    // Buscar por tags
    const vegetarianResults = await searchRestaurants({
        q: 'vegano',
    });

    console.log('Restaurantes veganos:', vegetarianResults.total);
}

// ============================================================================
// 3. FILTROS INDIVIDUALES
// ============================================================================

async function example3_singleFilters() {
    // Filtrar por categoría
    const italianRestaurants = await searchRestaurants({
        filters: {
            category: ['italian'],
        },
    });

    // Filtrar por rango de precio (1-4)
    const affordableRestaurants = await searchRestaurants({
        filters: {
            priceRange: [1, 2], // Solo económicos y medios
        },
    });

    // Filtrar por rating mínimo
    const topRatedRestaurants = await searchRestaurants({
        filters: {
            minRating: 4.5,
        },
    });

    // Filtrar por abierto ahora
    const openNow = await searchRestaurants({
        filters: {
            openNow: true,
        },
    });

    // Filtrar por tags
    const romanticRestaurants = await searchRestaurants({
        filters: {
            tags: ['romántico'],
        },
    });

    console.log('Italianos:', italianRestaurants.total);
    console.log('Económicos:', affordableRestaurants.total);
    console.log('Top rated:', topRatedRestaurants.total);
    console.log('Abiertos ahora:', openNow.total);
    console.log('Románticos:', romanticRestaurants.total);
}

// ============================================================================
// 4. FILTROS COMBINADOS (AND)
// ============================================================================

async function example4_combinedFilters() {
    // Pizza económica con buen rating
    const results = await searchRestaurants({
        filters: {
            category: ['pizza'],
            priceRange: [1, 2],
            minRating: 4.0,
        },
    });

    console.log('Pizzerías económicas y buenas:', results.total);
    results.items.forEach((r) => {
        console.log(`- ${r.name}: ${r.rating}⭐ ${'$'.repeat(r.priceLevel)}`);
    });
}

// ============================================================================
// 5. BÚSQUEDA + FILTROS
// ============================================================================

async function example5_searchWithFilters() {
    // Buscar "sushi" pero solo premium y abierto ahora
    const results = await searchRestaurants({
        q: 'sushi',
        filters: {
            priceRange: [3, 4], // Premium
            openNow: true,
        },
    });

    console.log('Sushi premium abierto:', results.total);
}

// ============================================================================
// 6. ORDENAMIENTO
// ============================================================================

async function example6_sorting() {
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

    // Ordenar por precio (ascendente)
    const byPrice = await searchRestaurants({
        sort: 'price_asc',
        pageSize: 5,
    });

    console.log('\nMás económicos:');
    byPrice.items.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} - ${'$'.repeat(r.priceLevel)}`);
    });
}

// ============================================================================
// 7. PAGINACIÓN
// ============================================================================

async function example7_pagination() {
    const pageSize = 5;

    // Página 1
    const page1 = await searchRestaurants({
        page: 1,
        pageSize,
    });

    console.log('Página 1:', page1.items.length, 'items');
    console.log('Total:', page1.total);
    console.log('¿Hay más?:', page1.hasMore);

    // Página 2
    const page2 = await searchRestaurants({
        page: 2,
        pageSize,
    });

    console.log('Página 2:', page2.items.length, 'items');

    // Cargar todas las páginas (Load More pattern)
    async function loadAllPages() {
        let allItems: typeof page1.items = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
            const result = await searchRestaurants({
                page: currentPage,
                pageSize: 10,
            });

            allItems = [...allItems, ...result.items];
            hasMore = result.hasMore;
            currentPage++;
        }

        return allItems;
    }

    const allRestaurants = await loadAllPages();
    console.log('Total cargado:', allRestaurants.length);
}

// ============================================================================
// 8. DETALLE DE RESTAURANTE
// ============================================================================

async function example8_getById() {
    try {
        const restaurant = await getRestaurantById('1');

        console.log('Nombre:', restaurant.name);
        console.log('Descripción:', restaurant.description);
        console.log('Rating:', restaurant.rating);
        console.log('Precio:', '$'.repeat(restaurant.priceLevel));
        console.log('Dirección:', restaurant.address);
        console.log('Teléfono:', restaurant.phone);
        console.log('País:', restaurant.country);
        console.log('Moneda:', restaurant.currency);
        console.log('Timezone:', restaurant.timezone);
        console.log('Horario:', restaurant.schedule);
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================================================
// 9. MANEJO DE ERRORES
// ============================================================================

async function example9_errorHandling() {
    try {
        // Error 404: Restaurante no encontrado
        await getRestaurantById('999');
    } catch (error) {
        const apiError = error as any;
        console.error('Error:', apiError.message);
        console.error('Código:', apiError.code);
        console.error('Status:', apiError.status);
    }

    try {
        // Error 500: Forzar error de servidor
        await searchRestaurants({}, { forceError: true });
    } catch (error) {
        const apiError = error as any;
        console.error('Error de servidor:', apiError.message);
    }
}

// ============================================================================
// 10. FUNCIONES AUXILIARES
// ============================================================================

async function example10_utilities() {
    // Obtener todas las categorías
    const categories = getCategories();
    console.log('Categorías disponibles:', categories);

    // Obtener todos los tags
    const tags = getTags();
    console.log('Tags disponibles:', tags);

    // Obtener estadísticas
    const stats = getStats();
    console.log('Estadísticas:', stats);
}

// ============================================================================
// 11. CASO REAL: PÁGINA DE LISTADO CON FILTROS
// ============================================================================

async function example11_realWorldUsage() {
    // Simular estado de una página con filtros
    const userFilters = {
        searchQuery: 'pizza',
        selectedCategories: ['pizza', 'italian'] as RestaurantCategory[],
        priceRange: [1, 3] as [number, number],
        minRating: 4.0,
        showOpenOnly: true,
        sortBy: 'rating_desc' as const,
        currentPage: 1,
    };

    const params: SearchParams = {
        q: userFilters.searchQuery,
        filters: {
            category: userFilters.selectedCategories,
            priceRange: userFilters.priceRange,
            minRating: userFilters.minRating,
            openNow: userFilters.showOpenOnly,
        },
        sort: userFilters.sortBy,
        page: userFilters.currentPage,
        pageSize: 12,
    };

    const results = await searchRestaurants(params);

    console.log(`Mostrando ${results.items.length} de ${results.total} resultados`);
    console.log(`Página ${results.page}`);

    if (results.hasMore) {
        console.log('Botón "Cargar más" visible');
    }
}

// ============================================================================
// 12. PERFORMANCE: LATENCIA SIMULADA
// ============================================================================

async function example12_latency() {
    console.log('Probando latencia...');

    const iterations = 5;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await searchRestaurants();
        const end = performance.now();
        const duration = end - start;
        times.push(duration);
        console.log(`Request ${i + 1}: ${duration.toFixed(0)}ms`);
    }

    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    console.log(`\nPromedio: ${avg.toFixed(0)}ms`);
    console.log(`Min: ${Math.min(...times).toFixed(0)}ms`);
    console.log(`Max: ${Math.max(...times).toFixed(0)}ms`);
}

// ============================================================================
// EJECUTAR EJEMPLOS
// ============================================================================

export async function runAllExamples() {
    console.log('=== FAKE API EXAMPLES ===\n');

    await example1_basicSearch();
    await example2_textSearch();
    await example3_singleFilters();
    await example4_combinedFilters();
    await example5_searchWithFilters();
    await example6_sorting();
    await example7_pagination();
    await example8_getById();
    await example9_errorHandling();
    await example10_utilities();
    await example11_realWorldUsage();
    await example12_latency();
}

// Descomentar para ejecutar en consola:
// runAllExamples();
