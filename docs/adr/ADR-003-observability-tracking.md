# ADR-003: Observabilidad y Tracking

**Estado:** Aceptado  
**Fecha:** 2026-02-18  
**Autores:** Eric Mogollon

## Contexto

Necesitamos visibilidad completa sobre:

1. **Errores:** qué falla y por qué
2. **Performance:** latencia de API, renders lentos
3. **Producto:** qué features usan los usuarios
4. **Experimentos:** qué variante funciona mejor

Sin observabilidad, operamos a ciegas en producción.

## Decisión

### Arquitectura de Observabilidad

Implementamos una capa de abstracción que permite cambiar de proveedor sin modificar el código de la app.

```
App Code → Observability Layer → Provider (Sentry, Crashlytics, etc.)
```

**Módulos:**

```typescript
// lib/observability/logger.ts
export const logger = {
  debug: (message: string, context?: object) => void,
  info: (message: string, context?: object) => void,
  warn: (message: string, context?: object) => void,
  error: (error: Error, context?: object) => void,
}

// lib/observability/metrics.ts
export const metrics = {
  timing: (name: string, duration: number) => void,
  count: (name: string, value: number) => void,
  gauge: (name: string, value: number) => void,
}

// lib/observability/errors.ts
export const errorReporter = {
  captureException: (error: Error, context?: object) => void,
  captureMessage: (message: string, level: 'info' | 'warning' | 'error') => void,
  setUser: (user: { id: string, email?: string }) => void,
}
```

### 1. Error Tracking

#### Web: Sentry

**Justificación:**

- Source maps para stack traces
- Release tracking
- User feedback integration
- Performance monitoring incluido

**Implementación:**

```typescript
// lib/observability/errors.ts
import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1, // 10% de transacciones
    beforeSend(event) {
        // Filtrar errores conocidos
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
            return null;
        }
        return event;
    },
});
```

**Error Boundaries:**

```typescript
// components/common/ErrorBoundary.tsx
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react'

export function ErrorBoundary({ children }) {
  return (
    <SentryErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        logger.error(error, { errorInfo })
      }}
    >
      {children}
    </SentryErrorBoundary>
  )
}
```

#### Mobile: Firebase Crashlytics

**Justificación:**

- Native crash reporting (no solo JS)
- Crash-free rate metrics
- Integración con Firebase ecosystem
- Gratis hasta volúmenes altos

**Implementación:**

```typescript
// lib/observability/errors.ts (mobile)
import crashlytics from '@react-native-firebase/crashlytics';

export const errorReporter = {
    captureException: (error, context) => {
        crashlytics().recordError(error);
        if (context) {
            crashlytics().log(JSON.stringify(context));
        }
    },
    setUser: (user) => {
        crashlytics().setUserId(user.id);
    },
};
```

### 2. Performance Monitoring

#### Métricas clave:

**API Latency:**

```typescript
// api/fake-api.ts
export async function fetchRestaurants(params) {
    const start = performance.now();
    try {
        const data = await simulateAPICall(params);
        const duration = performance.now() - start;
        metrics.timing('api.restaurants.list', duration);
        return data;
    } catch (error) {
        metrics.count('api.restaurants.list.error', 1);
        throw error;
    }
}
```

**Render Performance:**

```typescript
// hooks/usePerformanceMonitor.ts
export function usePerformanceMonitor(componentName: string) {
    useEffect(() => {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            if (duration > 1000) {
                logger.warn(`Slow render: ${componentName}`, { duration });
            }
        };
    }, []);
}
```

**Web Vitals:**

```typescript
// main.tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS((metric) => metrics.gauge('web_vitals.cls', metric.value));
onFID((metric) => metrics.gauge('web_vitals.fid', metric.value));
onLCP((metric) => metrics.gauge('web_vitals.lcp', metric.value));
```

### 3. Product Analytics (Tracking)

**Decisión:** Capa interna agnóstica de proveedor.

**Eventos core:**

```typescript
// lib/tracking.ts
export const tracking = {
    // Identificación
    identify: (userId: string, traits?: object) => {
        analytics?.identify(userId, traits);
    },

    // Eventos
    track: (eventName: string, properties?: object) => {
        analytics?.track(eventName, {
            ...properties,
            timestamp: new Date().toISOString(),
            platform: Platform.OS, // web | ios | android
        });
    },

    // Pantallas (mobile)
    screen: (screenName: string, properties?: object) => {
        analytics?.screen(screenName, properties);
    },
};
```

**Eventos implementados:**

