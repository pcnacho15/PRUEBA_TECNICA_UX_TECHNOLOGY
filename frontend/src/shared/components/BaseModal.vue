<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
    /** Impide cerrar con Esc o clic en el fondo (p. ej. mientras se guarda). */
    persistent?: boolean
  }>(),
  { size: 'md', persistent: false },
)

const emit = defineEmits<{ close: [] }>()

const titleId = useId()
const descriptionId = useId()
const panel = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' } as const
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function requestClose(): void {
  if (!props.persistent) emit('close')
}

function focusables(): HTMLElement[] {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
    (el) => !el.hasAttribute('disabled'),
  )
}

/** Esc cierra; Tab queda atrapado dentro del diálogo (accesibilidad). */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.stopPropagation()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return

  const items = focusables()
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      const autofocus = panel.value?.querySelector<HTMLElement>('[autofocus], [data-autofocus]')
      ;(autofocus ?? focusables()[0])?.focus()
    } else {
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  previouslyFocused?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      appear
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] transition-opacity sm:items-center sm:p-4"
        @mousedown.self="requestClose"
        @keydown="onKeydown"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descriptionId : undefined"
          class="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          :class="SIZES[size]"
        >
          <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 :id="titleId" class="text-base font-semibold text-slate-900">{{ title }}</h2>
              <p v-if="description" :id="descriptionId" class="mt-0.5 text-sm text-slate-500">
                {{ description }}
              </p>
            </div>
            <button
              type="button"
              class="btn-icon -mr-2"
              aria-label="Cerrar"
              :disabled="persistent"
              @click="requestClose"
            >
              <AppIcon name="x" class="size-5" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:justify-end sm:px-6"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
