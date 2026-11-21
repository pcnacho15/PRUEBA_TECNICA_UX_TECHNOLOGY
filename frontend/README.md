# Gestión de Órdenes de Servicio — Frontend

SPA en **Vue 3 (Composition API, `<script setup>`) + TypeScript (strict) + Tailwind CSS v4 + Pinia**, construida con Vite y probada con Vitest.

> Documentación completa (instalación paso a paso, variables de entorno, API y arquitectura detallada): [README de la raíz](../README.md).

## Ejecución local

Requiere la API en `http://localhost:3000` (`docker compose up -d db api` desde la raíz).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (Vite reenvía /api a la API)
```

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con proxy `/api` |
| `npm run build` | Typecheck (`vue-tsc`) + build de producción |
| `npm run typecheck` | Solo verificación de tipos |
| `npm test` | Tests unitarios (Vitest + jsdom) |

Variables (`.env.example`): `VITE_API_BASE_URL` (por defecto `/api`) y `VITE_API_PROXY_TARGET` (destino del proxy en desarrollo).

## Funcionalidad

- **Consulta**: tabla responsiva (tarjetas en móvil) con las órdenes activas; moneda en COP, porcentajes, fechas en `es-CO` sin desfase de zona horaria y etiquetas de color por estado y prioridad.
- **Búsqueda y filtros**: cliente (con debounce, Enter busca de inmediato) y estado; botón para limpiar.
- **Paginación**: rango "Mostrando X–Y de Z", tamaño de página y navegación numérica con elipsis.
- **Crear / editar** en ventana modal: texto, enteros (bloquea `.`, `,`, `e`, `-`), decimales con 2 posiciones, `type="date"` nativo y `<select>` cargados desde `GET /api/ordenes/catalogos`.
- **Eliminar** con diálogo de confirmación (borrado lógico en la API).
- **Retroalimentación**: validación en cliente antes de enviar (al perder el foco y al guardar, con foco en el primer error), errores del servidor en el formulario (409 → error en el campo código), toasts de confirmación/error, estados de carga, vacío y error con reintento, aviso de cambios sin guardar.

## Arquitectura

```
src/
├── main.ts                     # Raíz de composición: HttpClient → OrdenesService → provide()
├── config/env.ts
├── shared/                     # Reutilizable, sin conocimiento del dominio
│   ├── http/                   # HttpClient (interfaz) + FetchHttpClient, ApiError normalizado
│   ├── components/             # BaseModal, ConfirmDialog, AppPagination, BaseBadge, Toasts, form/
│   ├── composables/            # useDebounceFn
│   ├── stores/                 # notifications (toasts)
│   └── utils/                  # formatters, buildPageList
└── modules/ordenes/
    ├── types/                  # Contrato de la API
    ├── services/               # OrdenesService (puerto) + implementación REST
    ├── stores/                 # Estado del listado y acciones CRUD (Pinia setup store)
    ├── validation/             # Reglas del formulario (funciones puras)
    ├── composables/            # useOrdenForm: estado, validación y errores del servidor
    ├── components/             # Filtros, tabla, modal de formulario
    └── views/OrdenesView.vue   # Orquesta store, componentes y notificaciones
```

- **SRP**: los componentes solo presentan; `useOrdenForm` gestiona el formulario; las reglas viven en funciones puras; el store coordina datos; el servicio solo habla HTTP.
- **DIP**: el store depende de la interfaz `OrdenesService` inyectada con `provide/inject`, y el servicio de la interfaz `HttpClient`. Los tests sustituyen el servicio sin red.
- **OCP**: los colores de etiquetas se definen en mapas (`orden-presentation.ts`); un valor nuevo del catálogo se muestra en gris sin romper la UI.
- **Robustez**: se descartan respuestas obsoletas de búsquedas rápidas; si al eliminar se vacía la página actual, se retrocede a la anterior; antes de editar se recarga la orden por id.
- **Accesibilidad**: etiquetas asociadas, `aria-invalid`/`aria-describedby`, foco atrapado en modales, Esc para cerrar y regiones `aria-live` para mensajes.
