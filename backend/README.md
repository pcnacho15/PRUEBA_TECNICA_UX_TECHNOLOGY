# Gestión de Órdenes de Servicio — API

CRUD REST sobre la tabla única `ordenes_servicio`, construido con **NestJS 12 + TypeScript (strict) + TypeORM + MySQL 8**, documentado con **Swagger** y dockerizado.

> Para levantar todo el proyecto con Docker, ver el [README de la raíz](../README.md).

- API: http://localhost:3000/api/ordenes
- Swagger UI: http://localhost:3000/api/docs (JSON en `/api/docs-json`)

## Ejecución local (sin Docker para la API)

Desde la raíz del repositorio:

```bash
docker compose up -d db          # MySQL 8 con database/init.sql, en el puerto 3307
cd backend
npm install
cp .env.example .env
npm run start:dev
```

## Endpoints

| Método | Ruta | Descripción | Respuestas |
| --- | --- | --- | --- |
| GET | `/api/ordenes?page=1&limit=10&cliente=&estado=` | Listado paginado; `cliente` es coincidencia parcial, `estado` es exacto | 200, 400 |
| GET | `/api/ordenes/:id` | Detalle de una orden activa | 200, 400, 404 |
| POST | `/api/ordenes` | Crear | 201, 400, 409 |
| PUT | `/api/ordenes/:id` | Actualizar (se validan y aplican los campos enviados) | 200, 400, 404, 409 |
| DELETE | `/api/ordenes/:id` | Borrado lógico (`activo = 0`) | 204, 404 |

Respuesta del listado:

```json
{ "data": [ { "id": 1, "codigoOrden": "ORD-2026-001", "...": "..." } ],
  "meta": { "total": 4, "page": 1, "limit": 10, "totalPages": 1 } }
```

La API usa camelCase en JSON; las columnas de MySQL conservan snake_case según el diccionario de datos.

## Validación de los cinco tipos de dato

| Tipo | Campo(s) | DTO (class-validator) | Base de datos |
| --- | --- | --- | --- |
| Entero | `cantidadItems` | `@IsInt() @Min(1)` | `INT` + `CHECK (>= 1)` |
| Decimal | `valorTotal`, `porcentajeDescuento` | `@IsNumber({ maxDecimalPlaces: 2 })`, rangos `≥ 0` y `0–100` | `DECIMAL(12,2)`, `DECIMAL(5,2)` + `CHECK` |
| Cadena | `codigoOrden`, `clienteNombre`, `observaciones` | `@IsString() @MaxLength()`, `@Matches()` para el código | `VARCHAR`/`TEXT`, `UNIQUE` en el código |
| Fecha | `fechaSolicitud` | `YYYY-MM-DD` + `@IsISO8601({ strict: true })` (rechaza `2026-02-30`) | `DATE` |
| Lista desplegable | `estado`, `prioridad` | `@IsIn(ESTADOS_ORDEN)`, `@IsIn(PRIORIDADES_ORDEN)` | `VARCHAR(20)` + `CHECK (IN ...)` |

Los valores de las listas viven en `src/ordenes/constants/orden.constants.ts` y alimentan la validación, el tipado y Swagger. El `ValidationPipe` global usa `whitelist` y `forbidNonWhitelisted`, así que campos como `activo` o `id` no se pueden enviar.

## Arquitectura

```
src/
├── app.module.ts            # Config + TypeORM + módulos de dominio
├── app.setup.ts             # Prefijo /api, ValidationPipe, filtros, Swagger (compartido con e2e)
├── config/                  # database.config.ts (variables de entorno)
├── common/                  # Paginación, filtro de errores de MySQL, transformer DECIMAL
└── ordenes/
    ├── constants/           # Listas desplegables y límites
    ├── dto/                 # Create / Update / Filter / Response
    ├── entities/            # OrdenServicio ↔ ordenes_servicio
    ├── repositories/        # OrdenesRepository (abstracción) + implementación TypeORM
    ├── ordenes.controller.ts
    ├── ordenes.service.ts
    └── ordenes.module.ts
```

- **SRP**: el controlador solo traduce HTTP, el servicio contiene las reglas (unicidad, existencia, borrado lógico) y el repositorio solo persiste.
- **DIP**: `OrdenesService` depende de la clase abstracta `OrdenesRepository`; el módulo enlaza `TypeOrmOrdenesRepository`. Los tests sustituyen el repositorio sin tocar MySQL.
- **Contrato estable**: `OrdenResponseDto` desacopla la respuesta de la entidad (no expone `activo`).
- **Errores**: 404 si la orden no existe o fue eliminada, 409 por código duplicado (también si la BD lo detecta, vía `QueryFailedFilter`), 400 por validación.
- El esquema lo gobierna `../database/init.sql` (`synchronize: false`).

## Tests

```bash
npm test          # unitarios: servicio y validación de DTOs
npm run test:e2e  # capa HTTP real con el repositorio sustituido (no requiere MySQL)
npm run lint
```
