# Checklist de Implementación

## ✅ Completado

### Setup Inicial

- [x] Monorepo con pnpm workspaces
- [x] Estructura de carpetas `/web`, `/mobile`, `/docs`
- [x] Configuración de ESLint y Prettier
- [x] Scripts root: `pnpm web`, `pnpm mobile`, `pnpm lint`, `pnpm format`
- [x] README principal con instrucciones
- [x] .gitignore completo

### Documentación Obligatoria

- [x] README.md root completo
- [x] ADR-001: Estructura del proyecto
- [x] ADR-002: State management y caching
- [x] ADR-003: Observabilidad y tracking
- [x] diagrams.md con Mermaid
- [x] testing-plan.md
- [x] checklist.md (este archivo)
- [x] ai-log.md

### Configuración Web

- [x] Vite + React + TypeScript
- [x] shadcn/ui configurado
- [x] Tailwind CSS
- [x] React Router
- [x] TanStack Query setup
- [x] Jotai setup
- [x] Path aliases (@/\*)

### Configuración Mobile

- [x] Expo + React Native + TypeScript
- [x] Expo Router configurado
- [x] TanStack Query setup
- [x] Jotai + AsyncStorage
- [x] app.json configurado

## 🚧 En Progreso / Pendiente

### Fake API

- [ ] JSON con 20+ restaurantes
- [ ] Campos: tenantId, country, currency, timezone
- [ ] Simulación de latencia (200-600ms)
- [ ] Simulación de errores (5%)
- [ ] Filtros: category, price range, rating, tags, openNow
- [ ] Ordenamiento: rating desc, price asc, distance fake
- [ ] Paginación
- [ ] Search query con fuzzy matching

### Web - Features

- [ ] Página Home con listado
- [ ] RestaurantCard (variantes A/B)
- [ ] SearchBar con debounce
- [ ] Componente de filtros complejos
- [ ] Paginación (Load More o clásica)
- [ ] Página de detalle (`/restaurant/:id`)
- [ ] Error Boundary
- [ ] Loading states
- [ ] Empty states

### Mobile - Features

- [ ] Pantalla de listado (`/`)
- [ ] RestaurantCard (variantes A/B)
- [ ] SearchBar
- [ ] FilterModal (bottom sheet)
- [ ] FlatList optimizado (keyExtractor, getItemLayout)
- [ ] Pantalla de detalle (`/restaurant/[id]`)
- [ ] Pull to refresh
- [ ] Loading states
- [ ] Empty states

### State Management

- [ ] Query keys bien diseñados
- [ ] Atoms de Jotai para filtros
- [ ] URL state sync (web)
- [ ] AsyncStorage persistence (mobile)
- [ ] Invalidación de queries correcta

### Performance

- [ ] Debounce en search (300ms)
- [ ] React.memo en componentes costosos
- [ ] useMemo para cálculos complejos
- [ ] Virtualización si listas > 100 items
- [ ] Image lazy loading (mobile)
- [ ] Query staleTime optimizado

### Tracking

- [ ] Módulo `tracking.ts`
- [ ] Evento: SearchPerformed
- [ ] Evento: FilterApplied
- [ ] Evento: RestaurantViewed
- [ ] Evento: RestaurantCardClicked
- [ ] Evento: ExperimentExposed
- [ ] track(), identify(), screen() implementados

### Experimentos A/B

- [ ] Sistema de asignación random
- [ ] Persistencia localStorage (web)
- [ ] Persistencia AsyncStorage (mobile)
- [ ] Experimento: card compacta vs extendida
- [ ] Tracking de exposure

### Observabilidad

- [ ] Módulo observability/logger.ts
- [ ] Módulo observability/metrics.ts
- [ ] Módulo observability/errors.ts
- [ ] Error boundaries con reporte
- [ ] Métricas de latencia API
- [ ] Logs estructurados

### Multi-tenant/Multi-país (Modelado)

