# Mobile Application - Mesa247

Aplicación móvil del marketplace Mesa247 construida con Expo + React Native + TypeScript + Expo Router.

## Ver README principal

Consulta [el README principal](../README.md) para instrucciones de instalación y uso.

## Estructura del proyecto

```
mobile/
├── app/            # Expo Router (file-based routing)
│   ├── (tabs)/     # Tab navigation
│   ├── restaurant/ # Restaurant screens
│   └── _layout.tsx
├── src/
│   ├── components/ # React Native components
│   ├── api/        # Fake API y tipos
│   ├── hooks/      # Custom hooks
│   ├── store/      # Jotai atoms
│   └── lib/        # Utilidades y módulos
└── assets/         # Images, fonts, etc.
```

## Scripts

```bash
pnpm start        # Inicia Expo Dev Server
pnpm android      # Abre en Android
pnpm ios          # Abre en iOS
pnpm web          # Abre en web
pnpm build        # Exporta para producción
pnpm type-check   # Verificar tipos
```

## Testing en dispositivo

1. Instala Expo Go en tu dispositivo
2. Escanea el QR que aparece al correr `pnpm start`
3. La app se abrirá en Expo Go
