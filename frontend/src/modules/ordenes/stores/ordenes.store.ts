import { defineStore } from 'pinia'
import { computed, inject, reactive, ref } from 'vue'
import { getErrorMessage } from '@/shared/http/api-error'
import type { PaginationMeta } from '@/shared/types/pagination'
import { DEFAULT_PAGE_SIZE } from '../constants/orden.constants'
import { ORDENES_SERVICE_KEY } from '../services/ordenes.service'
import type { OrdenesService } from '../services/ordenes.service'
import type { CatalogosOrden, Orden, OrdenFilters, OrdenPayload } from '../types/orden.types'

const emptyMeta = (limit: number): PaginationMeta => ({ total: 0, page: 1, limit, totalPages: 0 })

const useOrdenesService = (): OrdenesService => {
  const service = inject(ORDENES_SERVICE_KEY)
  if (!service) throw new Error('OrdenesService no fue provisto (app.provide)')
  return service
}

/**
 * Estado del listado (filtros, paginación, resultados) y operaciones CRUD.
 * Las acciones de escritura propagan el error para que la vista decida cómo
 * mostrarlo; la carga del listado guarda el error en el estado.
 */
export const useOrdenesStore = defineStore('ordenes', () => {
  const service = useOrdenesService()

  // ---- Estado ---------------------------------------------------------------
  const ordenes = ref<Orden[]>([])
  const meta = ref<PaginationMeta>(emptyMeta(DEFAULT_PAGE_SIZE))
  const filters = reactive<OrdenFilters>({ cliente: '', estado: '' })
  const page = ref(1)
  const limit = ref(DEFAULT_PAGE_SIZE)
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  const hasLoaded = ref(false)

  const catalogos = ref<CatalogosOrden | null>(null)
  const catalogosError = ref<string | null>(null)

  // Descarta respuestas obsoletas cuando se lanzan búsquedas seguidas.
  let lastRequestId = 0

  // ---- Derivados ------------------------------------------------------------
  const hasActiveFilters = computed(() => filters.cliente.trim() !== '' || filters.estado !== '')
  const isEmpty = computed(() => hasLoaded.value && !loadError.value && ordenes.value.length === 0)

  // ---- Lectura --------------------------------------------------------------
  async function fetchOrdenes(): Promise<void> {
    const requestId = ++lastRequestId
    loading.value = true
    loadError.value = null

    try {
      const result = await service.list({
        page: page.value,
        limit: limit.value,
        cliente: filters.cliente,
        estado: filters.estado,
      })
      if (requestId !== lastRequestId) return

      // Si la página quedó fuera de rango (p. ej. tras eliminar), retrocede.
      if (result.data.length === 0 && result.meta.totalPages > 0 && page.value > result.meta.totalPages) {
        page.value = result.meta.totalPages
        return fetchOrdenes()
      }

      ordenes.value = result.data
      meta.value = result.meta
      hasLoaded.value = true
    } catch (error) {
      if (requestId !== lastRequestId) return
      loadError.value = getErrorMessage(error)
    } finally {
      if (requestId === lastRequestId) loading.value = false
    }
  }

  async function fetchCatalogos(): Promise<void> {
    catalogosError.value = null
    try {
      catalogos.value = await service.getCatalogos()
    } catch (error) {
      catalogosError.value = getErrorMessage(error)
    }
  }

  function fetchOrden(id: number): Promise<Orden> {
    return service.getById(id)
  }

  // ---- Filtros y paginación -------------------------------------------------
  function applyFilters(changes: Partial<OrdenFilters>): Promise<void> {
    Object.assign(filters, changes)
    page.value = 1
    return fetchOrdenes()
  }

  function clearFilters(): Promise<void> {
    return applyFilters({ cliente: '', estado: '' })
  }

  function goToPage(target: number): Promise<void> {
    const last = Math.max(meta.value.totalPages, 1)
    const next = Math.min(Math.max(Math.trunc(target), 1), last)
    if (next === page.value && hasLoaded.value) return Promise.resolve()
    page.value = next
    return fetchOrdenes()
  }

  function setPageSize(size: number): Promise<void> {
    limit.value = size
    page.value = 1
    return fetchOrdenes()
  }

  // ---- Escritura ------------------------------------------------------------
  async function createOrden(payload: OrdenPayload): Promise<Orden> {
    const created = await service.create(payload)
    page.value = 1 // el listado se ordena por fecha de creación descendente
    await fetchOrdenes()
    return created
  }

  async function updateOrden(id: number, payload: OrdenPayload): Promise<Orden> {
    const updated = await service.update(id, payload)
    await fetchOrdenes()
    return updated
  }

  async function deleteOrden(id: number): Promise<void> {
    await service.remove(id)
    await fetchOrdenes()
  }

  return {
    ordenes,
    meta,
    filters,
    page,
    limit,
    loading,
    loadError,
    hasLoaded,
    catalogos,
    catalogosError,
    hasActiveFilters,
    isEmpty,
    fetchOrdenes,
    fetchCatalogos,
    fetchOrden,
    applyFilters,
    clearFilters,
    goToPage,
    setPageSize,
    createOrden,
    updateOrden,
    deleteOrden,
  }
})
