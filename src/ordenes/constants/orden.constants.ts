/**
 * Valores fijos de las listas desplegables. Son la única fuente de verdad para
 * la validación de DTOs (@IsIn), la documentación Swagger y el tipado.
 * Deben coincidir con las restricciones CHECK de database/init.sql.
 */
export const ESTADOS_ORDEN = [
  'Pendiente',
  'En Proceso',
  'Completada',
  'Cancelada',
] as const;
export type EstadoOrden = (typeof ESTADOS_ORDEN)[number];

export const PRIORIDADES_ORDEN = ['Baja', 'Media', 'Alta', 'Crítica'] as const;
export type PrioridadOrden = (typeof PRIORIDADES_ORDEN)[number];

export const ESTADO_ORDEN_POR_DEFECTO: EstadoOrden = 'Pendiente';
export const PRIORIDAD_ORDEN_POR_DEFECTO: PrioridadOrden = 'Media';

export const ORDEN_LIMITES = {
  codigoOrdenMaxLength: 30,
  clienteNombreMaxLength: 150,
  observacionesMaxLength: 5000,
  cantidadItemsMin: 1,
  cantidadItemsMax: 2_147_483_647,
  valorTotalMin: 0,
  valorTotalMax: 9_999_999_999.99,
  porcentajeDescuentoMin: 0,
  porcentajeDescuentoMax: 100,
} as const;
