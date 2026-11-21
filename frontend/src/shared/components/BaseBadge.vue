<script setup lang="ts">
import { computed } from 'vue'

export type BadgeTone = 'slate' | 'amber' | 'blue' | 'emerald' | 'rose' | 'sky' | 'orange' | 'red'

const props = withDefaults(
  defineProps<{ label: string; tone?: BadgeTone; variant?: 'soft' | 'outline' }>(),
  { tone: 'slate', variant: 'soft' },
)

// Clases literales completas para que Tailwind las detecte en el build.
const SOFT: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/25',
}

const OUTLINE: Record<BadgeTone, string> = {
  slate: 'text-slate-600 ring-slate-300',
  amber: 'text-amber-700 ring-amber-300',
  blue: 'text-blue-700 ring-blue-300',
  emerald: 'text-emerald-700 ring-emerald-300',
  rose: 'text-rose-700 ring-rose-300',
  sky: 'text-sky-700 ring-sky-300',
  orange: 'text-orange-700 ring-orange-300',
  red: 'text-red-700 ring-red-300',
}

const DOT: Record<BadgeTone, string> = {
  slate: 'bg-slate-400',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  orange: 'bg-orange-500',
  red: 'bg-red-600',
}

const classes = computed(() => (props.variant === 'soft' ? SOFT : OUTLINE)[props.tone])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset"
    :class="classes"
  >
    <span class="size-1.5 rounded-full" :class="DOT[tone]" aria-hidden="true" />
    {{ label }}
  </span>
</template>
