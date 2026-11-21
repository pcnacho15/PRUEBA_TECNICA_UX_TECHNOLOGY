const LOCALE = 'es-CO'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatCurrency = (value: number): string => currencyFormatter.format(value)

/** Recibe el porcentaje en escala 0–100 (como lo entrega la API). */
export const formatPercent = (value: number): string => percentFormatter.format(value / 100)

export const formatInteger = (value: number): string => integerFormatter.format(value)

/**
 * Formatea una fecha 'YYYY-MM-DD' sin desfase de zona horaria: `new Date('2026-11-21')`
 * se interpreta en UTC y en América/Bogotá mostraría el día anterior.
 */
export const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return dateFormatter.format(new Date(Date.UTC(year, month - 1, day)))
}

export const formatDateTime = (isoDateTime: string): string => {
  const date = new Date(isoDateTime)
  return Number.isNaN(date.getTime()) ? isoDateTime : dateTimeFormatter.format(date)
}

/** Fecha local de hoy en formato 'YYYY-MM-DD' (valor para <input type="date">). */
export const todayIsoDate = (now: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
