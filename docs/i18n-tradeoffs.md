# i18n & Multi-Tenancy: Tradeoffs & Design Decisions

Este documento profundiza en las decisiones de diseño para configuración multi-tenant, formateo de moneda/fechas e internacionalización.

## Decisión 1: Tenant Detection Strategy

### Web: Subdomain-based vs Single-domain

#### Opción A: Subdomain-based (Recomendada)

**Arquitectura**:

```
cl.mesa247.com → Chile (CLP)
ar.mesa247.com → Argentina (ARS)
mx.mesa247.com → México (MXN)
```

**Pros**:

- **SEO optimizado por país**: Cada subdomain se indexa independientemente
- **Auto-detección sin UX friction**: Usuario entra directo a su país
- **Deep links más limpios**: `cl.mesa247.com/restaurant/123` es claro
- **Posibilidad de CDN per-region**: Cloudflare/AWS con routing geográfico
- **Analytics separados**: Métricas por país son triviales
- **Aislamiento de errores**: Bug en CL no afecta AR/MX

**Cons**:

- **Configuración DNS más compleja**: Requiere wildcard DNS (`*.mesa247.com`)
- **CORS en API**: Si el backend está en `api.mesa247.com`, necesitas CORS wildcard
- **Cookies no se comparten**: Auth/tracking separados por subdomain
- **Deploy multi-target**: CI/CD debe deployar a múltiples origins (o usar routing)
- **Testing más complejo**: Necesitas hostnames locales (`cl.localhost`)

**Implementación**:

```typescript
function detectTenant(): TenantConfig {
    const hostname = window.location.hostname; // 'cl.mesa247.com'
    const subdomain = hostname.split('.')[0]; // 'cl'

    if (TENANT_MAP[subdomain]) {
        return TENANT_MAP[subdomain];
    }

    // Fallback a localStorage (si usuario cambió país manualmente)
    const saved = localStorage.getItem('tenant');
    if (saved && TENANT_MAP[saved]) {
        return TENANT_MAP[saved];
    }

    // Default: Chile
    return TENANT_MAP['cl'];
}
```

#### Opción B: Single-domain + Country Selector

**Arquitectura**:

```
mesa247.com → Detecta país o muestra selector
mesa247.com?country=cl → Query param
mesa247.com/cl/restaurants → Path-based routing
```

**Pros**:

- **Deploy más simple**: Un solo origen, sin wildcard DNS
- **Sin CORS issues**: Todo está en el mismo domain
- **Cookies compartidas**: Auth/tracking unificado
- **Testing trivial**: Un solo localhost

**Cons**:

- **SEO mezclado**: Google ve todo como un solo site, no puedes rankear por país
- **UX con friction inicial**: Usuario debe seleccionar país en primer visit
- **URLs más largas**: `mesa247.com/cl/restaurant/123` vs `cl.mesa247.com/restaurant/123`
- **No geo-routing automático**: Debes implementar redirect por IP (ej. con Cloudflare Workers)

**Recomendación**: Subdomain-based si tienes control sobre DNS y backend CORS. Single-domain si necesitas MVP rápido.

---

### Mobile: Build Variants vs Single App

#### Opción A: Build Variants (Recomendada para producción)

**Arquitectura**:

- **3 apps separadas** en App Store / Play Store
- Cada app tiene config en build-time:
    ```json
    // eas.json
    {
        "build": {
            "cl": {
                "env": {
                    "EXPO_PUBLIC_TENANT_ID": "mesa247-cl",
                    "EXPO_PUBLIC_COUNTRY": "CL",
                    "EXPO_PUBLIC_CURRENCY": "CLP"
                }
            },
            "ar": {
                /* ... */
            },
            "mx": {
                /* ... */
            }
        }
    }
    ```

**Pros**:

- **Bundle size mínimo**: Solo assets del país (ej. solo banderas CL, no AR/MX)
- **Optimización por país**: Puedes tener diferentes features per-country
- **Branding por país**: Iconos, splash screens, nombres diferentes
- **Analytics separados**: Métricas por país son nativas
- **No UX friction**: Usuario descarga su app directamente

**Cons**:

- **3 builds en CI/CD**: Tiempo de build triplicado
- **3 submissions a stores**: iOS/Android review process x3
- **Updates triplicados**: Hotfix debe hacerse en 3 apps
- **Complejidad de versioning**: Debes sincronizar versiones
- **Testing x3**: QA debe probar 3 apps

