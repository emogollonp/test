# AI Log - Uso de Inteligencia Artificial

## Herramientas Utilizadas

- **GitHub Copilot** (VS Code extension)
- **Claude 3.5 Sonnet** (Anthropic)
- **ChatGPT-4** (OpenAI)

---

## Resumen de Uso

### 1. **Estructura Inicial del Proyecto**

**Prompt:**

> "Crea la estructura de carpetas para un monorepo con pnpm workspaces. Debe incluir un proyecto web (Vite + React + TS) y un proyecto mobile (Expo + React Native + TS). Añade carpeta /docs con subcarpetas /adr. Genera el package.json root, pnpm-workspace.yaml, y configuración de ESLint y Prettier."

**Resultado:** Setup completo de monorepo con configuración base.

**Validación humana:** Revisé versiones de dependencias, ajusté scripts para alinearse con el stack obligatorio (shadcn/ui, TanStack Query, Jotai).

---

### 2. **Generación de Datos Fake (JSON)**

**Prompt:**

> "Dame un JSON con 25 restaurantes para un marketplace B2C en Latinoamérica. Cada restaurante debe tener: id, name, category (italian, mexican, pizza, asian, etc.), rating (1-5 con decimales), avgPrice (número), tags (array de strings), openNow (boolean), hours (objeto con días y horarios), location (lat, lng), tenantId, country (MX, CO, AR, CL), currency (MXN, COP, ARS, CLP), timezone (ej: America/Mexico_City). Varía realismo."

**Resultado:** JSON con datos variados y realistas.

**Validación humana:** Ajusté algunos nombres de restaurantes, verifiqué que las coordenadas sean coherentes con las ciudades, añadí más variedad en tags.

---

### 3. **Implementación de Fake API**

**Prompt:**

> "Implementa una función fetchRestaurants en TypeScript que lea un JSON local, simule latencia entre 200-600ms, simule errores 5% de las veces, y soporte estos parámetros: q (search query), filters (category array, priceRange [min, max], minRating, openNow), sort (rating, price, distance), order (asc, desc), page, pageSize. Debe devolver { data: Restaurant[], total: number, page: number, pageSize: number }."

**Resultado:** Función con toda la lógica de filtrado, ordenamiento y paginación.

**Validación humana:** Revisé la lógica de filtrado (AND entre filtros, no OR), ajusté el fuzzy search para ser más permisivo, añadí tipos TypeScript estrictos. **No delegué:** la decisión de cómo combinar filtros (AND vs OR) y el threshold de error (5%).

---

### 4. **TanStack Query: Query Key Design**

**Prompt:**

> "Dame una estrategia de query keys para TanStack Query en un marketplace de restaurantes. Necesito listado con filtros, detalle por ID, y búsqueda. Incluye ejemplos de invalidación."

**Resultado:** Estructura jerárquica de keys con ejemplos.

**Validación humana:** Adapté para incluir tenant/country en keys (para multi-tenant futuro). **No delegué:** decisión de staleTime y gcTime (basado en naturaleza de datos de restaurantes).

---

### 5. **ADRs (Architecture Decision Records)**

**Prompt:**

> "Escribe ADR-001 para la estructura del proyecto. Contexto: monorepo con web y mobile separados, sin compartir código. Decisión: por qué elegimos pnpm workspaces, Vite, Expo Router. Incluye trade-offs y alternativas consideradas."

**Resultado:** ADR estructurado con contexto, decisión, consecuencias.

**Validación humana:** Expandí la sección de "Alternativas consideradas", añadí razonamiento sobre por qué NO usar Nx/Turborepo (overengineering para 2 proyectos). **No delegué:** la decisión de arquitectura en sí.

---

### 6. **Sistema de Tracking**

**Prompt:**

> "Crea un módulo de tracking agnóstico de proveedor con funciones track(eventName, properties), identify(userId), screen(screenName). En desarrollo debe usar console.log, pero diseñado para swapear a Amplitude/Mixpanel. TypeScript."

**Resultado:** Módulo con interfaces y provider pattern.

**Validación humana:** Añadí enriquecimiento automático de eventos (timestamp, platform, sessionId), ajusté para que sea type-safe con discriminated unions. **No delegué:** qué eventos trackear (basado en objetivos de producto).

---

### 7. **Sistema de Experimentos A/B**

**Prompt:**

> "Implementa un hook useExperiment(experimentId) que: 1) asigne variante random, 2) persista en localStorage (web) o AsyncStorage (mobile), 3) trackee evento ExperimentExposed. TypeScript + React."

**Resultado:** Hook con lógica de asignación y persistencia.

**Validación humana:** Ajusté para soportar múltiples experimentos simultáneos, añadí type safety para variants, separé implementación web/mobile. **No delegué:** la estrategia de persistencia (localStorage vs cookie vs server-side).

---

### 8. **Diagramas Mermaid**

**Prompt:**

> "Genera diagramas Mermaid para: 1) Data flow desde UI hasta API y cache (TanStack Query), 2) Flujo de tracking eventos, 3) Flujo de asignación de experimentos con persistencia. Incluye decision points."

**Resultado:** 3 diagramas en sintaxis Mermaid.

**Validación humana:** Simplifiqué algunos diagramas (demasiado detallados), añadí colores para claridad, corregí sintaxis de Mermaid que no renderizaba. **No delegué:** qué mostrar en los diagramas (basado en ADRs).

---

