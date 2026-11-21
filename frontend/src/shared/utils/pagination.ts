export type PageItem = number | 'ellipsis'

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)

/**
 * Lista compacta de páginas para los controles: siempre la primera, la última y
 * `siblings` alrededor de la actual, con elipsis en los huecos. Devuelve siempre
 * la misma cantidad de elementos para que los botones no cambien de posición.
 *
 * Ej. (siblings = 1):
 *   (1, 12)  → [1, 2, 3, 4, 5, '…', 12]
 *   (6, 12)  → [1, '…', 5, 6, 7, '…', 12]
 *   (12, 12) → [1, '…', 8, 9, 10, 11, 12]
 */
export const buildPageList = (current: number, totalPages: number, siblings = 1): PageItem[] => {
  if (totalPages <= 0) return []

  const totalSlots = siblings * 2 + 5 // primera + última + actual + 2 elipsis
  if (totalPages <= totalSlots) return range(1, totalPages)

  const page = Math.min(Math.max(current, 1), totalPages)
  const showLeftEllipsis = page - siblings > 3
  const showRightEllipsis = page + siblings < totalPages - 2
  const edgeCount = totalSlots - 2 // páginas contiguas cuando solo hay una elipsis

  if (!showLeftEllipsis) {
    return [...range(1, edgeCount), 'ellipsis', totalPages]
  }
  if (!showRightEllipsis) {
    return [1, 'ellipsis', ...range(totalPages - edgeCount + 1, totalPages)]
  }
  return [1, 'ellipsis', ...range(page - siblings, page + siblings), 'ellipsis', totalPages]
}