**Cuándo elegir**:

- Mercados grandes con necesidades diferentes (ej. Argentina con inflación alta requiere features únicos)
- Tienes equipo para mantener 3 builds
- Quieres optimización máxima de bundle size

#### Opción B: Single App + Country Selector

**Arquitectura**:

- **1 app** con selector de país en onboarding
- Tenant config guardado en AsyncStorage

**Pros**:

- **1 solo build**: CI/CD simple
- **1 submission**: Review process único
- **Updates unificados**: Hotfix en una sola app
- **Multi-country users**: Viajeros pueden cambiar país sin instalar otra app

**Cons**:

- **Bundle más grande**: Incluye assets de todos los países (~+30% size)
- **UX friction inicial**: Requiere selector en primer launch
- **No optimización per-country**: Mismas features para todos

**Recomendación**: Build variants para producción con mercados grandes. Single app para MVP o si tienes usuarios que viajan entre países.

---

### Mobile: Remote Config para overrides

**Complemento a Build Variants**: Firebase Remote Config permite cambios sin redeploy.

**Use cases**:

```typescript
// Ejemplo: Adaptar formato de moneda sin redeploy
const remoteConfig = getRemoteConfig();
await fetchAndActivate(remoteConfig);

const currencyOverrides = {
    // Override: Argentina usa "ARS $" en vez de "$ ARS"
    symbolPosition: getValue(remoteConfig, 'currency_symbol_position_ar').asString(), // 'after'

    // Override: México muestra miles con espacio en vez de coma
    thousandsSeparator: getValue(remoteConfig, 'thousands_separator_mx').asString(), // ' '

    // Feature flag: Mostrar converter de moneda solo en Argentina
    showCurrencyConverter: getValue(remoteConfig, 'feature_currency_converter').asBoolean(),
};
```

**Ventajas**:

- Hotfix de reglas de formateo sin app update
- A/B testing de UX per-country
- Gradual rollout de features (10% usuarios → 50% → 100%)

**Limitaciones**:

- No puedes cambiar `currency` completo (CLP → USD), solo reglas de formateo
- Requiere Firebase SDK (~200 KB)

---

## Decisión 2: Currency Formatting

### Intl.NumberFormat vs Libraries

#### Opción A: Intl.NumberFormat (Recomendada)

**Pros**:

- **0 KB bundle size**: API nativa del browser/Node
- **Soporte completo de locales**: 100+ locales built-in
- **Reglas correctas automáticamente**:
    - CLP: Sin decimales (`$15.000`)
    - ARS: 2 decimales con coma (`$ 15.000,00`)
    - MXN: 2 decimales con punto (`$15,000.00`)
- **Compact notation**: `{ notation: 'compact' }` → `1.5K` en vez de `1500`
- **Soporte de unit**: `{ style: 'unit', unit: 'kilometer' }` → `10 km`

**Cons**:

- **No soporta formato custom sin símbolo**: Si quieres `15.000` sin `$`, debes usar `.replace()`
- **No maneja conversión de moneda**: Solo formato, no convierte CLP → USD
- **Opciones limitadas**: No puedes cambiar el orden de símbolo fácilmente

**Ejemplo avanzado**:

```typescript
function formatCurrency(
    amount: number,
    config: TenantConfig,
    options?: {
        compact?: boolean;
        showSymbol?: boolean;
    }
): string {
    const formatted = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        notation: options?.compact ? 'compact' : 'standard',
        minimumFractionDigits: config.currency === 'CLP' ? 0 : 2,
        maximumFractionDigits: config.currency === 'CLP' ? 0 : 2,
    }).format(amount);

    // Remove symbol si options.showSymbol === false
    if (options?.showSymbol === false) {
        return formatted.replace(/[^0-9.,\s]/g, '').trim();
    }

    return formatted;
}

// Ejemplos:
formatCurrency(15000, CL_CONFIG); // "$15.000"
formatCurrency(15000, CL_CONFIG, { compact: true }); // "$15K"
formatCurrency(15000, CL_CONFIG, { showSymbol: false }); // "15.000"
```

#### Opción B: currency.js o dinero.js

**Pros**:

- **Aritmética de moneda precisa**: Evita floating point errors (`0.1 + 0.2 !== 0.3`)
- **Conversión de moneda**: Si agregas exchange rates
- **Formato custom flexible**

**Cons**:

