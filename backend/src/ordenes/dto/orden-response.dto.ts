import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../common/interfaces/paginated-result.interface.js';
import {
  ESTADOS_ORDEN,
  PRIORIDADES_ORDEN,
} from '../constants/orden.constants.js';
import type {
  EstadoOrden,
  PrioridadOrden,
} from '../constants/orden.constants.js';
import type { OrdenServicio } from '../entities/orden-servicio.entity.js';

/** Contrato público de una orden: desacopla la API del esquema de persistencia. */
export class OrdenResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ORD-2026-001' })
  codigoOrden: string;

  @ApiProperty({ example: 'Grupo Réditos S.A.' })
  clienteNombre: string;

  @ApiProperty({ example: 5 })
  cantidadItems: number;

  @ApiProperty({ example: 2500000 })
  valorTotal: number;

  @ApiProperty({ example: 10 })
  porcentajeDescuento: number;

  @ApiProperty({ example: '2026-11-15', format: 'date' })
  fechaSolicitud: string;

  @ApiProperty({ enum: ESTADOS_ORDEN, example: 'En Proceso' })
  estado: EstadoOrden;

  @ApiProperty({ enum: PRIORIDADES_ORDEN, example: 'Alta' })
  prioridad: PrioridadOrden;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Implementación módulo transaccional',
  })
  observaciones: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  fechaCreacion: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  fechaActualizacion: Date | null;

  static fromEntity(entity: OrdenServicio): OrdenResponseDto {
    const dto = new OrdenResponseDto();
    dto.id = entity.id;
    dto.codigoOrden = entity.codigoOrden;
    dto.clienteNombre = entity.clienteNombre;
    dto.cantidadItems = entity.cantidadItems;
    dto.valorTotal = entity.valorTotal;
    dto.porcentajeDescuento = entity.porcentajeDescuento;
    dto.fechaSolicitud = entity.fechaSolicitud;
    dto.estado = entity.estado;
    dto.prioridad = entity.prioridad;
    dto.observaciones = entity.observaciones;
    dto.fechaCreacion = entity.fechaCreacion;
    dto.fechaActualizacion = entity.fechaActualizacion;
    return dto;
  }
}

class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedOrdenesResponseDto {
  @ApiProperty({ type: [OrdenResponseDto] })
  data: OrdenResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
