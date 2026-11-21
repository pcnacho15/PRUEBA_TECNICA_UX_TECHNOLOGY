import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenServicio } from './entities/orden-servicio.entity.js';
import { OrdenesController } from './ordenes.controller.js';
import { OrdenesService } from './ordenes.service.js';
import { OrdenesRepository } from './repositories/ordenes.repository.js';
import { TypeOrmOrdenesRepository } from './repositories/typeorm-ordenes.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenServicio])],
  controllers: [OrdenesController],
  providers: [
    OrdenesService,
    { provide: OrdenesRepository, useClass: TypeOrmOrdenesRepository },
  ],
})
export class OrdenesModule {}
