<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import BaseModal from './BaseModal.vue'
import BaseSpinner from './BaseSpinner.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    danger?: boolean
  }>(),
  { confirmText: 'Confirmar', cancelText: 'Cancelar', loading: false, danger: false },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal :open="open" :title="title" size="sm" :persistent="loading" @close="emit('cancel')">
    <div class="flex gap-4">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full"
        :class="danger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'"
      >
        <AppIcon :name="danger ? 'alert' : 'info'" class="size-5" />
      </span>
      <div class="text-sm text-slate-600">
        <slot />
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" :disabled="loading" @click="emit('cancel')">
        {{ cancelText }}
      </button>
      <button
        type="button"
        class="btn"
        :class="danger ? 'btn-danger' : 'btn-primary'"
        :disabled="loading"
        data-autofocus
        @click="emit('confirm')"
      >
        <BaseSpinner v-if="loading" class="size-4" />
        {{ confirmText }}
      </button>
    </template>
  </BaseModal>
</template>
