import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mocked } from 'vitest'
import { createApp } from 'vue'
import type { Paginated } from '@/shared/types/pagination'
import { ApiError } from '@/shared/http/api-error'
import { ORDENES_SERVICE_KEY } from '../services/ordenes.service'
import type { OrdenesService } from '../services/ordenes.service'
import type { Orden } from '../types/orden.types'
import { useOrdenesStore } from './ordenes.store'

const buildOrden = (id: number): Orden => ({
  id,
  codigoOrden: `ORD-${id}`,
  clienteNombre: 'Cliente',
  cantidadItems: 1,
  valorTotal: 100,
  porcentajeDescuento: 0,
  fechaSolicitud: '2026-11-21',
  estado: 'Pendiente',
  prioridad: 'Media',
  observaciones: null,
  fechaCreacion: '2026-11-21T10:00:00.000Z',
  fechaActualizacion: null,
})

const page = (data: Orden[], meta: Partial<Paginated<Orden>['meta']> = {}): Paginated<Orden> => ({
  data,
  meta: { total: data.length, page: 1, limit: 10, totalPages: data.length ? 1 : 0, ...meta },
})

/** Pinia resuelve inject() en setup stores con el contexto de la app. */
function setup() {
  const service: Mocked<OrdenesService> = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getCatalogos: vi.fn(),
  }
  const app = createApp({})
  const pinia = createPinia()
  app.provide(ORDENES_SERVICE_KEY, service)
  app.use(pinia)
  setActivePinia(pinia)
  return { service, store: useOrdenesStore() }
}

describe('useOrdenesStore', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(() => {
    ctx = setup()
  })

  it('carga el listado con la paginación y filtros actuales', async () => {
    ctx.service.list.mockResolvedValue(page([buildOrden(1)]))

    await ctx.store.applyFilters({ cliente: 'Réditos', estado: 'Pendiente' })

    expect(ctx.service.list).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      cliente: 'Réditos',
      estado: 'Pendiente',
    })
    expect(ctx.store.ordenes).toHaveLength(1)
    expect(ctx.store.hasActiveFilters).toBe(true)
  })

  it('aplicar un filtro regresa a la página 1', async () => {
    ctx.service.list.mockResolvedValue(page([buildOrden(1)], { total: 30, totalPages: 3, page: 2 }))
    await ctx.store.fetchOrdenes()
    await ctx.store.goToPage(2)
    expect(ctx.store.page).toBe(2)

    await ctx.store.applyFilters({ estado: 'Completada' })

    expect(ctx.store.page).toBe(1)
  })

  it('ignora respuestas obsoletas de búsquedas anteriores', async () => {
    let resolveFirst!: (v: Paginated<Orden>) => void
    ctx.service.list
      .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
      .mockResolvedValueOnce(page([buildOrden(2)]))

    const first = ctx.store.applyFilters({ cliente: 'a' })
    await ctx.store.applyFilters({ cliente: 'ab' })
    resolveFirst(page([buildOrden(1)]))
    await first

    expect(ctx.store.ordenes.map((o) => o.id)).toEqual([2])
    expect(ctx.store.loading).toBe(false)
  })

  it('guarda el error de carga para mostrarlo con opción de reintento', async () => {
    ctx.service.list.mockRejectedValue(ApiError.network())

    await ctx.store.fetchOrdenes()

    expect(ctx.store.loadError).toMatch(/No se pudo conectar/)
    expect(ctx.store.isEmpty).toBe(false)
  })

  it('al eliminar el último registro de una página, retrocede a la anterior', async () => {
    ctx.service.list.mockResolvedValue(page([buildOrden(11)], { total: 11, totalPages: 2, page: 2 }))
    await ctx.store.fetchOrdenes()
    await ctx.store.goToPage(2)

    ctx.service.remove.mockResolvedValue()
    ctx.service.list
      .mockResolvedValueOnce(page([], { total: 10, totalPages: 1, page: 2 }))
      .mockResolvedValueOnce(page([buildOrden(1)], { total: 10, totalPages: 1, page: 1 }))

    await ctx.store.deleteOrden(11)

    expect(ctx.service.remove).toHaveBeenCalledWith(11)
    expect(ctx.store.page).toBe(1)
    expect(ctx.store.ordenes.map((o) => o.id)).toEqual([1])
  })

  it('propaga el error de creación sin recargar el listado', async () => {
    ctx.service.create.mockRejectedValue(new ApiError(409, ['Ya existe una orden con el código X']))

    await expect(ctx.store.createOrden({} as never)).rejects.toBeInstanceOf(ApiError)
    expect(ctx.service.list).not.toHaveBeenCalled()
  })
})
