import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info'

export interface AppNotification {
  id: number
  type: NotificationType
  title: string
  message?: string
}

const DURATION_MS: Record<NotificationType, number> = {
  success: 4000,
  info: 4000,
  error: 7000,
}

/** Cola global de mensajes de confirmación y error (toasts). */
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  let nextId = 1

  function dismiss(id: number): void {
    items.value = items.value.filter((n) => n.id !== id)
  }

  function notify(type: NotificationType, title: string, message?: string): number {
    const id = nextId++
    items.value.push({ id, type, title, message })
    setTimeout(() => dismiss(id), DURATION_MS[type])
    return id
  }

  return {
    items,
    dismiss,
    success: (title: string, message?: string) => notify('success', title, message),
    error: (title: string, message?: string) => notify('error', title, message),
    info: (title: string, message?: string) => notify('info', title, message),
  }
})
