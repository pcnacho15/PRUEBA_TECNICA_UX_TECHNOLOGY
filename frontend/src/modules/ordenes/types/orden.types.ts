import type { PaginationParams } from '@/shared/types/pagination'

/** Contrato de la API (backend/src/ordenes/constants/orden.constants.ts). */
export type EstadoOrden = 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada'
export type PrioridadOrden = 'Baja' | 'Media' | 'Alta' | 'Crítica'

/** Respuesta de GET /api/ordenes y GET /api/ordenes/:id. */
export interface Orden {
  id: number
  codigoOrden: string
  clienteNombre: string
  cantidadItems: number
  valorTotal: number
  porcentajeDescuento: number
  /** 'YYYY-MM-DD' */
  fechaSolicitud: string
  estado: EstadoOrden
  prioridad: PrioridadOrden
  observaciones: string | null
  /** ISO 8601 */
  fechaCreacion: string
  fechaActualizacion: string | null
}

/** Cuerpo de POST /api/ordenes y PUT /api/ordenes/:id. */
export interface OrdenPayload {
  codigoOrden: string
  clienteNombre: string
  cantidadItems: number
  valorTotal: number
  porcentajeDescuento: number
  fechaSolicitud: string
  estado: EstadoOrden
  prioridad: PrioridadOrden
  observaciones: string | null
}

/** Respuesta de GET /api/ordenes/catalogos (opciones de los <select>). */
export interface CatalogosOrden {
  estados: EstadoOrden[]
  prioridades: PrioridadOrden[]
  estadoPorDefecto: EstadoOrden
  prioridadPorDefecto: PrioridadOrden
}

export interface OrdenFilters {
  cliente: string
  estado: EstadoOrden | ''
}

export type ListOrdenesParams = PaginationParams & Partial<OrdenFilters>
