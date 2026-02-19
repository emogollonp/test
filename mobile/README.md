# Mobile - Mesa247 Restaurant Marketplace

Aplicación móvil del marketplace Mesa247 construida con **Expo + React Native + TypeScript + Expo Router**.

## 🚀 Quick Start

```bash
# Instalar dependencias (desde root del monorepo)
pnpm install

# Iniciar Expo Dev Server
pnpm mobile

# Opciones:
# - Escanea QR con Expo Go (iOS/Android)
# - Presiona 'i' para iOS Simulator
# - Presiona 'a' para Android Emulator
# - Presiona 'w' para abrir en web
```

## 📁 Estructura Completa

```
mobile/
├── app/                                    # Expo Router (file-based routing)
│   ├── _layout.tsx                         # Root layout con providers
│   ├── index.tsx                           # Home: Restaurant listing (/)
│   └── restaurant/
│       └── [id].tsx                        # Restaurant detail (/restaurant/:id)
│
├── src/
│   ├── api/                                # Fake API local
│   │   ├── types.ts                        # TypeScript types
│   │   ├── restaurants.json                # 25 restaurants data
│   │   ├── fake-api.ts                     # API implementation
│   │   ├── examples.ts                     # Usage examples
│   │   └── README.md                       # API documentation
│   │
│   ├── hooks/                              # Custom React hooks
│   │   ├── useRestaurants.ts               # TanStack Query hooks
│   │   └── useDebounce.ts                  # Debounce hook (500ms)
│   │
│   ├── components/
│   │   ├── restaurants/                    # Restaurant components
│   │   │   ├── RestaurantCard.tsx          # Card with image, rating, tags
│   │   │   ├── RestaurantList.tsx          # FlatList with infinite scroll
│   │   │   ├── RestaurantSchedule.tsx      # Weekly schedule display
│   │   │   └── SearchBar.tsx               # Search input with clear
│   │   │
│   │   └── filters/                        # Filter components
│   │       ├── FilterModal.tsx             # Full-screen modal with RHF
│   │       └── FilterButton.tsx            # Button with badge count
│   │
│   ├── lib/
│   │   └── tracking.ts                     # Tracking system (3 events)
│   │
│   └── store/
│       └── atoms.ts                        # Jotai global state atoms
│
├── package.json                            # Dependencies
└── tsconfig.json                           # TypeScript config
```

---

## 🎯 Funcionalidades Implementadas

### Pantalla 1: Restaurant Listing (`/`)

**Ruta**: `app/index.tsx`

Funcionalidades:

- ✅ **Search**: Barra de búsqueda con debounce de 500ms
- ✅ **Filtros**: Modal completo con React Hook Form
    - Categorías (multi-select)
    - Precio (rango 1-4)
    - Rating mínimo
    - Tags (multi-select)
    - Abierto ahora (toggle)
- ✅ **Sorting**: Picker con 3 opciones
    - Rating (descendente)
    - Distance (ascendente)
    - Price (ascendente)
- ✅ **Paginación**: Infinite scroll con FlatList
    - 12 items por página
    - Auto-fetch al llegar al final
    - Loading spinner mientras carga
- ✅ **Tracking**:
    - `SearchPerformed`: Al buscar (con resultCount)
    - `FilterApplied`: Al aplicar cada filtro
    - `RestaurantViewed`: Al presionar card

**Componentes**:

- `SearchBar`: Input con icono de búsqueda y botón clear
- `FilterButton`: Botón con badge de filtros activos
- `FilterModal`: Modal full-screen con React Hook Form
- `RestaurantList`: FlatList optimizado con infinite scroll
- `RestaurantCard`: Card con imagen, rating, tags, etc.

---

### Pantalla 2: Restaurant Detail (`/restaurant/[id]`)

**Ruta**: `app/restaurant/[id].tsx`

Funcionalidades:

- ✅ **Dynamic route**: Recibe `id` por URL params
- ✅ **Información completa**:
    - Hero image (280px height)
    - Nombre, categoría, descripción
    - Rating con review count
    - Price level, distancia
    - Tags (todos)
    - Horario semanal con timezone
    - Dirección y teléfono
    - País, moneda, timezone
- ✅ **Estados**:
    - Loading: Spinner + texto
    - Error: Icon + mensaje + botón "Go Back"
    - Success: Contenido completo
- ✅ **Tracking**:
    - `RestaurantViewed`: Al montar componente (source: 'direct')

**Componentes**:

- `RestaurantSchedule`: Horario semanal con día actual highlighted

---

## 🔧 Stack Técnico

### Core

- **React Native**: 0.74.1
- **Expo**: ~51.0.8
- **TypeScript**: ~5.3.3
- **Expo Router**: ~3.5.14 (file-based routing)

