# Ejemplos de Respuestas de la Fake API

Este documento muestra ejemplos reales de respuestas de la API para facilitar el desarrollo.

---

## 1. searchRestaurants() - Sin filtros

**Request:**

```typescript
await searchRestaurants();
```

**Response:**

```json
{
  "items": [
    {
      "id": "1",
      "name": "La Trattoria di Roma",
      "description": "Auténtica cocina italiana con pastas frescas y pizzas al horno de leña.",
      "category": "italian",
      "priceLevel": 3,
      "rating": 4.7,
      "reviewCount": 342,
      "tags": ["pasta", "pizza", "vino", "romántico", "terraza"],
      "isOpenNow": true,
      "distanceKm": 2.3,
      "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      "tenantId": "mesa247-mx",
      "country": "MX",
      "currency": "MXN",
      "timezone": "America/Mexico_City",
      "address": "Av. Reforma 450, Polanco, Ciudad de México",
      "phone": "+52 55 1234 5678",
      "schedule": {
        "monday": { "open": "13:00", "close": "23:00" },
        "tuesday": { "open": "13:00", "close": "23:00" },
        "wednesday": { "open": "13:00", "close": "23:00" },
        "thursday": { "open": "13:00", "close": "23:00" },
        "friday": { "open": "13:00", "close": "00:00" },
        "saturday": { "open": "12:00", "close": "00:00" },
        "sunday": { "open": "12:00", "close": "22:00" }
      }
    },
    {
      "id": "2",
      "name": "Tacos El Güero",
      "description": "Los mejores tacos al pastor de la ciudad.",
      "category": "mexican",
      "priceLevel": 1,
      "rating": 4.9,
      "reviewCount": 1243,
      "tags": ["tacos", "económico", "auténtico", "rápido", "para llevar"],
      "isOpenNow": true,
      "distanceKm": 0.8,
      "imageUrl": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47",
      "tenantId": "mesa247-mx",
      "country": "MX",
      "currency": "MXN",
      "timezone": "America/Mexico_City",
      "address": "Calle Morelos 123, Centro, Ciudad de México",
      "phone": "+52 55 9876 5432",
      "schedule": { "..." }
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```

---

## 2. searchRestaurants({ q: 'pizza' })

**Request:**

```typescript
await searchRestaurants({ q: 'pizza' });
```

**Response:**

```json
{
  "items": [
    {
      "id": "1",
      "name": "La Trattoria di Roma",
      "description": "... pizzas al horno de leña.",
      "category": "italian",
      "tags": ["pasta", "pizza", "vino", "romántico", "terraza"],
      "..."
    },
    {
      "id": "6",
      "name": "Pizza Napoletana",
      "description": "Pizza auténtica napolitana...",
      "category": "pizza",
      "tags": ["pizza", "italiano", "familiar", "terraza", "delivery"],
      "..."
    },
    {
      "id": "14",
      "name": "La Pizzería del Barrio",
      "description": "Pizza al taglio estilo romano.",
      "category": "pizza",
      "tags": ["pizza", "casual", "económico", "delivery", "para llevar"],
      "..."
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 10,
  "hasMore": false
}
```

---

## 3. searchRestaurants({ filters: { ... }, sort: 'rating_desc' })

**Request:**

```typescript
await searchRestaurants({
  filters: {
    category: ['pizza', 'italian'],
    priceRange: [1, 2],
    minRating: 4.0,
    openNow: true,
  },
  sort: 'rating_desc',
  pageSize: 5,
});
```

**Response:**

```json
{
  "items": [
    {
      "id": "6",
      "name": "Pizza Napoletana",
      "category": "pizza",
      "priceLevel": 2,
      "rating": 4.7,
      "isOpenNow": true,
      "distanceKm": 2.1,
      "country": "CO",
      "currency": "COP",
      "..."
    },
    {
      "id": "14",
      "name": "La Pizzería del Barrio",
      "category": "pizza",
      "priceLevel": 2,
      "rating": 4.4,
      "isOpenNow": false,
      "..."
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 5,
  "hasMore": false
}
```

**Nota**: Solo 2 resultados porque:

- Categoría: pizza ✅ o italian ✅
- Precio: 1-2 ✅
- Rating: ≥ 4.0 ✅
- Abierto: true (filtró uno)
- Ordenado por rating descendente

---

## 4. getRestaurantById('3')

**Request:**

```typescript
await getRestaurantById('3');
```

**Response:**

```json
{
  "id": "3",
  "name": "Sushi Zen",
  "description": "Experiencia culinaria japonesa premium. Pescado fresco diario y chefs especializados.",
  "category": "sushi",
  "priceLevel": 4,
  "rating": 4.8,
  "reviewCount": 567,
  "tags": ["sushi", "japonés", "premium", "sake", "omakase"],
  "isOpenNow": false,
  "distanceKm": 5.1,
  "imageUrl": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351",
  "tenantId": "mesa247-mx",
  "country": "MX",
  "currency": "MXN",
  "timezone": "America/Mexico_City",
  "address": "Presidente Masaryk 201, Polanco, Ciudad de México",
  "phone": "+52 55 5555 1234",
  "schedule": {
    "monday": { "open": "14:00", "close": "23:00" },
    "tuesday": { "open": "14:00", "close": "23:00" },
    "wednesday": { "open": "14:00", "close": "23:00" },
    "thursday": { "open": "14:00", "close": "23:00" },
    "friday": { "open": "14:00", "close": "00:00" },
    "saturday": { "open": "13:00", "close": "00:00" },
    "sunday": { "closed": true, "open": "", "close": "" }
  }
}
```

