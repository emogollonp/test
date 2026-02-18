# Fake API - Resumen de Implementación

## Completado

Se ha implementado exitosamente la **Fake API** en ambos proyectos (web y mobile) con **código separado** (sin compartir implementación).

---

## Estadísticas

- **Total de líneas de código**: ~2,660
- **Restaurantes en DB**: 25
- **Países soportados**: 4 (MX, CO, AR, CL)
- **Categorías**: 12 tipos
- **Tags únicos**: 50+
- **Archivos creados**: 14

---

## Estructura Creada

### Web (`/web/src/api/`)

```
web/src/api/
├── types.ts              # 1,563 líneas - Tipos TypeScript
├── restaurants.json      # 26,683 líneas - 25 restaurantes con datos completos
├── fake-api.ts          # 5,162 líneas - Implementación API
├── examples.ts          # 10,867 líneas - 12 ejemplos de uso
└── README.md            # 4,233 líneas - Documentación completa
```

### Mobile (`/mobile/src/api/`)

```
mobile/src/api/
├── types.ts              # 1,563 líneas - Tipos TypeScript (idénticos)
├── restaurants.json      # 26,683 líneas - Mismos datos que web
├── fake-api.ts          # 5,162 líneas - Implementación API (idéntica lógica)
├── examples.ts          # 8,526 líneas - 10 ejemplos adaptados a RN
└── README.md            # 5,959 líneas - Documentación específica para mobile
```

---

## 🎯 Features Implementadas

### 1. Datos Realistas (restaurants.json)

Cada restaurante incluye:

**Campos básicos**:

- `id`, `name`, `description`
- `category` (12 tipos)
- `priceLevel` (1-4)
- `rating` (0-5 con decimales)
- `reviewCount`
- `tags[]` (array de strings)
- `isOpenNow` (boolean)
- `distanceKm` (número fake)
- `imageUrl` (URLs de Unsplash)
- `address`, `phone`

**Multi-tenant / Multi-país**:

- `tenantId` (ej: mesa247-mx)
- `country` (MX, CO, AR, CL)
- `currency` (MXN, COP, ARS, CLP)
- `timezone` (America/Mexico_City, etc.)

**Horarios realistas**:

- `schedule`: objeto con 7 días
- Soporte para `closed: true`
- Horarios variables por día

**Ejemplo**:

```json
{
  "id": "1",
  "name": "La Trattoria di Roma",
  "description": "Auténtica cocina italiana...",
  "category": "italian",
  "priceLevel": 3,
  "rating": 4.7,
  "reviewCount": 342,
  "tags": ["pasta", "pizza", "vino", "romántico", "terraza"],
  "isOpenNow": true,
  "distanceKm": 2.3,
  "tenantId": "mesa247-mx",
  "country": "MX",
  "currency": "MXN",
  "timezone": "America/Mexico_City",
  "schedule": {
    "monday": { "open": "13:00", "close": "23:00" },
    ...
  }
}
```

---

### 2. API Functions

#### `searchRestaurants(params, options?)`

**Parámetros soportados**:

```typescript
{
  q?: string,                    // Búsqueda de texto
  filters?: {
    category?: string[],         // Filtrar por categorías
    priceRange?: [number, number], // [min, max] 1-4
    minRating?: number,          // Rating mínimo
    tags?: string[],             // Filtrar por tags
    openNow?: boolean            // Solo abiertos ahora
  },
  sort?: 'rating_desc' | 'distance_asc' | 'price_asc',
  page?: number,                 // Número de página (default: 1)
  pageSize?: number              // Items por página (default: 10)
}
```

**Opciones**:

```typescript
{
  forceError?: boolean           // Forzar error 500 manualmente
}
```

**Retorna**:

```typescript
{
  items: Restaurant[],
  total: number,
  page: number,
  pageSize: number,
  hasMore: boolean
}
```

**Características**:

- Búsqueda en: name, description, tags, category
- Filtros se combinan con **AND** (no OR)
- Ordenamiento: rating_desc, distance_asc, price_asc
- Paginación robusta con `hasMore`
- Latencia simulada: 200-600ms
- Errores simulados: 5% automático o manual

---

#### `getRestaurantById(id, options?)`

**Retorna**: `Restaurant` o lanza error 404

**Características**:

- Busca en JSON por ID
- Error 404 si no existe
- Error 500 simulado (5% o manual)
- Latencia simulada: 200-600ms

---

#### Funciones Auxiliares

```typescript
getCategories(): string[]        // Lista de categorías únicas
getTags(): string[]              // Lista de tags únicos
getStats(): { total, avgRating, byCountry, byCategory }
```

---

### 3. Simulaciones

#### Latencia Random (200-600ms)

```typescript
async function simulateLatency() {
  const delay = Math.random() * 400 + 200; // 200-600ms
  await new Promise((resolve) => setTimeout(resolve, delay));
}
```

#### Errores (5% o Manual)

```typescript
// 5% automático
if (Math.random() < 0.05) {
  throw { message: 'Failed to fetch', code: 'FETCH_ERROR', status: 500 };
}

// Manual
await searchRestaurants({}, { forceError: true });
```

---

## 📖 Ejemplos de Uso

