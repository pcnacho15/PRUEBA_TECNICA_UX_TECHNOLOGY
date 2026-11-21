import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { QueryFailedFilter } from './common/filters/query-failed.filter.js';

export const API_PREFIX = 'api';
export const SWAGGER_PATH = `${API_PREFIX}/docs`;

/**
 * CORS_ORIGIN: lista separada por comas de orígenes permitidos
 * (p. ej. "https://mi-app.vercel.app"). Vacío o ausente: se permite cualquier
 * origen, cómodo en desarrollo; en producción debe definirse.
 */
export function resolveCorsOrigin(value: string | undefined): true | string[] {
  const origins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return origins.length > 0 ? origins : true;
}

/**
 * Configuración HTTP compartida por main.ts y los tests e2e, para que ambos
 * ejerzan exactamente el mismo prefijo, validación y manejo de errores.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({ origin: resolveCorsOrigin(process.env.CORS_ORIGIN) });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new QueryFailedFilter(app.get(HttpAdapterHost).httpAdapter),
  );
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Gestión de Órdenes de Servicio')
    .setDescription('API REST para el CRUD de la tabla ordenes_servicio')
    .setVersion('1.0.0')
    .build();

  SwaggerModule.setup(SWAGGER_PATH, app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
