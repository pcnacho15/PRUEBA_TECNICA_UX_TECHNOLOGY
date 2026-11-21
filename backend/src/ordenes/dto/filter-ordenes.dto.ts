import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ESTADOS_ORDEN, ORDEN_LIMITES } from '../constants/orden.constants.js';
import type { EstadoOrden } from '../constants/orden.constants.js';

export class FilterOrdenesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Coincidencia parcial sobre el nombre del cliente',
    example: 'Réditos',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString()
  @MaxLength(ORDEN_LIMITES.clienteNombreMaxLength)
  cliente?: string;

  @ApiPropertyOptional({ enum: ESTADOS_ORDEN, example: 'Pendiente' })
  @IsOptional()
  @IsIn(ESTADOS_ORDEN, {
    message: `estado debe ser uno de: ${ESTADOS_ORDEN.join(', ')}`,
  })
  estado?: EstadoOrden;
}
