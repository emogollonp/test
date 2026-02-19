# Mesa247 - Senior Frontend Technical Test

Repositorio monorepo para prueba técnica Senior Frontend (React Web + React Native) para marketplace B2C.

## Estructura del Proyecto

```
mesa247-tech-test/
├── web/          # Aplicación web (Vite + React + TS + shadcn/ui)
├── mobile/       # Aplicación móvil (Expo + React Native + TS + Expo Router)
├── docs/         # Documentación técnica (ADRs, diagramas, planes)
└── package.json  # Scripts root y configuración del monorepo
```

## 🚀 Quick Start

### Prerequisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Expo CLI (opcional, se instala automáticamente)

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm
```

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd mesa247-tech-test

# Instalar todas las dependencias
pnpm install
```

### Correr los proyectos

#### Web (puerto 5173 por defecto)

```bash
pnpm web
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

#### Mobile (Expo)

```bash
pnpm mobile
```

Opciones para ver la app:

- Escanea el QR con Expo Go (iOS/Android)
- Presiona `i` para iOS Simulator
- Presiona `a` para Android Emulator
- Presiona `w` para abrir en web

### Scripts disponibles

```bash
# Desarrollo
pnpm web              # Corre web en modo desarrollo
pnpm mobile           # Corre mobile con Expo

# Build
pnpm web:build        # Build de producción para web
pnpm mobile:build     # Build para mobile (requiere configuración de Expo)

# Code quality
pnpm lint             # Ejecuta ESLint en todo el monorepo
pnpm lint:fix         # Ejecuta ESLint y corrige automáticamente
pnpm format           # Formatea código con Prettier
pnpm format:check     # Verifica formato sin modificar archivos

# Type checking
pnpm type-check       # Verifica tipos de TypeScript en ambos proyectos

# Limpieza
pnpm clean            # Limpia builds y caches
```

## Stack Tecnológico

### Web

- **Framework:** Vite + React 18
- **Lenguaje:** TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **Routing:** React Router v6
- **Server State:** TanStack Query (React Query)
- **Global State:** Jotai
- **Forms:** React Hook Form + Zod

### Mobile

- **Framework:** Expo + React Native
- **Lenguaje:** TypeScript
- **Routing:** Expo Router (file-based)
- **Server State:** TanStack Query
- **Global State:** Jotai
- **Persistence:** AsyncStorage
- **Forms:** React Hook Form

## Características Principales

### Funcionalidades Core

- Listado de restaurantes con búsqueda, filtros y paginación
- Vista detalle de restaurante
- Filtros complejos (categoría, precio, rating, tags, abierto ahora)
- Ordenamiento múltiple (rating, distancia fake, precio)
- Sincronización de estado con URL (web)

### Arquitectura Avanzada

- Fake API con simulación de latencia y errores
- Multi-tenant, multi-país, multi-moneda (modelado)
- Sistema de tracking provider-agnostic (6 proveedores soportados)
- Feature flags y experimentos A/B client-side
- Error boundaries y manejo de errores
- Optimizaciones de performance avanzadas

### Performance Web

- Debounce en búsqueda
- Memoización con `useMemo` y `React.memo`
- Query key design optimizado para caching
- Estado en URL para deep linking

### Performance Mobile

- `FlatList` con optimizaciones (`keyExtractor`, `getItemLayout`)
- Prevención de re-renders innecesarios
- Lazy loading de imágenes
- Persistencia de estado con AsyncStorage

## Performance & Scalability

### Current Optimizations

- **Query Key Factory**: Hierarchical structure for efficient cache management
- **Smart Caching**: Differentiated staleTime/gcTime (5/10/15min) based on data volatility
- **Smart Prefetching**: Hover/focus-triggered with cache awareness to prevent redundant fetches
- **Component Memoization**: Strategic React.memo + useCallback for 60 FPS scroll
- **Granular Invalidation**: Targeted cache updates without full refetch

### Scaling to 10k+ Restaurants

For details on future optimizations (virtual scrolling, intersection observer prefetch, multi-tenant context, memory management), see **[web/docs/PERFORMANCE.md](web/docs/PERFORMANCE.md)**.

**Performance targets**:

- Initial load: < 300ms
- Card click → navigation: < 50ms
- 60 FPS smooth scrolling
- < 50MB memory usage at scale

## Testing

Ver [docs/testing-plan.md](docs/testing-plan.md) para el plan completo de testing.

## Documentación

📖 **[Índice Completo de Documentación](docs/INDEX.md)** - Navegación rápida por todos los documentos

### ADRs (Architecture Decision Records)

- [ADR-001: Estructura del proyecto y capas](docs/adr/ADR-001-project-structure.md)
- [ADR-002: Server state + caching + estado global](docs/adr/ADR-002-state-management-caching.md)
- [ADR-003: Feature Flags y Experiments](docs/adr/ADR-003-feature-flags.md)
- [ADR-004: Observabilidad y Tracking (Legacy)](docs/adr/ADR-004-observability-tracking.md) - Superseded
- [ADR-005: Telemetry y Observability](docs/adr/ADR-005-observability.md)

### Documentación adicional

- [Diagramas de arquitectura](docs/diagrams.md)
- [Plan de testing](docs/testing-plan.md)
- [Checklist de implementación](docs/checklist.md)
- [Log de uso de AI](docs/ai-log.md)

## Multi-tenant / Multi-país

El proyecto está diseñado con soporte para:

- **Tenants:** Identificación por `tenantId` en datos
- **Países:** Campo `country` para filtrado y configuración regional
- **Monedas:** Campo `currency` para formateo correcto
- **Timezones:** Campo `timezone` para horarios locales
- **i18n:** Estructura preparada para internacionalización (no implementado completamente)

Ver README de cada proyecto para detalles de implementación.

## Configuration Design: Multi-Tenancy & i18n

Este es el diseño arquitectónico para configuración multi-tenant e internacionalización. **No está completamente implementado**, pero establece las decisiones técnicas y patrones a seguir.

### 1. Tenant Configuration

#### Web: Subdomain-based detection

**Estrategia recomendada:** Detección automática por subdominio con fallback a config.

```typescript
// lib/config/tenant.ts
interface TenantConfig {
    id: string;
    name: string;
    country: string;
    currency: string;
    locale: string;
    timezone: string;
    theme?: ThemeConfig;
}

