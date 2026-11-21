import { computed, reactive, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { ApiError, getErrorMessage } from '@/shared/http/api-error'
import type { CatalogosOrden, OrdenPayload } from '../types/orden.types'
import {
  ORDEN_FORM_FIELDS,
  formValuesToPayload,
  validateOrdenField,
  validateOrdenForm,
} from '../validation/orden-form'
import type { OrdenFormErrors, OrdenFormField, OrdenFormValues } from '../validation/orden-form'

export type SubmitResult = { ok: true } | { ok: false; reason: 'invalid' | 'server' }

/**
 * Lógica del formulario de orden, independiente de la presentación:
 * - valida cada campo al perder el foco y todo el formulario al enviar;
 * - convierte los errores de la API en errores de campo o en un resumen general.
 */
export function useOrdenForm(
  initialValues: OrdenFormValues,
  catalogos: MaybeRefOrGetter<CatalogosOrden | null>,
) {
  const values = reactive<OrdenFormValues>({ ...initialValues })
  const errors = ref<OrdenFormErrors>({})
  const touched = reactive(new Set<OrdenFormField>())
  const serverErrors = ref<string[]>([])
  const isSubmitting = ref(false)
  const submitAttempted = ref(false)

  const snapshot = JSON.stringify(initialValues)
  const isDirty = computed(() => JSON.stringify(values) !== snapshot)
  const errorCount = computed(() => Object.keys(errors.value).length)

  function setFieldError(field: OrdenFormField, message: string | null): void {
    const next = { ...errors.value }
    if (message) next[field] = message
    else delete next[field]
    errors.value = next
  }

  function validateField(field: OrdenFormField): boolean {
    const message = validateOrdenField(field, values, toValue(catalogos))
    setFieldError(field, message)
    return message === null
  }

  /** Valida al perder el foco para no mostrar errores mientras se escribe. */
  function onBlur(field: OrdenFormField): void {
    touched.add(field)
    validateField(field)
  }

  /** Tras un intento de envío, re-valida en vivo el campo que se corrige. */
  function onInput(field: OrdenFormField): void {
    if (submitAttempted.value || touched.has(field)) validateField(field)
  }

  function validateAll(): boolean {
    errors.value = validateOrdenForm(values, toValue(catalogos))
    ORDEN_FORM_FIELDS.forEach((field) => touched.add(field))
    return errorCount.value === 0
  }

  function applyServerError(error: unknown): void {
    if (error instanceof ApiError && error.isConflict) {
      setFieldError('codigoOrden', 'Ya existe una orden con este código.')
    }
    serverErrors.value = error instanceof ApiError ? [...error.messages] : [getErrorMessage(error)]
  }

  async function submit(handler: (payload: OrdenPayload) => Promise<unknown>): Promise<SubmitResult> {
    submitAttempted.value = true
    serverErrors.value = []
    if (!validateAll()) return { ok: false, reason: 'invalid' }

    isSubmitting.value = true
    try {
      await handler(formValuesToPayload(values))
      return { ok: true }
    } catch (error) {
      applyServerError(error)
      return { ok: false, reason: 'server' }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    values,
    errors,
    serverErrors,
    isSubmitting,
    isDirty,
    errorCount,
    onBlur,
    onInput,
    submit,
  }
}
