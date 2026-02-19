# Telemetry / Observability (Mobile)

Sistema completo de observabilidad para monitoreo de producción en React Native.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Módulos](#módulos)
- [Integración con Firebase Crashlytics](#integración-con-firebase-crashlytics)
- [Métricas Clave](#métricas-clave)
- [SLOs y Thresholds](#slos-y-thresholds)
- [Dashboards](#dashboards)
- [Alertas](#alertas)
- [Uso](#uso)

## Arquitectura

```
┌──────────────────────────────────────┐
│        Application Layer             │
│   (Screens, Components, Hooks)       │
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
┌───────────┐ ┌──────────┐ ┌─────────┐
│ Crashlytics│ │ Firebase │ │ Console │
│            │ │Analytics │ │   Dev   │
└───────────┘ └──────────┘ └─────────┘
```

## Módulos

### 1. Logger

Logging estructurado con niveles y contexto.

```typescript
import { logger } from '@/lib/telemetry';

// Log levels
logger.debug('Debug message', { key: 'value' });
logger.info('Info message', { userId: '123' });
logger.warn('Warning message', { screen: 'RestaurantList' });
logger.error('Error occurred', { error: err });

// Set user context
logger.setUser('user-123');
```

### 2. Error Tracker

Captura y reporte de crashes/errores con contexto rico.

```typescript
import { errorTracker } from '@/lib/telemetry';

// Capture exceptions
try {
    dangerousOperation();
} catch (error) {
    errorTracker.captureException(error as Error, {
        screen: 'RestaurantList',
        component: 'RestaurantCard',
        action: 'fetch',
        tags: {
            category: 'api',
        },
        extra: {
            filters: currentFilters,
        },
    });
}

// Capture messages (non-fatal)
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

// Screen tracking
metrics.trackScreenView('RestaurantList');
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

## Integración con Firebase Crashlytics

### 1. Instalación

```bash
# Install Firebase dependencies
npm install @react-native-firebase/app @react-native-firebase/crashlytics @react-native-firebase/analytics @react-native-firebase/perf

# iOS: Install pods
cd ios && pod install && cd ..
```

### 2. Configuración Firebase

#### iOS

1. Descarga `GoogleService-Info.plist` de Firebase Console
2. Agrégalo a Xcode en la raíz del proyecto
3. Actualiza `ios/Podfile`:

```ruby
platform :ios, '13.0'

target 'Mesa247' do
  # ... existing config

  # Firebase
  use_frameworks! :linkage => :static
end
```

4. Actualiza `ios/Mesa247/AppDelegate.mm`:

```objc
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize Firebase
  [FIRApp configure];

  // ... rest of code
}
```

#### Android

1. Descarga `google-services.json` de Firebase Console
2. Colócalo en `android/app/`
3. Actualiza `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        // ... existing dependencies
        classpath 'com.google.gms:google-services:4.4.0'
        classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
    }
}
```

4. Actualiza `android/app/build.gradle`:

```gradle
apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services"
apply plugin: "com.google.firebase.crashlytics"

dependencies {
    // ... existing dependencies
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-crashlytics'
    implementation 'com.google.firebase:firebase-analytics'
}
```

### 3. Actualizar Código

Actualizar `/mobile/src/lib/telemetry/errors.ts`:

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

class CrashlyticsErrorTracker implements ErrorTracker {
    constructor() {
        // Enable collection in production only
        if (!__DEV__) {
            crashlytics().setCrashlyticsCollectionEnabled(true);
        }
    }

    captureException(error: Error, context?: ErrorContext): void {
        if (!this.enabled) return;

        // Log to Crashlytics
        crashlytics().recordError(error);

        // Add custom attributes
        if (context?.screen) {
            crashlytics().setAttribute('screen', context.screen);
        }
        if (context?.component) {
            crashlytics().setAttribute('component', context.component);
        }
        if (context?.action) {
            crashlytics().setAttribute('action', context.action);
        }

        // Add custom keys
        if (context?.tags) {
            Object.entries(context.tags).forEach(([key, value]) => {
                crashlytics().setAttribute(key, value);
            });
        }

        // Add extra data
        if (context?.extra) {
            Object.entries(context.extra).forEach(([key, value]) => {
                crashlytics().setAttribute(key, String(value));
            });
        }

        // Log breadcrumb
        crashlytics().log(`Error in ${context?.component || 'Unknown'}: ${error.message}`);
    }

    setUser(userId: string, userData?: Record<string, unknown>): void {
        crashlytics().setUserId(userId);

        if (userData) {
            Object.entries(userData).forEach(([key, value]) => {
                crashlytics().setAttribute(key, String(value));
            });
        }
    }
}
```

### 4. Forzar un Crash de Prueba

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Test crash (use only in development)
if (__DEV__) {
    crashlytics().crash();
}

// Test non-fatal error
crashlytics().recordError(new Error('Test non-fatal error'));
```

### 5. Variables de Entorno

`.env.production`:

```bash
FIREBASE_PROJECT_ID=mesa247-prod
FIREBASE_APP_ID=1:xxxxx:android:xxxxx
```

## Métricas Clave

### 1. Perceived API Latency

**Qué mide**: Tiempo total desde que el usuario inicia una acción hasta que ve el resultado en pantalla.

**Componentes**:

- `start`: Usuario hace tap / inicia búsqueda
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

### 3. Crash-Free Sessions

**Qué mide**: Porcentaje de sesiones sin crashes.

**Fórmula**:

```
Crash-Free Rate = ((total_sessions - sessions_with_crashes) / total_sessions) * 100
```

### 4. App-Specific Metrics

- **Screen Load Time**: Tiempo hasta primer render
- **Image Load Time**: Tiempo de carga de imágenes
- **List Scroll Performance**: FPS durante scroll

## SLOs y Thresholds

### Service Level Objectives (SLOs)

| Métrica                     | Target (SLO) | Warning  | Critical | Medición        |
| --------------------------- | ------------ | -------- | -------- | --------------- |
| **Perceived Latency (p95)** | < 1500ms     | > 2000ms | > 3000ms | 95% de requests |
| **Perceived Latency (p50)** | < 800ms      | > 1200ms | > 1800ms | 50% de requests |
| **Error Rate**              | < 1%         | > 2%     | > 5%     | Últimos 5min    |
| **Crash-Free Sessions**     | > 99.9%      | < 99.5%  | < 99%    | Últimas 24h     |
| **Crash-Free Users**        | > 99.9%      | < 99.5%  | < 99%    | Últimos 7 días  |
| **API Success Rate**        | > 99%        | < 98%    | < 95%    | Últimos 5min    |
| **App Start Time (cold)**   | < 3s         | > 4s     | > 6s     | p95             |
| **App Start Time (warm)**   | < 1.5s       | > 2s     | > 3s     | p95             |
| **Screen Load Time**        | < 500ms      | > 1s     | > 2s     | p95             |

### Percentiles Explicados

- **p50 (median)**: La mitad de los usuarios experimentan este tiempo o menos
- **p95**: 95% de usuarios experimentan este tiempo o menos (5% más lento)
- **p99**: 99% de usuarios experimentan este tiempo o menos (1% más lento)

**Ejemplo Mobile**:

- p50 = 600ms → Usuario típico espera 600ms
- p95 = 1800ms → El 5% más lento espera hasta 1800ms
- p99 = 3000ms → El 1% más lento espera hasta 3000ms

**Por qué mobile es más lento que web**:

- Dispositivos menos potentes
- Conexiones de red más lentas/inestables
- Procesamiento en dispositivo puede variar más

## Dashboards

### Firebase Crashlytics Dashboard

```
┌─────────────────────────────────────────────────────┐
│  Mesa247 Mobile - Crashlytics                       │
├─────────────────────────────────────────────────────┤
│  📊 Overview (Last 24h)                             │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ Users    │ Crash-   │ Crashes  │ ANRs     │    │
│  │ 8,234    │ Free     │ 5        │ 2        │    │
│  │          │ 99.94%   │          │          │    │
│  │          │ ✅ Good  │ ✅ Good  │ ✅ Good  │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
│                                                     │
│  🔴 Top Crashes                                     │
│  1. NullPointerException in RestaurantCard (iOS)   │
│     Impact: 3 users, 3 crashes                     │
│  2. Network timeout                                 │
│     Impact: 2 users, 2 crashes                     │
└─────────────────────────────────────────────────────┘
```

### Firebase Analytics Dashboard

```
┌─────────────────────────────────────────────────────┐
│  Mesa247 Mobile - Performance                       │
├─────────────────────────────────────────────────────┤
│  ⚡ Key Metrics                                      │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ App Start│ Screen   │ Network  │ API      │    │
│  │ (cold)   │ Load     │ Requests │ Latency  │    │
│  │ 2.1s     │ 420ms    │ 98.5%    │ p95:     │    │
│  │ ✅ Good  │ ✅ Good  │ ✅ Good  │ 1650ms   │    │
│  │          │          │          │ ✅ Good  │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────────────────┘
```

### Custom Dashboard (Firebase + BigQuery)

Para insights avanzados, exporta datos a BigQuery:

```sql
-- Query para Perceived Latency p95
SELECT
  DATE(timestamp) as date,
  APPROX_QUANTILES(
    CAST(JSON_EXTRACT_SCALAR(event_params, '$.value') AS INT64),
    100
  )[OFFSET(95)] as p95_latency_ms
FROM `mesa247.analytics_xxxxx.events_*`
WHERE event_name = 'custom_metric'
  AND JSON_EXTRACT_SCALAR(event_params, '$.metric_name') = 'api.perceived_latency'
  AND _TABLE_SUFFIX BETWEEN '20240101' AND '20240131'
GROUP BY date
ORDER BY date DESC;
```

## Alertas

### Firebase Crashlytics Alerts

#### 1. Crash Rate Spike

```
Alert: New fatal crashes detected
Trigger: > 5 crashes in 1 hour
Severity: Critical
Action:
  - Email: mobile-team@mesa247.com
  - Slack: #mobile-alerts
  - Create PagerDuty incident
```

#### 2. ANR (Application Not Responding)

```
Alert: ANR detected
Trigger: ANR count > 3 per hour
Severity: Warning
Action:
  - Slack: #mobile-performance
  - Email: platform-team@mesa247.com
```

#### 3. Crash-Free Sessions Drop

```
Alert: Crash-free sessions below target
Trigger: Crash-free rate < 99.5% for 2 hours
Severity: Warning
Action:
  - Slack: #mobile-quality
  - Create Jira ticket
```

### Configuration Example (Firebase Console)

1. Go to Firebase Console → Crashlytics → Velocity Alerts
2. Click "New Velocity Alert"
3. Configure:
    - **Metric**: Crash-free sessions
    - **Threshold**: Falls below 99.5%
    - **Duration**: 2 hours
    - **Notifications**: Email + Slack webhook

### Firebase Performance Monitoring Alerts

```javascript
// Example: Set custom trace alert threshold
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('restaurant_list_load');
// ... do work
await trace.stop();

// In Firebase Console, set alert:
// Metric: restaurant_list_load
// Condition: p95 > 2000ms
// Duration: 15 minutes
```

## Uso en Producción

### 1. Inicialización

En `App.tsx` o root component:

```typescript
import { initTelemetry } from './lib/telemetry';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
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

### 2. En Screens

```typescript
import { logger, metrics } from '@/lib/telemetry';

function RestaurantListScreen() {
    React.useEffect(() => {
        logger.info('Screen viewed', { screen: 'RestaurantList' });
        metrics.trackScreenView('RestaurantList');
    }, []);

    return <View>...</View>;
}
```

### 3. En Error Handling

```typescript
import { errorTracker } from '@/lib/telemetry';

function RestaurantCard({ restaurant }: Props) {
    const handlePress = async () => {
        try {
            await fetchRestaurantDetails(restaurant.id);
        } catch (error) {
            errorTracker.captureException(error as Error, {
                screen: 'RestaurantList',
                component: 'RestaurantCard',
                action: 'fetch_details',
                extra: {
                    restaurantId: restaurant.id,
                },
            });
        }
    };

    return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}
```

### 4. En Custom Hooks

```typescript
import { usePerceivedLatency, errorTracker } from '@/lib/telemetry';

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
                    screen: 'RestaurantList',
                    action: 'fetch',
                });
                throw error;
            }
        },
    });
}
```

## Testing

### 1. Test Crashlytics (Development)

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Force a test crash (NEVER in production!)
if (__DEV__) {
    crashlytics().crash();
}

// Test non-fatal error
crashlytics().recordError(new Error('Test error'));

// Check logs in Firebase Console after ~5 minutes
```

### 2. Test Performance Traces

```typescript
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('test_trace');
await new Promise((resolve) => setTimeout(resolve, 1000));
await trace.stop();

// Check in Firebase Console → Performance
```

### 3. Test Custom Metrics

```typescript
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('test_event', {
    test: true,
    value: 123,
});

// Check in Firebase Console → Analytics → Events
```

## Best Practices

1. **Always add context**: Include screen name, component, action, and relevant data
2. **Use Crashlytics for crashes**: Don't mix with error tracking services
3. **Set user IDs early**: As soon as user authenticates
4. **Track navigation**: Log every screen view
5. **Measure critical paths**: Login, search, checkout
6. **Monitor offline behavior**: Track offline errors separately
7. **Test on real devices**: Emulators don't represent real performance
8. **Review crashes weekly**: Don't let crashes accumulate
9. **Use custom keys**: Add context-specific attributes
10. **Enable breadcrumbs**: Track user journey before crash

## Troubleshooting

### High Perceived Latency

1. Check network conditions (wifi vs cellular)
2. Review API response times
3. Check for memory leaks with Xcode Instruments
4. Profile with React DevTools
5. Reduce bundle size

### High Crash Rate

1. Check Crashlytics for stack traces
2. Look for common patterns (OS version, device model)
3. Review recent releases
4. Test on affected devices
5. Add more granular error boundaries

### Low Crash-Free Sessions

1. Identify crash clusters by device/OS
2. Check for memory issues
3. Review native module integrations
4. Test with older devices
5. Add defensive coding (null checks, try-catch)

### Firebase Not Reporting

1. Verify `google-services.json` / `GoogleService-Info.plist` are present
2. Check Firebase Console for project ID
3. Rebuild app completely (`rm -rf node_modules ios/Pods && npm install && cd ios && pod install`)
4. Wait 5-10 minutes for Firebase to process data
5. Check device network connectivity

## Platform-Specific Notes

### iOS

- **dSYM files**: Upload to Firebase for symbolicated crash reports

    ```bash
    # Automatically upload dSYMs
    # Add to Xcode Build Phases → Run Script:
    "${PODS_ROOT}/FirebaseCrashlytics/run"
    ```

- **Bitcode**: Disable if having issues with Crashlytics
    ```
    Xcode → Build Settings → Enable Bitcode → No
    ```

### Android

- **ProGuard/R8**: Ensure mapping files are uploaded

    ```gradle
    // android/app/build.gradle
    buildTypes {
        release {
            firebaseCrashlytics {
                mappingFileUploadEnabled true
            }
        }
    }
    ```

- **NDK Crashes**: Enable native crash reporting
    ```gradle
    // android/app/build.gradle
    android {
        buildTypes {
            release {
                ndk {
                    debugSymbolLevel 'FULL'
                }
            }
        }
    }
    ```

---
