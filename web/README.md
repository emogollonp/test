# Web Application - Mesa247

Aplicación web del marketplace Mesa247 construida con Vite + React + TypeScript + shadcn/ui.

## Ver README principal

Consulta [el README principal](../README.md) para instrucciones de instalación y uso.

## Estructura del proyecto

```
web/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas/rutas
│   ├── api/            # Fake API y tipos
│   ├── hooks/          # Custom hooks
│   ├── store/          # Jotai atoms
│   ├── lib/            # Utilidades y módulos
│   └── main.tsx        # Entry point
├── public/             # Assets estáticos
└── index.html          # HTML template
```

## Scripts

```bash
pnpm dev          # Desarrollo en http://localhost:5173
pnpm build        # Build de producción
pnpm preview      # Preview del build
pnpm type-check   # Verificar tipos
```
