import type { InjectionKey } from 'vue'
import type { HttpClient } from '@/shared/http/http-client'
import type { Paginated } from '@/shared/types/pagination'
import type {
  CatalogosOrden,
  ListOrdenesParams,
  Orden,
  OrdenPayload,
} from '../types/orden.types'

/** Puerto de acceso a datos de órdenes: la UI y el store dependen de esta interfaz. */
export interface OrdenesService {
  list(params: ListOrdenesParams): Promise<Paginated<Orden>>
  getById(id: number): Promise<Orden>
  create(payload: OrdenPayload): Promise<Orden>
  update(id: number, payload: OrdenPayload): Promise<Orden>
  remove(id: number): Promise<void>
  getCatalogos(): Promise<CatalogosOrden>
}

const RESOURCE = '/ordenes'

/** Implementación REST sobre la API NestJS. */
export const createOrdenesService = (http: HttpClient): OrdenesService => ({
  list: ({ page, limit, cliente, estado }) =>
    http.get<Paginated<Orden>>(RESOURCE, {
      page,
      limit,
      cliente: cliente?.trim(),
      estado,
    }),
  getById: (id) => http.get<Orden>(`${RESOURCE}/${id}`),
  create: (payload) => http.post<Orden>(RESOURCE, payload),
  update: (id, payload) => http.put<Orden>(`${RESOURCE}/${id}`, payload),
  remove: (id) => http.delete(`${RESOURCE}/${id}`),
  getCatalogos: () => http.get<CatalogosOrden>(`${RESOURCE}/catalogos`),
})

export const ORDENES_SERVICE_KEY: InjectionKey<OrdenesService> = Symbol('OrdenesService')
