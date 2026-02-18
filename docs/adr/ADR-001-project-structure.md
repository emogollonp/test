# ADR-001: Estructura del Proyecto y Capas

**Estado:** Aceptado  
**Fecha:** 2026-02-18  
**Autores:** Eric Mogollon

## Contexto

Necesitamos definir la estructura del proyecto para un marketplace B2C que incluye tanto aplicación web como móvil, con requisitos de escalabilidad, mantenibilidad y claridad arquitectónica.

## Decisión

### Monorepo con pnpm Workspaces

Adoptamos un monorepo simple con pnpm workspaces que contiene dos aplicaciones independientes sin compartir código entre ellas.

**Razones:**

- Simplicidad: no necesitamos Nx, Turborepo u otras herramientas complejas para 2 proyectos
- Independencia: web y mobile no comparten código, evitando coupling
- Scripts unificados: `pnpm web`, `pnpm mobile`, `pnpm lint` desde root
- Versionado atómico: commits y PRs pueden abarcar ambos proyectos

**Alternativas consideradas:**

- Multi-repo: rechazado por mayor complejidad en sync de cambios cross-platform
- Monorepo con código compartido: rechazado porque web y mobile tienen necesidades diferentes

### Arquitectura por Capas

Cada proyecto sigue esta estructura:

```
├── components/     # Presentación (UI)
├── pages/app/      # Routing y composición
├── api/            # Data layer (fake API)
├── hooks/          # Business logic & data fetching
├── store/          # Global state (Jotai)
└── lib/            # Utilidades, tracking, observabilidad
```

**Principios:**

1. **Separation of Concerns:** cada carpeta tiene una responsabilidad única
2. **Colocation:** archivos relacionados viven juntos (ej: RestaurantCard.tsx y sus estilos)
3. **Top-down imports:** las capas superiores importan de las inferiores, nunca al revés

### Decisiones Específicas

#### Web

- **Vite:** build tool por velocidad y DX superior a CRA
- **React Router:** routing client-side con loader pattern
- **shadcn/ui:** componentes headless customizables, no biblioteca monolítica

#### Mobile

- **Expo:** DX superior, updates OTA, sin eject necesario
- **Expo Router:** file-based routing alineado con estándares modernos (Next.js, Remix)
- **No Expo Web:** mobile es React Native puro

## Consecuencias

### Positivas

- Estructura clara y predecible
- Fácil onboarding para nuevos desarrolladores
- Escalable: agregar features no cambia la estructura
- Testing: cada capa puede testearse aisladamente

### Negativas

- No hay reuso de código entre web y mobile (trade-off aceptado)
- Monorepo requiere pnpm (no npm/yarn)

### Mitigaciones

- Documentación exhaustiva en README de cada proyecto
- ADRs para documentar cambios arquitectónicos futuros
- Scripts root para evitar entrar/salir de carpetas

## Revisión Futura

Evaluar en 6 meses:

- ¿Hay lógica de negocio duplicada que valga la pena compartir?
- ¿El monorepo simple sigue siendo suficiente o necesitamos Turborepo?
