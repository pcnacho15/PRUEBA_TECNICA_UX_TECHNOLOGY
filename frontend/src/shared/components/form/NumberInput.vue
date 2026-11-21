<script setup lang="ts">
import { computed } from 'vue'

/**
 * Campo numérico con v-model `number | null` (vacío = null).
 * - `integer`: bloquea punto/coma y pegar valores no enteros.
 * - `min >= 0`: bloquea el signo menos.
 * Usa v-model nativo de Vue, que no reescribe el valor mientras se teclea
 * (p. ej. "1.50" no se convierte en "1.5" a mitad de la escritura).
 */
const model = defineModel<number | null>({ required: true })

const props = withDefaults(
  defineProps<{
    id: string
    integer?: boolean
    min?: number
    max?: number
    step?: number | string
    prefix?: string
    suffix?: string
    placeholder?: string
    invalid?: boolean
    describedby?: string
    required?: boolean
  }>(),
  { integer: false },
)

const emit = defineEmits<{ blur: []; input: [] }>()

const inner = computed<number | string>({
  get: () => model.value ?? '',
  set: (value) => {
    model.value = typeof value === 'number' && Number.isFinite(value) ? value : null
  },
})

const allowsNegative = computed(() => props.min === undefined || props.min < 0)
const resolvedStep = computed(() => props.step ?? (props.integer ? 1 : 'any'))

function onKeydown(event: KeyboardEvent): void {
  const blocked =
    ['e', 'E', '+'].includes(event.key) ||
    (event.key === '-' && !allowsNegative.value) ||
    (props.integer && (event.key === '.' || event.key === ','))
  if (blocked) event.preventDefault()
}

function onPaste(event: ClipboardEvent): void {
  const text = event.clipboardData?.getData('text')?.trim() ?? ''
  const pattern = props.integer ? /^\d+$/ : /^\d+([.,]\d+)?$/
  if (!pattern.test(text)) event.preventDefault()
}

function onInput(): void {
  emit('input')
}
</script>

<template>
  <div class="relative">
    <span
      v-if="prefix"
      class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-500"
      aria-hidden="true"
    >
      {{ prefix }}
    </span>
    <input
      :id="id"
      v-model.number="inner"
      type="number"
      class="form-control tabular-nums"
      :class="{ 'pl-7': prefix, 'pr-8': suffix }"
      :inputmode="integer ? 'numeric' : 'decimal'"
      :min="min"
      :max="max"
      :step="resolvedStep"
      :placeholder="placeholder"
      :aria-invalid="invalid"
      :aria-describedby="describedby"
      :aria-required="required"
      @keydown="onKeydown"
      @paste="onPaste"
      @input="onInput"
      @blur="emit('blur')"
      @wheel.passive="($event.target as HTMLInputElement).blur()"
    />
    <span
      v-if="suffix"
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500"
      aria-hidden="true"
    >
      {{ suffix }}
    </span>
  </div>
</template>
