import type { Mocked } from 'vitest';
import type { OrdenServicio } from '../../src/ordenes/entities/orden-servicio.entity.js';
import type { OrdenesRepository } from '../../src/ordenes/repositories/ordenes.repository.js';

export const buildOrden = (
  overrides: Partial<OrdenServicio> = {},
): OrdenServicio => ({
  id: 1,
  codigoOrden: 'ORD-2026-001',
  clienteNombre: 'Grupo Réditos S.A.',
  cantidadItems: 5,
  valorTotal: 2500000,
  porcentajeDescuento: 10,
  fechaSolicitud: '2026-11-15',
  estado: 'En Proceso',
  prioridad: 'Alta',
  observaciones: null,
  activo: true,
  fechaCreacion: new Date('2026-11-15T10:00:00Z'),
  fechaActualizacion: null,
  ...overrides,
});

export const createOrdenesRepositoryMock = (): Mocked<OrdenesRepository> => ({
  findAndCount: vi.fn(),
  findActiveById: vi.fn(),
  existsByCodigo: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
});
