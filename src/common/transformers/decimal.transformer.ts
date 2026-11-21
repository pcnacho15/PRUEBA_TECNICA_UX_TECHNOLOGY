import type { ValueTransformer } from 'typeorm';

/**
 * mysql2 devuelve las columnas DECIMAL como string para no perder precisión.
 * Los importes de este dominio caben en un number (DECIMAL(12,2)), así que se
 * exponen como number al resto de la aplicación.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null): number | null =>
    value === null ? null : Number.parseFloat(value),
};