- **+8-15 KB bundle size**
- **Mantenimiento**: Debes actualizar reglas de formato manualmente
- **Overkill para display-only**: Si solo formateas (no calculas), Intl es suficiente

**Cuándo usarla**:

- Haces cálculos de moneda (totals, taxes, discounts) → Necesitas aritmética precisa
- Conviertes entre monedas → Necesitas exchange rates
- Solo formateas para display → **Intl.NumberFormat es suficiente**

**Recomendación**: Intl.NumberFormat para display. Si necesitas cálculos complejos con moneda, evalúa dinero.js (más moderno que currency.js).

---

## Decisión 3: Date Formatting

### Intl.DateTimeFormat vs date-fns vs date-fns-tz

#### Caso 1: Formato básico de fechas/horas

**Requerimiento**: Mostrar "18 feb 2026" o "12:30 PM"

**Solución: Intl.DateTimeFormat** (0 KB)

```typescript
// Fecha
new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium', // "18 feb 2026"
    timeZone: 'America/Santiago',
}).format(new Date());

// Hora
new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24h format
    timeZone: 'America/Santiago',
}).format(new Date());
```

**Ventajas**: Cero dependencias, soporte completo de timezones.

#### Caso 2: Relative time ("Hace 2 horas")

**Requerimiento**: Mostrar "Hace 2 horas", "Ayer", "Hace 3 días"

**Solución: Intl.RelativeTimeFormat** (0 KB)

```typescript
function formatRelativeTime(date: Date, locale: string): string {
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffDay > 0) return rtf.format(-diffDay, 'day'); // "Hace 2 días"
    if (diffHour > 0) return rtf.format(-diffHour, 'hour'); // "Hace 3 horas"
    if (diffMin > 0) return rtf.format(-diffMin, 'minute'); // "Hace 15 minutos"
    return rtf.format(-diffSec, 'second'); // "Hace 30 segundos"
}
```

**Ventajas**: Nativo, no requiere date-fns.

**Limitaciones**: Formato fijo ("Hace X días"), no puedes customizar a "X d" o "Ayer".

#### Caso 3: Lógica compleja con timezones

**Requerimiento**: "Cierra en 2 horas", "Abre mañana a las 09:00"

**Solución: date-fns-tz** (+15-25 KB)

```typescript
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { differenceInMinutes, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

function getRestaurantStatus(
    openTime: string, // "09:00"
    closeTime: string, // "22:00"
    timezone: string
): string {
    const now = new Date();
    const todayOpen = zonedTimeToUtc(`${getTodayDate()} ${openTime}`, timezone);
    const todayClose = zonedTimeToUtc(`${getTodayDate()} ${closeTime}`, timezone);

    if (now < todayOpen) {
        const minsUntilOpen = differenceInMinutes(todayOpen, now);
        if (minsUntilOpen < 60) {
            return `Abre en ${minsUntilOpen} minutos`;
        }
        return `Abre a las ${openTime}`;
    }

    if (now < todayClose) {
        const minsUntilClose = differenceInMinutes(todayClose, now);
        if (minsUntilClose < 60) {
            return `Cierra en ${minsUntilClose} minutos`;
        }
        return 'Abierto ahora';
    }

    // Closed
    const tomorrowOpen = addDays(todayOpen, 1);
    return `Abre mañana a las ${formatInTimeZone(tomorrowOpen, timezone, 'HH:mm', { locale: es })}`;
}
```

**Ventajas**: Lógica compleja de comparación es trivial.

**Desventajas**: +15-25 KB bundle size.

#### Comparación final

| Use Case                    | Intl nativo                | date-fns-tz               | Razón                       |
| --------------------------- | -------------------------- | ------------------------- | --------------------------- |
| Formatear fecha/hora        |                            |                           | 0 KB vs +15 KB              |
| Relative time ("Hace 2h")   | ⚠️ Intl.RelativeTimeFormat | Más flexible              | Intl es suficiente          |
| Comparar horas (open/close) | Muy manual                 | Trivial                   | date-fns simplifica lógica  |
| Parsing de strings          | No                         | Sí                        | date-fns tiene `parseISO()` |
| Manipulación (add/subtract) | Manual                     | `addDays()`, `subHours()` |                             |

**Recomendación**:

1. Empieza con Intl nativo (DateTimeFormat + RelativeTimeFormat)
2. Agrega date-fns-tz **solo si** necesitas:
    - Comparaciones complejas de horarios (restaurant open/close logic)
    - Manipulación de fechas (add/subtract days)
    - Parsing de múltiples formatos de string

