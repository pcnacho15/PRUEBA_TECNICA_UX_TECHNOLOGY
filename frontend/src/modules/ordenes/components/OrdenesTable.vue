<script setup lang="ts">
import AppIcon from '@/shared/components/AppIcon.vue'
import BaseBadge from '@/shared/components/BaseBadge.vue'
import BaseSpinner from '@/shared/components/BaseSpinner.vue'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatInteger,
  formatPercent,
} from '@/shared/utils/formatters'
import type { Orden } from '../types/orden.types'
import { estadoTone, prioridadTone } from '../utils/orden-presentation'

withDefaults(
  defineProps<{
    ordenes: Orden[]
    loading: boolean
    /** Id de la orden cuya edición se está cargando (muestra spinner en su botón). */
    busyId?: number | null
    skeletonRows?: number
  }>(),
  { busyId: null, skeletonRows: 5 },
)

const emit = defineEmits<{ edit: [orden: Orden]; delete: [orden: Orden] }>()
</script>

<template>
  <div class="relative" :aria-busy="loading">
    <!-- Escritorio / tablet: tabla -->
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <caption class="sr-only">
          Órdenes de servicio activas
        </caption>
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>
            <th scope="col" class="px-6 py-3">Código</th>
            <th scope="col" class="px-4 py-3">Cliente</th>
            <th scope="col" class="px-4 py-3 text-right">Ítems</th>
            <th scope="col" class="px-4 py-3 text-right">Valor total</th>
            <th scope="col" class="px-4 py-3 text-right">Descuento</th>
            <th scope="col" class="px-4 py-3">Solicitud</th>
            <th scope="col" class="px-4 py-3">Estado</th>
            <th scope="col" class="px-4 py-3">Prioridad</th>
            <th scope="col" class="px-6 py-3 text-right"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 bg-white">
          <template v-if="loading && ordenes.length === 0">
            <tr v-for="n in skeletonRows" :key="`sk-${n}`" class="animate-pulse">
              <td v-for="c in 9" :key="c" class="px-4 py-4 first:px-6 last:px-6">
                <div class="h-4 rounded bg-slate-200" :class="c === 2 ? 'w-40' : 'w-16'" />
              </td>
            </tr>
          </template>

          <tr
            v-for="orden in ordenes"
            v-else
            :key="orden.id"
            class="transition-colors hover:bg-slate-50/80"
          >
            <td class="px-6 py-3 font-mono text-xs font-medium whitespace-nowrap text-slate-900">
              {{ orden.codigoOrden }}
            </td>
            <td class="max-w-xs px-4 py-3">
              <p class="truncate font-medium text-slate-900" :title="orden.clienteNombre">
                {{ orden.clienteNombre }}
              </p>
              <p
                v-if="orden.observaciones"
                class="truncate text-xs text-slate-500"
                :title="orden.observaciones"
              >
                {{ orden.observaciones }}
              </p>
            </td>
            <td class="px-4 py-3 text-right tabular-nums text-slate-700">
              {{ formatInteger(orden.cantidadItems) }}
            </td>
            <td class="px-4 py-3 text-right font-medium whitespace-nowrap tabular-nums text-slate-900">
              {{ formatCurrency(orden.valorTotal) }}
            </td>
            <td class="px-4 py-3 text-right tabular-nums text-slate-700">
              <span :class="{ 'text-slate-400': orden.porcentajeDescuento === 0 }">
                {{ formatPercent(orden.porcentajeDescuento) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-slate-700">
              <time :datetime="orden.fechaSolicitud" :title="`Creada: ${formatDateTime(orden.fechaCreacion)}`">
                {{ formatDate(orden.fechaSolicitud) }}
              </time>
            </td>
            <td class="px-4 py-3">
              <BaseBadge :label="orden.estado" :tone="estadoTone(orden.estado)" />
            </td>
            <td class="px-4 py-3">
              <BaseBadge :label="orden.prioridad" :tone="prioridadTone(orden.prioridad)" variant="outline" />
            </td>
            <td class="px-6 py-3">
              <div class="flex justify-end gap-1">
                <button
                  type="button"
                  class="btn-icon"
                  :aria-label="`Editar orden ${orden.codigoOrden}`"
                  title="Editar"
                  :disabled="busyId !== null"
                  @click="emit('edit', orden)"
                >
                  <BaseSpinner v-if="busyId === orden.id" class="size-4" />
                  <AppIcon v-else name="pencil" class="size-4" />
                </button>
                <button
                  type="button"
                  class="btn-icon hover:bg-rose-50 hover:text-rose-600"
                  :aria-label="`Eliminar orden ${orden.codigoOrden}`"
                  title="Eliminar"
                  :disabled="busyId !== null"
                  @click="emit('delete', orden)"
                >
                  <AppIcon name="trash" class="size-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Móvil: tarjetas -->
    <ul class="divide-y divide-slate-100 md:hidden">
      <template v-if="loading && ordenes.length === 0">
        <li v-for="n in 3" :key="`skm-${n}`" class="animate-pulse space-y-3 p-4">
          <div class="h-4 w-1/3 rounded bg-slate-200" />
          <div class="h-4 w-2/3 rounded bg-slate-200" />
          <div class="h-4 w-1/2 rounded bg-slate-200" />
        </li>
      </template>

      <li v-for="orden in ordenes" v-else :key="orden.id" class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-xs font-medium text-slate-500">{{ orden.codigoOrden }}</p>
            <p class="truncate font-medium text-slate-900">{{ orden.clienteNombre }}</p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button
              type="button"
              class="btn-icon"
              :aria-label="`Editar orden ${orden.codigoOrden}`"
              :disabled="busyId !== null"
              @click="emit('edit', orden)"
            >
              <BaseSpinner v-if="busyId === orden.id" class="size-4" />
              <AppIcon v-else name="pencil" class="size-4" />
            </button>
            <button
              type="button"
              class="btn-icon hover:bg-rose-50 hover:text-rose-600"
              :aria-label="`Eliminar orden ${orden.codigoOrden}`"
              :disabled="busyId !== null"
              @click="emit('delete', orden)"
            >
              <AppIcon name="trash" class="size-4" />
            </button>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-2">
          <BaseBadge :label="orden.estado" :tone="estadoTone(orden.estado)" />
          <BaseBadge :label="orden.prioridad" :tone="prioridadTone(orden.prioridad)" variant="outline" />
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt class="text-xs text-slate-500">Valor total</dt>
            <dd class="font-medium tabular-nums text-slate-900">{{ formatCurrency(orden.valorTotal) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">Descuento</dt>
            <dd class="tabular-nums text-slate-700">{{ formatPercent(orden.porcentajeDescuento) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">Ítems</dt>
            <dd class="tabular-nums text-slate-700">{{ formatInteger(orden.cantidadItems) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">Solicitud</dt>
            <dd class="text-slate-700">{{ formatDate(orden.fechaSolicitud) }}</dd>
          </div>
        </dl>
        <p v-if="orden.observaciones" class="mt-2 line-clamp-2 text-xs text-slate-500">
          {{ orden.observaciones }}
        </p>
      </li>
    </ul>

    <!-- Recarga con datos ya visibles: velo sutil en lugar de vaciar la tabla. -->
    <div
      v-if="loading && ordenes.length > 0"
      class="absolute inset-0 flex items-start justify-center bg-white/50 pt-16"
    >
      <BaseSpinner class="size-6 text-indigo-600" />
      <span class="sr-only">Cargando órdenes…</span>
    </div>
  </div>
</template>