---

## 5. Paginación - Múltiples páginas

### Página 1

**Request:**

```typescript
await searchRestaurants({ page: 1, pageSize: 5 });
```

**Response:**

```json
{
  "items": [
    /* 5 restaurantes */
  ],
  "total": 25,
  "page": 1,
  "pageSize": 5,
  "hasMore": true // ← Hay más páginas
}
```

### Página 2

**Request:**

```typescript
await searchRestaurants({ page: 2, pageSize: 5 });
```

**Response:**

```json
{
  "items": [
    /* Siguientes 5 restaurantes */
  ],
  "total": 25,
  "page": 2,
  "pageSize": 5,
  "hasMore": true // ← Todavía hay más
}
```

### Última página (página 5)

**Request:**

```typescript
await searchRestaurants({ page: 5, pageSize: 5 });
```

**Response:**

```json
{
  "items": [
    /* Últimos 5 restaurantes */
  ],
  "total": 25,
  "page": 5,
  "pageSize": 5,
  "hasMore": false // ← No hay más páginas
}
```

---

## 6. Error 404 - Restaurante no encontrado

**Request:**

```typescript
await getRestaurantById('999');
```

**Response (error):**

```json
{
  "message": "Restaurant not found",
  "code": "NOT_FOUND",
  "status": 404
}
```

---

## 7. Error 500 - Error de servidor simulado

**Request:**

```typescript
await searchRestaurants({}, { forceError: true });
```

**Response (error):**

```json
{
  "message": "Failed to fetch restaurants",
  "code": "FETCH_ERROR",
  "status": 500
}
```

---

## 8. Filtros por país/moneda

**Request:**

```typescript
await searchRestaurants({
  filters: {
    // No hay filtro directo por país, pero puedes filtrar los resultados:
  },
});

// Luego filtrar en memoria:
const results = response.items.filter((r) => r.country === 'MX');
```

**Response:**

```json
{
  "items": [
    { "id": "1", "name": "La Trattoria di Roma", "country": "MX", "currency": "MXN", "..." },
    { "id": "2", "name": "Tacos El Güero", "country": "MX", "currency": "MXN", "..." },
    { "id": "4", "name": "Burger Master", "country": "MX", "currency": "MXN", "..." }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```

**Nota**: Para implementar filtro por país en producción, agregarías:

```typescript
// En fake-api.ts, agregar en SearchFilters:
export type SearchFilters = {
  // ...
  country?: Country; // ← Agregar esto
};

// Y en la función searchRestaurants:
if (filters.country) results = results.filter((r) => r.country === filters.country);
```

---

## 9. getCategories()

**Request:**

```typescript
getCategories();
```

**Response:**

```json
[
  "asian",
  "bakery",
  "bbq",
  "burgers",
  "cafe",
  "italian",
  "mexican",
  "pizza",
  "seafood",
  "steakhouse",
  "sushi",
  "vegetarian"
]
```

---

## 10. getTags()

**Request:**

```typescript
getTags();
```

**Response (parcial):**

```json
[
  "argentino",
  "asado",
  "ahumado",
  "auténtico",
  "bowls",
  "brunch",
  "café",
  "casual",
  "ceviche",
  "cerveza",
  "chino",
  "costillas",
  "craft beer",
  "croissant",
  "curry",
  "delivery",
  "desayuno",
  "dim sum",
  "económico",
  "familiar",
  "francés",
  "fresco",
  "gluten-free",
  "gourmet",
  "hamburguesas",
  "instagram worthy",
  "italiano",
  "japonés",
  "jugos",
  "kids friendly",
  "macarons",
  "mariscos",
  "mexicano",
  "milkshake",
  "mole",
  "omakase",
  "orgánico",
  "pad thai",
  "paella",
  "pan dulce",
  "panadería",
  "para compartir",
  "para llevar",
  "parrilla",
  "pasta",
  "pescado",
  "picante",
  "pizza",
  "playa",
  "poke",
  "premium",
  "ramen",
  "rápido",
  "romántico",
  "sake",
  "saludable",
  "smoothies",
  "sopa",
  "sushi",
  "tacos",
  "tailandés",
  "té",
  "terraza",
  "tradicional",
  "trufadas",
  "vegano",
  "vino",
  "wifi"
]
```

---

## 11. getStats()

**Request:**

```typescript
getStats();
```

**Response:**

