# Diagramas de Arquitectura

## 1. Data Flow: UI → Query → Fake API → Cache → UI

```mermaid
sequenceDiagram
    participant User
    participant UI as React Component
    participant Hook as useRestaurants
    participant TQ as TanStack Query
    participant API as Fake API
    participant Cache as Query Cache

    User->>UI: Interactúa (búsqueda, filtros)
    UI->>Hook: useRestaurants({ filters, page })
    Hook->>TQ: useQuery(['restaurants', 'list', params])

    alt Cache hit (dentro de staleTime)
        TQ->>Cache: getData(queryKey)
        Cache-->>TQ: cached data
        TQ-->>Hook: { data, isLoading: false }
        Hook-->>UI: restaurants[]
        UI-->>User: Muestra resultados
    else Cache miss o stale
        TQ->>Cache: getData(queryKey)
        Cache-->>TQ: stale data (si existe)
        TQ-->>Hook: { data: stale, isLoading: false, isFetching: true }
        Hook-->>UI: Muestra stale data + loading indicator

        TQ->>API: fetchRestaurants(params)
        API->>API: Simula latencia (200-600ms)
        API->>API: Filtra, ordena, pagina JSON
        API-->>TQ: fresh data
        TQ->>Cache: setData(queryKey, fresh data)
        TQ-->>Hook: { data: fresh, isLoading: false, isFetching: false }
        Hook-->>UI: Actualiza con datos frescos
        UI-->>User: Muestra resultados actualizados
    end
```

## 2. Tracking / Telemetry: Eventos → Collector → Provider

```mermaid
graph LR
    A[User Action] --> B[Component Event Handler]
    B --> C{tracking.track}

    C --> D[Event Enrichment]
    D --> D1[+ timestamp]
    D --> D2[+ platform]
    D --> D3[+ sessionId]
    D --> D4[+ userId]

    D --> E[Tracking Queue]

    E --> F{Provider Switch}

    F -->|Web| G1[Amplitude/Mixpanel]
    F -->|Mobile| G2[Firebase Analytics]
    F -->|Dev| G3[Console Log]

    G1 --> H[Analytics Dashboard]
    G2 --> H

    style C fill:#90EE90
    style F fill:#FFD700
    style H fill:#87CEEB
```

### Ejemplo de Flujo Completo

```mermaid
sequenceDiagram
    participant U as User
    participant C as RestaurantCard
    participant T as tracking.track()
    participant Q as Queue
    participant P as Provider (Amplitude)
    participant D as Dashboard

    U->>C: Click en card
    C->>C: handleClick()
    C->>T: track('RestaurantCardClicked', { id, position, variant })
    T->>T: Enrich (timestamp, platform, sessionId)
    T->>Q: Add to batch queue

    alt Queue llena o timeout
        Q->>P: POST /batch [eventos]
        P-->>Q: 200 OK
        Q->>Q: Clear queue
    end

    P->>D: Store en analytics DB
    D->>D: Aggregate metrics

    Note over D: Dashboard muestra:<br/>- CTR por variante<br/>- Posiciones más clickeadas<br/>- Conversion funnel
```

## 3. Experiments: Assignment → Persistence → Exposure → Variant UI

```mermaid
graph TD
    A[User entra a la app] --> B{Experimento activo?}

    B -->|No| Z[Render default UI]

    B -->|Sí| C{Ya asignado?}

    C -->|Sí| D[Leer de Storage]
    D --> E[variant = stored value]

    C -->|No| F[Asignación Random]
    F --> G[variant = variants random]
    G --> H[Guardar en Storage]

    E --> I[Track Exposure Event]
    H --> I

    I --> J{Variant A?}

    J -->|Sí| K[Render Compact Card]
    J -->|No| L[Render Extended Card]

    K --> M[User interactúa]
    L --> M

    M --> N[Track Conversion Event]
    N --> O[Analytics: variant A vs B]

    style F fill:#FFB6C1
    style I fill:#90EE90
    style O fill:#87CEEB
```

### Persistence por Plataforma

```mermaid
graph LR
    subgraph Web
        W1[useExperiment hook] --> W2[localStorage]
        W2 --> W3[variant persiste en browser]
    end

    subgraph Mobile
        M1[useExperiment hook] --> M2[AsyncStorage]
        M2 --> M3[variant persiste en device]
    end

    W3 --> T[tracking.track ExperimentExposed]
    M3 --> T

    T --> A[Analytics Provider]

    style W2 fill:#FFE4B5
    style M2 fill:#FFE4B5
    style A fill:#87CEEB
```

## 4. Arquitectura General - Capas

