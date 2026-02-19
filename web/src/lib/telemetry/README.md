# Telemetry / Observability (Web)

Sistema completo de observabilidad para monitoreo de producción.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Módulos](#módulos)
- [Integración con Sentry](#integración-con-sentry)
- [Métricas Clave](#métricas-clave)
- [SLOs y Thresholds](#slos-y-thresholds)
- [Dashboards](#dashboards)
- [Alertas](#alertas)
- [Uso](#uso)

## Arquitectura

```
┌──────────────────────────────────────┐
│        Application Layer             │
│   (Components, Hooks, Pages)         │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│      Telemetry Module                │
│  ┌──────────┬──────────┬──────────┐  │
│  │ Logger   │  Errors  │ Metrics  │  │
│  └──────────┴──────────┴──────────┘  │
└────────────┬─────────────────────────┘
             │
      ┌──────┴──────┬──────────┐
      ↓             ↓          ↓
┌──────────┐  ┌─────────┐  ┌─────────┐
│  Sentry  │  │ Datadog │  │ Console │
│          │  │   RUM   │  │   Dev   │
└──────────┘  └─────────┘  └─────────┘
```

## Módulos

### 1. Logger

Logging estructurado con niveles y contexto.

```typescript
import { logger } from '@/lib/telemetry';

// Log levels
logger.debug('Debug message', { key: 'value' });
logger.info('Info message', { userId: '123' });
logger.warn('Warning message', { component: 'RestaurantCard' });
logger.error('Error occurred', { error: err });

// Set user context
logger.setUser('user-123');
```

### 2. Error Tracker

Captura y reporte de errores con contexto rico.

```typescript
import { errorTracker } from '@/lib/telemetry';

// Capture exceptions
try {
    dangerousOperation();
} catch (error) {
    errorTracker.captureException(error as Error, {
        component: 'RestaurantList',
        action: 'fetch',
        tags: {
            category: 'api',
        },
        extra: {
            filters: currentFilters,
        },
    });
}

// Capture messages
errorTracker.captureMessage('User attempted invalid action', 'warning', {
    userId: user.id,
    action: 'checkout',
});

// Set user context
errorTracker.setUser('user-123', {
    email: 'user@example.com',
    plan: 'premium',
});
```

### 3. Metrics Tracker

Métricas de performance y negocio.

```typescript
import { metrics } from '@/lib/telemetry';

// Counters
metrics.increment('restaurant.viewed', 1, {
    category: 'italian',
});

// Gauges
metrics.gauge('restaurant.list.count', restaurants.length);

// Timings
metrics.timing('api.response_time', 250, {
    endpoint: '/restaurants',
});

// Histograms
metrics.histogram('query.results', 42, {
    query: 'pizza',
});
```

### 4. Perceived Latency

Métrica más importante: tiempo desde inicio de query hasta render.

```typescript
import { usePerceivedLatency } from '@/lib/telemetry';
import { useQuery } from '@tanstack/react-query';

function RestaurantList() {
    const queryKey = ['restaurants', filters];
    const { onFetchStart, onFetchSuccess, onRenderComplete } = usePerceivedLatency(queryKey);

    const { data } = useQuery({
        queryKey,
        queryFn: async () => {
            onFetchStart();
            const data = await fetchRestaurants(filters);
            onFetchSuccess();
            return data;
        },
    });

    React.useEffect(() => {
        if (data) {
            onRenderComplete();
        }
    }, [data, onRenderComplete]);

    return <>{/* render */}</>;
}
```

## Integración con Sentry

### 1. Instalación

```bash
pnpm add @sentry/react
```

### 2. Configuración

Actualizar `/web/src/lib/telemetry/errors.ts`:

```typescript
import * as Sentry from '@sentry/react';

// En el constructor de SentryErrorTracker:
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,

    // Performance monitoring
    tracesSampleRate: 0.1, // 10% de transacciones

    // Session replay
    replaysSessionSampleRate: 0.1, // 10% de sesiones normales
    replaysOnErrorSampleRate: 1.0, // 100% de sesiones con error

    integrations: [
        new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
                React.useEffect,
                useLocation,
                useNavigationType,
                createRoutesFromChildren,
                matchRoutes
            ),
        }),
        new Sentry.Replay({
            maskAllText: false,
            blockAllMedia: true,
        }),
    ],

    // Filtering
    beforeSend(event, hint) {
        // Don't send development errors
        if (import.meta.env.DEV) return null;

        // Filter out known issues
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
            return null;
        }

        return event;
    },
});
```

### 3. Variables de Entorno

`.env.production`:

```bash
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_APP_VERSION=1.0.0
```

### 4. Wrap App

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initTelemetry } from '@/lib/telemetry';

function App() {
    React.useEffect(() => {
        initTelemetry();
    }, []);

    return (
        <ErrorBoundary>
            {/* Your app */}
        </ErrorBoundary>
    );
}
```

## Métricas Clave

### 1. Perceived API Latency

**Qué mide**: Tiempo total desde que el usuario inicia una acción hasta que ve el resultado en pantalla.

**Componentes**:

- `start`: Usuario hace clic / inicia búsqueda
- `fetchComplete`: API responde
- `renderComplete`: UI actualizada

**Fórmula**:

```
Perceived Latency = renderComplete - start
```

### 2. Error Rate

**Qué mide**: Porcentaje de requests/operaciones que fallan.

**Fórmula**:

```
Error Rate = (failed_requests / total_requests) * 100
```

### 3. Crash-Free Sessions (Web: Error-Free Sessions)

**Qué mide**: Porcentaje de sesiones sin errores fatales.

**Fórmula**:

```
Error-Free Rate = ((total_sessions - sessions_with_errors) / total_sessions) * 100
```

### 4. Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## SLOs y Thresholds

### Service Level Objectives (SLOs)

| Métrica                     | Target (SLO) | Warning  | Critical | Medición             |
| --------------------------- | ------------ | -------- | -------- | -------------------- |
| **Perceived Latency (p95)** | < 1000ms     | > 1500ms | > 2500ms | 95% de requests      |
| **Perceived Latency (p50)** | < 500ms      | > 800ms  | > 1200ms | 50% de requests      |
| **Error Rate**              | < 1%         | > 2%     | > 5%     | Últimos 5min         |
| **Error-Free Sessions**     | > 99.5%      | < 99%    | < 98%    | Últimas 24h          |
| **API Success Rate**        | > 99%        | < 98%    | < 95%    | Últimos 5min         |
| **LCP**                     | < 2.5s       | > 3s     | > 4s     | 75% de pageviews     |
| **FID**                     | < 100ms      | > 200ms  | > 300ms  | 95% de interacciones |
| **CLS**                     | < 0.1        | > 0.15   | > 0.25   | 75% de pageviews     |

### Percentiles Explicados

- **p50 (median)**: La mitad de los usuarios experimentan este tiempo o menos
- **p95**: 95% de usuarios experimentan este tiempo o menos (5% más lento)
- **p99**: 99% de usuarios experimentan este tiempo o menos (1% más lento)

**Ejemplo**:

- p50 = 400ms → Usuario típico espera 400ms
- p95 = 1200ms → El 5% más lento espera hasta 1200ms
- p99 = 2500ms → El 1% más lento espera hasta 2500ms

## Dashboards

### Dashboard Principal (Datadog/Sentry)

#### 1. Overview

```
┌─────────────────────────────────────────────────────┐
│  Mesa247 Web - Health Dashboard                    │
├─────────────────────────────────────────────────────┤
│  📊 Key Metrics (Last 24h)                          │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ Sessions │ Error    │ Latency  │ Error-Free│    │
│  │ 12,453   │ Rate     │ p95      │ Sessions  │    │
│  │          │ 0.8%     │ 850ms    │ 99.6%     │    │
│  │          │ ✅ Good  │ ✅ Good  │ ✅ Good   │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────────────────┘
```

#### 2. API Performance

- **Graph**: Perceived Latency over time (p50, p95, p99)
- **Graph**: Error rate over time
- **Table**: Slowest queries (p95 latency)

#### 3. Errors & Crashes

- **Graph**: Error count by type
- **Table**: Top errors by frequency
- **Table**: Recent errors (last 1h)

#### 4. Web Vitals

- **Gauges**: LCP, FID, CLS current values
- **Graph**: Web Vitals trend over time
- **Heatmap**: Vitals by page

#### 5. Business Metrics

- **Graph**: Restaurant views
- **Graph**: Search queries
- **Graph**: Filter usage

### Query para Datadog Dashboard

```json
{
    "title": "Mesa247 Web - Perceived Latency",
    "widgets": [
        {
            "definition": {
                "type": "timeseries",
                "requests": [
                    {
                        "q": "p95:api.perceived_latency{env:production}",
                        "display_type": "line",
                        "style": {
                            "palette": "cool"
                        }
                    }
                ],
                "title": "Perceived Latency p95"
            }
        }
    ]
}
```

## Alertas

### Configuración en Sentry

#### 1. High Error Rate

```
Alert: Error Rate Spike
Condition: error_count > 50 per 5 minutes
Severity: Critical
Action:
  - PagerDuty alert
  - Slack #incidents
  - Email eng-leads
```

#### 2. Slow Perceived Latency

```
Alert: Perceived Latency High
Condition: p95(api.perceived_latency) > 2500ms for 10 minutes
Severity: Warning
Action:
  - Slack #performance
  - Email platform-team
```

#### 3. Error-Free Sessions Drop

```
Alert: Error-Free Sessions Below Target
Condition: error_free_rate < 99% for 30 minutes
Severity: Warning
Action:
  - Slack #quality
  - Create Jira ticket
```

### Configuración en Datadog

```hcl
# Terraform configuration
resource "datadog_monitor" "perceived_latency_high" {
  name    = "Mesa247 Web - Perceived Latency High"
  type    = "metric alert"
  message = <<-EOF
    Perceived latency p95 is above threshold.
    Current: {{value}}ms
    Threshold: 2500ms

    Investigate:
    - API response times
    - Network issues
    - Database performance

    @slack-performance @pagerduty-platform
  EOF

  query = "avg(last_10m):p95:api.perceived_latency{env:production} > 2500"

  thresholds = {
    critical = 2500
    warning  = 1500
  }

  notify_no_data    = true
  no_data_timeframe = 20

  tags = ["team:platform", "service:mesa247-web"]
}
```

## Uso en Producción

### 1. Inicialización

En `main.tsx`:

```typescript
import { initTelemetry } from './lib/telemetry';

// Initialize telemetry before rendering
initTelemetry();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
```

### 2. En Componentes

```typescript
import { logger, errorTracker, metrics } from '@/lib/telemetry';

function RestaurantCard({ restaurant }: Props) {
    const handleClick = () => {
        logger.info('Restaurant card clicked', {
            restaurantId: restaurant.id,
        });

        metrics.increment('restaurant.card_click');
    };

    return <div onClick={handleClick}>...</div>;
}
```

### 3. En Error Boundaries

Ya integrado en `/web/src/components/ErrorBoundary.tsx`.

### 4. En Custom Hooks

```typescript
function useRestaurants() {
    const { onFetchStart, onFetchSuccess, onRenderComplete } = usePerceivedLatency(['restaurants']);

    return useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            onFetchStart();
            try {
                const data = await api.fetchRestaurants();
                onFetchSuccess();
                return data;
            } catch (error) {
                errorTracker.captureException(error as Error, {
                    component: 'useRestaurants',
                });
                throw error;
            }
        },
    });
}
```

## Testing

### 1. Test Error Tracking

```typescript
import { errorTracker } from '@/lib/telemetry';

// Force an error
errorTracker.captureException(new Error('Test error'), {
    component: 'Test',
    tags: { test: 'true' },
});
```

### 2. Test Metrics

```typescript
import { metrics } from '@/lib/telemetry';

// Send test metric
metrics.timing('test.metric', 123, { env: 'test' });
```

### 3. Check Console (Development)

All telemetry outputs to console in development mode with colorized logs.

## Best Practices

1. **Always add context**: Include component name, action, and relevant data
2. **Use appropriate log levels**: Debug for debugging, Info for important events, Error for failures
3. **Track user actions**: Button clicks, searches, filters
4. **Measure everything**: API calls, renders, user interactions
5. **Set error budgets**: Don't exceed SLO thresholds
6. **Review dashboards daily**: Check health metrics every morning
7. **Act on alerts**: Don't ignore warnings

## Troubleshooting

### High Perceived Latency

1. Check API response times in Network tab
2. Look for slow database queries
3. Check for large bundle sizes
4. Review React render performance

### High Error Rate

1. Check Sentry for error details
2. Look for recent deployments
3. Review API status
4. Check for browser compatibility issues

### Low Error-Free Sessions

1. Identify most common errors in Sentry
2. Check if errors are related to specific features
3. Review recent code changes
4. Add more specific error handling

---
