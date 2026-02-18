# Testing Plan

## Filosofía

No escribir tests por escribir. Tests deben:

1. Dar confianza para refactorizar
2. Documentar comportamiento esperado
3. Ser más baratos que debuggear producción
4. No ralentizar desarrollo (DX)

**Trade-off:** Para MVP priorizamos plan sobre implementación completa. En producción: cobertura ≥ 80% en código crítico.

## Estrategia General

### Pirámide de Testing

```
           ╱╲
          ╱ E2E ╲          10% - Críticos flujos de negocio
         ╱────────╲
        ╱ Integration ╲     30% - Interacción entre capas
       ╱──────────────╲
      ╱  Unit Tests     ╲   60% - Lógica de negocio, utils
     ╱──────────────────╲
```

### Qué Testear (Prioridad)

#### 🔴 Crítico (Must Have)

- [ ] Fake API: filtrado, ordenamiento, paginación
- [ ] TanStack Query: caching, invalidación
- [ ] Search con debounce
- [ ] Filtros complejos: aplicar, limpiar, combinar
- [ ] Navegación a detalle (web: Router, mobile: Expo Router)
- [ ] Experimentos: asignación, persistencia, exposure tracking
- [ ] Error boundaries

#### 🟡 Importante (Should Have)

- [ ] Componentes UI: RestaurantCard, RestaurantList
- [ ] Hooks custom: useRestaurants, useDebounce
- [ ] Tracking: eventos disparados correctamente
- [ ] Observability: logs, métricas
- [ ] URL state sync (web)
- [ ] AsyncStorage persistence (mobile)

#### 🟢 Nice to Have

- [ ] Visual regression (Chromatic/Percy)
- [ ] Performance tests (render timing)
- [ ] Accessibility (a11y)
- [ ] Snapshot tests (con cuidado, tienden a ser frágiles)

---

## Herramientas

### Web

| Tipo             | Herramienta                   | Por qué                                         |
| ---------------- | ----------------------------- | ----------------------------------------------- |
| Unit/Integration | **Vitest**                    | Rápido, compatible con Vite, API similar a Jest |
| UI Component     | **React Testing Library**     | Testing Library philosophy: test como usuario   |
| E2E              | **Playwright**                | Más rápido que Cypress, multi-browser           |
| Mocks            | **MSW (Mock Service Worker)** | Intercepta requests, no cambia código           |

**Setup:**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
pnpm add -D @playwright/test
pnpm add -D msw
```

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/', '**/*.test.tsx'],
    },
  },
});
```

### Mobile

| Tipo             | Herramienta                             | Por qué                              |
| ---------------- | --------------------------------------- | ------------------------------------ |
| Unit/Integration | **Jest**                                | Default en React Native              |
| UI Component     | **React Native Testing Library**        | Mismo philosophy que web             |
| E2E              | **Detox**                               | Recomendado para RN, graybox testing |
| Mocks            | **MSW + react-native-polyfill-globals** | Mismo MSW que web                    |

**Setup:**

```bash
pnpm add -D @testing-library/react-native jest-expo
pnpm add -D detox detox-cli
```

---

## Casos Críticos a Testear

### 1. Fake API

#### `fetchRestaurants()`

**Unit tests:**

```typescript
describe('fetchRestaurants', () => {
  it('filtra por categoría correctamente', async () => {
    const result = await fetchRestaurants({ category: ['italian'] });
    expect(result.data.every((r) => r.category === 'italian')).toBe(true);
  });

  it('filtra por rango de precio', async () => {
    const result = await fetchRestaurants({ priceRange: [10, 30] });
    expect(result.data.every((r) => r.avgPrice >= 10 && r.avgPrice <= 30)).toBe(true);
  });

  it('combina múltiples filtros (AND)', async () => {
    const result = await fetchRestaurants({
      category: ['pizza'],
      priceRange: [0, 20],
      minRating: 4,
    });
    result.data.forEach((r) => {
      expect(r.category).toBe('pizza');
      expect(r.avgPrice).toBeLessThanOrEqual(20);
      expect(r.rating).toBeGreaterThanOrEqual(4);
    });
  });

  it('ordena por rating desc', async () => {
    const result = await fetchRestaurants({ sort: 'rating', order: 'desc' });
    const ratings = result.data.map((r) => r.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it('pagina correctamente', async () => {
    const page1 = await fetchRestaurants({ page: 1, pageSize: 10 });
    const page2 = await fetchRestaurants({ page: 2, pageSize: 10 });

    expect(page1.data).toHaveLength(10);
    expect(page2.data).toHaveLength(10);
    expect(page1.data[0].id).not.toBe(page2.data[0].id);
  });

  it('simula latencia entre 200-600ms', async () => {
    const start = Date.now();
    await fetchRestaurants();
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(200);
    expect(duration).toBeLessThanOrEqual(700); // +100ms margen
  });

  it('simula error 5% de las veces', async () => {
    // Mock Math.random para controlar
    vi.spyOn(Math, 'random').mockReturnValue(0.03); // < 0.05

    await expect(fetchRestaurants()).rejects.toThrow('Simulated API error');
  });
});
```