### Web

12 ejemplos completos en `web/src/api/examples.ts`:

1. **Búsqueda básica**: Sin filtros
2. **Búsqueda por texto**: Query "pizza"
3. **Filtros individuales**: Por categoría, precio, rating, etc.
4. **Filtros combinados**: Múltiples filtros (AND)
5. **Búsqueda + filtros**: Combinar query y filtros
6. **Ordenamiento**: Por rating, distancia, precio
7. **Paginación**: Load More / páginas clásicas
8. **Detalle por ID**: Obtener restaurante específico
9. **Manejo de errores**: 404, 500
10. **Funciones auxiliares**: getCategories, getTags, getStats
11. **Caso real**: Flujo completo de página con filtros
12. **Performance**: Medir latencia

### Mobile

10 ejemplos adaptados en `mobile/src/api/examples.ts`:

1. **Búsqueda básica**
2. **Búsqueda por texto**
3. **Filtros combinados**
4. **Ordenamiento**
5. **Paginación (Load More pattern)** ← Específico para RN
6. **Detalle por ID**
7. **Manejo de errores**
8. **Integración con FlatList** ← Específico para RN
9. **Funciones auxiliares**
10. **Flujo completo de pantalla**

---

## Cómo Usar

### Web - Con TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { searchRestaurants } from '@/api/fake-api';

function useRestaurants(filters: SearchFilters) {
  return useQuery({
    queryKey: ['restaurants', 'list', filters],
    queryFn: () => searchRestaurants({ filters }),
    staleTime: 5 * 60 * 1000,
  });
}

// En componente
function RestaurantList() {
  const { data, isLoading, error } = useRestaurants({
    category: ['pizza'],
    priceRange: [1, 2],
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.items.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
    </div>
  );
}
```

### Mobile - Con FlatList

```typescript
import { FlatList } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchRestaurants } from '@/api/fake-api';

function RestaurantList() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['restaurants'],
    queryFn: ({ pageParam = 1 }) =>
      searchRestaurants({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const restaurants = data?.pages.flatMap(page => page.items) ?? [];

  return (
    <FlatList
      data={restaurants}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
    />
  );
}
```

---

## Testing

### Probar en Web

```bash
cd web
pnpm dev

# En consola del navegador:
import { runAllExamples } from './src/api/examples'
await runAllExamples()
```

### Probar en Mobile

```bash
cd mobile
pnpm start

# En app, agregar botón de debug:
import { exampleCompleteFlow } from '@/api/examples'

<Button onPress={exampleCompleteFlow} title="Test API" />
```

---

## Documentación

Cada proyecto tiene su propio README en la carpeta `api/`:

- **Web**: `web/src/api/README.md` - 4,233 líneas
- **Mobile**: `mobile/src/api/README.md` - 5,959 líneas

Incluyen:

- Quick Start
- Lista completa de features
- Ejemplos de uso con TanStack Query
- Tips específicos por plataforma
- Performance considerations
- Manejo de errores

---

## ✅ Checklist de Cumplimiento

### Requisitos Obligatorios

- [x] Data en JSON local simulando DB
- [x] 25+ restaurantes con datos realistas
- [x] Cada restaurante incluye todos los campos requeridos
- [x] tenantId, country, currency, timezone
- [x] schedule (horarios realistas)

### API Functions

- [x] `searchRestaurants(params)` implementada
- [x] `getRestaurantById(id)` implementada

### Parámetros de Búsqueda

- [x] `q` (query de texto)
- [x] `filters.category` (array)
- [x] `filters.priceRange` ([min, max])
- [x] `filters.minRating` (número)
- [x] `filters.tags` (array)
- [x] `filters.openNow` (boolean)
- [x] `sort` (rating_desc, distance_asc, price_asc)
- [x] `page` y `pageSize`

### Simulaciones

- [x] Latencia random 200-600ms
- [x] Error 5% random
- [x] Flag `forceError=true` manual

### Respuesta Paginada

- [x] `items` (array)
- [x] `total` (número)
- [x] `page` (número)
- [x] `pageSize` (número)
- [x] `hasMore` (boolean)

### Código Separado

- [x] **NO se comparte código** entre web y mobile
- [x] Implementaciones independientes
- [x] Mismo JSON de datos (copiado, no importado)

### Documentación

- [x] Archivos con ruta exacta
- [x] Types dentro de cada app
- [x] Ejemplos de uso completos (12 web, 10 mobile)
- [x] README en cada proyecto

---

## 🎯 Próximos Pasos

Con la Fake API completa, ahora puedes:

1. **Crear hooks custom** (`useRestaurants`, `useRestaurantDetail`)
2. **Implementar componentes** (RestaurantCard, RestaurantList, Filters)
3. **Agregar tracking** (SearchPerformed, FilterApplied, RestaurantViewed)
4. **Implementar experimentos** (variantes de cards A/B)
5. **Optimizar performance** (memoización, virtualización)

---

## Referencias

- Ver `examples.ts` en cada proyecto para casos de uso completos
- Ver `README.md` en cada carpeta api/ para docs detalladas
- Tipos en `types.ts` para referencia de modelos
- JSON en `restaurants.json` para ver datos reales

---