**Decisión para este proyecto**:

- **Phase 1 (MVP)**: Solo Intl nativo
- **Phase 2 (Restaurant hours logic)**: Agregar date-fns-tz (~20 KB)

---

## Decisión 4: i18n Structure

### Namespaces: Flat vs Feature-based

#### Opción A: Flat structure (❌ No escalable)

```
locales/
  es-CL.json (1500 keys en un solo archivo)
```

**Problemas**:

- Bundle size: Todo se carga al inicio (no code-splitting)
- Colisiones: `button.search` en filters vs search bar → conflictos
- Mantenimiento: Archivo de 1500 líneas es inmanejable
- Múltiples editores: Merge conflicts constantes

#### Opción B: Feature-based namespaces (✅ Recomendado)

```
locales/
  es-CL/
    common.json       (100 keys: buttons, labels, units)
    restaurant.json   (200 keys: card, detail, menu)
    filters.json      (150 keys: categories, price, rating)
    errors.json       (80 keys: network, validation)
    checkout.json     (300 keys: cart, payment, confirmation)
```

**Ventajas**:

- **Code-splitting**: Solo carga `common.json` al inicio, resto on-demand
- **Escalabilidad**: Cada feature team edita su namespace sin conflictos
- **Mantenimiento**: Archivo de 100-300 líneas es manejable
- **Import explícito**: `useTranslation(['restaurant', 'common'])` deja claro las dependencias

**Implementación**:

```typescript
// i18n.config.ts
export const i18nConfig = {
  ns: ['common', 'restaurant', 'filters', 'errors'], // Namespaces
  defaultNS: 'common',  // Namespace por defecto

  // Lazy loading: Solo carga namespace cuando se usa
  partialBundledLanguages: true,

  // Fallback en cadena
  fallbackLng: 'es-CL',
  fallbackNS: 'common',
};

// Uso en componente
function RestaurantCard() {
  // Carga solo 'restaurant' + 'common'
  const { t } = useTranslation(['restaurant', 'common']);

  return <h3>{t('restaurant:card.title')}</h3>;
}
```

**Recomendación**: Feature-based namespaces desde el inicio, incluso con pocos keys. Migrar de flat a feature-based es doloroso.

---

### Key naming: Dot notation vs Nested objects

#### En JSON: Nested objects (✅)

```json
{
    "restaurant": {
        "card": {
            "openNow": "Abierto ahora",
            "closesAt": "Cierra a las {{time}}"
        }
    }
}
```

**Ventajas**: Fácil de editar, puedes colapsar secciones en IDE.

#### En código: Dot notation (✅)

```typescript
t('restaurant:card.openNow'); // Claro, autocomplete funciona
t('restaurant.card.openNow'); // Sin namespace explícito, ambiguo
```

**Convención recomendada**:

```
namespace:feature.context.element
  ↓        ↓      ↓       ↓
restaurant:card.status.openNow
```

**Ejemplos**:

- `common:buttons.search`
- `restaurant:card.rating.label`
- `filters:categories.italian`
- `errors:network.timeout`

---

### Plurals: Manejo correcto

```json
{
    "restaurant": {
        "resultsCount": "{{count}} restaurante encontrado",
        "resultsCount_plural": "{{count}} restaurantes encontrados"
    }
}
```

```typescript
t('restaurant:resultsCount', { count: 1 }); // "1 restaurante encontrado"
t('restaurant:resultsCount', { count: 5 }); // "5 restaurantes encontrados"
```

**Ventaja de react-i18next**: Maneja plurals automáticamente según locale (español tiene 2 formas, árabe tiene 6).

---

### Interpolation: Variables en strings

```json
{
    "restaurant": {
        "opensAt": "Abre a las {{time}}",
        "distance": "A {{distance}} km de ti",
        "review": "{{name}} dejó una reseña: \"{{comment}}\""
    }
}
```

```typescript
t('restaurant:opensAt', { time: '09:00' });
t('restaurant:distance', { distance: 2.5 });
t('restaurant:review', { name: 'Juan', comment: '¡Excelente!' });
```

**Escape de HTML**: react-i18next automáticamente escapa HTML en interpolaciones (seguridad).

---

## Decisión 5: Locale Detection

### Web: Estrategia de fallback

