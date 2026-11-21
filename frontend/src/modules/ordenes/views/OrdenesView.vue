<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import AppPagination from '@/shared/components/AppPagination.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import { ApiError, getErrorMessage } from '@/shared/http/api-error'
import { useNotificationsStore } from '@/shared/stores/notifications.store'
import OrdenesFilters from '../components/OrdenesFilters.vue'
import OrdenesTable from '../components/OrdenesTable.vue'
import OrdenFormModal from '../components/OrdenFormModal.vue'
import { PAGE_SIZE_OPTIONS } from '../constants/orden.constants'
import { useOrdenesStore } from '../stores/ordenes.store'
import type { Orden, OrdenPayload } from '../types/orden.types'

const store = useOrdenesStore()
const notifications = useNotificationsStore()
const { ordenes, meta, filters, loading, loadError, isEmpty, hasActiveFilters, catalogos, catalogosError } =
  storeToRefs(store)

// ---- Formulario (crear / editar) --------------------------------------------
type FormState = { open: false } | { open: true; orden: Orden | null }
const formState = ref<FormState>({ open: false })
const loadingEditId = ref<number | null>(null)

function openCreate(): void {
  if (!catalogos.value) void store.fetchCatalogos()
  formState.value = { open: true, orden: null }
}

/** Trae la versión vigente de la orden antes de editar (podría haber cambiado). */
async function openEdit(orden: Orden): Promise<void> {
  loadingEditId.value = orden.id
  try {
    const fresh = await store.fetchOrden(orden.id)
    formState.value = { open: true, orden: fresh }
  } catch (error) {
    notifications.error('No se pudo abrir la orden', getErrorMessage(error))
    if (error instanceof ApiError && error.isNotFound) void store.fetchOrdenes()
  } finally {
    loadingEditId.value = null
  }
}

function closeForm(): void {
  formState.value = { open: false }
}

function saveOrden(payload: OrdenPayload): Promise<Orden> {
  const current = formState.value.open ? formState.value.orden : null
  return current ? store.updateOrden(current.id, payload) : store.createOrden(payload)
}

function onSaved(): void {
  const isEdit = formState.value.open && formState.value.orden !== null
  notifications.success(isEdit ? 'Orden actualizada' : 'Orden creada', 'Los cambios se guardaron correctamente.')
  closeForm()
}

// ---- Eliminación ------------------------------------------------------------
const ordenToDelete = ref<Orden | null>(null)
const deleting = ref(false)

async function confirmDelete(): Promise<void> {
  const orden = ordenToDelete.value
  if (!orden) return
  deleting.value = true
  try {
    await store.deleteOrden(orden.id)
    notifications.success('Orden eliminada', `La orden ${orden.codigoOrden} se eliminó correctamente.`)
    ordenToDelete.value = null
  } catch (error) {
    notifications.error('No se pudo eliminar la orden', getErrorMessage(error))
    if (error instanceof ApiError && error.isNotFound) {
      ordenToDelete.value = null
      void store.fetchOrdenes()
    }
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  void store.fetchCatalogos()
  void store.fetchOrdenes()
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Órdenes de servicio</h1>
        <p class="mt-1 text-sm text-slate-500">
          Consulta, registra y actualiza las órdenes activas.
        </p>
      </div>
      <button type="button" class="btn btn-primary" @click="openCreate">
        <AppIcon name="plus" class="size-4" />
        Nueva orden
      </button>
    </header>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 p-4 sm:px-6">
        <OrdenesFilters
          :cliente="filters.cliente"
          :estado="filters.estado"
          :estados="catalogos?.estados ?? []"
          :loading="loading"
          @update:cliente="store.applyFilters({ cliente: $event })"
          @update:estado="store.applyFilters({ estado: $event })"
          @clear="store.clearFilters()"
        />
      </div>

      <!-- Error de carga -->
      <div v-if="loadError" role="alert" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span class="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AppIcon name="alert" class="size-6" />
        </span>
        <div>
          <p class="font-medium text-slate-900">No se pudieron cargar las órdenes</p>
          <p class="mt-1 max-w-md text-sm text-slate-500">{{ loadError }}</p>
        </div>
        <button type="button" class="btn btn-secondary" :disabled="loading" @click="store.fetchOrdenes()">
          <AppIcon name="refresh" class="size-4" />
          Reintentar
        </button>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="isEmpty && !loading" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span class="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <AppIcon :name="hasActiveFilters ? 'search' : 'clipboard'" class="size-6" />
        </span>
        <div>
          <p class="font-medium text-slate-900">
            {{ hasActiveFilters ? 'Ninguna orden coincide con los filtros' : 'Aún no hay órdenes registradas' }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {{ hasActiveFilters ? 'Prueba con otro nombre de cliente o estado.' : 'Crea la primera orden de servicio.' }}
          </p>
        </div>
        <button v-if="hasActiveFilters" type="button" class="btn btn-secondary" @click="store.clearFilters()">
          Limpiar filtros
        </button>
        <button v-else type="button" class="btn btn-primary" @click="openCreate">
          <AppIcon name="plus" class="size-4" />
          Nueva orden
        </button>
      </div>

      <template v-else>
        <OrdenesTable
          :ordenes="ordenes"
          :loading="loading"
          :busy-id="loadingEditId"
          :skeleton-rows="meta.limit > 10 ? 10 : meta.limit"
          @edit="openEdit"
          @delete="ordenToDelete = $event"
        />
        <AppPagination
          :meta="meta"
          :page-size-options="PAGE_SIZE_OPTIONS"
          :disabled="loading"
          @update:page="store.goToPage($event)"
          @update:limit="store.setPageSize($event)"
        />
      </template>
    </section>

    <OrdenFormModal
      v-if="formState.open"
      :orden="formState.orden"
      :catalogos="catalogos"
      :catalogos-error="catalogosError"
      :save="saveOrden"
      @close="closeForm"
      @saved="onSaved"
      @retry-catalogos="store.fetchCatalogos()"
    />

    <ConfirmDialog
      :open="ordenToDelete !== null"
      title="Eliminar orden"
      confirm-text="Eliminar"
      danger
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="ordenToDelete = null"
    >
      <p>
        ¿Seguro que deseas eliminar la orden
        <strong class="font-mono text-slate-900">{{ ordenToDelete?.codigoOrden }}</strong>
        de <strong class="text-slate-900">{{ ordenToDelete?.clienteNombre }}</strong>?
      </p>
      <p class="mt-1">Dejará de aparecer en el listado.</p>
    </ConfirmDialog>
  </div>
</template>
