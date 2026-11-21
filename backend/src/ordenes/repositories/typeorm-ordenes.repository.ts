import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { OrdenServicio } from '../entities/orden-servicio.entity.js';
import { OrdenesRepository } from './ordenes.repository.js';
import type {
  OrdenesSearchCriteria,
  OrdenWritableFields,
} from './ordenes.repository.js';

/** Escapa los comodines de LIKE para que el texto del usuario sea literal. */
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, '\\$&');

@Injectable()
export class TypeOrmOrdenesRepository extends OrdenesRepository {
  constructor(
    @InjectRepository(OrdenServicio)
    private readonly repository: Repository<OrdenServicio>,
  ) {
    super();
  }

  findAndCount({
    cliente,
    estado,
    skip,
    take,
  }: OrdenesSearchCriteria): Promise<[OrdenServicio[], number]> {
    const where: FindOptionsWhere<OrdenServicio> = { activo: true };
    if (cliente) where.clienteNombre = Like(`%${escapeLike(cliente)}%`);
    if (estado) where.estado = estado;

    return this.repository.findAndCount({
      where,
      order: { fechaCreacion: 'DESC', id: 'DESC' },
      skip,
      take,
    });
  }

  findActiveById(id: number): Promise<OrdenServicio | null> {
    return this.repository.findOneBy({ id, activo: true });
  }

  existsByCodigo(codigo: string, excludeId?: number): Promise<boolean> {
    return this.repository.existsBy({
      codigoOrden: codigo,
      ...(excludeId === undefined ? {} : { id: Not(excludeId) }),
    });
  }

  async create(data: OrdenWritableFields): Promise<OrdenServicio> {
    const saved = await this.repository.save(this.repository.create(data));
    // Recarga para obtener los valores por defecto y las fechas generadas por MySQL.
    return this.repository.findOneByOrFail({ id: saved.id });
  }

  async update(
    orden: OrdenServicio,
    changes: OrdenWritableFields,
  ): Promise<OrdenServicio> {
    await this.repository.update({ id: orden.id }, changes);
    return this.repository.findOneByOrFail({ id: orden.id });
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update({ id }, { activo: false });
  }
}