### 2. TanStack Query - Caching

**Integration tests:**

```typescript
describe('useRestaurants caching', () => {
  it('no refetch si dentro de staleTime', async () => {
    const { result, rerender } = renderHook(() => useRestaurants({ category: [] }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const firstData = result.current.data;
    const fetchCount = vi.mocked(fetchRestaurants).mock.calls.length;

    // Remount component
    rerender();

    // No debería refetch
    expect(vi.mocked(fetchRestaurants).mock.calls.length).toBe(fetchCount);
    expect(result.current.data).toBe(firstData); // Misma referencia
  });

  it('invalida cache al mutar datos', async () => {
    const queryClient = new QueryClient();

    // Fetch inicial
    await queryClient.fetchQuery({
      queryKey: ['restaurants', 'list', {}],
      queryFn: () => fetchRestaurants({}),
    });

    // Simular mutación (crear restaurante)
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });

    // Cache debe estar invalidado
    const state = queryClient.getQueryState(['restaurants', 'list', {}]);
    expect(state?.isInvalidated).toBe(true);
  });
});
```

### 3. Search con Debounce

```typescript
describe('SearchBar with debounce', () => {
  it('solo busca después de 300ms sin escribir', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} debounce={300} />)

    const input = screen.getByRole('searchbox')

    // Usuario escribe rápido
    await userEvent.type(input, 'piz')

    // No debería haber llamado aún
    expect(onSearch).not.toHaveBeenCalled()

    // Esperar debounce
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('piz'), {
      timeout: 400,
    })
  })

  it('cancela búsqueda anterior si sigue escribiendo', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} debounce={300} />)

    const input = screen.getByRole('searchbox')

    await userEvent.type(input, 'piz')
    await waitFor(() => new Promise(r => setTimeout(r, 150))) // 150ms
    await userEvent.type(input, 'za') // Interrumpe

    // Solo debería llamar una vez con "pizza"
    await waitFor(() => expect(onSearch).toHaveBeenCalledTimes(1))
    expect(onSearch).toHaveBeenCalledWith('pizza')
  })
})
```

### 4. Filtros Complejos

```typescript
describe('RestaurantFilters', () => {
  it('aplica filtros correctamente', async () => {
    const onFiltersChange = vi.fn()
    render(<RestaurantFilters onFiltersChange={onFiltersChange} />)

    // Seleccionar categoría
    await userEvent.click(screen.getByLabelText('Italian'))

    // Mover slider de precio
    const priceSlider = screen.getByRole('slider', { name: /price/i })
    fireEvent.change(priceSlider, { target: { value: [10, 50] } })

    // Aplicar
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(onFiltersChange).toHaveBeenCalledWith({
      category: ['italian'],
      priceRange: [10, 50],
      minRating: 0,
      openNow: false,
    })
  })

  it('limpia filtros', async () => {
    const onFiltersChange = vi.fn()
    render(<RestaurantFilters onFiltersChange={onFiltersChange} initialFilters={{
      category: ['pizza'],
      priceRange: [20, 60],
    }} />)

    await userEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(onFiltersChange).toHaveBeenCalledWith({
      category: [],
      priceRange: [0, 100],
      minRating: 0,
      openNow: false,
    })
  })
})
```

### 5. Experimentos A/B

```typescript
describe('useExperiment', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('asigna variante random en primera visita', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3); // 30% → variant A (si <0.5)

    const { result } = renderHook(() => useExperiment('card_design'));

    expect(result.current).toBe('compact'); // variant A
    expect(localStorage.getItem('experiment_card_design')).toBe('compact');
  });

  it('persiste variante en siguientes visitas', () => {
    localStorage.setItem('experiment_card_design', 'extended');

    const { result } = renderHook(() => useExperiment('card_design'));

    expect(result.current).toBe('extended');
    // No debería cambiar
  });

  it('trackea exposure event', () => {
    const trackSpy = vi.spyOn(tracking, 'track');

    renderHook(() => useExperiment('card_design'));

    expect(trackSpy).toHaveBeenCalledWith('ExperimentExposed', {
      experimentId: 'card_design',
      variant: expect.any(String),
    });
  });
});
```

