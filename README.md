# QSS RRHH — React Frontend

Frontend del sistema de control de recursos humanos para empresa de seguridad. Gestión de empleados, contrataciones, asistencia, vacaciones, roles de descanso, catálogos, usuarios y reportes.

## Stack

| Tecnología | Versión |
|------------|---------|
| React | 19.2 |
| TypeScript | 6.0 |
| Vite | 8.0 |
| React Router | 7.15 |
| React Hook Form | 7.76 |
| Zod | 4.4 |
| shadcn/ui | 4.8 |
| Tailwind CSS | 4.3 |
| Recharts | 3.8 |
| Axios | 1.16 |

## Prerrequisitos

- **Node.js** >= 22
- **PNPM** >= 10.33 (el proyecto usa `pnpm` como package manager)

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
```

## Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear archivo de entorno
cp .env.example .env

# 3. Editar .env con la URL del API
# VITE_API_URL=http://localhost:5000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Levanta servidor de desarrollo con HMR |
| `pnpm build` | Compila TypeScript y genera bundle de producción |
| `pnpm preview` | Previsualiza el build de producción localmente |
| `pnpm lint` | Ejecuta ESLint sobre el código fuente |

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del API NestJS | `http://localhost:3000/api` |

Las variables deben tener el prefijo `VITE_` para ser expuestas al cliente. Se definen en `.env` (local) y se pasan como `--build-arg` en Docker.

## Estructura del Proyecto

```
react/
├── public/                    # Assets estáticos (favicon, icons)
├── src/
│   ├── main.tsx               # Punto de entrada
│   ├── App.tsx                # Root: AuthProvider + RouterProvider
│   ├── index.css              # Tailwind + tokens CSS + animaciones
│   ├── assets/                # Imágenes e íconos
│   ├── components/
│   │   ├── ui/                # 27 componentes shadcn/ui + float-label
│   │   ├── layout/            # AppLayout, Sidebar, Breadcrumbs
│   │   └── data-list/         # DataListLayout genérico para CRUD
│   ├── features/              # Módulos por dominio
│   │   ├── auth/              # Login, AuthContext, guards de ruta
│   │   ├── dashboard/         # Dashboard con KPIs y gráficos
│   │   ├── employees/         # Empleados (CRUD, formulario complejo)
│   │   ├── customers/         # Clientes (CRUD, carga de CSF)
│   │   ├── companies/         # Empresas (CRUD)
│   │   ├── catalogs/          # Catálogos (estados, ciudades, plantas, etc.)
│   │   ├── vacation-requests/ # Solicitudes de vacaciones
│   │   ├── attendance/        # Registros de asistencia
│   │   ├── rest-roles/        # Roles de descanso (fijo/recorrido)
│   │   ├── users/             # Usuarios (CRUD, privilegios)
│   │   ├── settings/          # Configuración del sistema
│   │   ├── audit-logs/        # Bitácora de auditoría (solo System)
│   │   └── reports/           # Reportes
│   ├── router/
│   │   └── index.tsx          # Definición de todas las rutas (~45)
│   ├── lib/
│   │   ├── api.ts             # Instancia Axios con interceptores
│   │   ├── utils.ts           # cn(), formatDate(), formatCurrency()
│   │   ├── types.ts           # Interfaces TypeScript compartidas
│   │   ├── constants.ts       # APP_NAME, ROUTES, SHADOW_LEVELS
│   │   └── breadcrumbs.tsx    # Generación de breadcrumbs
│   └── hooks/                 # Hooks globales (vacío — hooks en features/)
├── Dockerfile                 # Build multi-stage (Node + Nginx)
├── nginx.conf                 # Configuración de Nginx (SPA, gzip, cache)
├── vite.config.ts             # Vite + React + Tailwind + alias @/
├── tsconfig.json              # TypeScript project references
├── components.json            # Configuración de shadcn/ui
└── eslint.config.js           # ESLint flat config
```

## Arquitectura

### Feature-based

Cada dominio es un módulo autocontenido bajo `features/<nombre>/` con estructura consistente:

```
features/<nombre>/
├── pages/          # Componentes de página (rutas)
├── components/     # Componentes específicos del dominio
├── services/       # Llamadas al API (Axios)
├── hooks/          # Hooks del dominio
└── types.ts        # Tipos e interfaces locales
```

### Autenticación

- **JWT** almacenado en `localStorage` como `auth_token`
- `AuthContext` provee `user`, `isAuthenticated`, `login()`, `logout()`
- `ProtectedRoute` redirige a `/login` si no hay sesión
- Interceptor Axios adjunta `Authorization: Bearer <token>` automáticamente
- 401 en cualquier request → logout automático vía evento `auth:unauthorized`

### Formularios

- **React Hook Form** + **Zod** para validación y estado
- **Float labels** obligatorios: `FloatLabelInput`, `FloatLabelSelect`, `FloatLabelTextarea`, `FloatLabelDateInput`, `FloatLabelPhoneInput`
- Nunca usar `type="date"` nativo — usar `FloatLabelDateInput` con formato `dd/mm/aaaa` (display) / `YYYY-MM-DD` (payload)
- Payloads se limpian antes de enviar (se eliminan strings vacíos, `null`, `undefined`)

### Listados

- Componente genérico `DataListLayout` para todas las páginas CRUD
- Soporta vista tabla (desktop) + cards (móvil)
- Búsqueda con debounce de 300ms, paginación, eliminación con confirmación
- Estados: loading (skeleton), empty, error

### Diseño

- **Tailwind CSS v4** con tokens CSS custom (`@theme inline`)
- Sidebar cálido oscuro (`#1C1917`) fijo, independiente del tema
- Contenido frío slate (light: `slate-50`, dark: `slate-900`)
- 5 niveles de sombra (`--shadow-1` a `--shadow-5`)
- Animaciones sutiles: fade, stagger-grid (80ms offset)
- `prefers-reduced-motion` respetado
- Gráficos con **Recharts**: donut para distribución, barras para comparativas

## Docker

### Build

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t qss-rrhh-react .
```

### Run

```bash
docker run -p 80:80 qss-rrhh-react
```

El build usa multi-stage: compila con Node 22 y sirve con Nginx Alpine. La configuración de Nginx incluye:
- SPA fallback (`try_files $uri /index.html`)
- Gzip nivel 6
- Headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- Cache de 1 año para assets hasheados (`/assets/`)

## Convenciones

- **Nunca `any`**: tipar todo con interfaces precisas
- **Nunca `style=""` inline**: solo clases Tailwind
- **Nunca `$fetch` / `fetch` directo**: usar Axios vía feature services
- **Formularios**: usar float-label components, nunca `<Label>` + `<Input>` sueltos
- **Listados**: usar `DataListLayout`, delegar paginación y búsqueda al hook del dominio
- **Hooks**: hooks de dominio en `features/<nombre>/hooks/`, no en `src/hooks/`
- **Sonner**: toasts con `richColors`, posicionados top-right
- **snake_case** en payloads hacia el API; camelCase en el frontend (tipos/interfaces)
