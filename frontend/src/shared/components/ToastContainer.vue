<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '../stores/notifications.store'
import type { NotificationType } from '../stores/notifications.store'
import AppIcon from './AppIcon.vue'
import type { IconName } from './AppIcon.vue'

const store = useNotificationsStore()
const { items } = storeToRefs(store)

const STYLES: Record<NotificationType, { icon: IconName; iconClass: string; border: string }> = {
  success: { icon: 'check', iconClass: 'text-emerald-500', border: 'border-l-emerald-500' },
  error: { icon: 'alert', iconClass: 'text-rose-500', border: 'border-l-rose-500' },
  info: { icon: 'info', iconClass: 'text-indigo-500', border: 'border-l-indigo-500' },
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
    aria-live="polite"
    aria-relevant="additions"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0 sm:translate-x-4 sm:translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="item in items"
        :key="item.id"
        :role="item.type === 'error' ? 'alert' : 'status'"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-l-4 border-slate-200 bg-white p-4 shadow-lg"
        :class="STYLES[item.type].border"
      >
        <AppIcon :name="STYLES[item.type].icon" class="mt-0.5 size-5 shrink-0" :class="STYLES[item.type].iconClass" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
          <p v-if="item.message" class="mt-0.5 text-sm break-words text-slate-600">{{ item.message }}</p>
        </div>
        <button type="button" class="btn-icon -m-1 size-7" aria-label="Cerrar notificación" @click="store.dismiss(item.id)">
          <AppIcon name="x" class="size-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
