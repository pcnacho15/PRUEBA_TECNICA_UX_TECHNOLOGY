import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrdenDto } from './create-orden.dto.js';

const valid = {
  codigoOrden: 'ORD-2026-010',
  clienteNombre: 'Cliente Nuevo',
  cantidadItems: 3,
  valorTotal: 1540000.5,
  porcentajeDescuento: 12.5,
  fechaSolicitud: '2026-11-21',
  estado: 'En Proceso',
  prioridad: 'Crítica',
  observaciones: 'Notas',
};

const errorsFor = async (
  payload: Record<string, unknown>,
): Promise<string[]> => {
  const errors = await validate(plainToInstance(CreateOrdenDto, payload));
  return errors.map((error) => error.property);
};

describe('CreateOrdenDto', () => {
  it('acepta un payload válido con los cinco tipos de dato', async () => {
    expect(await errorsFor(valid)).toEqual([]);
  });

  it('acepta solo los campos obligatorios', async () => {
    const {
      codigoOrden,
      clienteNombre,
      cantidadItems,
      valorTotal,
      fechaSolicitud,
    } = valid;
    expect(
      await errorsFor({
        codigoOrden,
        clienteNombre,
        cantidadItems,
        valorTotal,
        fechaSolicitud,
      }),
    ).toEqual([]);
  });

  it.each([
    ['cantidadItems', 0],
    ['cantidadItems', 1.5],
    ['cantidadItems', '3'],
    ['valorTotal', -1],
    ['valorTotal', 10.123],
    ['porcentajeDescuento', 100.01],
    ['porcentajeDescuento', -0.5],
    ['fechaSolicitud', '21/11/2026'],
    ['fechaSolicitud', '2026-02-30'],
    ['estado', 'Abierta'],
    ['prioridad', 'Urgente'],
    ['codigoOrden', 'ORD 2026/001'],
    ['codigoOrden', 'X'.repeat(31)],
    ['clienteNombre', '   '],
    ['clienteNombre', 'X'.repeat(151)],
  ])('rechaza %s = %j', async (field, value) => {
    expect(await errorsFor({ ...valid, [field]: value })).toEqual([field]);
  });
});
