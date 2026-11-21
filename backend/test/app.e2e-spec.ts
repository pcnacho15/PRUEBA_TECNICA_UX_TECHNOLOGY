import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { Mocked } from 'vitest';
import { configureApp } from '../src/app.setup.js';
import { OrdenesController } from '../src/ordenes/ordenes.controller.js';
import { OrdenesService } from '../src/ordenes/ordenes.service.js';
import { OrdenesRepository } from '../src/ordenes/repositories/ordenes.repository.js';
import {
  buildOrden,
  createOrdenesRepositoryMock,
} from './fixtures/ordenes.fixtures.js';

/**
 * Ejercita la capa HTTP real (prefijo, ValidationPipe, pipes de parámetros,
 * códigos de estado) con el repositorio sustituido, sin depender de MySQL.
 */
describe('Órdenes API (e2e)', () => {
  let app: INestApplication<App>;
  let repository: Mocked<OrdenesRepository>;

  beforeEach(async () => {
    repository = createOrdenesRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      controllers: [OrdenesController],
      providers: [
        OrdenesService,
        { provide: OrdenesRepository, useValue: repository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/ordenes convierte la query y aplica valores por defecto', async () => {
    repository.findAndCount.mockResolvedValue([[buildOrden()], 1]);

    const res = await request(app.getHttpServer())
      .get('/api/ordenes')
      .query({ page: '2', cliente: 'Réditos', estado: 'En Proceso' })
      .expect(200);

    expect(repository.findAndCount).toHaveBeenCalledWith({
      cliente: 'Réditos',
      estado: 'En Proceso',
      skip: 10,
      take: 10,
    });
    expect(res.body.meta).toEqual({
      total: 1,
      page: 2,
      limit: 10,
      totalPages: 1,
    });
  });

  it('GET /api/ordenes rechaza un estado fuera de la lista', () => {
    return request(app.getHttpServer())
      .get('/api/ordenes?estado=Abierta')
      .expect(400);
  });

  it('GET /api/ordenes/catalogos devuelve las listas desplegables (no la trata como :id)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/ordenes/catalogos')
      .expect(200);

    expect(res.body).toEqual({
      estados: ['Pendiente', 'En Proceso', 'Completada', 'Cancelada'],
      prioridades: ['Baja', 'Media', 'Alta', 'Crítica'],
      estadoPorDefecto: 'Pendiente',
      prioridadPorDefecto: 'Media',
    });
    expect(repository.findActiveById).not.toHaveBeenCalled();
  });

  it('GET /api/ordenes/:id responde 400 si el id no es entero', () => {
    return request(app.getHttpServer()).get('/api/ordenes/abc').expect(400);
  });

  it('GET /api/ordenes/:id responde 404 si no existe', () => {
    repository.findActiveById.mockResolvedValue(null);
    return request(app.getHttpServer()).get('/api/ordenes/99').expect(404);
  });

  it('POST /api/ordenes crea y responde 201', async () => {
    repository.existsByCodigo.mockResolvedValue(false);
    repository.create.mockResolvedValue(buildOrden({ id: 5 }));

    const res = await request(app.getHttpServer())
      .post('/api/ordenes')
      .send({
        codigoOrden: 'ORD-2026-005',
        clienteNombre: 'Cliente',
        cantidadItems: 1,
        valorTotal: 10.5,
        fechaSolicitud: '2026-11-21',
      })
      .expect(201);

    expect(res.body.id).toBe(5);
  });

  it('POST /api/ordenes rechaza campos no permitidos', () => {
    return request(app.getHttpServer())
      .post('/api/ordenes')
      .send({
        codigoOrden: 'ORD-2026-005',
        clienteNombre: 'Cliente',
        cantidadItems: 1,
        valorTotal: 10,
        fechaSolicitud: '2026-11-21',
        activo: false,
      })
      .expect(400);
  });

  it('PUT /api/ordenes/:id responde 409 si el código ya existe', () => {
    repository.findActiveById.mockResolvedValue(buildOrden());
    repository.existsByCodigo.mockResolvedValue(true);

    return request(app.getHttpServer())
      .put('/api/ordenes/1')
      .send({ codigoOrden: 'ORD-2026-002' })
      .expect(409);
  });

  it('DELETE /api/ordenes/:id responde 204', async () => {
    repository.findActiveById.mockResolvedValue(buildOrden());

    await request(app.getHttpServer()).delete('/api/ordenes/1').expect(204);
    expect(repository.softDelete).toHaveBeenCalledWith(1);
  });
});
