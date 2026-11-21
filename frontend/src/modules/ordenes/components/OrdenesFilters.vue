<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import BaseSpinner from '@/shared/components/BaseSpinner.vue'
import { useDebounceFn } from '@/shared/composables/useDebounceFn'
import { ORDEN_LIMITES } from '../constants/orden.constants'
import type { EstadoOrden } from '../types/orden.types'

const props = defineProps<{
  cliente: string
  estado: EstadoOrden | ''
  estados: readonly EstadoOrden[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:cliente': [value: string]
  'update:estado': [value: EstadoOrden | '']
  clear: []
}>()

// Copia local para escribir sin disparar una petición por tecla.
const search = ref(props.cliente)
watch(
  () => props.cliente,
  (value) => {
    if (value !== search.value.trim()) search.value = value
  },
)

const emitSearch = useDebounceFn((value: string) => emit('update:cliente', value.trim()), 400)

function onSearchInput(): void {
  emitSearch(search.value)
}

/** Enter busca de inmediato, sin esperar el debounce. */
function onSearchSubmit(): void {
  emitSearch.cancel()
  emit('update:cliente', search.value.trim())
}

function onEstadoChange(event: Event): void {
  emit('update:estado', (event.target as HTMLSelectElement).value as EstadoOrden | '')
}

const hasFilters = computed(() => props.cliente !== '' || props.estado !== '' || search.value !== '')

function clear(): void {
  emitSearch.cancel()
  search.value = ''
  emit('clear')
}
</script>

<template>
  <form
    role="search"
    class="flex flex-col gap-3 sm:flex-row sm:items-end"
    @submit.prevent="onSearchSubmit"
  >
    <div class="flex-1">
      <label for="filtro-cliente" class="mb-1.5 block text-sm font-medium text-slate-700">
        Buscar cliente
      </label>
      <div class="relative">
        <AppIcon
          name="search"
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id="filtro-cliente"
          v-model="search"
          type="search"
          class="form-control pr-9 pl-9"
          placeholder="Nombre o razón social…"
          autocomplete="off"
          :maxlength="ORDEN_LIMITES.clienteNombreMaxLength"
          @input="onSearchInput"
        />
        <BaseSpinner
          v-if="loading"
          class="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-indigo-500"
        />
      </div>
    </div>

    <div class="sm:w-52">
      <label for="filtro-estado" class="mb-1.5 block text-sm font-medium text-slate-700">Estado</label>
      <select id="filtro-estado" class="form-control" :value="estado" @change="onEstadoChange">
        <option value="">Todos los estados</option>
        <option v-for="item in estados" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>

    <button type="button" class="btn btn-secondary" :disabled="!hasFilters" @click="clear">
      <AppIcon name="x" class="size-4" />
      Limpiar
    </button>
  </form>
</template>