const TENANT_MAP: Record<string, TenantConfig> = {
    cl: {
        id: 'mesa247-cl',
        country: 'CL',
        currency: 'CLP',
        locale: 'es-CL',
        timezone: 'America/Santiago',
    },
    ar: {
        id: 'mesa247-ar',
        country: 'AR',
        currency: 'ARS',
        locale: 'es-AR',
        timezone: 'America/Buenos_Aires',
    },
    mx: {
        id: 'mesa247-mx',
        country: 'MX',
        currency: 'MXN',
        locale: 'es-MX',
        timezone: 'America/Mexico_City',
    },
};

function detectTenant(): TenantConfig {
    // 1. Try subdomain: cl.mesa247.com → 'cl'
    const subdomain = window.location.hostname.split('.')[0];
    if (TENANT_MAP[subdomain]) {
        return TENANT_MAP[subdomain];
    }

    // 2. Fallback to localStorage (user selection)
    const saved = localStorage.getItem('tenant');
    if (saved && TENANT_MAP[saved]) {
        return TENANT_MAP[saved];
    }

    // 3. Default fallback
    return TENANT_MAP['cl'];
}
```

**Alternativa:** Config explícita con selector de país en UI para single-domain deployment.

#### Mobile: Build-time configuration + Remote Config

**Estrategia recomendada:** Build variants para cada país + Firebase Remote Config para overrides.

```typescript
// config/tenant.ts (build-time)
const TENANT_CONFIG: TenantConfig = {
    id: process.env.EXPO_PUBLIC_TENANT_ID!,
    country: process.env.EXPO_PUBLIC_COUNTRY!,
    currency: process.env.EXPO_PUBLIC_CURRENCY!,
    locale: process.env.EXPO_PUBLIC_LOCALE!,
    timezone: process.env.EXPO_PUBLIC_TIMEZONE!,
};