### State Management

- **TanStack Query**: ^5.28.4 (server state + caching)
- **Jotai**: ^2.7.2 (global state, minimal usage)
- **React Hook Form**: ^7.51.1 (filtros)

### Storage

- **AsyncStorage**: 1.23.1 (tracking events, preferences)

### Performance

- **FlatList optimizations**:
    - `keyExtractor`: Unique keys
    - `onEndReached`: Infinite scroll
    - `maxToRenderPerBatch`: 10 items
    - `updateCellsBatchingPeriod`: 50ms
    - `removeClippedSubviews`: true
    - `windowSize`: 10
- **React.memo**: RestaurantCard, RestaurantList
- **useCallback**: Event handlers
- **useMemo**: Expensive calculations

---

## 📊 TanStack Query Architecture

### Query Key Factory

```typescript
export const restaurantKeys = {
    all: ['restaurants'] as const,
    lists: () => [...restaurantKeys.all, 'list'] as const,
    list: (params: SearchParams) => [...restaurantKeys.lists(), params] as const,
    details: () => [...restaurantKeys.all, 'detail'] as const,
    detail: (id: string) => [...restaurantKeys.details(), id] as const,
};
```

### Cache Strategy

| Hook                       | StaleTime | GC Time | Use Case                 |
| -------------------------- | --------- | ------- | ------------------------ |
| `useRestaurants()`         | 5 min     | 10 min  | Search/filter results    |
| `useRestaurantsInfinite()` | 10 min    | 15 min  | Infinite scroll pages    |
| `useRestaurant()`          | 15 min    | 30 min  | Single restaurant detail |

### Hooks Disponibles

```typescript
// Fetch restaurants with pagination
useRestaurants({ query, filters, sort, page, pageSize });

// Infinite scroll
useRestaurantsInfinite({ query, filters, sort, pageSize });

// Single restaurant
useRestaurant(restaurantId);

// Prefetch for instant navigation
usePrefetchRestaurant();

// Cache invalidation utilities
useInvalidateRestaurants();
```

---

## 📡 Tracking System

Implementado en `src/lib/tracking.ts`

### Eventos Trackeados

1. **SearchPerformed**

    ```typescript
    trackSearchPerformed(query: string, resultsCount: number)
    ```

    - Trigger: Al cambiar searchQuery (debounced)
    - Properties: query, resultsCount

2. **FilterApplied**

    ```typescript
    trackFilterApplied(filterType: string, filterValue: any)
    ```

    - Trigger: Al aplicar filtros en modal
    - Properties: filterType (category, priceRange, minRating, tags, openNow), filterValue

3. **RestaurantViewed**
    ```typescript
    trackRestaurantViewed(restaurantId, restaurantName, category, source);
    ```

    - Trigger:
        - Al presionar card en listing (source: 'list' o 'search')
        - Al montar pantalla de detalle (source: 'direct')
    - Properties: restaurantId, restaurantName, category, source

### Storage

- **AsyncStorage**: Últimos 100 eventos
- **Console**: Logs en development (`__DEV__`)
- **Metadata**: timestamp, sessionId, platform, version

### Debugging

```typescript
// Ver todos los eventos
const events = await getTrackedEvents();

// Limpiar eventos
await clearTrackedEvents();
```

---

## 🗂️ Jotai Store (Global State)

Implementado en `src/store/atoms.ts`

### Atoms Disponibles

```typescript
// User preferences (persisted)
userPreferencesAtom: { theme, notificationsEnabled }

// Recently viewed restaurants (persisted)
recentlyViewedAtom: string[]

// Favorites (persisted)
favoritesAtom: string[]

// Filter modal visibility (non-persisted)
filterModalVisibleAtom: boolean

// A/B experiment variant (persisted)
experimentVariantAtom: 'A' | 'B'
```

**Nota**: Estado mínimo en Jotai. La mayoría del estado es:

- URL/Navigation state (Expo Router)
- Server state (TanStack Query)
- Local component state (useState, useForm)

---

## 🎨 Componentes Principales

### RestaurantCard

Card optimizado con React.memo:

- Hero image (180px height)
- Nombre, categoría, descripción (2 líneas max)
- Tags (primeros 3 + contador)
- Rating, price level, distancia
- País y moneda
- Badge "Closed" si no está abierto
- Prefetch al presionar (onPressIn)

### RestaurantList

FlatList optimizado:

- keyExtractor eficiente
- onEndReached para infinite scroll
- Loading states (inicial + load more)
- Empty state customizable
- Prefetch automático en press

### FilterModal

Modal full-screen con React Hook Form:

- Multi-select categorías (chips)
- Price range selector (1-4)
- Rating selector (buttons)
- Multi-select tags (chips)
- Switch "Open Now"
- Buttons: Cancel, Reset, Apply

