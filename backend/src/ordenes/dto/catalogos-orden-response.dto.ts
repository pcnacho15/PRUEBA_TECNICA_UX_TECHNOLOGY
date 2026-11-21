import { ApiProperty } from '@nestjs/swagger';
import {
  ESTADO_ORDEN_POR_DEFECTO,
  ESTADOS_ORDEN,
  PRIORIDAD_ORDEN_POR_DEFECTO,
  PRIORIDADES_ORDEN,
} from '../constants/orden.constants.js';
import type {
  EstadoOrden,
  PrioridadOrden,
} from '../constants/orden.constants.js';

/**
 * Valores de las listas desplegables expuestos al cliente, para que el
 * frontend no duplique las constantes del dominio.
 */
export class CatalogosOrdenResponseDto {
  @ApiProperty({ enum: ESTADOS_ORDEN, isArray: true })
  estados: readonly EstadoOrden[];

  @ApiProperty({ enum: PRIORIDADES_ORDEN, isArray: true })
  prioridades: readonly PrioridadOrden[];

  @ApiProperty({ enum: ESTADOS_ORDEN, example: ESTADO_ORDEN_POR_DEFECTO })
  estadoPorDefecto: EstadoOrden;

  @ApiProperty({
    enum: PRIORIDADES_ORDEN,
    example: PRIORIDAD_ORDEN_POR_DEFECTO,
  })
  prioridadPorDefecto: PrioridadOrden;

  static create(): CatalogosOrdenResponseDto {
    const dto = new CatalogosOrdenResponseDto();
    dto.estados = ESTADOS_ORDEN;
    dto.prioridades = PRIORIDADES_ORDEN;
    dto.estadoPorDefecto = ESTADO_ORDEN_POR_DEFECTO;
    dto.prioridadPorDefecto = PRIORIDAD_ORDEN_POR_DEFECTO;
    return dto;
  }
}
