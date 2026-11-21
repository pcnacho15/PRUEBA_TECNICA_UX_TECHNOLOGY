import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ESTADO_ORDEN_POR_DEFECTO,
  ESTADOS_ORDEN,
  ORDEN_LIMITES as L,
  PRIORIDAD_ORDEN_POR_DEFECTO,
  PRIORIDADES_ORDEN,
} from '../constants/orden.constants.js';
import type {
  EstadoOrden,
  PrioridadOrden,
} from '../constants/orden.constants.js';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const DOS_DECIMALES = {
  maxDecimalPlaces: 2,
  allowNaN: false,
  allowInfinity: false,
};

export class CreateOrdenDto {
  @ApiProperty({
    description: 'Código alfanumérico único de referencia',
    example: 'ORD-2026-005',
    maxLength: L.codigoOrdenMaxLength,
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(L.codigoOrdenMaxLength)
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'codigoOrden solo admite letras, números y guiones',
  })
  codigoOrden: string;

  @ApiProperty({
    description: 'Nombre completo o razón social del cliente',
    example: 'Grupo Réditos S.A.',
    maxLength: L.clienteNombreMaxLength,
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(L.clienteNombreMaxLength)
  clienteNombre: string;

  @ApiProperty({
    description: 'Cantidad entera de ítems o servicios (≥ 1)',
    example: 3,
    minimum: L.cantidadItemsMin,
  })
  @IsInt()
  @Min(L.cantidadItemsMin)
  @Max(L.cantidadItemsMax)
  cantidadItems: number;

  @ApiProperty({
    description: 'Valor total con máximo 2 decimales (≥ 0)',
    example: 1540000.5,
    minimum: L.valorTotalMin,
    maximum: L.valorTotalMax,
  })
  @IsNumber(DOS_DECIMALES)
  @Min(L.valorTotalMin)
  @Max(L.valorTotalMax)
  valorTotal: number;

  @ApiPropertyOptional({
    description: 'Porcentaje de descuento (0.00 a 100.00)',
    example: 12.5,
    minimum: L.porcentajeDescuentoMin,
    maximum: L.porcentajeDescuentoMax,
    default: 0,
  })
  @IsOptional()
  @IsNumber(DOS_DECIMALES)
  @Min(L.porcentajeDescuentoMin)
  @Max(L.porcentajeDescuentoMax)
  porcentajeDescuento?: number;

  @ApiProperty({
    description: 'Fecha de solicitud en formato YYYY-MM-DD',
    example: '2026-11-21',
    format: 'date',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaSolicitud debe tener el formato YYYY-MM-DD',
  })
  @IsISO8601(
    { strict: true },
    { message: 'fechaSolicitud no es una fecha válida' },
  )
  fechaSolicitud: string;

  @ApiPropertyOptional({
    enum: ESTADOS_ORDEN,
    default: ESTADO_ORDEN_POR_DEFECTO,
    example: 'Pendiente',
  })
  @IsOptional()
  @IsIn(ESTADOS_ORDEN, {
    message: `estado debe ser uno de: ${ESTADOS_ORDEN.join(', ')}`,
  })
  estado?: EstadoOrden;

  @ApiPropertyOptional({
    enum: PRIORIDADES_ORDEN,
    default: PRIORIDAD_ORDEN_POR_DEFECTO,
    example: 'Media',
  })
  @IsOptional()
  @IsIn(PRIORIDADES_ORDEN, {
    message: `prioridad debe ser uno de: ${PRIORIDADES_ORDEN.join(', ')}`,
  })
  prioridad?: PrioridadOrden;

  @ApiPropertyOptional({
    description: 'Notas o comentarios adicionales',
    example: 'Visita técnica en horario de la mañana',
    maxLength: L.observacionesMaxLength,
    nullable: true,
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(L.observacionesMaxLength)
  observaciones?: string | null;
}
