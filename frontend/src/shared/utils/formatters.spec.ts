import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatPercent, todayIsoDate } from './formatters'

// Intl usa espacios no separables: se normalizan para comparar.
const normalize = (s: string) => s.replace(/\s/g, ' ')
// La separación del símbolo % varía según la versión de ICU.
const compact = (s: string) => s.replace(/\s/g, '')

describe('formatters', () => {
  it('formatCurrency usa pesos colombianos con 2 decimales', () => {
    expect(normalize(formatCurrency(2500000))).toBe('$ 2.500.000,00')
    expect(normalize(formatCurrency(850500.5))).toBe('$ 850.500,50')
  })

  it('formatPercent recibe la escala 0–100 de la API', () => {
    expect(compact(formatPercent(10))).toBe('10%')
    expect(compact(formatPercent(5.5))).toBe('5,5%')
    expect(compact(formatPercent(0))).toBe('0%')
  })

  it('formatDate no desplaza el día por zona horaria', () => {
    expect(formatDate('2026-11-21')).toMatch(/^21/)
    expect(formatDate('2026-01-01')).toMatch(/^01/)
  })

  it('formatDate devuelve la entrada si no es YYYY-MM-DD', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha')
  })

  it('todayIsoDate usa la fecha local', () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
