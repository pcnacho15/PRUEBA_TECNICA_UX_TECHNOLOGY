import { getCurrentScope, onScopeDispose } from 'vue'

export interface DebouncedFn<Args extends unknown[]> {
  (...args: Args): void
  cancel: () => void
}

/** Retrasa la ejecución hasta que dejan de llegar llamadas durante `delay` ms. */
export function useDebounceFn<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 350,
): DebouncedFn<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  const debounced = ((...args: Args) => {
    cancel()
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, delay)
  }) as DebouncedFn<Args>
  debounced.cancel = cancel

  if (getCurrentScope()) onScopeDispose(cancel)
  return debounced
}
