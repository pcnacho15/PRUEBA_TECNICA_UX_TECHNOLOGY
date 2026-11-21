<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import BaseModal from '@/shared/components/BaseModal.vue'
import BaseSpinner from '@/shared/components/BaseSpinner.vue'
import FormField from '@/shared/components/form/FormField.vue'
import NumberInput from '@/shared/components/form/NumberInput.vue'
import { formatDateTime } from '@/shared/utils/formatters'
import { useOrdenForm } from '../composables/useOrdenForm'
import { ORDEN_LIMITES as L } from '../constants/orden.constants'
import type { CatalogosOrden, Orden, OrdenPayload } from '../types/orden.types'
import { createEmptyOrdenForm, ordenToFormValues } from '../validation/orden-form'

/**
 * Formulario de creación/edición. No conoce el store: recibe `save` y avisa con
 * `saved` cuando la operación terminó bien (la vista decide qué notificar).
 * Se monta en cada apertura (v-if en el padre), así el estado siempre parte limpio.
 */
const props = defineProps<{
  orden: Orden | null
  catalogos: CatalogosOrden | null
  catalogosError: string | null
  save: (payload: OrdenPayload) => Promise<unknown>
}>()

const emit = defineEmits<{ close: []; saved: []; 'retry-catalogos': [] }>()

const isEdit = computed(() => props.orden !== null)
const {
  values,
  errors,
  serverErrors,
  isSubmitting,
  isDirty,
  errorCount,
  onBlur,
  onInput,
  submit,
} = useOrdenForm(
  props.orden ? ordenToFormValues(props.orden) : createEmptyOrdenForm(props.catalogos),
  () => props.catalogos,
)

const confirmDiscard = ref(false)
const catalogosReady = computed(() => props.catalogos !== null)
const observacionesLength = computed(() => values.observaciones.trim().length)

function requestClose(): void {
  if (isSubmitting.value) return
  if (isDirty.value && !confirmDiscard.value) {
    confirmDiscard.value = true
    return
  }
  emit('close')
}

async function onSubmit(): Promise<void> {
  confirmDiscard.value = false
  const result = await submit(props.save)
  if (result.ok) {
    emit('saved')
    return
  }
  if (result.reason === 'invalid') {
    // Lleva el foco al primer campo con error.
    document.querySelector<HTMLElement>('#orden-form [aria-invalid="true"]')?.focus()
  }
}
</script>