// Build variants en eas.json:
// - mesa247-cl (CL/CLP/es-CL)
// - mesa247-ar (AR/ARS/es-AR)
// - mesa247-mx (MX/MXN/es-MX)
```

```typescript
// lib/remote-config.ts (runtime overrides)
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';

async function loadRemoteConfig() {
    const remoteConfig = getRemoteConfig();
    await fetchAndActivate(remoteConfig);

    // Override currency formatting rules, feature flags, etc.
    return {
        currencySymbolPosition: getValue(remoteConfig, 'currency_symbol_position').asString(),
        useThousandsSeparator: getValue(remoteConfig, 'use_thousands_separator').asBoolean(),
    };
}
```

**Tradeoff**: Build variants = apps separadas en stores vs. Single app con selector de país.

---

### 2. Currency Formatting

**Decisión:** `Intl.NumberFormat` nativo (sin dependencias).

```typescript
// lib/format/currency.ts
interface CurrencyFormatOptions {
    locale: string; // 'es-CL', 'es-AR', 'es-MX'
    currency: string; // 'CLP', 'ARS', 'MXN'
    notation?: 'standard' | 'compact'; // 1500 vs 1.5K
}

function formatCurrency(amount: number, options: CurrencyFormatOptions): string {
    return new Intl.NumberFormat(options.locale, {
        style: 'currency',
        currency: options.currency,
        notation: options.notation || 'standard',
        // Nota: CLP no usa decimales, pero ARS/MXN sí
        minimumFractionDigits: options.currency === 'CLP' ? 0 : 2,
        maximumFractionDigits: options.currency === 'CLP' ? 0 : 2,
    }).format(amount);
}

// Ejemplos de output:
// CL: formatCurrency(15000, { locale: 'es-CL', currency: 'CLP' }) → "$15.000"
// AR: formatCurrency(15000, { locale: 'es-AR', currency: 'ARS' }) → "$ 15.000,00"
// MX: formatCurrency(15000, { locale: 'es-MX', currency: 'MXN' }) → "$15,000.00"
```

**Ventajas**:

- ✅ Sin dependencias externas (built-in)
- ✅ Soporte automático de símbolos de moneda
- ✅ Reglas locales correctas (separadores, decimales)
- ✅ Compact notation para listas (1.5K en vez de 1500)

**Limitaciones**:

- ❌ No soporta formato "custom" sin símbolo (necesitarías `.replace()`)
- ❌ No maneja conversión de moneda (solo formato)

---

### 3. Date & Time Formatting

**Decisión:** `Intl.DateTimeFormat` para casos simples + `date-fns-tz` para lógica compleja.

#### Opción A: Intl.DateTimeFormat (preferida para formato básico)

```typescript
// lib/format/date.ts
interface DateFormatOptions {
    locale: string; // 'es-CL', 'es-AR'
    timezone: string; // 'America/Santiago', 'America/Buenos_Aires'
    style?: 'short' | 'medium' | 'long' | 'full';
}

function formatDate(date: Date | string, options: DateFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(options.locale, {
        timeZone: options.timezone,
        dateStyle: options.style || 'medium',
    }).format(dateObj);
}

function formatTime(date: Date | string, options: DateFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(options.locale, {
        timeZone: options.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24h format en LATAM
    }).format(dateObj);
}

// Ejemplos:
// formatDate('2026-02-18T15:30:00Z', { locale: 'es-CL', timezone: 'America/Santiago' })
// → "18 feb 2026"
//
// formatTime('2026-02-18T15:30:00Z', { locale: 'es-CL', timezone: 'America/Santiago' })
// → "12:30" (considerando offset UTC-3)
```

#### Opción B: date-fns-tz (para lógica compleja)

```typescript
// lib/format/date-advanced.ts
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

function formatRelativeTime(date: Date | string, timezone: string): string {
    // "Hace 2 horas", "Ayer", "Hace 3 días"
    // Requiere date-fns para formatDistanceToNow
}

