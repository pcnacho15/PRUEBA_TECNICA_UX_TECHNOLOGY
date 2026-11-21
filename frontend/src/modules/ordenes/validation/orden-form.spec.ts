import { describe, expect, it } from 'vitest'
import type { CatalogosOrden } from '../types/orden.types'
import {
  createEmptyOrdenForm,
  formValuesToPayload,
  isValidIsoDate,
  validateOrdenForm,
} from './orden-form'
import type { OrdenFormValues } from './orden-form'

const catalogos: CatalogosOrden = {
  estados: ['Pendiente', 'En Proceso', 'Completada', 'Cancelada'],
  prioridades: ['Baja', 'Media', 'Alta', 'Crítica'],
  estadoPorDefecto: 'Pendiente',
  prioridadPorDefecto: 'Media',
}

const valid = (overrides: Partial<OrdenFormValues> = {}): OrdenFormValues => ({
  codigoOrden: 'ORD-2026-010',
  clienteNombre: 'Grupo Réditos S.A.',
  cantidadItems: 3,
  valorTotal: 1540000.5,
  porcentajeDescuento: 12.5,
  fechaSolicitud: '2026-11-21',
  estado: 'Pendiente',
  prioridad: 'Alta',
  observaciones: '',
  ...overrides,
})

describe('validateOrdenForm', () => {
  it('acepta un formulario válido', () => {
    expect(validateOrdenForm(valid(), catalogos)).toEqual({})
  })

  it('exige los campos obligatorios', () => {
    const errors = validateOrdenForm(
      valid({
        codigoOrden: '  ',
        clienteNombre: '',
        cantidadItems: null,
        valorTotal: null,
        porcentajeDescuento: null,
        fechaSolicitud: '',
        estado: '',
        prioridad: '',
      }),
      catalogos,
    )
    expect(Object.keys(errors).sort()).toEqual(
      [
        'cantidadItems',
        'clienteNombre',
        'codigoOrden',
        'estado',
        'fechaSolicitud',
        'porcentajeDescuento',
        'prioridad',
        'valorTotal',
      ].sort(),
    )
  })

  it.each([
    ['ORD 001', 'Solo se permiten letras'],
    ['ORD_001', 'Solo se permiten letras'],
    ['A'.repeat(31), 'Máximo 30'],
  ])('rechaza el código %s', (codigoOrden, mensaje) => {
    expect(validateOrdenForm(valid({ codigoOrden }), catalogos).codigoOrden).toContain(mensaje)
  })

  it.each([
    [0, 'mayor o igual a 1'],
    [2.5, 'entero'],
  ])('cantidadItems %s es inválida', (cantidadItems, mensaje) => {
    expect(validateOrdenForm(valid({ cantidadItems }), catalogos).cantidadItems).toContain(mensaje)
  })

  it('valorTotal: no negativo y máximo 2 decimales (sin falsos positivos de coma flotante)', () => {
    expect(validateOrdenForm(valid({ valorTotal: -1 }), catalogos).valorTotal).toBeDefined()
    expect(validateOrdenForm(valid({ valorTotal: 10.123 }), catalogos).valorTotal).toContain('2 decimales')
    expect(validateOrdenForm(valid({ valorTotal: 1.1 }), catalogos).valorTotal).toBeUndefined()
    expect(validateOrdenForm(valid({ valorTotal: 0.29 }), catalogos).valorTotal).toBeUndefined()
  })

  it('porcentajeDescuento debe estar entre 0 y 100', () => {
    expect(validateOrdenForm(valid({ porcentajeDescuento: 100.01 }), catalogos).porcentajeDescuento).toBeDefined()
    expect(validateOrdenForm(valid({ porcentajeDescuento: 100 }), catalogos).porcentajeDescuento).toBeUndefined()
  })

  it('rechaza valores de lista que no vienen del catálogo', () => {
    const errors = validateOrdenForm(valid({ estado: 'Abierta' as never }), catalogos)
    expect(errors.estado).toBe('Estado no válido.')
  })
})

describe('isValidIsoDate', () => {
  it('rechaza fechas inexistentes como 2026-02-30', () => {
    expect(isValidIsoDate('2026-02-28')).toBe(true)
    expect(isValidIsoDate('2026-02-30')).toBe(false)
    expect(isValidIsoDate('21/11/2026')).toBe(false)
  })
})

describe('createEmptyOrdenForm', () => {
  it('toma los valores por defecto del catálogo y la fecha de hoy', () => {
    const form = createEmptyOrdenForm(catalogos, '2026-11-21')
    expect(form).toMatchObject({
      estado: 'Pendiente',
      prioridad: 'Media',
      fechaSolicitud: '2026-11-21',
      cantidadItems: 1,
      porcentajeDescuento: 0,
    })
  })
})

describe('formValuesToPayload', () => {
  it('recorta textos y envía null cuando no hay observaciones', () => {
    const payload = formValuesToPayload(
      valid({ codigoOrden: ' ORD-1 ', clienteNombre: ' ACME ', observaciones: '   ' }),
    )
    expect(payload).toMatchObject({ codigoOrden: 'ORD-1', clienteNombre: 'ACME', observaciones: null })
  })

  it('falla si se invoca con valores inválidos', () => {
    expect(() => formValuesToPayload(valid({ cantidadItems: null }))).toThrow()
  })
})
