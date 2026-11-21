import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';
import { CreateOrdenDto } from './dto/create-orden.dto.js';
import { FilterOrdenesDto } from './dto/filter-ordenes.dto.js';
import {
  OrdenResponseDto,
  PaginatedOrdenesResponseDto,
} from './dto/orden-response.dto.js';
import { UpdateOrdenDto } from './dto/update-orden.dto.js';
import { OrdenesService } from './ordenes.service.js';

const idPipe = new ParseIntPipe({
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
});

@ApiTags('Órdenes de servicio')
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Get()
  @ApiOperation({ summary: 'Listado paginado con filtro por cliente o estado' })
  @ApiOkResponse({ type: PaginatedOrdenesResponseDto })
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos' })
  findAll(
    @Query() filters: FilterOrdenesDto,
  ): Promise<PaginatedResult<OrdenResponseDto>> {
    return this.ordenesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: OrdenResponseDto })
  @ApiNotFoundResponse({ description: 'La orden no existe o fue eliminada' })
  findOne(@Param('id', idPipe) id: number): Promise<OrdenResponseDto> {
    return this.ordenesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una orden' })
  @ApiCreatedResponse({ type: OrdenResponseDto })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiConflictResponse({ description: 'El código de orden ya existe' })
  create(@Body() dto: CreateOrdenDto): Promise<OrdenResponseDto> {
    return this.ordenesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una orden' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: OrdenResponseDto })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiNotFoundResponse({ description: 'La orden no existe o fue eliminada' })
  @ApiConflictResponse({ description: 'El código de orden ya existe' })
  update(
    @Param('id', idPipe) id: number,
    @Body() dto: UpdateOrdenDto,
  ): Promise<OrdenResponseDto> {
    return this.ordenesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una orden (borrado lógico: activo = 0)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Orden eliminada' })
  @ApiNotFoundResponse({ description: 'La orden no existe o ya fue eliminada' })
  remove(@Param('id', idPipe) id: number): Promise<void> {
    return this.ordenesService.remove(id);
  }
}