function getOpeningHoursDisplay(
    openTime: string, // "09:00"
    closeTime: string, // "22:00"
    timezone: string
): string {
    // "Abierto de 09:00 a 22:00"
    // "Cierra en 2 horas"
    // Requiere comparación con hora actual en timezone
}
```

**Tradeoff Table**:

| Criterio             | Intl.DateTimeFormat | date-fns-tz      |
| -------------------- | ------------------- | ---------------- |
| **Bundle size**      | 0 KB (built-in)     | ~15 KB + locales |
| **Timezone support** | ✅ Completo         | ✅ Completo      |
| **Relative dates**   | ❌ No ("hace 2h")   | ✅ Sí            |
| **Custom formats**   | ⚠️ Limitado         | ✅ Flexible      |
| **Parsing**          | ❌ No               | ✅ Sí            |

**Recomendación**: Usar `Intl.DateTimeFormat` por defecto, agregar `date-fns-tz` solo si necesitas relative time o parsing complejo.

---

### 4. i18n Structure

**Decisión:** Namespaces por feature + react-i18next (o similar).

#### Estructura de archivos

```
web/src/locales/
├── es-CL/
│   ├── common.json         # Botones, labels comunes
│   ├── restaurant.json     # Feature: Restaurantes
│   ├── filters.json        # Feature: Filtros
│   ├── errors.json         # Mensajes de error
│   └── validation.json     # Validaciones de formularios
├── es-AR/
│   └── ... (misma estructura)
└── es-MX/
    └── ... (misma estructura)

mobile/src/locales/
└── (misma estructura)
```

#### Ejemplo de namespace: `common.json`

```json
{
    "buttons": {
        "search": "Buscar",
        "filter": "Filtrar",
        "clear": "Limpiar",
        "apply": "Aplicar",
        "cancel": "Cancelar",
        "close": "Cerrar"
    },
    "loading": {
        "default": "Cargando...",
        "restaurants": "Cargando restaurantes...",
        "details": "Cargando información..."
    },
    "empty": {
        "noResults": "No se encontraron resultados",
        "tryAgain": "Intenta con otros filtros"
    },
    "units": {
        "km": "km",
        "min": "min"
    }
}
```

#### Ejemplo de namespace: `restaurant.json`

```json
{
    "list": {
        "title": "Restaurantes",
        "sortBy": "Ordenar por",
        "filterBy": "Filtrar por"
    },
    "card": {
        "openNow": "Abierto ahora",
        "closed": "Cerrado",
        "opensAt": "Abre a las {{time}}",
        "closesAt": "Cierra a las {{time}}",
        "rating": "{{value}} estrellas",
        "distance": "A {{distance}} km",
        "priceLevel": {
            "1": "Económico",
            "2": "Moderado",
            "3": "Costoso",
            "4": "Muy costoso"
        }
    },
    "detail": {
        "about": "Acerca de",
        "menu": "Ver menú",
        "call": "Llamar",
        "directions": "Cómo llegar",
        "share": "Compartir"
    }
}
```

#### Ejemplo de namespace: `filters.json`

```json
{
    "categories": {
        "title": "Categorías",
        "all": "Todas",
        "italian": "Italiana",
        "mexican": "Mexicana",
        "japanese": "Japonesa",
        "fast_food": "Comida rápida",
        "seafood": "Mariscos",
        "vegetarian": "Vegetariana"
    },
    "price": {
        "title": "Rango de precio",
        "any": "Cualquiera"
    },
    "rating": {
        "title": "Calificación",
        "minRating": "Mínimo {{stars}} estrellas"
    },
    "features": {
        "title": "Características",
        "delivery": "Delivery",
        "takeout": "Para llevar",
        "outdoor": "Terraza",
        "parking": "Estacionamiento"
    }
}
```

#### Uso en componentes

```typescript
// Web: con react-i18next
import { useTranslation } from 'react-i18next';