- [ ] Datos JSON incluyen: tenantId, country, currency, timezone
- [ ] Documentación de cómo parametrizar tenant
- [ ] Propuesta de formateo de moneda (Intl.NumberFormat)
- [ ] Propuesta de formateo de fechas (date-fns-tz)
- [ ] Propuesta de i18n (estructura, namespaces)

## ❌ No Implementado (Fuera de Scope)

### Testing

- [ ] Tests unitarios (solo plan entregado)
- [ ] Tests de integración (solo plan)
- [ ] Tests E2E (solo plan)
- [ ] Setup de Vitest/Jest/Playwright/Detox

### Backend Real

- [ ] Integración con API real (usamos Fake API)
- [ ] Autenticación
- [ ] Autorización

### Features Avanzadas

- [ ] Mapa interactivo
- [ ] Reservas
- [ ] Reviews de usuarios
- [ ] Favoritos persistidos
- [ ] Carrito de compras
- [ ] Checkout

### Multi-idioma (i18n)

- [ ] Implementación completa de i18n
- [ ] Traducciones
- [ ] Selector de idioma

### Observabilidad Real

- [ ] Integración con Sentry (web)
- [ ] Integración con Crashlytics (mobile)
- [ ] Dashboards en Grafana/Datadog
- [ ] Alertas configuradas

### CI/CD

- [ ] GitHub Actions con tests
- [ ] Preview deploys (Vercel/Expo)
- [ ] Lint y type-check automático
- [ ] Bundle size tracking
- [ ] Performance budgets

## 🔮 Próximos Pasos (Si fuera Producción)

### Corto Plazo (Sprint 1-2)

1. Implementar tests críticos según testing-plan.md
2. Integrar Sentry (web) y Crashlytics (mobile)
3. Conectar tracking a Amplitude/Mixpanel
4. Setup CI/CD básico (lint + type-check en PRs)
5. Agregar Storybook para documentar componentes

### Medio Plazo (Sprint 3-6)

1. Implementar i18n completo (es, en)
2. Multi-tenant real con subdominios
3. Optimizaciones de performance (virtualización, code splitting)
4. Agregar mapa de ubicación con Mapbox/Google Maps
5. Sistema de favoritos con persistencia
6. Push notifications (mobile)

### Largo Plazo (6+ meses)

1. Migrar a backend real con GraphQL/REST
2. Agregar sistema de reviews y ratings
3. Implementar reservas en tiempo real
4. Dashboard de analytics interno
5. Progressive Web App (PWA) para web
6. Offline-first con Service Workers

## 📊 Métricas de Éxito

### Técnicas

- [ ] 0 errores de TypeScript
- [ ] < 5 warnings de ESLint
- [ ] Build time < 10s (web), < 30s (mobile)
- [ ] Lighthouse score > 90 (web)
- [ ] Crash-free rate > 99.5%

### Funcionales

- [ ] Todos los filtros funcionan correctamente
- [ ] Paginación sin bugs
- [ ] Navegación fluida entre pantallas
- [ ] Search con results instantáneos (<300ms perceived)
- [ ] Experimentos A/B asignados correctamente

### Documentación

- [ ] README claro y completo
- [ ] ADRs explican decisiones clave
- [ ] Diagramas clarifican arquitectura
- [ ] Testing plan es accionable
- [ ] AI log muestra uso responsable de AI

## 🎯 Objetivos del Proyecto (Meta)

Este es un **MVP enfocado en arquitectura y decisiones técnicas**, no un producto completo.

**Lo que demuestra:**

- ✅ Capacidad de estructurar proyectos escalables
- ✅ Entendimiento de trade-offs técnicos
- ✅ Diseño de sistemas observables
- ✅ Documentación de decisiones (ADRs)
- ✅ Uso estratégico de AI (no copy-paste)
- ✅ Pensamiento en producción (no solo código)

**Lo que NO intenta ser:**

- ❌ Producto con todas las features
- ❌ Tests al 100% de cobertura
- ❌ UI perfecto pixel-perfect
- ❌ Backend real conectado

---

**Última actualización:** 2026-02-18  
**Status del proyecto:** Setup completo, listo para implementación de features