### 9. **Testing Plan**

**Prompt:**

> "Escribe un testing plan para una app de marketplace con filtros, paginación, caching (TanStack Query), experimentos A/B. Debe incluir: qué testear (unit/integration/e2e), herramientas (Vitest, Playwright, Detox), casos críticos, y cómo integrar AI en testing."

**Resultado:** Plan completo con piramide de testing, herramientas, ejemplos de tests.

**Validación humana:** Prioricé qué testear (basado en criticidad del negocio), ajusté herramientas (Vitest sobre Jest para web porque es más rápido con Vite), añadí sección de "Qué NO delegar a AI". **No delegué:** la estrategia de testing (unit vs e2e), qué casos son críticos.

---

### 10. **Configuración de shadcn/ui**

**Prompt:**

> "Dame la configuración completa de shadcn/ui para un proyecto Vite + React + TS. Incluye components.json, tailwind.config, y lista de componentes necesarios para un marketplace (button, card, input, select, slider, badge)."

**Resultado:** Archivos de configuración y comandos de instalación.

**Validación humana:** Ajusté el theme (colores, radius), verifiqué que los path aliases coincidan con tsconfig. **No delegué:** qué componentes instalar (basado en UX requerida).

---

## Decisiones NO Delegadas a AI

### Arquitectura

- ❌ **Monorepo vs multi-repo:** Decisión basada en DX y sync de cambios.
- ❌ **No compartir código entre web y mobile:** Trade-off consciente (simplicidad > DRY).
- ❌ **Estructura de capas:** Basada en experiencia con proyectos escalables.

### Estado

- ❌ **TanStack Query vs SWR vs Redux Toolkit Query:** Basado en features necesarias.
- ❌ **Jotai vs Zustand vs Redux:** Trade-off de boilerplate vs flexibilidad.
- ❌ **Qué va en URL vs localStorage vs Jotai:** Basado en semántica (shareable vs privado).
- ❌ **staleTime y gcTime específicos:** Basado en naturaleza de datos de restaurantes.

### Performance

- ❌ **Debounce de 300ms en search:** Balance entre UX y carga de API.
- ❌ **Cuándo usar React.memo:** Solo donde profiling muestre necesidad.
- ❌ **Virtualización de listas:** Solo si > 100 items (no premature optimization).

### Producto

- ❌ **Qué eventos trackear:** Basado en metrics que importan al negocio.
- ❌ **Estrategia de experimentos:** Simple random > sophisticated (MVP).
- ❌ **Qué filtros implementar:** Basado en casos de uso del marketplace.

### Testing

- ❌ **Qué testear primero:** Basado en criticidad (Fake API, caching, filtros).
- ❌ **Vitest vs Jest para web:** Vitest más rápido con Vite.
- ❌ **Coverage target:** 80% en código crítico, no 100% global (diminishing returns).

### Observabilidad

- ❌ **Sentry vs otros:** Basado en features (source maps, releases).
- ❌ **Crashlytics vs Bugsnag:** Crashlytics gratis hasta volúmenes altos.
- ❌ **Qué métricas capturar:** Basado en SLOs realistas.

---

## Reflexión sobre Uso de AI

### Buenas Prácticas Seguidas

1. **Nunca acepté código sin revisar:** Todo output de AI fue validado y ajustado.
2. **Usé AI para boilerplate, no decisiones:** Setup, JSON, tipos TS, configuración.
3. **Iteré sobre outputs:** Pedí refinamientos basados en contexto real.
4. **Documenté qué vino de AI:** Este log es evidencia de transparencia.

### Riesgos Mitigados

- **Código sin tipado estricto:** AI tiende a usar `any`, lo reemplacé con tipos proper.
- **Configuraciones desactualizadas:** Verifiqué versiones de dependencias (ej: `cacheTime` → `gcTime` en TanStack Query v5).
- **Trade-offs no justificados:** AI no explica por qué, añadí contexto en ADRs.

### Resultado

AI aceleró ~40-50% del trabajo repetitivo (setup, configs, datos fake), permitiéndome enfocarme en decisiones arquitectónicas y documentación de trade-offs.

**Sin AI:** 2 días setup + implementación.  
**Con AI:** ~4-6 horas setup completo, resto del tiempo en decisiones y docs.

---

## Prompts Complejos que Funcionaron Bien

### Prompt Estructurado (Ejemplo)

```
Context: Estoy construyendo un marketplace B2C con web (Vite + React) y mobile (Expo).

Task: Implementa un sistema de filtros para restaurantes.

Requirements:
- Filtros: category (multi-select), priceRange (slider [0-100]), minRating (select 1-5), openNow (toggle)
- Los filtros se combinan con AND (no OR)
- En web: sincronizar con URL query params
- En mobile: usar Jotai para estado local

Output:
1. Tipos TypeScript para Filters
2. Atom de Jotai para web
3. Atom de Jotai para mobile (sin URL sync)
4. Hook useFilters que encapsule lógica
```

**Por qué funcionó:** Contexto claro, requirements específicos, output esperado estructurado.

---

## Conclusión

AI es una herramienta poderosa para acelerar desarrollo, pero:

1. No reemplaza criterio técnico
2. Requiere validación constante
3. Es excelente para boilerplate, pobre para decisiones arquitectónicas
4. Documentar su uso es crítico para transparencia

**Regla de oro:** Si no puedo explicar por qué el código generado por AI es correcto, no lo uso.