function RestaurantCard({ restaurant }) {
  const { t } = useTranslation(['restaurant', 'common']);

  return (
    <div>
      <h3>{restaurant.name}</h3>
      <p>
        {restaurant.isOpen
          ? t('restaurant:card.openNow')
          : t('restaurant:card.opensAt', { time: restaurant.opensAt })
        }
      </p>
      <p>{t('restaurant:card.rating', { value: restaurant.rating })}</p>
      <button>{t('common:buttons.call')}</button>
    </div>
  );
}
```

#### Fallback strategy

```typescript
// i18n config
const i18nConfig = {
    fallbackLng: 'es-CL', // Default si no hay traducción
    fallbackNS: 'common', // Namespace por defecto

    // Fallback en cadena: es-AR → es-CL → es → key
    supportedLngs: ['es-CL', 'es-AR', 'es-MX'],

    interpolation: {
        escapeValue: false, // React ya escapa
    },

    // Load namespaces on-demand (code-splitting)
    partialBundledLanguages: true,
    ns: ['common', 'restaurant', 'filters'],
    defaultNS: 'common',
};
```

#### Key naming conventions

```typescript
// ✅ CORRECTO: Namespace:feature.context.element
t('restaurant:card.openNow');
t('filters:categories.italian');
t('common:buttons.search');
t('errors:network.timeout');

// ❌ INCORRECTO: Flat structure sin contexto
t('openNow');
t('italian');
t('search');
```

---

### 5. Context Provider Pattern

```typescript
// lib/context/LocaleContext.tsx
interface LocaleContextValue {
  tenant: TenantConfig;
  locale: string;
  currency: string;
  timezone: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  changeTenant: (tenantId: string) => void;
}

