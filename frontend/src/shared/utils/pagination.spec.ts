import { describe, expect, it } from 'vitest'
import { buildPageList } from './pagination'

describe('buildPageList', () => {
  it('devuelve vacío si no hay páginas', () => {
    expect(buildPageList(1, 0)).toEqual([])
  })

  it('muestra todas las páginas cuando caben', () => {
    expect(buildPageList(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('usa una sola elipsis cerca de los extremos', () => {
    expect(buildPageList(1, 12)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 12])
    expect(buildPageList(12, 12)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12])
  })

  it('usa dos elipsis en el centro y conserva siempre 7 elementos', () => {
    expect(buildPageList(6, 12)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 12])
    for (let page = 1; page <= 30; page++) {
      expect(buildPageList(page, 30)).toHaveLength(7)
      expect(buildPageList(page, 30)).toContain(page)
    }
  })
})
