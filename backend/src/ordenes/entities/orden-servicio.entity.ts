import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import {
  ESTADO_ORDEN_POR_DEFECTO,
  PRIORIDAD_ORDEN_POR_DEFECTO,
} from '../constants/orden.constants.js';
import type {
  EstadoOrden,
  PrioridadOrden,
} from '../constants/orden.constants.js';

@Entity({ name: 'ordenes_servicio' })
export class OrdenServicio {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'codigo_orden', type: 'varchar', length: 30, unique: true })
  codigoOrden: string;

  @Column({ name: 'cliente_nombre', type: 'varchar', length: 150 })
  clienteNombre: string;

  @Column({ name: 'cantidad_items', type: 'int', default: 1 })
  cantidadItems: number;

  @Column({
    name: 'valor_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  valorTotal: number;

  @Column({
    name: 'porcentaje_descuento',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  porcentajeDescuento: number;

  /** Formato 'YYYY-MM-DD' (ver dateStrings en database.config.ts). */
  @Column({ name: 'fecha_solicitud', type: 'date' })
  fechaSolicitud: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ESTADO_ORDEN_POR_DEFECTO,
  })
  estado: EstadoOrden;

  @Column({
    type: 'varchar',
    length: 20,
    default: PRIORIDAD_ORDEN_POR_DEFECTO,
  })
  prioridad: PrioridadOrden;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  /** En MySQL, 'boolean' se mapea a TINYINT(1). */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'timestamp',
    nullable: true,
  })
  fechaActualizacion: Date | null;
}
