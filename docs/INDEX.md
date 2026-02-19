# Mesa247 - Índice de Documentación

Guía completa de toda la documentación del proyecto.

## 📚 Documentos Principales

### README Principal

- **[README.md](../README.md)** - Punto de entrada principal
    - Quick start, stack tecnológico, scripts
    - Características principales
    - Configuración multi-tenant e i18n

## 🏗️ Architecture Decision Records (ADRs)

Decisiones técnicas fundamentales del proyecto:

1. **[ADR-001: Estructura del proyecto y capas](adr/ADR-001-project-structure.md)**
    - Organización del monorepo
    - Capas de arquitectura (UI, Logic, Data)
    - Separación web/mobile

2. **[ADR-002: State Management y Caching](adr/ADR-002-state-management-caching.md)**
    - TanStack Query para server state
    - Jotai para global state
    - Estrategias de caching

3. **[ADR-003: Feature Flags y Experiments](adr/ADR-003-feature-flags.md)**
    - Sistema de A/B testing client-side
    - Algoritmo de asignación
    - Storage y tracking de experimentos

4. **[ADR-004: Observabilidad y Tracking](adr/ADR-004-observability-tracking.md)** ⚠️ _Legacy - Superseded_
    - ⚠️ **Estado:** Reemplazado por ADR-005
    - Documento original que mezclaba tracking y telemetry

5. **[ADR-005: Telemetry y Observability](adr/ADR-005-observability.md)** ✅ _Current_
    - Logger, Error Tracker, Metrics Tracker
    - Sentry (web) + Firebase (mobile)
    - SLOs y dashboards
    - Perceived latency measurement

## 📖 Guías de Implementación

### Fake API

- **[FAKE-API-IMPLEMENTATION.md](FAKE-API-IMPLEMENTATION.md)**
    - Diseño de la API simulada
    - Simulación de latencia y errores
    - Endpoints y respuestas

- **[API-RESPONSE-EXAMPLES.md](API-RESPONSE-EXAMPLES.md)**
    - Ejemplos de respuestas JSON
    - Formato de errores
    - Casos de uso

### Testing

- **[testing-plan.md](testing-plan.md)**
    - Estrategia de testing completa
    - Tests unitarios, integración, E2E
    - Tools y configuración recomendada

### Internacionalización

- **[i18n-tradeoffs.md](i18n-tradeoffs.md)**
    - Decisiones de i18n y multi-tenant
    - Formateo de monedas y fechas
    - Estructura de traducciones

## 🎨 Diagramas y Visualización

- **[diagrams.md](diagrams.md)**
    - Diagramas de arquitectura (Mermaid)
    - Flujos de datos
    - Ciclo de vida de requests

## ✅ Seguimiento

- **[checklist.md](checklist.md)**
    - Estado de implementación del proyecto
    - Features completadas y pendientes
    - Métricas de éxito

- **[ai-log.md](ai-log.md)**
    - Registro de uso de AI
    - Prompts y decisiones
    - Transparencia en el proceso

## 📱 Documentación por Plataforma

### Web

- **[web/README.md](../web/README.md)** - Setup y arquitectura web
- **[web/docs/PERFORMANCE.md](../web/docs/PERFORMANCE.md)** - Optimizaciones de performance
- **[web/src/lib/tracking/README.md](../web/src/lib/tracking/README.md)** - Sistema de tracking web
- **[web/src/lib/telemetry/README.md](../web/src/lib/telemetry/README.md)** - Telemetry web (Sentry + Datadog)
- **[web/src/lib/experiments/README.md](../web/src/lib/experiments/README.md)** - A/B testing web

### Mobile

- **[mobile/README.md](../mobile/README.md)** - Setup y arquitectura mobile
- **[mobile/src/lib/tracking/README.md](../mobile/src/lib/tracking/README.md)** - Sistema de tracking mobile
- **[mobile/src/lib/telemetry/README.md](../mobile/src/lib/telemetry/README.md)** - Telemetry mobile (Firebase)
- **[mobile/src/lib/experiments/README.md](../mobile/src/lib/experiments/README.md)** - A/B testing mobile

## 🗂️ Organización de la Documentación

