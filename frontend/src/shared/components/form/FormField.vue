<script setup lang="ts">
/**
 * Envoltorio de campo: etiqueta, ayuda y error asociados por id al control
 * (aria-describedby) para lectores de pantalla. El control se pasa por slot.
 */
defineProps<{
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
}>()
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-rose-500" aria-hidden="true">*</span>
    </label>
    <slot
      :describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      :invalid="Boolean(error)"
    />
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 flex items-start gap-1 text-xs text-rose-600">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
