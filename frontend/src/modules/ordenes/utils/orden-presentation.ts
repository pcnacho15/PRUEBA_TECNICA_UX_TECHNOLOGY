import type { BadgeTone } from '@/shared/components/BaseBadge.vue'
import type { EstadoOrden, PrioridadOrden } from '../types/orden.types'

const ESTADO_TONES: Record<EstadoOrden, BadgeTone> = {
  Pendiente: 'amber',
  'En Proceso': 'blue',
  Completada: 'emerald',
  Cancelada: 'slate',
}

const PRIORIDAD_TONES: Record<PrioridadOrden, BadgeTone> = {
  Baja: 'slate',
  Media: 'sky',
  Alta: 'orange',
  Crítica: 'red',
}

/** Un valor nuevo del catálogo que la UI aún no conoce se muestra en gris. */
export const estadoTone = (estado: string): BadgeTone =>
  ESTADO_TONES[estado as EstadoOrden] ?? 'slate'

export const prioridadTone = (prioridad: string): BadgeTone =>
  PRIORIDAD_TONES[prioridad as PrioridadOrden] ?? 'slate'
