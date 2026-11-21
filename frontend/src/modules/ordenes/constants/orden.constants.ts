/**
 * Límites de validación en cliente. Reflejan los del DTO del backend
 * (ORDEN_LIMITES); el servidor sigue siendo la fuente de verdad.
 */
export const ORDEN_LIMITES = {
  codigoOrdenMaxLength: 30,
  codigoOrdenPattern: /^[A-Za-z0-9-]+$/,
  clienteNombreMaxLength: 150,
  observacionesMaxLength: 5000,
  cantidadItemsMin: 1,
  cantidadItemsMax: 2_147_483_647,
  valorTotalMin: 0,
  valorTotalMax: 9_999_999_999.99,
  porcentajeDescuentoMin: 0,
  porcentajeDescuentoMax: 100,
  decimales: 2,
} as const

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const
export const DEFAULT_PAGE_SIZE = 10