export function LocaleProvider({ children }) {
  const [tenant, setTenant] = useState(() => detectTenant());

  const value: LocaleContextValue = {
    tenant,
    locale: tenant.locale,
    currency: tenant.currency,
    timezone: tenant.timezone,
    formatCurrency: (amount) => formatCurrency(amount, {
      locale: tenant.locale,
      currency: tenant.currency,
    }),
    formatDate: (date) => formatDate(date, {
      locale: tenant.locale,
      timezone: tenant.timezone,
    }),
    formatTime: (date) => formatTime(date, {
      locale: tenant.locale,
      timezone: tenant.timezone,
    }),
    changeTenant: (id) => {
      const newTenant = TENANT_MAP[id];
      if (newTenant) {
        setTenant(newTenant);
        localStorage.setItem('tenant', id);  // Persistir
        // Actualizar i18n.changeLanguage(newTenant.locale)
      }
    },
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

// Hook de uso
export function useLocale() {
  return useContext(LocaleContext);
}

// Uso en componentes
function PriceDisplay({ amount }) {
  const { formatCurrency } = useLocale();
  return <span>{formatCurrency(amount)}</span>;
}
```

---

### Tradeoffs & Decisiones

#### ✅ Decisiones tomadas

| Aspecto              | Decisión                       | Razón                                                                 |
| -------------------- | ------------------------------ | --------------------------------------------------------------------- |
| **Tenant (web)**     | Subdomain detection            | SEO-friendly, sin config manual, URL limpia                           |
| **Tenant (mobile)**  | Build variants + Remote Config | App stores requieren builds separados; Remote Config permite hotfixes |
| **Currency**         | `Intl.NumberFormat`            | 0 KB bundle, soporte nativo, reglas locales correctas                 |
| **Dates (basic)**    | `Intl.DateTimeFormat`          | 0 KB bundle, timezone support completo                                |
| **Dates (advanced)** | date-fns-tz                    | Solo si necesitas relative time ("hace 2h")                           |
| **i18n structure**   | Namespaces por feature         | Code-splitting, evita colisiones, escalable                           |
| **Fallback**         | es-CL como default             | Chile es el mercado principal                                         |

#### ⚠️ Tradeoffs importantes

**1. Web: Subdomain vs Single-domain**

| Subdomain (cl.mesa247.com) | Single-domain + Selector    |
| -------------------------- | --------------------------- |
| ✅ SEO per-country         | ❌ SEO único                |
| ✅ Auto-detección          | ❌ Requiere selector manual |
| ✅ Deep links limpios      | ✅ Deploy más simple        |
| ❌ Requiere wildcard DNS   | ✅ Un solo dominio          |
| ❌ CORS en API             | ✅ Sin CORS issues          |

**2. Mobile: Build variants vs Single app**

| Build variants (3 apps) | Single app + selector       |
| ----------------------- | --------------------------- |
| ✅ Optimizado por país  | ❌ Incluye todos los assets |
| ✅ Menor bundle size    | ❌ Mayor bundle size        |
| ❌ 3 apps en stores     | ✅ 1 app en stores          |
| ❌ Updates triplicados  | ✅ Update único             |
| ✅ No requiere selector | ❌ UX de selector           |

**3. i18n: react-i18next vs FormatJS vs Native**

| Criterio         | react-i18next            | FormatJS (react-intl) | Intl nativo |
| ---------------- | ------------------------ | --------------------- | ----------- |
| **Bundle size**  | ~10 KB                   | ~15 KB                | 0 KB        |
| **Namespaces**   | ✅ Sí                    | ❌ No (flat)          | N/A         |
| **Plurals**      | ✅ Automático            | ✅ Automático         | ❌ Manual   |
| **Lazy loading** | ✅ Sí                    | ⚠️ Limitado           | N/A         |
| **React Native** | ✅ Completo              | ✅ Completo           | ⚠️ Limitado |
| **TypeScript**   | ⚠️ Requiere tipos custom | ✅ Built-in           | N/A         |

**Recomendación**: react-i18next para escalabilidad (namespaces + lazy loading).

**4. date-fns-tz: ¿Cuándo agregarlo?**

**Agregar SI necesitas**:

- Relative time: "Hace 2 horas", "Ayer"
- Horarios complejos: "Abre en 30 minutos"
- Parsing de strings: "2026-02-18" → Date
- Manipulación: add/subtract days con timezone

**NO agregar SI solo necesitas**:

- Formatear fechas/horas
- Mostrar "DD/MM/YYYY" o "HH:MM"
- Timezone conversion básico

**Cost**: +15 KB + 5-10 KB por locale → Total ~25 KB.

#### 🔮 Futuras consideraciones

1. **Currency conversion**: Si necesitas mostrar precios en múltiples monedas, requerirás un servicio de exchange rates (ej. API de Fixer.io).

2. **Locale detection**: En vez de country selector manual, podrías auto-detectar desde:
    - `navigator.language` (web)
    - `Localization.locale` (mobile Expo)
    - GeoIP del usuario

3. **RTL support**: Si expandes a países con idiomas RTL (árabe, hebreo), necesitarás:
    - CSS logical properties (`margin-inline-start` vs `margin-left`)
    - `dir="rtl"` en HTML
    - Flip de iconos (flechas, etc.)

4. **Server-side i18n (web)**: Si migras a SSR/SSG (Next.js), necesitarás:
    - i18n routing (`/es-CL/restaurants`)
    - Server-side translation loading
    - SEO meta tags por idioma

---

### Implementation Checklist (No implementado)

Cuando decidas implementar, seguir este orden:

- [ ]   1. Setup tenant detection (web: subdomain, mobile: env vars)
- [ ]   2. Crear `LocaleProvider` con context
- [ ]   3. Implementar `formatCurrency()` con Intl.NumberFormat
- [ ]   4. Implementar `formatDate()` / `formatTime()` con Intl.DateTimeFormat
- [ ]   5. Crear estructura de archivos JSON para i18n (common, restaurant, filters)
- [ ]   6. Instalar y configurar react-i18next
- [ ]   7. Traducir strings hardcodeados en componentes
- [ ]   8. Agregar selector de país en UI (si single-domain/single-app)
- [ ]   9. Testing: Cambiar tenant y verificar currency/dates/translations
- [ ]   10. (Opcional) Agregar date-fns-tz si necesitas relative time

**Prioridad**: Iniciar con currency y dates (alto impacto, bajo esfuerzo), luego i18n completo (alto esfuerzo).

---

## Tracking de Eventos

Sistema de tracking provider-agnostic implementado:

- **Arquitectura:** Capa de abstracción con tipo-safety completo
- **Providers:** Console, Segment, Mixpanel, Amplitude, Google Analytics 4, Firebase
- **Eventos:** Page views, clicks, búsquedas, filtros, experiment exposure
- **Features:** Queue de eventos, retry automático, validación de schemas
- **Configuración:** Multi-provider simultáneo con enable/disable individual

### Documentación

- 📖 [Guía Web](web/src/lib/tracking/README.md)
- 📖 [Guía Mobile](mobile/src/lib/tracking/README.md)

## Telemetry y Observability

Sistema completo de observabilidad production-ready:

- **Logger:** Logging estructurado con niveles (debug, info, warn, error)
- **Error Tracker:** Captura de excepciones y crashes con contexto rico
- **Metrics Tracker:** Performance metrics + business metrics
- **Perceived Latency:** Métrica clave - tiempo desde acción hasta render

### Stack de Herramientas

**Web**:

- Error tracking: **Sentry** (crashes, errors, session replay)
- Metrics: **Datadog RUM** (performance, web vitals)
- Error Boundary: React error boundary con reporte automático

**Mobile**:

- Crashes: **Firebase Crashlytics** (crash reports, ANRs)
- Performance: **Firebase Performance Monitoring**
- Analytics: **Firebase Analytics** (custom metrics)

### SLOs y Thresholds

#### Web

| Métrica                            | Target   | Warning  | Critical |
| ---------------------------------- | -------- | -------- | -------- |
| **Perceived Latency (p95)**        | < 1000ms | > 1500ms | > 2500ms |
| **Error Rate**                     | < 1%     | > 2%     | > 5%     |
| **Error-Free Sessions**            | > 99.5%  | < 99%    | < 98%    |
| **LCP (Largest Contentful Paint)** | < 2.5s   | > 3s     | > 4s     |

#### Mobile

| Métrica                     | Target   | Warning  | Critical |
| --------------------------- | -------- | -------- | -------- |
| **Perceived Latency (p95)** | < 1500ms | > 2000ms | > 3000ms |
| **Error Rate**              | < 1%     | > 2%     | > 5%     |
| **Crash-Free Sessions**     | > 99.9%  | < 99.5%  | < 99%    |
| **App Start (cold, p95)**   | < 3s     | > 4s     | > 6s     |

### Documentación

- 📖 [Guía Web](web/src/lib/telemetry/README.md)
- 📖 [Guía Mobile](mobile/src/lib/telemetry/README.md)
- 📋 [ADR-005: Observability Architecture](docs/adr/ADR-005-observability.md)

## Experimentos y Feature Flags

Sistema de A/B testing client-side sin dependencias externas:

- **Arquitectura:** Client-side random assignment con persistencia local
- **Storage:** localStorage (web) + AsyncStorage (mobile)
- **Tracking:** Eventos `ExperimentExposed` automáticos
- **Type-safe:** Variants tipados en TypeScript
- **Plataformas:** Implementaciones independientes web/mobile

### Experimento Activo

**`restaurant_card_variant`**

- **Variante A (compact):** Card original compacta
- **Variante B (extended):** Card extendida con más información
- **Split:** 50/50 random assignment
- **Objetivo:** Medir engagement (clicks, conversiones)

### Documentación

- 📖 [Guía Web](web/src/lib/experiments/README.md)
- 📖 [Guía Mobile](mobile/src/lib/experiments/README.md)
- 📋 [ADR-003: Feature Flags Architecture](docs/ADR-003-feature-flags.md)

## CI/CD (Propuesta)

Ver sección "CI/CD" en el README de cada proyecto para la propuesta completa.

Incluye:

- Lint y type-check en PRs
- Tests automatizados
- Preview deploys (Vercel para web, Expo Updates para mobile)
- Bundle size tracking
- Performance budgets

## Convenciones

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(web): add restaurant filters
fix(mobile): resolve FlatList performance issue
docs: update testing plan
chore: upgrade dependencies
```

### Código

- TypeScript strict mode
- ESLint + Prettier configurados
- Nombres descriptivos y auto-documentados
- Comentarios solo cuando añaden valor

## Contribución

Este es un proyecto de prueba técnica. Para desarrollo:

1. Crear feature branch desde `main`
2. Verificar lint y types: `pnpm lint && pnpm type-check`
3. Push y abrir PR

## 👤 Autor

Eric Mogollon

---

**Nota:** Este proyecto usa una Fake API con datos locales JSON. No requiere backend ni servicios externos para funcionar.
