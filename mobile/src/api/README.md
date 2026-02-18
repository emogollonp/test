# Fake API - Mobile

Esta carpeta contiene la implementación de la Fake API para el proyecto mobile (React Native).

## Archivos

- **`types.ts`**: Tipos TypeScript para todos los modelos
- **`restaurants.json`**: Base de datos simulada con 25 restaurantes
- **`fake-api.ts`**: Implementación de la API con filtros, búsqueda y paginación
- **`examples.ts`**: 10 ejemplos de uso adaptados para React Native

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

## Uso con FlatList

```typescript
import { FlatList } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchRestaurants } from '@/api/fake-api';

function RestaurantList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['restaurants'],
    queryFn: ({ pageParam = 1 }) =>
      searchRestaurants({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const restaurants = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <FlatList
      data={restaurants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

## Optimizaciones para React Native

### 1. FlatList con keyExtractor

```typescript
<FlatList
  data={restaurants}
  keyExtractor={(item) => item.id}
  // Evita re-renders innecesarios
/>
```

### 2. getItemLayout (si altura fija)

```typescript
<FlatList
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  // Mejora scroll performance
/>
```

### 3. maxToRenderPerBatch

```typescript
<FlatList
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  // Controla cuántos items renderizar por frame
/>
```

### 4. Image caching (recomendado)

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: restaurant.imageUrl }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>
```

## Manejo de Errores

```typescript
try {
    const result = await searchRestaurants();
} catch (error) {
    const apiError = error as ApiError;
    Alert.alert('Error', apiError.message);
    console.error(apiError.code); // "FETCH_ERROR"
    console.error(apiError.status); // 500
}
```

## Ejemplos Completos

Ver `examples.ts` para 10 ejemplos adaptados a React Native:

1. Búsqueda básica
2. Búsqueda por texto
3. Filtros combinados
4. Ordenamiento
5. Paginación (Load More pattern)
6. Detalle por ID
7. Manejo de errores
8. Integración con FlatList
9. Funciones auxiliares
10. Flujo completo de pantalla

## Tips Mobile

### Pull to Refresh

```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await refetch();
  setRefreshing(false);
};

<FlatList
  refreshing={refreshing}
  onRefresh={onRefresh}
/>
```

### Persistencia con AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage = createJSONStorage(() => AsyncStorage);

export const filtersAtom = atomWithStorage('filters', {}, storage);
```

### Debounce en búsqueda

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

const { data } = useQuery({
    queryKey: ['restaurants', debouncedQuery],
    queryFn: () => searchRestaurants({ q: debouncedQuery }),
    enabled: debouncedQuery.length >= 2, // Solo buscar si ≥ 2 chars
});
```

## Performance

- Latencia simulada: **200-600ms**
- Filtrado: **O(n)** lineal
- Ordenamiento: **O(n log n)**
- Paginación: **O(1)** con slice

**Recomendaciones:**

- Usar `FlatList` en lugar de `ScrollView` para listas largas
- Implementar `keyExtractor` correcto para evitar re-renders
- Considerar `getItemLayout` si todos los items tienen la misma altura
- Usar `maxToRenderPerBatch` para controlar cuánto renderizar

## Datos

25 restaurantes con:

- **Multi-país**: MX, CO, AR, CL
- **Multi-moneda**: MXN, COP, ARS, CLP
- **Timezones**: America/Mexico_City, America/Bogota, etc.
- **Categorías**: 12 tipos (italian, mexican, sushi, etc.)
- **Tags**: 50+ tags únicos
- **Horarios**: Realistas por día de semana
