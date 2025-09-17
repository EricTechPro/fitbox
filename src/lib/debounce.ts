/**
 * Debounce utility function that delays function execution until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    const callNow = immediate && !timeout

    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Async debounce that returns a promise
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let resolve: ((value: ReturnType<T>) => void) | null = null
  let reject: ((reason?: unknown) => void) | null = null

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise<ReturnType<T>>((res, rej) => {
      if (timeout) {
        clearTimeout(timeout)
        if (reject) reject(new Error('Debounced function cancelled'))
      }

      resolve = res
      reject = rej

      timeout = setTimeout(async () => {
        try {
          const result = await func(...args)
          resolve?.(result)
        } catch (error) {
          reject?.(error)
        }
        timeout = null
        resolve = null
        reject = null
      }, wait)
    })
  }
}

/**
 * Throttle utility function that limits function execution to once per wait period
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, wait)
    }
  }
}