<template>
  <BaseModal
    :open="true"
    :title="isEdit ? `Editar orden ${orden?.codigoOrden}` : 'Nueva orden de servicio'"
    :description="
      isEdit && orden?.fechaActualizacion
        ? `Última actualización: ${formatDateTime(orden.fechaActualizacion)}`
        : 'Los campos marcados con * son obligatorios.'
    "
    :persistent="isSubmitting"
    @close="requestClose"
  >
    <form id="orden-form" novalidate class="space-y-5" @submit.prevent="onSubmit">
      <!-- Resumen de errores: validación en cliente o respuesta del servidor -->
      <div
        v-if="serverErrors.length > 0"
        role="alert"
        class="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
      >
        <AppIcon name="alert" class="size-5 shrink-0 text-rose-500" />
        <div>
          <p class="font-medium">No se pudo guardar la orden</p>
          <ul class="mt-1 list-disc space-y-0.5 pl-4">
            <li v-for="message in serverErrors" :key="message">{{ message }}</li>
          </ul>
        </div>
      </div>
      <p
        v-else-if="errorCount > 0"
        role="alert"
        class="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
      >
        <AppIcon name="alert" class="size-5 shrink-0 text-amber-500" />
        Revisa {{ errorCount === 1 ? 'el campo marcado' : `los ${errorCount} campos marcados` }} antes de guardar.
      </p>

      <div
        v-if="catalogosError"
        class="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
      >
        <span>No se pudieron cargar las listas de estado y prioridad.</span>
        <button type="button" class="btn btn-secondary py-1" @click="emit('retry-catalogos')">
          <AppIcon name="refresh" class="size-4" /> Reintentar
        </button>
      </div>

      <fieldset class="grid grid-cols-1 gap-4 sm:grid-cols-2" :disabled="isSubmitting">
        <legend class="sr-only">Datos de la orden</legend>

        <FormField
          id="codigoOrden"
          label="Código de orden"
          required
          :error="errors.codigoOrden"
          :hint="`Letras, números y guiones. Máx. ${L.codigoOrdenMaxLength}.`"
        >
          <template #default="{ describedby, invalid }">
            <input
              id="codigoOrden"
              v-model="values.codigoOrden"
              type="text"
              class="form-control font-mono"
              placeholder="ORD-2026-005"
              autocomplete="off"
              :maxlength="L.codigoOrdenMaxLength"
              :aria-invalid="invalid"
              :aria-describedby="describedby"
              aria-required="true"
              data-autofocus
              @input="onInput('codigoOrden')"
              @blur="onBlur('codigoOrden')"
            />
          </template>
        </FormField>

        <FormField id="fechaSolicitud" label="Fecha de solicitud" required :error="errors.fechaSolicitud">
          <template #default="{ describedby, invalid }">
            <input
              id="fechaSolicitud"
              v-model="values.fechaSolicitud"
              type="date"
              class="form-control"
              :aria-invalid="invalid"
              :aria-describedby="describedby"
              aria-required="true"
              @input="onInput('fechaSolicitud')"
              @blur="onBlur('fechaSolicitud')"
            />
          </template>
        </FormField>

        <FormField
          id="clienteNombre"
          class="sm:col-span-2"
          label="Cliente"
          required
          :error="errors.clienteNombre"
        >
          <template #default="{ describedby, invalid }">
            <input
              id="clienteNombre"
              v-model="values.clienteNombre"
              type="text"
              class="form-control"
              placeholder="Nombre completo o razón social"
              autocomplete="organization"
              :maxlength="L.clienteNombreMaxLength"
              :aria-invalid="invalid"
              :aria-describedby="describedby"
              aria-required="true"
              @input="onInput('clienteNombre')"
              @blur="onBlur('clienteNombre')"
            />
          </template>
        </FormField>

        <FormField
          id="cantidadItems"
          label="Cantidad de ítems"
          required
          hint="Número entero, mínimo 1."
          :error="errors.cantidadItems"
        >
          <template #default="{ describedby, invalid }">
            <NumberInput
              id="cantidadItems"
              v-model="values.cantidadItems"
              integer
              :min="L.cantidadItemsMin"
              :max="L.cantidadItemsMax"
              :invalid="invalid"
              :describedby="describedby"
              required
              @input="onInput('cantidadItems')"
              @blur="onBlur('cantidadItems')"
            />
          </template>
        </FormField>

        <FormField
          id="valorTotal"
          label="Valor total (COP)"
          required
          hint="Hasta 2 decimales."
          :error="errors.valorTotal"
        >
          <template #default="{ describedby, invalid }">
            <NumberInput
              id="valorTotal"
              v-model="values.valorTotal"
              prefix="$"
              step="0.01"
              :min="L.valorTotalMin"
              :max="L.valorTotalMax"
              placeholder="0.00"
              :invalid="invalid"
              :describedby="describedby"
              required
              @input="onInput('valorTotal')"
              @blur="onBlur('valorTotal')"
            />
          </template>
        </FormField>

        <FormField
          id="porcentajeDescuento"
          label="Descuento"
          required
          hint="Entre 0 y 100, hasta 2 decimales."
          :error="errors.porcentajeDescuento"
        >
          <template #default="{ describedby, invalid }">
            <NumberInput
              id="porcentajeDescuento"
              v-model="values.porcentajeDescuento"
              suffix="%"
              step="0.01"
              :min="L.porcentajeDescuentoMin"
              :max="L.porcentajeDescuentoMax"
              :invalid="invalid"
              :describedby="describedby"
              required
              @input="onInput('porcentajeDescuento')"
              @blur="onBlur('porcentajeDescuento')"
            />
          </template>
        </FormField>

        <FormField id="estado" label="Estado" required :error="errors.estado">
          <template #default="{ describedby, invalid }">
            <select
              id="estado"
              v-model="values.estado"
              class="form-control"
              :disabled="!catalogosReady"
              :aria-invalid="invalid"
              :aria-describedby="describedby"
              aria-required="true"
              @change="onInput('estado')"
              @blur="onBlur('estado')"
            >
              <option value="" disabled>{{ catalogosReady ? 'Seleccione…' : 'Cargando…' }}</option>
              <option v-for="item in catalogos?.estados" :key="item" :value="item">{{ item }}</option>
            </select>
          </template>
        </FormField>

        <FormField id="prioridad" label="Prioridad" required :error="errors.prioridad">
          <template #default="{ describedby, invalid }">
            <select
              id="prioridad"
              v-model="values.prioridad"
              class="form-control"
              :disabled="!catalogosReady"
              :aria-invalid="invalid"
              :aria-describedby="describedby"
              aria-required="true"
              @change="onInput('prioridad')"
              @blur="onBlur('prioridad')"
            >
              <option value="" disabled>{{ catalogosReady ? 'Seleccione…' : 'Cargando…' }}</option>
              <option v-for="item in catalogos?.prioridades" :key="item" :value="item">{{ item }}</option>
            </select>
          </template>
        </FormField>

        <FormField id="observaciones" class="sm:col-span-2" label="Observaciones" :error="errors.observaciones">
          <template #default="{ describedby, invalid }">
            <textarea
              id="observaciones"
              v-model="values.observaciones"
              rows="3"
              class="form-control resize-y"
              placeholder="Notas o comentarios adicionales (opcional)"
              :maxlength="L.observacionesMaxLength"
              :aria-invalid="invalid"
              :aria-describedby="describedby"
              @input="onInput('observaciones')"
              @blur="onBlur('observaciones')"
            />
            <p class="mt-1 text-right text-xs text-slate-400 tabular-nums">
              {{ observacionesLength.toLocaleString('es-CO') }} / {{ L.observacionesMaxLength.toLocaleString('es-CO') }}
            </p>
          </template>
        </FormField>
      </fieldset>
    </form>

    <template #footer>
      <div
        v-if="confirmDiscard"
        role="alert"
        class="flex flex-1 flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <span class="text-slate-700">Tienes cambios sin guardar. ¿Descartarlos?</span>
        <div class="flex gap-2">
          <button type="button" class="btn btn-secondary" @click="confirmDiscard = false">Seguir editando</button>
          <button type="button" class="btn btn-danger" @click="emit('close')">Descartar</button>
        </div>
      </div>
      <template v-else>
        <button type="button" class="btn btn-secondary" :disabled="isSubmitting" @click="requestClose">
          Cancelar
        </button>
        <button
          type="submit"
          form="orden-form"
          class="btn btn-primary"
          :disabled="isSubmitting || !catalogosReady"
        >
          <BaseSpinner v-if="isSubmitting" class="size-4" />
          {{ isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear orden' }}
        </button>
      </template>
    </template>
  </BaseModal>
</template>
