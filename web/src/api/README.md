# Fake API - Web

Esta carpeta contiene la implementación de la Fake API para el proyecto web.

## Archivos

- **`types.ts`**: Tipos TypeScript para todos los modelos
- **`restaurants.json`**: Base de datos simulada con 25 restaurantes
- **`fake-api.ts`**: Implementación de la API con filtros, búsqueda y paginación
- **`examples.ts`**: 12 ejemplos de uso completos

## Quick Start

```typescript
import { searchRestaurants, getRestaurantById } from '@/api/fake-api';

// Buscar todos los restaurantes
const results = await searchRestaurants();

// Buscar con filtros
const filtered = await searchRestaurants({
    q: 'pizza',
    filters: {
        category: ['pizza', 'italian'],
        priceRange: [1, 2],
        minRating: 4.0,
        openNow: true,
    },
    sort: 'rating_desc',
    page: 1,
    pageSize: 10,
});

// Obtener detalle
const restaurant = await getRestaurantById('1');
```

## Features

### Búsqueda

- **Query (`q`)**: Busca en nombre, descripción, tags y categoría
- **Fuzzy matching**: No requiere coincidencia exacta

### Filtros (AND)

- **`category`**: Array de categorías (italian, mexican, pizza, etc.)
- **`priceRange`**: Tuple [min, max] de 1 a 4
- **`minRating`**: Número de 0 a 5
- **`tags`**: Array de tags (vegano, romántico, etc.)
- **`openNow`**: Boolean para filtrar solo abiertos

### Ordenamiento

- **`rating_desc`**: Por rating descendente (default)
- **`distance_asc`**: Por distancia ascendente
- **`price_asc`**: Por precio ascendente

### Paginación

- **`page`**: Número de página (empieza en 1)
- **`pageSize`**: Items por página (default: 10)
- **`hasMore`**: Indica si hay más páginas

### Simulaciones

- **Latencia**: 200-600ms random
- **Errores**: 5% de probabilidad automática
- **`forceError: true`**: Forzar error manualmente

## Datos

25 restaurantes con:

- **Multi-país**: MX, CO, AR, CL
- **Multi-moneda**: MXN, COP, ARS, CLP
- **Timezones**: America/Mexico_City, America/Bogota, etc.
- **Categorías**: 12 tipos (italian, mexican, sushi, etc.)
- **Tags**: 50+ tags únicos
- **Horarios**: Realistas por día de semana

## Estructura de Respuesta

```typescript
{
  items: Restaurant[],
  total: number,
  page: number,
  pageSize: number,
  hasMore: boolean
}
```

## Manejo de Errores

```typescript
try {
    const result = await searchRestaurants();
} catch (error) {
    const apiError = error as ApiError;
    console.error(apiError.message); // "Failed to fetch restaurants"
    console.error(apiError.code); // "FETCH_ERROR"
    console.error(apiError.status); // 500
}
```

## Ejemplos Completos

Ver `examples.ts` para 12 ejemplos detallados:

1. Búsqueda básica
2. Búsqueda por texto
3. Filtros individuales
4. Filtros combinados
5. Búsqueda + filtros
6. Ordenamiento
7. Paginación
8. Detalle por ID
9. Manejo de errores
10. Funciones auxiliares
11. Caso real: página de listado
12. Performance: latencia

## Tips

### Combinar con TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { searchRestaurants } from '@/api/fake-api';

function useRestaurants(params: SearchParams) {
    return useQuery({
        queryKey: ['restaurants', 'list', params],
        queryFn: () => searchRestaurants(params),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}
```

### Debounce en búsqueda

```typescript
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);

    const { data } = useRestaurants({ q: debouncedQuery });
}
```

### Load More / Infinite Scroll

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function useInfiniteRestaurants(filters: SearchFilters) {
    return useInfiniteQuery({
        queryKey: ['restaurants', 'infinite', filters],
        queryFn: ({ pageParam = 1 }) => searchRestaurants({ filters, page: pageParam }),
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    });
}
```

## Performance

- Latencia simulada: **200-600ms**
- Filtrado: **O(n)** lineal
- Ordenamiento: **O(n log n)**
- Paginación: **O(1)** con slice

Para listas grandes (>100 items), considerar virtualización.
