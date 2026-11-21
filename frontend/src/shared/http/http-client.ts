import { ApiError } from './api-error'

export type QueryParams = Record<string, string | number | null | undefined>

/**
 * Abstracción mínima de transporte HTTP. Los servicios de dominio dependen de
 * esta interfaz y no de fetch, lo que permite sustituirla en los tests (DIP).
 */
export interface HttpClient {
  get<T>(path: string, query?: QueryParams): Promise<T>
  post<T>(path: string, body: unknown): Promise<T>
  put<T>(path: string, body: unknown): Promise<T>
  delete(path: string): Promise<void>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  query?: QueryParams
  body?: unknown
}

export const buildQueryString = (query: QueryParams = {}): string => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, { query })
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, { body })
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body })
  }

  delete(path: string): Promise<void> {
    return this.request<void>('DELETE', path)
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    { query, body }: RequestOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${path}${buildQueryString(query)}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw ApiError.network()
    }

    if (!response.ok) throw await ApiError.fromResponse(response)
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }
}