### SearchBar

Input nativo con estilo iOS/Android:

- Icon de búsqueda
- Clear button (cuando tiene texto)
- Platform-specific styling

### RestaurantSchedule

Horario semanal:

- Día actual highlighted
- Formato 12 horas (AM/PM)
- Días cerrados en italic
- Muestra timezone

---

## 🔄 Navegación

### Expo Router (File-based)

```
app/
├── _layout.tsx           → Providers (QueryClient, Jotai, SafeArea)
├── index.tsx             → / (listing)
└── restaurant/
    └── [id].tsx          → /restaurant/:id (detail)
```

### Navegación Programática

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Ir a detalle
router.push(`/restaurant/${restaurantId}`);

// Volver
router.back();

// Reemplazar (sin history)
router.replace(`/restaurant/${restaurantId}`);
```

### Stack Header

```typescript
import { Stack } from 'expo-router';

<Stack.Screen
  options={{
    title: 'Mesa247',
    headerLargeTitle: true,
    headerShadowVisible: false,
  }}
/>
```

---

## 🧪 Testing Plan

Ver [../docs/testing-plan.md](../docs/testing-plan.md) para el plan completo.

### Prioridad Mobile

1. **Unit Tests**:
    - `useDebounce` hook
    - Tracking functions
    - Jotai atoms

2. **Component Tests**:
    - RestaurantCard render
    - SearchBar functionality
    - FilterModal form validation

3. **Integration Tests**:
    - Restaurant listing flow
    - Search + filter flow
    - Navigation flow

4. **E2E Tests** (Detox):
    - User journey: Search → View → Detail
    - Filter application
    - Infinite scroll

---

## 📱 Platform-Specific Notes

### iOS

- Native large titles en Stack headers
- iOS-style picker (ruedita)
- Shadow con shadowColor/shadowOffset/shadowOpacity/shadowRadius

### Android

- Picker con dropdown nativo
- Elevation en lugar de shadow
- StatusBar con backgroundColor

### Web

- Funciona con Expo web (experimental)
- Responsive design básico
- Mouse hover estados

---

## 🚀 Performance Tips

### Optimizaciones Implementadas

1. **FlatList**:
    - keyExtractor único y estable
    - maxToRenderPerBatch: 10
    - windowSize: 10
    - removeClippedSubviews: true

2. **React.memo**:
    - RestaurantCard (evita re-renders)
    - RestaurantList (evita re-renders)
    - Todos los componentes de filtro

3. **useCallback**:
    - Event handlers en listings
    - Prefetch callbacks

4. **useMemo**:
    - Flatten paginated data
    - Active filter count
    - Price symbols

5. **Debounce**:
    - Search input (500ms)
    - Reduce API calls

6. **Prefetch**:
    - onPressIn en cards
    - Instant navigation

### Scaling to 10k Items

Cuando el dataset crezca:

1. **Virtualization mejorada**:
    - getItemLayout con altura fija
    - initialNumToRender: 12
    - maxToRenderPerBatch: 5

2. **Backend pagination**:
    - Cursor-based pagination
    - Page size: 20

3. **Search debounce**:
    - Aumentar a 700ms
    - Cancelar requests pendientes

4. **Lazy loading**:
    - Suspense para módulos pesados
    - Dynamic imports

---

## 🐛 Debugging

### React Native Debugger

```bash
# Instalar
brew install react-native-debugger

# Abrir
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

### Flipper

```bash
# Instalar
brew install --cask flipper

# Plugins útiles:
# - Network
# - AsyncStorage
# - React DevTools
# - Hermes Debugger
```

### Logs

```typescript
// Development logs
console.log('[Component]', data);

// Tracking logs
console.log('[Tracking]', event);

// React Query DevTools (web only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

---

## 📦 Build & Deploy

### Expo EAS Build

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Build both
eas build --platform all
```

### Expo Updates (OTA)

```bash
# Publish update
eas update --branch production

# Usuarios reciben update automáticamente
# sin pasar por App Store / Play Store
```

---

## 🔐 Environment Variables

Create `.env` file:

```bash
# API endpoints (cuando haya backend real)
API_BASE_URL=https://api.mesa247.com

# Analytics keys
MIXPANEL_TOKEN=your_token_here
SENTRY_DSN=your_dsn_here

# Feature flags
ENABLE_EXPERIMENTS=true
```

Acceder en código:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;
```

---

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Jotai](https://jotai.org/)
- [React Hook Form](https://react-hook-form.com/)

---

## 👤 Autor

Eric Mogollon

---

**Nota**: Esta es la implementación mobile del proyecto Mesa247. Ver [README principal](../README.md) para más contexto.