| Evento                  | Propiedades                           | Cuándo                 |
| ----------------------- | ------------------------------------- | ---------------------- |
| `SearchPerformed`       | `{ query, resultsCount }`             | Al buscar restaurantes |
| `FilterApplied`         | `{ filterType, value }`               | Al aplicar filtro      |
| `FilterCleared`         | `{ filterType }`                      | Al limpiar filtro      |
| `RestaurantViewed`      | `{ restaurantId, source }`            | Al ver detalle         |
| `RestaurantCardClicked` | `{ restaurantId, position, variant }` | Al clickear card       |
| `PageViewed`            | `{ page, referrer }`                  | Al cambiar de página   |
| `ExperimentExposed`     | `{ experimentId, variant }`           | Al mostrar variante    |

**Implementación en componentes:**

```typescript
// components/restaurant/RestaurantCard.tsx
function RestaurantCard({ restaurant, position, variant }) {
  const handleClick = () => {
    tracking.track('RestaurantCardClicked', {
      restaurantId: restaurant.id,
      position,
      variant, // compact | extended (A/B test)
    })
    navigate(`/restaurant/${restaurant.id}`)
  }

  return <Card onClick={handleClick}>...</Card>
}
```

### 4. Feature Flags & Experiments

**Sistema simple de A/B testing:**

```typescript
// lib/experiments.ts
export type Experiment = {
    id: string;
    variants: string[];
    active: boolean;
};

export function getVariant(experimentId: string): string {
    // 1. Buscar en storage (si ya fue asignado)
    const stored = storage.get(`experiment_${experimentId}`);
    if (stored) return stored;

    // 2. Asignar random si no existe
    const experiment = experiments[experimentId];
    const variant = experiment.variants[Math.floor(Math.random() * experiment.variants.length)];

    // 3. Persistir
    storage.set(`experiment_${experimentId}`, variant);

    // 4. Track exposure
    tracking.track('ExperimentExposed', {
        experimentId,
        variant,
    });

    return variant;
}
```

**Uso:**

```typescript
// components/restaurant/RestaurantCard.tsx
function RestaurantCard({ restaurant }) {
  const variant = useExperiment('restaurant_card_design')
  // variant: 'compact' | 'extended'

  return variant === 'compact'
    ? <CompactCard {...restaurant} />
    : <ExtendedCard {...restaurant} />
}
```

### 5. Alertas y Dashboards

**Propuesta de SLOs:**

| Métrica         | Target  | Alerta |
| --------------- | ------- | ------ |
| Crash-free rate | > 99.5% | < 99%  |
| API P95 latency | < 1s    | > 2s   |
| Error rate      | < 0.1%  | > 1%   |
| LCP (Web)       | < 2.5s  | > 4s   |

**Dashboards sugeridos:**

1. **Health Overview:**
    - Crash-free rate (7d, 30d)
    - Error rate
    - Active users

2. **Performance:**
    - API latency (P50, P95, P99)
    - Web Vitals (CLS, FID, LCP)
    - Render duration por componente

3. **Product:**
    - Funnel: búsqueda → filtros → click → detalle
    - Top filtros aplicados
    - Conversion rate por experimento

4. **Experiments:**
    - Exposures por variante
    - Conversiones por variante
    - Statistical significance

**Herramientas:**

- Sentry Performance para web
- Firebase Performance + Crashlytics para mobile
- Amplitude/Mixpanel para product analytics
- Grafana/Datadog para custom dashboards

## Consecuencias

### Positivas

- Visibilidad completa en producción
- Debugging más rápido con stack traces
- Decisiones basadas en datos (experimentos)
- Detección proactiva de problemas (alertas)

### Negativas

- Overhead de código (wrapper layer)
- Costo de servicios externos
- Privacy concerns (GDPR compliance necesario)

### Mitigaciones

- Hacer tracking opt-out (user consent)
- Sampling: no trackear 100% de eventos
- Mock providers en desarrollo local
- Documentar qué se trackea y por qué

## Proveedores Recomendados

### Errores

- **Web:** Sentry (source maps, releases, user feedback)
- **Mobile:** Firebase Crashlytics (native crashes, gratis)

### Analytics

- **Opción 1:** Amplitude (product analytics, funnels, cohorts)
- **Opción 2:** Mixpanel (similar a Amplitude)
- **Opción 3:** Custom (Snowplow + BigQuery) para control total

### Performance

- **Web:** Sentry Performance o Datadog RUM
- **Mobile:** Firebase Performance Monitoring

### Feature Flags

- **Producción:** LaunchDarkly, Split.io, Statsig
- **MVP:** Sistema custom (suficiente para A/B simple)

## Referencias

- [Sentry Docs](https://docs.sentry.io/)
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)
- [Web Vitals](https://web.dev/vitals/)
- [Amplitude Best Practices](https://amplitude.com/blog/event-tracking-best-practices)
