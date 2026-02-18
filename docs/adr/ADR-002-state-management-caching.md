# ADR-002: Server State + Caching + Estado Global + URL State

**Estado:** Aceptado  
**Fecha:** 2026-02-18  
**Autores:** Eric Mogollon

## Contexto

Necesitamos una estrategia clara de manejo de estado que cubra:

- Server state (datos de API)
- Client state (UI temporal)
- Global state (preferencias, filtros persistentes)
- URL state (deep linking, compartir filtros)

## Decisión

### Server State: TanStack Query

**Decisión:** Usar TanStack Query (React Query) para todo el estado del servidor.

**Razones:**

- Caching inteligente out-of-the-box
- Invalidación automática y refetch
- Loading/error states manejados
- Stale-while-revalidate pattern
- Optimistic updates
- Pagination y infinite scroll support

**Query Key Design:**

```typescript
// Listado con filtros
['restaurants', 'list', { filters, sort, page }][
    // Detalle
    ('restaurants', 'detail', { id })
][
    // Búsqueda
    ('restaurants', 'search', { q, filters })
];
```

**Estrategia de Invalidación:**

```typescript
// Al crear/actualizar un restaurante
queryClient.invalidateQueries({ queryKey: ['restaurants'] });

// Al cambiar tenant/país
queryClient.clear(); // reset completo
```

**Configuración Global:**

```typescript
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5min
            gcTime: 10 * 60 * 1000, // 10min (antes cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
```

**Alternativas consideradas:**

- SWR: similar pero menos features (no mutations)
- Redux Toolkit Query: demasiado boilerplate
- Fetch directo: reinventar la rueda

### Global State: Jotai

**Decisión:** Usar Jotai para estado global UI que no viene del servidor.

**Casos de uso:**

- Filtros aplicados (antes de enviar al API)
- Preferencias de UI (modo grid/list, ordenamiento local)
- Estado de experimentos A/B
- Modal/drawer open/close states

**Ejemplo:**

```typescript
// store/filters.ts
export const searchQueryAtom = atom('');
export const categoryFilterAtom = atom<string[]>([]);
export const priceRangeAtom = atom<[number, number]>([0, 100]);

// Atom derivado
export const filtersAppliedAtom = atom((get) => ({
    q: get(searchQueryAtom),
    category: get(categoryFilterAtom),
    priceRange: get(priceRangeAtom),
}));
```

**Por qué Jotai sobre Zustand/Redux:**

- Atomic: solo re-render lo que cambió
- TypeScript-first
- Menor boilerplate que Redux
- Persistencia simple: `atomWithStorage`

**Mobile:** Jotai + AsyncStorage para persistencia

```typescript
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);
export const experimentAtom = atomWithStorage('experiment', null, storage);
```

### URL State (Web Only)

**Decisión:** Sincronizar filtros y paginación con URL params.

**Beneficios:**

- Deep linking: compartir URL con filtros aplicados
- Browser back/forward funciona
- Refresh mantiene estado
- SEO-friendly (pre-rendering posible)

**Implementación:**

```typescript
// hooks/useFiltersFromURL.ts
const [searchParams, setSearchParams] = useSearchParams();

const filters = {
    q: searchParams.get('q') || '',
    category: searchParams.getAll('category'),
    page: Number(searchParams.get('page')) || 1,
};

const updateFilters = (newFilters) => {
    setSearchParams(newFilters);
};
```

**Qué va en URL:**

- ✅ Filtros de búsqueda (q, category, price, rating)
- ✅ Ordenamiento (sort, order)
- ✅ Paginación (page)
- ❌ Estado UI temporal (modal open, hover states)
- ❌ Datos del servidor (se obtienen por ID en URL)

### Caching Strategy

**Niveles de cache:**

1. **TanStack Query Cache (memoria):** 5-10 min
2. **Browser Cache (HTTP):** headers `Cache-Control` en API
3. **LocalStorage (persistencia):** solo experimentos y preferencias

**Trade-offs:**

| Strategy            | Pros           | Cons                    |
| ------------------- | -------------- | ----------------------- |
| Aggressive (30min)  | Menos requests | Datos stale             |
| Conservative (1min) | Datos frescos  | Más requests            |
| **Elegido: 5min**   | Balance        | Depende del caso de uso |

**Invalidación:**

- Manual: al mutar datos (crear/editar/eliminar)
- Automática: al cambiar tenant/país
- Por tiempo: `staleTime` expira

## Consecuencias

### Positivas

- Estado predecible y fácil de debuggear
- Código declarativo: `const { data, isLoading } = useRestaurants()`
- Performance: menos requests innecesarios
- UX: transiciones suaves, optimistic updates

### Negativas

- Curva de aprendizaje para desarrolladores nuevos en TanStack Query
- Cache puede causar bugs si invalidation es incorrecta
- URL state requiere lógica extra de serialización

### Mitigaciones

- Documentar query keys y estrategia de invalidación
- React Query DevTools en desarrollo
- Tests de integración para caching

## Referencias

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Jotai Docs](https://jotai.org/)
- [URL State Management Patterns](https://www.smashingmagazine.com/2022/06/state-management-nextjs/)