```typescript
function detectLocale(): string {
    // 1. URL query param (?lang=es-AR)
    const params = new URLSearchParams(window.location.search);
    if (params.has('lang')) {
        return params.get('lang')!;
    }

    // 2. localStorage (usuario cambió idioma)
    const saved = localStorage.getItem('locale');
    if (saved) {
        return saved;
    }

    // 3. Browser preference
    const browserLang = navigator.language; // 'es-CL', 'es-AR', 'es', 'en-US'
    if (SUPPORTED_LOCALES.includes(browserLang)) {
        return browserLang;
    }

    // 4. Browser language without region ('es' → 'es-CL')
    const langCode = browserLang.split('-')[0];
    const match = SUPPORTED_LOCALES.find((l) => l.startsWith(langCode));
    if (match) {
        return match;
    }

    // 5. Default fallback
    return 'es-CL';
}
```

**Prioridades**: Preferencia explícita > Browser preference > Default.

### Mobile: AsyncStorage + Device locale

```typescript
import * as Localization from 'expo-localization';

async function detectLocale(): Promise<string> {
    // 1. AsyncStorage (usuario cambió idioma)
    const saved = await AsyncStorage.getItem('locale');
    if (saved) {
        return saved;
    }

    // 2. Device locale
    const deviceLocale = Localization.locale; // 'es-CL', 'es-AR'
    if (SUPPORTED_LOCALES.includes(deviceLocale)) {
        return deviceLocale;
    }

    // 3. Device language without region
    const langCode = deviceLocale.split('-')[0];
    const match = SUPPORTED_LOCALES.find((l) => l.startsWith(langCode));
    if (match) {
        return match;
    }

    // 4. Fallback
    return 'es-CL';
}
```

---

## Summary: Recommended Stack

| Aspecto                    | Web                     | Mobile                         | Bundle Cost |
| -------------------------- | ----------------------- | ------------------------------ | ----------- |
| **Tenant detection**       | Subdomain               | Build variants + Remote Config | 0 KB        |
| **Currency format**        | Intl.NumberFormat       | Intl.NumberFormat              | 0 KB        |
| **Date format (basic)**    | Intl.DateTimeFormat     | Intl.DateTimeFormat            | 0 KB        |
| **Date format (advanced)** | date-fns-tz (if needed) | date-fns-tz (if needed)        | +20 KB      |
| **i18n library**           | react-i18next           | react-i18next                  | +10 KB      |
| **Locale detection**       | Browser + localStorage  | Device + AsyncStorage          | 0 KB        |
| **Remote config**          | N/A (subdomain)         | Firebase Remote Config         | +200 KB\*   |

\* Firebase SDK ya está incluido si usas Crashlytics/Analytics (costo compartido).

**Total bundle cost**: ~10 KB (react-i18next) + 20 KB (date-fns-tz, opcional) = **30 KB máximo**.

---

## Migration Path

### Phase 1: Foundation (1 sprint)

1. Setup tenant detection (web: subdomain, mobile: env vars)
2. Create `LocaleProvider` context
3. Implement `formatCurrency()` and `formatDate()` helpers
4. Replace hardcoded currency/date displays

**Impact**: Currency/dates correctos per-country sin i18n completo.

### Phase 2: Core i18n (2 sprints)

1. Install react-i18next
2. Create namespace structure (common, restaurant, filters)
3. Extract strings from top 10 components
4. Add language switcher in UI

**Impact**: 80% de strings traducibles.

### Phase 3: Complete i18n (1 sprint)

1. Extract remaining strings from all components
2. Add error/validation translations
3. Add plural forms
4. QA pass con native speakers per-country

**Impact**: 100% traducible.

### Phase 4: Advanced (optional)

1. Add date-fns-tz for relative time
2. Implement server-side i18n (if migrating to SSR)
3. Add RTL support (if expanding to Arabic markets)

---

## Key Takeaways

1. **Start simple**: Intl APIs cubren 90% de casos sin dependencias.
2. **Feature-based namespaces**: Desde el inicio, incluso con pocos keys.
3. **Subdomain (web) + Build variants (mobile)**: Mejor para SEO y optimización.
4. **Fallback strategy**: Query param → localStorage → Browser → Default.
5. **Add date-fns-tz only if**: Necesitas lógica compleja de horarios o relative time.
6. **Remote Config**: Para hotfixes de reglas de formateo sin redeploy.

**Bundle budget**: 30 KB máximo (10 KB react-i18next + 20 KB date-fns-tz) es totalmente aceptable para i18n completo.
