import type { EstadoOrden } from '../constants/orden.constants.js';
import type { OrdenServicio } from '../entities/orden-servicio.entity.js';

export interface OrdenesSearchCriteria {
  cliente?: string;
  estado?: EstadoOrden;
  skip: number;
  take: number;
}

export type OrdenWritableFields = Partial<
  Omit<OrdenServicio, 'id' | 'activo' | 'fechaCreacion' | 'fechaActualizacion'>
>;

/**
 * Puerto de persistencia (Inversión de Dependencias): el servicio depende de
 * esta abstracción y no de TypeORM. Se usa como token de inyección.
 * Todas las consultas operan solo sobre órdenes activas.
 */
export abstract class OrdenesRepository {
  abstract findAndCount(
    criteria: OrdenesSearchCriteria,
  ): Promise<[OrdenServicio[], number]>;

  abstract findActiveById(id: number): Promise<OrdenServicio | null>;

  /** Busca en toda la tabla (activas y eliminadas): la columna es UNIQUE. */
  abstract existsByCodigo(codigo: string, excludeId?: number): Promise<boolean>;

  abstract create(data: OrdenWritableFields): Promise<OrdenServicio>;

  abstract update(
    orden: OrdenServicio,
    changes: OrdenWritableFields,
  ): Promise<OrdenServicio>;

  abstract softDelete(id: number): Promise<void>;
}
