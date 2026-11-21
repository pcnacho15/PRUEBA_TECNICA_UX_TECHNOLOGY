import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Mocked } from 'vitest';
import {
  buildOrden,
  createOrdenesRepositoryMock,
} from '../../test/fixtures/ordenes.fixtures.js';
import type { CreateOrdenDto } from './dto/create-orden.dto.js';
import type { FilterOrdenesDto } from './dto/filter-ordenes.dto.js';
import { OrdenesService } from './ordenes.service.js';
import type { OrdenesRepository } from './repositories/ordenes.repository.js';

describe('OrdenesService', () => {
  let repository: Mocked<OrdenesRepository>;
  let service: OrdenesService;

  beforeEach(() => {
    repository = createOrdenesRepositoryMock();
    service = new OrdenesService(repository);
  });

  describe('findAll', () => {
    it('traduce page/limit a skip/take y devuelve la metadata de paginación', async () => {
      repository.findAndCount.mockResolvedValue([[buildOrden()], 21]);
      const filters = {
        page: 3,
        limit: 10,
        estado: 'Pendiente',
      } as FilterOrdenesDto;

      const result = await service.findAll(filters);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        cliente: undefined,
        estado: 'Pendiente',
        skip: 20,
        take: 10,
      });
      expect(result.meta).toEqual({
        total: 21,
        page: 3,
        limit: 10,
        totalPages: 3,
      });
      expect(result.data[0]).not.toHaveProperty('activo');
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si la orden no existe o está inactiva', async () => {
      repository.findActiveById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const dto: CreateOrdenDto = {
      codigoOrden: 'ORD-2026-010',
      clienteNombre: 'Cliente Nuevo',
      cantidadItems: 1,
      valorTotal: 100,
      fechaSolicitud: '2026-11-21',
    };

    it('rechaza un código de orden duplicado con 409', async () => {
      repository.existsByCodigo.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('persiste solo los campos enviados para que apliquen los defaults de BD', async () => {
      repository.existsByCodigo.mockResolvedValue(false);
      repository.create.mockResolvedValue(buildOrden({ id: 10 }));

      await service.create(Object.assign({}, dto, { prioridad: undefined }));

      expect(repository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('valida unicidad del código excluyendo la propia orden', async () => {
      const orden = buildOrden();
      repository.findActiveById.mockResolvedValue(orden);
      repository.existsByCodigo.mockResolvedValue(false);
      repository.update.mockResolvedValue(
        buildOrden({ codigoOrden: 'ORD-NEW' }),
      );

      await service.update(1, { codigoOrden: 'ORD-NEW' });

      expect(repository.existsByCodigo).toHaveBeenCalledWith('ORD-NEW', 1);
      expect(repository.update).toHaveBeenCalledWith(orden, {
        codigoOrden: 'ORD-NEW',
      });
    });

    it('no consulta unicidad si el código no cambia', async () => {
      const orden = buildOrden();
      repository.findActiveById.mockResolvedValue(orden);
      repository.update.mockResolvedValue(orden);

      await service.update(1, {
        codigoOrden: orden.codigoOrden,
        estado: 'Completada',
      });

      expect(repository.existsByCodigo).not.toHaveBeenCalled();
    });

    it('no ejecuta UPDATE si el cuerpo no trae cambios', async () => {
      repository.findActiveById.mockResolvedValue(buildOrden());

      await service.update(1, {});

      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('hace borrado lógico de una orden activa', async () => {
      repository.findActiveById.mockResolvedValue(buildOrden());

      await service.remove(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundException si la orden ya fue eliminada', async () => {
      repository.findActiveById.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });
});
