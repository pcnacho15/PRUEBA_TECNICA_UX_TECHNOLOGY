<script setup lang="ts">
import { computed, useId } from 'vue'
import type { PaginationMeta } from '../types/pagination'
import { buildPageList } from '../utils/pagination'
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    meta: PaginationMeta
    pageSizeOptions: readonly number[]
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ 'update:page': [page: number]; 'update:limit': [limit: number] }>()

const sizeId = useId()
const pages = computed(() => buildPageList(props.meta.page, props.meta.totalPages))
const isFirst = computed(() => props.meta.page <= 1)
const isLast = computed(() => props.meta.page >= props.meta.totalPages)

const rangeText = computed(() => {
  const { total, page, limit } = props.meta
  if (total === 0) return 'Sin resultados'
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return `Mostrando ${from}–${to} de ${total}`
})

function onLimitChange(event: Event): void {
  emit('update:limit', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <nav
    class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    aria-label="Paginación"
  >
    <div class="flex items-center justify-between gap-4 text-sm text-slate-600 sm:justify-start">
      <p aria-live="polite">{{ rangeText }}</p>
      <div class="flex items-center gap-2">
        <label :for="sizeId" class="whitespace-nowrap">Por página</label>
        <select
          :id="sizeId"
          class="form-control w-auto py-1 pr-8"
          :value="meta.limit"
          :disabled="disabled"
          @change="onLimitChange"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
    </div>

    <div v-if="meta.totalPages > 1" class="flex items-center justify-center gap-1">
      <button
        type="button"
        class="btn-icon"
        aria-label="Página anterior"
        :disabled="disabled || isFirst"
        @click="emit('update:page', meta.page - 1)"
      >
        <AppIcon name="chevron-left" class="size-4" />
      </button>

      <!-- Números: ocultos en móvil, donde se muestra "Página X de Y". -->
      <span class="px-2 text-sm text-slate-600 sm:hidden">
        Página {{ meta.page }} de {{ meta.totalPages }}
      </span>
      <template v-for="(item, index) in pages" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="hidden w-8 text-center text-slate-400 sm:inline" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          class="hidden h-8 min-w-8 cursor-pointer rounded-md px-2 text-sm font-medium tabular-nums transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed sm:inline-block"
          :class="
            item === meta.page
              ? 'bg-indigo-600 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          "
          :aria-current="item === meta.page ? 'page' : undefined"
          :aria-label="`Página ${item}`"
          :disabled="disabled"
          @click="item !== meta.page && emit('update:page', item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        class="btn-icon"
        aria-label="Página siguiente"
        :disabled="disabled || isLast"
        @click="emit('update:page', meta.page + 1)"
      >
        <AppIcon name="chevron-right" class="size-4" />
      </button>
    </div>
  </nav>
</template>