### 6. Error Boundaries

```typescript
describe('ErrorBoundary', () => {
  it('captura errores de componentes hijos', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('reporta error a observability layer', () => {
    const reportSpy = vi.spyOn(errorReporter, 'captureException')
    const ThrowError = () => { throw new Error('Test error') }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(reportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    )
  })
})
```

### 7. E2E - Flujo Crítico (Playwright - Web)

```typescript
test.describe('Restaurant search and detail flow', () => {
  test('user can search, filter, and view restaurant', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 1. Buscar
    await page.fill('input[type="search"]', 'pizza');
    await page.waitForTimeout(350); // Esperar debounce

    // 2. Verificar resultados
    const cards = page.locator('[data-testid="restaurant-card"]');
    await expect(cards.first()).toBeVisible();

    // 3. Aplicar filtro de precio
    await page.click('button:has-text("Filters")');
    await page.fill('input[name="priceMax"]', '30');
    await page.click('button:has-text("Apply")');

    // 4. Verificar URL actualizada
    await expect(page).toHaveURL(/\?q=pizza.*priceMax=30/);

    // 5. Click en primer resultado
    await cards.first().click();

    // 6. Verificar página de detalle
    await expect(page).toHaveURL(/\/restaurant\/\d+/);
    await expect(page.locator('h1')).toBeVisible();

    // 7. Verificar tracking (mock o check console)
    // En real: verificar que se llamó a analytics
  });
});
```

### 8. E2E - Mobile (Detox)

```typescript
describe('Restaurant List on Mobile', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show restaurant list', async () => {
    await expect(element(by.id('restaurant-list'))).toBeVisible();
  });

  it('should navigate to detail on tap', async () => {
    await element(by.id('restaurant-card-1')).tap();
    await expect(element(by.id('restaurant-detail'))).toBeVisible();
    await expect(element(by.text('Back'))).toBeVisible();
  });

  it('should open filter modal', async () => {
    await element(by.id('filter-button')).tap();
    await expect(element(by.id('filter-modal'))).toBeVisible();
  });
});
```

---

## Integración con AI

### Qué pedirle a AI

1. **Generar casos de test:**

   ```
   "Dame 10 casos edge para testear la función de filtrado de restaurantes"
   ```

2. **Escribir mocks:**

   ```
   "Crea un mock de restaurantes.json con 20 restaurantes variados"
   ```

3. **Setup inicial:**

   ```
   "Configura Vitest con React Testing Library y MSW"
   ```

4. **Tests boilerplate:**

   ```
   "Escribe tests básicos para el componente RestaurantCard"
   ```

5. **Fixtures/factories:**
   ```
   "Crea una factory de restaurantes con faker.js"
   ```

### Qué NO delegar a AI

1. **Decisiones de qué testear:** AI no conoce tu criticidad de negocio
2. **Trade-offs coverage vs velocidad:** Contexto del proyecto
3. **Casos edge específicos del dominio:** Horarios, zonas horarias, multi-tenant
4. **Estrategia de testing (pirámide):** Requiere experiencia
5. **Interpretación de tests fallando:** Debuggear es humano

### Workflow con AI

```
1. Humano: Define qué componente/función testear y por qué
2. AI: Genera estructura de tests
3. Humano: Revisa y ajusta casos edge
4. AI: Implementa tests específicos
5. Humano: Verifica que tests fallen cuando deberían (TDD)
6. AI: Ayuda a debuggear si algo no funciona
7. Humano: Aprueba y comitea
```

---

## Scripts de Testing

### Web (`package.json`)

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Mobile (`package.json`)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "detox test",
    "test:e2e:build": "detox build --configuration ios.sim.debug"
  }
}
```

---

## CI/CD Integration

### GitHub Actions (ejemplo)

```yaml
name: Tests

on: [pull_request]

jobs:
  web-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter web test:coverage
      - run: pnpm --filter web test:e2e

  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter mobile test:coverage
```

---

## Próximos Pasos (Producción)

1. **Integrar coverage en CI:** Fallar PR si < 80% en código crítico
2. **Visual regression:** Chromatic para detectar cambios UI
3. **Performance benchmarks:** Lighthouse CI
4. **Mutation testing:** Stryker para verificar calidad de tests
5. **Contract testing:** Pact si hay backend real

---

## Conclusión

Tests no son el objetivo, son el medio. Priorizar:

1. Flujos críticos de negocio
2. Lógica compleja (filtros, caching)
3. Integraciones (API, navegación)
4. Componentes triviales
5. Tests que solo verifican implementación (no comportamiento)
