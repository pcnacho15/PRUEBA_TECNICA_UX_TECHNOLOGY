import { todayIsoDate } from '@/shared/utils/formatters'
import { ORDEN_LIMITES as L } from '../constants/orden.constants'
import type {
  CatalogosOrden,
  EstadoOrden,
  Orden,
  OrdenPayload,
  PrioridadOrden,
} from '../types/orden.types'

/** Estado editable del formulario: los numéricos admiten null mientras están vacíos. */
export interface OrdenFormValues {
  codigoOrden: string
  clienteNombre: string
  cantidadItems: number | null
  valorTotal: number | null
  porcentajeDescuento: number | null
  fechaSolicitud: string
  estado: EstadoOrden | ''
  prioridad: PrioridadOrden | ''
  observaciones: string
}

export type OrdenFormField = keyof OrdenFormValues
export type OrdenFormErrors = Partial<Record<OrdenFormField, string>>

type FieldValidator = (values: OrdenFormValues, catalogos: CatalogosOrden | null) => string | null

const tieneMaxDecimales = (value: number, decimales: number): boolean => {
  const factor = 10 ** decimales
  return Math.abs(value * factor - Math.round(value * factor)) < 1e-6
}

/** Valida que sea una fecha real (rechaza 2026-02-30), igual que IsISO8601 strict. */
export const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

const formatLimit = (n: number) => n.toLocaleString('es-CO')

const validators: Record<OrdenFormField, FieldValidator> = {
  codigoOrden: ({ codigoOrden }) => {
    const value = codigoOrden.trim()
    if (!value) return 'El código de la orden es obligatorio.'
    if (value.length > L.codigoOrdenMaxLength)
      return `Máximo ${L.codigoOrdenMaxLength} caracteres.`
    if (!L.codigoOrdenPattern.test(value)) return 'Solo se permiten letras, números y guiones.'
    return null
  },

  clienteNombre: ({ clienteNombre }) => {
    const value = clienteNombre.trim()
    if (!value) return 'El nombre del cliente es obligatorio.'
    if (value.length > L.clienteNombreMaxLength)
      return `Máximo ${L.clienteNombreMaxLength} caracteres.`
    return null
  },

  cantidadItems: ({ cantidadItems: value }) => {
    if (value === null) return 'La cantidad de ítems es obligatoria.'
    if (!Number.isInteger(value)) return 'Debe ser un número entero.'
    if (value < L.cantidadItemsMin) return `Debe ser mayor o igual a ${L.cantidadItemsMin}.`
    if (value > L.cantidadItemsMax) return `No puede superar ${formatLimit(L.cantidadItemsMax)}.`
    return null
  },

  valorTotal: ({ valorTotal: value }) => {
    if (value === null) return 'El valor total es obligatorio.'
    if (!Number.isFinite(value)) return 'Debe ser un número válido.'
    if (value < L.valorTotalMin) return 'No puede ser negativo.'
    if (value > L.valorTotalMax) return `No puede superar ${formatLimit(L.valorTotalMax)}.`
    if (!tieneMaxDecimales(value, L.decimales)) return `Máximo ${L.decimales} decimales.`
    return null
  },

  porcentajeDescuento: ({ porcentajeDescuento: value }) => {
    if (value === null) return 'El porcentaje de descuento es obligatorio (use 0 si no aplica).'
    if (!Number.isFinite(value)) return 'Debe ser un número válido.'
    if (value < L.porcentajeDescuentoMin || value > L.porcentajeDescuentoMax)
      return `Debe estar entre ${L.porcentajeDescuentoMin} y ${L.porcentajeDescuentoMax}.`
    if (!tieneMaxDecimales(value, L.decimales)) return `Máximo ${L.decimales} decimales.`
    return null
  },

  fechaSolicitud: ({ fechaSolicitud }) => {
    if (!fechaSolicitud) return 'La fecha de solicitud es obligatoria.'
    if (!isValidIsoDate(fechaSolicitud)) return 'Ingrese una fecha válida.'
    return null
  },

  estado: ({ estado }, catalogos) => {
    if (!estado) return 'Seleccione un estado.'
    if (catalogos && !catalogos.estados.includes(estado)) return 'Estado no válido.'
    return null
  },

  prioridad: ({ prioridad }, catalogos) => {
    if (!prioridad) return 'Seleccione una prioridad.'
    if (catalogos && !catalogos.prioridades.includes(prioridad)) return 'Prioridad no válida.'
    return null
  },

  observaciones: ({ observaciones }) =>
    observaciones.trim().length > L.observacionesMaxLength
      ? `Máximo ${formatLimit(L.observacionesMaxLength)} caracteres.`
      : null,
}

export const ORDEN_FORM_FIELDS = Object.keys(validators) as OrdenFormField[]

export const validateOrdenField = (
  field: OrdenFormField,
  values: OrdenFormValues,
  catalogos: CatalogosOrden | null,
): string | null => validators[field](values, catalogos)

export const validateOrdenForm = (
  values: OrdenFormValues,
  catalogos: CatalogosOrden | null,
): OrdenFormErrors => {
  const errors: OrdenFormErrors = {}
  for (const field of ORDEN_FORM_FIELDS) {
    const error = validateOrdenField(field, values, catalogos)
    if (error) errors[field] = error
  }
  return errors
}

export const createEmptyOrdenForm = (
  catalogos: CatalogosOrden | null,
  today: string = todayIsoDate(),
): OrdenFormValues => ({
  codigoOrden: '',
  clienteNombre: '',
  cantidadItems: 1,
  valorTotal: null,
  porcentajeDescuento: 0,
  fechaSolicitud: today,
  estado: catalogos?.estadoPorDefecto ?? '',
  prioridad: catalogos?.prioridadPorDefecto ?? '',
  observaciones: '',
})

export const ordenToFormValues = (orden: Orden): OrdenFormValues => ({
  codigoOrden: orden.codigoOrden,
  clienteNombre: orden.clienteNombre,
  cantidadItems: orden.cantidadItems,
  valorTotal: orden.valorTotal,
  porcentajeDescuento: orden.porcentajeDescuento,
  fechaSolicitud: orden.fechaSolicitud,
  estado: orden.estado,
  prioridad: orden.prioridad,
  observaciones: orden.observaciones ?? '',
})

/**
 * Convierte valores ya validados al cuerpo que espera la API: recorta textos y
 * envía null si no hay observaciones (así se pueden borrar al editar).
 */
export const formValuesToPayload = (values: OrdenFormValues): OrdenPayload => {
  const errors = validateOrdenForm(values, null)
  if (Object.keys(errors).length > 0) {
    throw new Error('formValuesToPayload requiere valores válidos')
  }
  const observaciones = values.observaciones.trim()
  return {
    codigoOrden: values.codigoOrden.trim(),
    clienteNombre: values.clienteNombre.trim(),
    cantidadItems: values.cantidadItems as number,
    valorTotal: values.valorTotal as number,
    porcentajeDescuento: values.porcentajeDescuento as number,
    fechaSolicitud: values.fechaSolicitud,
    estado: values.estado as EstadoOrden,
    prioridad: values.prioridad as PrioridadOrden,
    observaciones: observaciones || null,
  }
}
