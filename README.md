# Prueba técnica UX — Gestión de Órdenes de Servicio

CRUD sobre la tabla única `ordenes_servicio`.

```
.
├── backend/            # API REST: NestJS 12 + TypeORM + MySQL 8 + Swagger
├── frontend/           # (próximamente) Vue 3 + TypeScript + Tailwind
├── database/init.sql   # CREATE DATABASE, CREATE TABLE y datos de ejemplo
└── docker-compose.yml  # MySQL + API
```

## Ejecución rápida (Docker)

```bash
cp .env.example .env      # opcional: los valores por defecto ya funcionan
docker compose up -d --build
```

- API: http://localhost:3000/api/ordenes
- Swagger UI: http://localhost:3000/api/docs

MySQL queda expuesto en el host en el puerto **3307** (`DB_HOST_PORT`) para no chocar con un MySQL local. `database/init.sql` se ejecuta **solo en el primer arranque** (volumen vacío). Para recrear la base: `docker compose down -v && docker compose up -d --build`.

Detalles de la API (endpoints, validaciones, arquitectura y tests): [backend/README.md](backend/README.md).