```
docs/
├── INDEX.md (este archivo)
├── README.md → ../README.md (principal)
├── adr/
│   ├── ADR-001-project-structure.md
│   ├── ADR-002-state-management-caching.md
│   ├── ADR-003-feature-flags.md
│   ├── ADR-004-observability-tracking.md (legacy)
│   └── ADR-005-observability.md (current)
├── FAKE-API-IMPLEMENTATION.md
├── API-RESPONSE-EXAMPLES.md
├── testing-plan.md
├── i18n-tradeoffs.md
├── diagrams.md
├── checklist.md
└── ai-log.md

web/
├── README.md
├── docs/
│   └── PERFORMANCE.md
└── src/lib/
    ├── tracking/README.md
    ├── telemetry/README.md
    └── experiments/README.md

mobile/
├── README.md
└── src/lib/
    ├── tracking/README.md
    ├── telemetry/README.md
    └── experiments/README.md
```

## 🔍 Cómo Navegar esta Documentación

### Para entender el proyecto:

1. Empieza por **[README.md](../README.md)** principal
2. Lee **[ADR-001](adr/ADR-001-project-structure.md)** para estructura
3. Revisa **[diagrams.md](diagrams.md)** para visualización

### Para implementar features:

1. **[ADR-002](adr/ADR-002-state-management-caching.md)** - State management
2. **[FAKE-API-IMPLEMENTATION.md](FAKE-API-IMPLEMENTATION.md)** - API
3. **[testing-plan.md](testing-plan.md)** - Testing

### Para configuración avanzada:

1. **[ADR-003](adr/ADR-003-feature-flags.md)** - Experimentos
2. **[ADR-005](adr/ADR-005-observability.md)** - Observability
3. **[i18n-tradeoffs.md](i18n-tradeoffs.md)** - Internacionalización

### Para performance:

1. **[web/docs/PERFORMANCE.md](../web/docs/PERFORMANCE.md)** - Optimizaciones web
2. **[ADR-002](adr/ADR-002-state-management-caching.md)** - Caching strategies

### Para tracking y analytics:

1. **[web/src/lib/tracking/README.md](../web/src/lib/tracking/README.md)** - Tracking web
2. **[mobile/src/lib/tracking/README.md](../mobile/src/lib/tracking/README.md)** - Tracking mobile
3. **[ADR-005](adr/ADR-005-observability.md)** - Telemetry

## 📊 Estado de la Documentación

| Documento                  | Estado         | Última actualización |
| -------------------------- | -------------- | -------------------- |
| README.md                  | ✅ Completo    | 2026-02-18           |
| ADR-001                    | ✅ Completo    | 2026-02-18           |
| ADR-002                    | ✅ Completo    | 2026-02-18           |
| ADR-003                    | ✅ Completo    | 2026-02-18           |
| ADR-004                    | ⚠️ Legacy      | 2026-02-18           |
| ADR-005                    | ✅ Current     | 2026-02-18           |
| testing-plan.md            | ✅ Completo    | 2026-02-18           |
| diagrams.md                | ✅ Completo    | 2026-02-18           |
| checklist.md               | ✅ Actualizado | 2026-02-18           |
| i18n-tradeoffs.md          | ✅ Completo    | 2026-02-18           |
| FAKE-API-IMPLEMENTATION.md | ✅ Completo    | 2026-02-18           |
| API-RESPONSE-EXAMPLES.md   | ✅ Completo    | 2026-02-18           |
| web/README.md              | ✅ Completo    | 2026-02-18           |
| mobile/README.md           | ✅ Completo    | 2026-02-18           |

## 🆘 Where to Find Help

- **Setup issues**: README principal o README de cada plataforma
- **Architecture questions**: ADRs relevantes
- **API integration**: FAKE-API-IMPLEMENTATION.md
- **Testing strategy**: testing-plan.md
- **Performance issues**: web/docs/PERFORMANCE.md
- **Tracking/Analytics**: lib/tracking/README.md de cada plataforma
- **Observability**: ADR-005-observability.md
- **i18n/multi-tenant**: i18n-tradeoffs.md

## 🔄 Actualizaciones

Este índice debe actualizarse cuando:

- Se añaden nuevos ADRs
- Se crean nuevos documentos en /docs
- Se añaden READMEs en módulos importantes
- Cambia la estructura de documentación

**Última actualización**: 2026-02-18

---

**Tip**: Todos los enlaces son relativos. Puedes leer esta documentación directamente en GitHub o localmente.
