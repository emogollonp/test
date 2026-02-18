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
- Sistema de tracking de eventos
- Feature flags y experimentos A/B
- Capa de observabilidad (logs, métricas, errores)
- Error boundaries y manejo de errores
- Optimizaciones de performance

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

## Testing

Ver [docs/testing-plan.md](docs/testing-plan.md) para el plan completo de testing.

## Documentación

### ADRs (Architecture Decision Records)

- [ADR-001: Estructura del proyecto y capas](docs/adr/ADR-001-project-structure.md)
- [ADR-002: Server state + caching + estado global](docs/adr/ADR-002-state-management-caching.md)
- [ADR-003: Observabilidad y tracking](docs/adr/ADR-003-observability-tracking.md)

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

## Observabilidad

Sistema de observabilidad modular con:

- **Logging:** Niveles de log estructurados
- **Métricas:** Latencia de API, performance de render
- **Errores:** Error boundaries + reporting (preparado para Sentry/Crashlytics)
- **Tracking:** Eventos de negocio (búsquedas, filtros, vistas)
- **Experimentos:** Exposure tracking para A/B tests

## Experimentos y Feature Flags

Sistema simple de A/B testing implementado:

- Variante A: Card de restaurante compacta
- Variante B: Card con información extendida
- Asignación random con persistencia (localStorage/AsyncStorage)
- Tracking de exposición para análisis

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
