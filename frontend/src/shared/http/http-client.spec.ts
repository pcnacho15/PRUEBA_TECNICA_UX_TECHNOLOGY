import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './api-error'
import { buildQueryString, FetchHttpClient } from './http-client'

const jsonResponse = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('buildQueryString', () => {
  it('omite valores vacíos y codifica el resto', () => {
    expect(buildQueryString({ page: 1, cliente: 'Réditos S.A.', estado: '', x: undefined })).toBe(
      '?page=1&cliente=R%C3%A9ditos+S.A.',
    )
    expect(buildQueryString({})).toBe('')
  })
})

describe('FetchHttpClient', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envía JSON y devuelve el cuerpo parseado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: 1 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await new FetchHttpClient('/api/').post('/ordenes', { a: 1 })

    expect(result).toEqual({ id: 1 })
    expect(fetchMock).toHaveBeenCalledWith('/api/ordenes', expect.objectContaining({
      method: 'POST',
      body: '{"a":1}',
    }))
  })

  it('devuelve undefined en 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(new FetchHttpClient('/api').delete('/ordenes/1')).resolves.toBeUndefined()
  })

  it('normaliza los errores de validación de NestJS', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(400, { statusCode: 400, message: ['a inválido', 'b inválido'], error: 'Bad Request' }),
      ),
    )

    const error = await new FetchHttpClient('/api').get('/ordenes').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).isValidationError).toBe(true)
    expect((error as ApiError).messages).toEqual(['a inválido', 'b inválido'])
  })

  it('traduce un fallo de red a ApiError con estado 0 y mensaje en español', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = (await new FetchHttpClient('/api').get('/ordenes').catch((e: unknown) => e)) as ApiError

    expect(error.isNetworkError).toBe(true)
    expect(error.message).toMatch(/No se pudo conectar/)
  })

  it('no expone el mensaje en inglés de un 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(500, { statusCode: 500, message: 'Internal server error' })),
    )

    const error = (await new FetchHttpClient('/api').get('/x').catch((e: unknown) => e)) as ApiError

    expect(error.message).toBe('Ocurrió un error inesperado en el servidor.')
  })
})