```json
{
  "total": 25,
  "avgRating": 4.62,
  "byCountry": {
    "MX": 10,
    "CO": 5,
    "AR": 6,
    "CL": 4
  },
  "byCategory": {
    "italian": 2,
    "mexican": 2,
    "sushi": 2,
    "burgers": 2,
    "steakhouse": 2,
    "pizza": 2,
    "vegetarian": 2,
    "seafood": 2,
    "cafe": 2,
    "bbq": 2,
    "asian": 3,
    "bakery": 2
  }
}
```

---

## 12. Ordenamiento comparado

### Por Rating (descendente)

**Request:**

```typescript
await searchRestaurants({ sort: 'rating_desc', pageSize: 3 });
```

**Response:**

```json
{
  "items": [
    { "id": "2", "name": "Tacos El Güero", "rating": 4.9, "..." },
    { "id": "17", "name": "La Boulangerie", "rating": 4.9, "..." },
    { "id": "3", "name": "Sushi Zen", "rating": 4.8, "..." }
  ],
  "..."
}
```

### Por Distancia (ascendente)

**Request:**

```typescript
await searchRestaurants({ sort: 'distance_asc', pageSize: 3 });
```

**Response:**

```json
{
  "items": [
    { "id": "12", "name": "Panadería La Espiga", "distanceKm": 0.4, "..." },
    { "id": "9", "name": "Café Paris", "distanceKm": 0.6, "..." },
    { "id": "2", "name": "Tacos El Güero", "distanceKm": 0.8, "..." }
  ],
  "..."
}
```

### Por Precio (ascendente)

**Request:**

```typescript
await searchRestaurants({ sort: 'price_asc', pageSize: 3 });
```

**Response:**

```json
{
  "items": [
    { "id": "2", "name": "Tacos El Güero", "priceLevel": 1, "..." },
    { "id": "12", "name": "Panadería La Espiga", "priceLevel": 1, "..." },
    { "id": "4", "name": "Burger Master", "priceLevel": 2, "..." }
  ],
  "..."
}
```

---

## 13. Filtros complejos - Caso real

**Escenario**: Usuario busca "sushi premium cerca de mí que esté abierto ahora"

**Request:**

```typescript
await searchRestaurants({
  q: 'sushi',
  filters: {
    priceRange: [3, 4], // Premium
    openNow: true,
  },
  sort: 'distance_asc',
  pageSize: 10,
});
```

**Response:**

```json
{
  "items": [
    {
      "id": "16",
      "name": "Sushi Express",
      "category": "sushi",
      "priceLevel": 2,
      "rating": 4.3,
      "isOpenNow": true,
      "distanceKm": 1.7,
      "country": "CL",
      "..."
    }
    // Nota: Sushi Zen (id: 3) NO aparece porque isOpenNow: false
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "hasMore": false
}
```

---

## Tips para Desarrolladores

### 1. Inspeccionar en Consola (Web)

```javascript
// En DevTools Console:
import { searchRestaurants } from './src/api/fake-api';

// Ver todos los restaurantes
const all = await searchRestaurants();
console.table(
  all.items.map((r) => ({
    id: r.id,
    nombre: r.name,
    rating: r.rating,
    precio: r.priceLevel,
  }))
);
```

### 2. Probar Errores

```javascript
// Forzar error 500
try {
  await searchRestaurants({}, { forceError: true });
} catch (e) {
  console.error('Capturado:', e);
}

// Error 404
try {
  await getRestaurantById('999');
} catch (e) {
  console.error('404:', e.message);
}
```

### 3. Medir Latencia

```javascript
console.time('API call');
await searchRestaurants();
console.timeEnd('API call');
// Output: API call: 457.23ms
```

---

## Resumen de Campos Disponibles

Cada restaurante tiene estos campos que puedes usar para filtrar/ordenar/mostrar:

| Campo         | Tipo     | Ejemplo                | Uso                       |
| ------------- | -------- | ---------------------- | ------------------------- |
| `id`          | string   | "1"                    | Identificador único       |
| `name`        | string   | "La Trattoria di Roma" | Nombre del restaurante    |
| `description` | string   | "Auténtica cocina..."  | Descripción larga         |
| `category`    | enum     | "italian"              | Tipo de cocina            |
| `priceLevel`  | 1-4      | 3                      | Nivel de precio ($ $ $ $) |
| `rating`      | 0-5      | 4.7                    | Calificación promedio     |
| `reviewCount` | number   | 342                    | Cantidad de reviews       |
| `tags`        | string[] | ["pasta", "vino"]      | Tags descriptivos         |
| `isOpenNow`   | boolean  | true                   | ¿Está abierto ahora?      |
| `distanceKm`  | number   | 2.3                    | Distancia fake            |
| `imageUrl`    | string   | "https://..."          | URL de imagen             |
| `tenantId`    | string   | "mesa247-mx"           | ID del tenant             |
| `country`     | enum     | "MX"                   | País (MX/CO/AR/CL)        |
| `currency`    | enum     | "MXN"                  | Moneda local              |
| `timezone`    | string   | "America/Mexico_City"  | Zona horaria              |
| `address`     | string   | "Av. Reforma 450..."   | Dirección completa        |
| `phone`       | string   | "+52 55 1234 5678"     | Teléfono                  |
| `schedule`    | object   | { monday: {...}, ... } | Horarios por día          |

---
