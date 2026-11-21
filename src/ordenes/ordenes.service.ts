import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildPaginationMeta } from '../common/interfaces/paginated-result.interface.js';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import type { CreateOrdenDto } from './dto/create-orden.dto.js';
import type { FilterOrdenesDto } from './dto/filter-ordenes.dto.js';
import { OrdenResponseDto } from './dto/orden-response.dto.js';
import type { UpdateOrdenDto } from './dto/update-orden.dto.js';
import type { OrdenServicio } from './entities/orden-servicio.entity.js';
import { OrdenesRepository } from './repositories/ordenes.repository.js';
import type { OrdenWritableFields } from './repositories/ordenes.repository.js';

/** Quita las claves con valor undefined para no sobrescribir columnas no enviadas. */
const definedOnly = <T extends object>(input: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

@Injectable()
export class OrdenesService {
  constructor(private readonly ordenesRepository: OrdenesRepository) {}

  async findAll(
    filters: FilterOrdenesDto,
  ): Promise<PaginatedResult<OrdenResponseDto>> {
    const { page, limit, cliente, estado } = filters;
    const [ordenes, total] = await this.ordenesRepository.findAndCount({
      cliente,
      estado,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: ordenes.map((orden) => OrdenResponseDto.fromEntity(orden)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number): Promise<OrdenResponseDto> {
    return OrdenResponseDto.fromEntity(await this.getActiveOrFail(id));
  }

  async create(dto: CreateOrdenDto): Promise<OrdenResponseDto> {
    await this.assertCodigoDisponible(dto.codigoOrden);
    const orden = await this.ordenesRepository.create(
      definedOnly<OrdenWritableFields>(dto),
    );
    return OrdenResponseDto.fromEntity(orden);
  }

  async update(id: number, dto: UpdateOrdenDto): Promise<OrdenResponseDto> {
    const orden = await this.getActiveOrFail(id);
    const changes = definedOnly<OrdenWritableFields>(dto);

    if (Object.keys(changes).length === 0) {
      return OrdenResponseDto.fromEntity(orden);
    }
    if (changes.codigoOrden && changes.codigoOrden !== orden.codigoOrden) {
      await this.assertCodigoDisponible(changes.codigoOrden, id);
    }

    const updated = await this.ordenesRepository.update(orden, changes);
    return OrdenResponseDto.fromEntity(updated);
  }

  async remove(id: number): Promise<void> {
    await this.getActiveOrFail(id);
    await this.ordenesRepository.softDelete(id);
  }

  private async getActiveOrFail(id: number): Promise<OrdenServicio> {
    const orden = await this.ordenesRepository.findActiveById(id);
    if (!orden) {
      throw new NotFoundException(`La orden con id ${id} no existe`);
    }
    return orden;
  }

  private async assertCodigoDisponible(
    codigo: string,
    excludeId?: number,
  ): Promise<void> {
    if (await this.ordenesRepository.existsByCodigo(codigo, excludeId)) {
      throw new ConflictException(
        `Ya existe una orden con el código ${codigo}`,
      );
    }
  }
}