```mermaid
graph TB
    subgraph Presentación
        P1[Components]
        P2[Pages/Screens]
    end

    subgraph Lógica de Negocio
        L1[Custom Hooks]
        L2[TanStack Query]
        L3[Jotai Atoms]
    end

    subgraph Data Layer
        D1[Fake API]
        D2[JSON Data]
    end

    subgraph Cross-Cutting
        X1[Tracking]
        X2[Observability]
        X3[Experiments]
    end

    P2 --> P1
    P1 --> L1
    L1 --> L2
    L1 --> L3
    L2 --> D1
    D1 --> D2

    P1 -.-> X1
    P1 -.-> X3
    L1 -.-> X2
    D1 -.-> X2

    style P1 fill:#FFB6C1
    style L1 fill:#90EE90
    style D1 fill:#87CEEB
    style X1 fill:#FFD700
```

## 5. Estado: Dónde Vive Cada Pieza

```mermaid
graph TD
    A[Application State] --> B[Server State]
    A --> C[Client State]

    B --> B1[TanStack Query Cache]
    B1 --> B1a[restaurants list]
    B1 --> B1b[restaurant detail]
    B1 --> B1c[search results]

    C --> C1[URL State - Web]
    C1 --> C1a[filters params]
    C1 --> C1b[page number]
    C1 --> C1c[sort order]

    C --> C2[Jotai Global State]
    C2 --> C2a[experiment variant]
    C2 --> C2b[UI preferences]

    C --> C3[Local Component State]
    C3 --> C3a[modal open/close]
    C3 --> C3b[input values]

    style B1 fill:#87CEEB
    style C1 fill:#90EE90
    style C2 fill:#FFD700
    style C3 fill:#FFB6C1
```

## 6. Mobile: Navigation Flow

```mermaid
graph TD
    A[App Entry] --> B[Expo Router]

    B --> C[app/_layout.tsx]
    C --> D[QueryClientProvider]
    D --> E[Provider - Jotai]

    E --> F{Route}

    F -->|/| G[app/ tabs /index.tsx]
    F -->|/restaurant/:id| H[app/restaurant/ id .tsx]

    G --> G1[RestaurantList]
    G1 --> G2[SearchBar]
    G1 --> G3[FilterModal]
    G1 --> G4[FlatList]

    H --> H1[RestaurantDetail]
    H1 --> H2[Header]
    H1 --> H3[Info Cards]
    H1 --> H4[Map - Future]

    G4 --> I[nav.navigate restaurant/ID]
    I --> H

    H --> J[nav.goBack]
    J --> G

    style B fill:#9370DB
    style F fill:#FFD700
    style G1 fill:#90EE90
    style H1 fill:#87CEEB
```

## 7. Fake API: Request Processing

```mermaid
flowchart TD
    A[API Request] --> B{Simular error?}

    B -->|5% random| C[throw Error]
    C --> D[TanStack Query retry]
    D --> E[UI muestra error]

    B -->|95% success| F[Simular latencia]
    F --> G[wait 200-600ms]

    G --> H{Operación}

    H -->|List| I[Filtrar por params]
    I --> I1[Filter: category]
    I --> I2[Filter: price range]
    I --> I3[Filter: rating]
    I --> I4[Filter: search query]

    I4 --> J[Ordenar: sort + order]
    J --> K[Paginar: page + pageSize]

    H -->|Detail| L[Find by ID]
    L --> M{Found?}
    M -->|No| N[return 404]
    M -->|Sí| O[return restaurant]

    K --> P[Return results]
    O --> P

    P --> Q[TanStack Query cache]
    Q --> R[UI actualizada]

    style B fill:#FFB6C1
    style F fill:#FFD700
    style Q fill:#87CEEB
```

## Notas de Implementación

### Performance Optimizations

```mermaid
graph LR
    A[Performance Strategy] --> B[Web]
    A --> C[Mobile]

    B --> B1[React.memo components]
    B --> B2[useMemo expensive calcs]
    B --> B3[Query staleTime 5min]
    B --> B4[Debounce search 300ms]

    C --> C1[FlatList optimizations]
    C --> C2[keyExtractor]
    C --> C3[getItemLayout]
    C --> C4[maxToRenderPerBatch=10]
    C --> C5[AsyncStorage persistence]

    style B fill:#90EE90
    style C fill:#87CEEB
```

### Multi-tenant Architecture (Future)

```mermaid
graph TD
    A[Request] --> B{Tenant Detection}

    B -->|Subdomain| C1[tenant.mesa247.com]
    B -->|Header| C2[X-Tenant-ID]
    B -->|Config| C3[config.tenantId]

    C1 --> D[Load Tenant Config]
    C2 --> D
    C3 --> D

    D --> E[Tenant Context]
    E --> E1[country: MX/CO/AR]
    E --> E2[currency: MXN/COP/ARS]
    E --> E3[timezone: America/Mexico_City]
    E --> E4[i18n locale: es-MX]

    E --> F[API fetches filtered by tenant]
    E --> G[UI formats w/ locale]

    style B fill:#FFD700
    style E fill:#87CEEB
```
